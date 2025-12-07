
const cache = new Map();
const pendingRequests = new Map();
const cacheStats = {
  hits: 0,
  misses: 0,
  staleHits: 0,
  persistentHits: 0,
  errors: 0,
  totalRequests: 0,
};
const CACHE_CONFIG = {
  defaultTTL: 60000,        // 1 minute default
  staleTTL: 300000,         // 5 minutes stale data is still usable
  persistentTTL: 86400000,  // 24 hours for localStorage persistence
  maxCacheSize: 100,        // Max cached items
  cleanupInterval: 60000,   // Cleanup every minute
  localStorageKey: 'finboard_cache',
};
const isBrowser = typeof window !== 'undefined';
const loadPersistentCache = () => {
  if (!isBrowser) return;
  
  try {
    const stored = localStorage.getItem(CACHE_CONFIG.localStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      Object.entries(parsed).forEach(([key, value]) => {
        if (value.persistentExpiry > now) {
          cache.set(key, {
            ...value,
            fromPersistent: true,
          });
        }
      });
    }
  } catch (error) {
  }
};
const savePersistentCache = () => {
  if (!isBrowser) return;
  
  try {
    const toStore = {};
    const now = Date.now();
    
    cache.forEach((value, key) => {
      if (value.persistentExpiry > now && value.data) {
        toStore[key] = {
          data: value.data,
          expiry: value.expiry,
          staleExpiry: value.staleExpiry,
          persistentExpiry: value.persistentExpiry,
          createdAt: value.createdAt,
        };
      }
    });
    
    localStorage.setItem(CACHE_CONFIG.localStorageKey, JSON.stringify(toStore));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(CACHE_CONFIG.localStorageKey);
      } catch (e) {
      }
    }
  }
};
let saveTimeout = null;
const debouncedSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(savePersistentCache, 1000);
};
if (isBrowser) {
  loadPersistentCache();
}
const CORS_FRIENDLY_DOMAINS = [
  'api.coingecko.com',
  'api.exchangerate-api.com',
  'api.coinpaprika.com',
];
const needsProxy = (url) => {
  try {
    const urlObj = new URL(url);
    return !CORS_FRIENDLY_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};
const getFetchUrl = (url) => {
  if (typeof window !== 'undefined' && needsProxy(url)) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};
const generateCacheKey = (url, options = {}) => {
  return `${url}::${JSON.stringify(options)}`;
};
const isFresh = (cachedItem) => {
  return Date.now() < cachedItem.expiry;
};
const isStale = (cachedItem) => {
  return Date.now() >= cachedItem.expiry && Date.now() < cachedItem.staleExpiry;
};
export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (isFresh(cached)) {
    return { data: cached.data, fresh: true, stale: false, persistent: false };
  }
  
  if (isStale(cached)) {
    return { data: cached.data, fresh: false, stale: true, persistent: false };
  }
  if (cached.persistentExpiry && Date.now() < cached.persistentExpiry) {
    return { data: cached.data, fresh: false, stale: false, persistent: true };
  }
  cache.delete(key);
  return null;
};
export const setCachedData = (key, data, ttl = CACHE_CONFIG.defaultTTL) => {
  if (cache.size >= CACHE_CONFIG.maxCacheSize) {
    cleanupOldestEntries();
  }
  
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
    staleExpiry: Date.now() + ttl + CACHE_CONFIG.staleTTL,
    persistentExpiry: Date.now() + CACHE_CONFIG.persistentTTL,
    createdAt: Date.now(),
    accessCount: 0,
  });
  debouncedSave();
};
export const clearCache = () => {
  cache.clear();
  pendingRequests.clear();
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.staleHits = 0;
  cacheStats.persistentHits = 0;
  cacheStats.errors = 0;
  cacheStats.totalRequests = 0;
  if (isBrowser) {
    try {
      localStorage.removeItem(CACHE_CONFIG.localStorageKey);
    } catch (e) {
    }
  }
};
export const removeCacheEntry = (key) => {
  cache.delete(key);
};
export const invalidateCachePattern = (pattern) => {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
};
const cleanupOldestEntries = () => {
  const entries = Array.from(cache.entries())
    .sort((a, b) => a[1].createdAt - b[1].createdAt);
  const removeCount = Math.ceil(cache.size * 0.2);
  for (let i = 0; i < removeCount; i++) {
    cache.delete(entries[i][0]);
  }
};
export const getCacheStats = () => ({
  ...cacheStats,
  cacheSize: cache.size,
  hitRate: cacheStats.totalRequests > 0 
    ? ((cacheStats.hits + cacheStats.staleHits + cacheStats.persistentHits) / cacheStats.totalRequests * 100).toFixed(2) + '%'
    : '0%',
  pendingRequests: pendingRequests.size,
});
export const fetchWithCache = async (url, options = {}, ttl = CACHE_CONFIG.defaultTTL) => {
  const cacheKey = generateCacheKey(url, options);
  cacheStats.totalRequests++;
  const cached = getCachedData(cacheKey);
  
  if (cached?.fresh) {
    cacheStats.hits++;
    cache.get(cacheKey).accessCount++;
    return { data: cached.data, fromCache: true, fresh: true };
  }
  if (pendingRequests.has(cacheKey)) {
    try {
      const result = await pendingRequests.get(cacheKey);
      return { data: result, fromCache: false, coalesced: true };
    } catch (error) {
      if (cached?.stale || cached?.persistent) {
        cacheStats.staleHits++;
        return { data: cached.data, fromCache: true, fresh: false, stale: true };
      }
      throw error;
    }
  }
  if (cached?.stale) {
    cacheStats.staleHits++;
    revalidateInBackground(url, options, ttl, cacheKey);
    return { data: cached.data, fromCache: true, fresh: false, stale: true, revalidating: true };
  }
  if (cached?.persistent) {
    cacheStats.persistentHits++;
    revalidateInBackground(url, options, ttl, cacheKey);
    return { data: cached.data, fromCache: true, fresh: false, persistent: true, revalidating: true };
  }
  cacheStats.misses++;
  
  const fetchUrl = getFetchUrl(url);
  const fetchPromise = (async () => {
    const response = await fetch(fetchUrl, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  })();
  
  pendingRequests.set(cacheKey, fetchPromise);
  
  try {
    const data = await fetchPromise;
    setCachedData(cacheKey, data, ttl);
    return { data, fromCache: false };
  } catch (error) {
    cacheStats.errors++;
    throw error;
  } finally {
    pendingRequests.delete(cacheKey);
  }
};
const revalidateInBackground = async (url, options, ttl, cacheKey) => {
  try {
    const fetchUrl = getFetchUrl(url);
    const response = await fetch(fetchUrl, options);
    
    if (response.ok) {
      const data = await response.json();
      setCachedData(cacheKey, data, ttl);
    }
  } catch (error) {
  }
};
export const prefetchData = async (url, options = {}, ttl = CACHE_CONFIG.defaultTTL) => {
  const cacheKey = generateCacheKey(url, options);
  const cached = getCachedData(cacheKey);
  if (cached?.fresh) return;
  
  try {
    await fetchWithCache(url, options, ttl);
  } catch (error) {
  }
};
export const fetchBatchWithCache = async (urls, options = {}, ttl = CACHE_CONFIG.defaultTTL) => {
  const results = await Promise.allSettled(
    urls.map(url => fetchWithCache(url, options, ttl))
  );
  
  return results.map((result, index) => ({
    url: urls[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value.data : null,
    error: result.status === 'rejected' ? result.reason.message : null,
    fromCache: result.status === 'fulfilled' ? result.value.fromCache : false,
  }));
};
export const testApiEndpoint = async (url) => {
  const fetchUrl = getFetchUrl(url);
  
  try {
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
      fields: extractFields(data),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
export const extractFields = (obj, prefix = '') => {
  const fields = [];
  
  if (obj === null || obj === undefined) {
    return fields;
  }
  const needsBracket = (key) => /[\s.]/.test(key);
  const makePath = (prefix, key) => {
    if (!prefix) {
      return needsBracket(key) ? `['${key}']` : key;
    }
    return needsBracket(key) ? `${prefix}['${key}']` : `${prefix}.${key}`;
  };
  
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      const arrayFields = extractFields(obj[0], prefix);
      fields.push({
        path: prefix || 'root',
        type: 'array',
        sample: `Array[${obj.length}]`,
        isArray: true,
        children: arrayFields,
      });
    }
    return fields;
  }
  
  if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      const path = makePath(prefix, key);
      
      if (Array.isArray(value)) {
        fields.push({
          path,
          type: 'array',
          sample: `Array[${value.length}]`,
          isArray: true,
          children: value.length > 0 ? extractFields(value[0], path) : [],
        });
      } else if (typeof value === 'object' && value !== null) {
        fields.push({
          path,
          type: 'object',
          sample: '{...}',
          children: extractFields(value, path),
        });
      } else {
        fields.push({
          path,
          type: typeof value,
          sample: String(value).slice(0, 50),
          value,
        });
      }
    });
  }
  
  return fields;
};
export const getValueByPath = (obj, path) => {
  if (!path) return obj;
  if (!obj) return undefined;
  const parts = [];
  let current = '';
  let inBracket = false;
  
  for (let i = 0; i < path.length; i++) {
    const char = path[i];
    
    if (char === '[' && !inBracket) {
      if (current) {
        parts.push(current);
        current = '';
      }
      inBracket = true;
    } else if (char === ']' && inBracket) {
      const bracketContent = current.replace(/^['"]|['"]$/g, '');
      parts.push(bracketContent);
      current = '';
      inBracket = false;
    } else if (char === '.' && !inBracket) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) {
    parts.push(current);
  }
  let result = obj;
  for (const part of parts) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[part];
  }
  if (result === undefined && path.includes('.')) {
    result = findValueByFlexiblePath(obj, path);
  }
  
  return result;
};
const findValueByFlexiblePath = (obj, path) => {
  if (!obj || typeof obj !== 'object') return undefined;
  if (path in obj) {
    return obj[path];
  }
  const parts = path.split('.');
  
  for (let i = 1; i <= parts.length; i++) {
    const firstPart = parts.slice(0, i).join('.');
    const rest = parts.slice(i).join('.');
    
    if (firstPart in obj) {
      if (!rest) {
        return obj[firstPart];
      }
      const nextValue = obj[firstPart];
      if (typeof nextValue === 'object' && nextValue !== null) {
        const result = findValueByFlexiblePath(nextValue, rest);
        if (result !== undefined) {
          return result;
        }
      }
    }
  }
  
  return undefined;
};
export const flattenFields = (fields, result = []) => {
  fields.forEach((field) => {
    if (field.type !== 'object' && field.type !== 'array') {
      result.push(field);
    }
    if (field.children) {
      flattenFields(field.children, result);
    }
  });
  return result;
};
export const findArraysInResponse = (obj, prefix = '') => {
  const arrays = [];
  const needsBracket = (key) => /[\s.]/.test(key);
  const makePath = (prefix, key) => {
    if (!prefix) {
      return needsBracket(key) ? `['${key}']` : key;
    }
    return needsBracket(key) ? `${prefix}['${key}']` : `${prefix}.${key}`;
  };
  
  if (Array.isArray(obj)) {
    arrays.push({
      path: prefix || 'root',
      data: obj,
      sample: obj.slice(0, 3),
    });
    return arrays;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      const path = makePath(prefix, key);
      
      if (Array.isArray(value)) {
        arrays.push({
          path,
          data: value,
          sample: value.slice(0, 3),
        });
      } else if (typeof value === 'object' && value !== null) {
        arrays.push(...findArraysInResponse(value, path));
      }
    });
  }
  
  return arrays;
};
