'use client';

import { useState, useEffect, useCallback } from 'react';
import CandlestickChart from '../charts/CandlestickChart';

const MarketChartWidget = ({ 
  symbol, 
  name, 
  theme = 'dark',
  interval = 'daily',
  onRemove,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stocks/candles?symbol=${symbol}&interval=${interval}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const isPositive = data?.changePercent >= 0;

  return (
    <div className={`h-full rounded-lg overflow-hidden ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border border-slate-700/50' 
        : 'bg-white border border-gray-200'
    }`}>
      {}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium text-sm ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isPositive 
                ? 'text-green-400 bg-green-500/10' 
                : 'text-red-400 bg-red-500/10'
            }`}>
              {isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%
            </span>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className={`p-1 rounded transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="px-2 pb-2" style={{ height: 'calc(100% - 44px)' }}>
        {loading && !data ? (
          <div className="h-full flex items-center justify-center">
            <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-xs">
            {error}
          </div>
        ) : (
          <CandlestickChart 
            data={data?.candles || []} 
            theme={theme}
            height="100%"
          />
        )}
      </div>
    </div>
  );
};

export default MarketChartWidget;
