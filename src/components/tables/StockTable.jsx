'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import useDashboardStore from '@/store/useDashboardStore';

const StockTable = ({ 
  stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'JPM', 'BAC', 'WMT', 'DIS', 'V', 'MA', 'PG', 'JNJ', 'UNH', 'HD'],
  pageSize = 10,
}) => {
  const { theme } = useDashboardStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, gainers, losers

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const symbolsParam = stocks.join(',');

      const url = `/api/stocks/finnhub?symbols=${symbolsParam}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (result.stocks) {
        setData(result.stocks);
      }
    } catch (err) {
      console.error('Stock table fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stocks]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const processedData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'gainers') {
      filtered = filtered.filter(stock => stock.changePercent > 0);
    } else if (filter === 'losers') {
      filtered = filtered.filter(stock => stock.changePercent < 0);
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });

    return filtered;
  }, [data, searchTerm, sortConfig, filter]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      {}
      <div className={`px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Stock Prices
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
            }`}>
              {processedData.length} stocks
            </span>
            {}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } ${refreshing ? 'animate-spin' : ''}`}
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {}
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search symbol..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-9 pr-3 py-1.5 text-sm rounded-lg border w-40 ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {}
            <div className="flex gap-1">
              {['all', 'gainers', 'losers'].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    filter === f
                      ? f === 'gainers' 
                        ? 'bg-green-500/20 text-green-500'
                        : f === 'losers'
                          ? 'bg-red-500/20 text-red-500'
                          : theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-800'
                      : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}>
              {[
                { key: 'symbol', label: 'Symbol' },
                { key: 'price', label: 'Price' },
                { key: 'change', label: 'Change' },
                { key: 'changePercent', label: '% Change' },
                { key: 'high', label: 'High' },
                { key: 'low', label: 'Low' },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    <SortIcon columnKey={column.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-4 py-8 text-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  No stocks found
                </td>
              </tr>
            ) : (
              paginatedData.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <tr 
                    key={stock.symbol}
                    className={`transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                        }`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        {stock.symbol}
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-mono ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${stock.price?.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{stock.change?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        isPositive 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent)?.toFixed(2)}%
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-green-500`}>
                      ${stock.high?.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 font-mono text-red-500`}>
                      ${stock.low?.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {}
      {totalPages > 1 && (
        <div className={`px-4 py-3 border-t flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
        }`}>
          <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? theme === 'dark' ? 'text-slate-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                  : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white'
                    : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? theme === 'dark' ? 'text-slate-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                  : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;
