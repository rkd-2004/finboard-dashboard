'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatPercentage, formatLargeNumber } from '@/utils/formatters';
import useDashboardStore from '@/store/useDashboardStore';
import StockCandlestickChart from '../charts/StockCandlestickChart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const StockChartWidget = ({ 
  symbol = 'AAPL',
  defaultChartType = 'candle',
  defaultInterval = 'D',
  showControls = true,
  height = 400,
  onRemove,
}) => {
  const { theme, removeWidget } = useDashboardStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState(defaultChartType); // candle, line, area
  const [timeInterval, setTimeInterval] = useState(defaultInterval); // D, W, M
  const [showMA, setShowMA] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const url = `/api/stocks/candles?symbol=${symbol}&resolution=${timeInterval}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [symbol, timeInterval]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const isPositive = data?.periodChangePercent >= 0;
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const d = payload[0].payload;
    
    return (
      <div className={`p-2 rounded-lg shadow-lg border ${
        theme === 'dark' 
          ? 'bg-slate-800 border-slate-600 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="text-xs text-slate-400 mb-1">{d.date}</p>
        <p className="font-mono font-medium">${d.close?.toFixed(2)}</p>
      </div>
    );
  };

  return (
    <div className={`rounded-xl border overflow-hidden h-full flex flex-col ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      {}
      <div className={`px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="widget-drag-handle cursor-move">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                {symbol.slice(0, 2)}
              </div>
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {symbol}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.currentPrice !== undefined ? formatCurrency(data.currentPrice) : '---'}
                </span>
                {data && (
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {data.periodChangePercent !== undefined ? formatPercentage(data.periodChangePercent) : '--'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {}
            {onRemove && (
              <button
                onClick={onRemove}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {}
        {showControls && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
            {}
            <div className="flex items-center gap-1">
              {[
                { id: 'candle', label: 'Candle', icon: '📊' },
                { id: 'line', label: 'Line', icon: '📈' },
                { id: 'area', label: 'Area', icon: '📉' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    chartType === type.id
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {}
            <div className="flex items-center gap-1">
              {[
                { id: 'D', label: 'Daily' },
                { id: 'W', label: 'Weekly' },
                { id: 'M', label: 'Monthly' },
              ].map((int) => (
                <button
                  key={int.id}
                  onClick={() => setTimeInterval(int.id)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    timeInterval === int.id
                      ? theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                      : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>

            {}
            <div className="flex items-center gap-2">
              {chartType === 'candle' && (
                <>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMA}
                      onChange={(e) => setShowMA(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>MA</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showVolume}
                      onChange={(e) => setShowVolume(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Vol</span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {}
      <div className="flex-1 p-4 min-h-0">
        {loading && !data ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                Loading {symbol} data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 text-emerald-500 text-sm hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data?.candles?.length > 0 ? (
          <>
            {chartType === 'candle' && (
              <StockCandlestickChart 
                data={data.candles} 
                theme={theme} 
                height={height - 120}
                showMA={showMA}
                showVolume={showVolume}
              />
            )}
            
            {chartType === 'line' && (
              <ResponsiveContainer width="100%" height={height - 120}>
                <LineChart data={data.candles} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
                    tickFormatter={(v) => v.split('-').slice(1).join('/')}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                    width={50}
                    orientation="right"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'area' && (
              <ResponsiveContainer width="100%" height={height - 120}>
                <AreaChart data={data.candles} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
                    tickFormatter={(v) => v.split('-').slice(1).join('/')}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                    width={50}
                    orientation="right"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                    fill={`url(#gradient-${symbol})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              No chart data available
            </p>
          </div>
        )}
      </div>

      {}
      {data && (
        <div className={`px-4 py-2 border-t grid grid-cols-4 gap-4 ${
          theme === 'dark' ? 'border-slate-700 bg-slate-800/30' : 'border-gray-100 bg-gray-50'
        }`}>
          <div>
            <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Open</div>
            <div className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {data.candles?.[data.candles.length - 1]?.open !== undefined ? formatCurrency(data.candles[data.candles.length - 1].open) : '--'}
            </div>
          </div>
          <div>
            <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>High</div>
            <div className="font-mono text-sm text-green-500">
              {data.candles?.[data.candles.length - 1]?.high !== undefined ? formatCurrency(data.candles[data.candles.length - 1].high) : '--'}
            </div>
          </div>
          <div>
            <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Low</div>
            <div className="font-mono text-sm text-red-500">
              {data.candles?.[data.candles.length - 1]?.low !== undefined ? formatCurrency(data.candles[data.candles.length - 1].low) : '--'}
            </div>
          </div>
          <div>
            <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Volume</div>
            <div className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {data.candles?.[data.candles.length - 1]?.volume !== undefined ? formatLargeNumber(data.candles[data.candles.length - 1].volume) : '--'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockChartWidget;
