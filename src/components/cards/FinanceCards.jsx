'use client';

import { useState, useEffect, useCallback } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
const RefreshButton = ({ onClick, loading, theme }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`p-1 rounded transition-colors ${
      theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
    } ${loading ? 'animate-spin' : ''}`}
    title="Refresh data"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </button>
);
export const WatchlistCard = ({ stocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'] }) => {
  const { theme } = useDashboardStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const symbolsParam = stocks.join(',');
      const url = `/api/stocks/finnhub?symbols=${symbolsParam}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (result.stocks) {
        setData(result.stocks);
      }
    } catch (err) {
      console.error('Watchlist fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stocks]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className={`rounded-xl border h-full ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Watchlist
            </h3>
          </div>
          <RefreshButton onClick={() => fetchData(true)} loading={refreshing} theme={theme} />
        </div>
      </div>
      
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              return (
                <div 
                  key={stock.symbol}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stock.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${stock.price?.toFixed(2)}
                    </div>
                    <div className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export const MarketGainersCard = () => {
  const { theme } = useDashboardStore();
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [activeTab, setActiveTab] = useState('gainers');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const symbols = 'AAPL,MSFT,GOOGL,AMZN,TSLA,NVDA,META,NFLX,AMD,INTC,JPM,BAC,WMT,DIS,V';
      const url = `/api/stocks/finnhub?symbols=${symbols}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (result.stocks) {
        const sorted = [...result.stocks].sort((a, b) => b.changePercent - a.changePercent);
        setGainers(sorted.filter(s => s.changePercent > 0).slice(0, 5));
        setLosers(sorted.filter(s => s.changePercent < 0).slice(-5).reverse());
      }
    } catch (err) {
      console.error('Market movers fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayData = activeTab === 'gainers' ? gainers : losers;

  return (
    <div className={`rounded-xl border h-full ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Market Movers
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('gainers')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  activeTab === 'gainers'
                    ? 'bg-green-500/20 text-green-500'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setActiveTab('losers')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  activeTab === 'losers'
                    ? 'bg-red-500/20 text-red-500'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Losers
              </button>
            </div>
            <RefreshButton onClick={() => fetchData(true)} loading={refreshing} theme={theme} />
          </div>
        </div>
      </div>
      
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-1">
            {displayData.map((stock, index) => {
              const isPositive = stock.changePercent >= 0;
              return (
                <div 
                  key={stock.symbol}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded ${
                      isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stock.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${stock.price?.toFixed(2)}
                    </div>
                    <div className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent)?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export const PerformanceCard = ({ symbol = 'AAPL' }) => {
  const { theme } = useDashboardStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const url = `/api/stocks/candles?symbol=${symbol}&resolution=D`;
      
      const res = await fetch(url);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Performance fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [symbol]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPositive = data?.periodChangePercent >= 0;

  return (
    <div className={`rounded-xl border h-full ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {symbol} Performance
            </h3>
          </div>
          <RefreshButton onClick={() => fetchData(true)} loading={refreshing} theme={theme} />
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {}
            <div className="text-center">
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${data.currentPrice?.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{data.periodChange?.toFixed(2)} ({isPositive ? '+' : ''}{data.periodChangePercent?.toFixed(2)}%)
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                6 Month Performance
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  52W High
                </div>
                <div className={`font-mono font-medium text-green-500`}>
                  ${data.high52Week?.toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  52W Low
                </div>
                <div className={`font-mono font-medium text-red-500`}>
                  ${data.low52Week?.toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  Avg Volume
                </div>
                <div className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {(data.avgVolume / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  Data Points
                </div>
                <div className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data.candleCount}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            No data available
          </div>
        )}
      </div>
    </div>
  );
};
export const FinancialDataCard = ({ symbol = 'AAPL' }) => {
  const { theme } = useDashboardStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const url = `/api/stocks/detail?symbol=${symbol}`;
      
      const res = await fetch(url);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Financial data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [symbol]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metrics = data ? [
    { label: 'Market Cap', value: data.marketCap ? `$${(data.marketCap * 1e6 / 1e9).toFixed(1)}B` : 'N/A' },
    { label: 'P/E Ratio', value: data.peRatio ? data.peRatio.toFixed(2) : 'N/A' },
    { label: 'EPS', value: data.eps ? `$${data.eps.toFixed(2)}` : 'N/A' },
    { label: 'Dividend Yield', value: data.dividendYield ? `${data.dividendYield.toFixed(2)}%` : 'N/A' },
    { label: 'Beta', value: data.beta ? data.beta.toFixed(2) : 'N/A' },
    { label: '52W Range', value: data.week52High && data.week52Low ? `$${data.week52Low.toFixed(0)} - $${data.week52High.toFixed(0)}` : 'N/A' },
  ] : [];

  return (
    <div className={`rounded-xl border h-full ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {symbol} Financials
            </h3>
          </div>
          <RefreshButton onClick={() => fetchData(true)} loading={refreshing} theme={theme} />
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.map((metric) => (
              <div 
                key={metric.label}
                className={`flex items-center justify-between py-2 border-b last:border-0 ${
                  theme === 'dark' ? 'border-slate-700/50' : 'border-gray-100'
                }`}
              >
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  {metric.label}
                </span>
                <span className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default { WatchlistCard, MarketGainersCard, PerformanceCard, FinancialDataCard };
