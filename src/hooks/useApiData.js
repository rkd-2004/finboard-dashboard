'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithCache, getCacheStats } from '@/utils/apiUtils';

const useApiData = (url, refreshInterval = 30000, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cacheStatus, setCacheStatus] = useState({ fromCache: false, stale: false, revalidating: false });
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const hasDataRef = useRef(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!url || !enabled) return;
    if (showLoading && !hasDataRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const [result] = await Promise.all([
        fetchWithCache(url, {}, 60000),
        showLoading && !hasDataRef.current ? new Promise(resolve => setTimeout(resolve, 300)) : Promise.resolve(),
      ]);
      if (mountedRef.current) {
        setData(result.data);
        hasDataRef.current = true;
        setCacheStatus({
          fromCache: result.fromCache || false,
          stale: result.stale || false,
          revalidating: result.revalidating || false,
          fresh: result.fresh || false,
          coalesced: result.coalesced || false,
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, enabled]);
  useEffect(() => {
    mountedRef.current = true;
    hasDataRef.current = false;
    fetchData(true);
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      fetchData(false); // Don't show loading on refresh
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval, enabled]);
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    fromCache: cacheStatus.fromCache,
    cacheStatus,
    refresh,
    getCacheStats, // Expose cache stats for debugging
  };
};

export default useApiData;
