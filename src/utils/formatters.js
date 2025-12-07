
export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  
  const num = parseFloat(value);
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};
export const formatLargeNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  
  const num = parseFloat(value);
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return `${(num / 1e12).toFixed(2)}T`;
  }
  if (absNum >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (absNum >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (absNum >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  
  return num.toFixed(2);
};
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
export const formatTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
export const autoFormat = (value, formatType = 'auto') => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  switch (formatType) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
      return formatLargeNumber(value);
    case 'date':
      return formatDateTime(value);
    case 'auto':
    default:
      if (typeof value === 'number') {
        if (Math.abs(value) < 1 && value !== 0) {
          return formatPercentage(value * 100);
        }
        return formatLargeNumber(value);
      }
      return String(value);
  }
};
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
export const getValueColor = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-gray-400';
  }
  
  const num = parseFloat(value);
  if (num > 0) return 'text-green-500';
  if (num < 0) return 'text-red-500';
  return 'text-gray-400';
};
