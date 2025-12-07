'use client';

import { useState, useEffect } from 'react';
import MarketChartWidget from './widgets/MarketChartWidget';
import useDashboardStore from '@/store/useDashboardStore';
const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'EWC', name: 'S&P/TSX' },
  { symbol: 'VIX', name: 'Volatility Index' },
  { symbol: 'UUP', name: 'US Dollar Index' },
  { symbol: 'IEF', name: 'Treasury Yield 5 Years' },
  { symbol: 'TLT', name: 'Treasury Yield 30 Years' },
];

const BroadMarketPerformance = () => {
  const { theme } = useDashboardStore();
  const [activeTab, setActiveTab] = useState('charts');
  const [interval, setInterval] = useState('daily');

  const tabs = [
    { id: 'charts', label: 'Charts' },
    { id: 'summary', label: 'Summary' },
    { id: 'returns', label: 'One-Day Returns' },
  ];

  const intervals = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className={`rounded-xl border overflow-hidden ${
      theme === 'dark' 
        ? 'bg-slate-900/50 border-slate-700/50' 
        : 'bg-white border-gray-200'
    }`}>
      {}
      <div className={`px-5 py-4 border-b ${
        theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Broad Market Performance
          </h2>
          
          {}
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-slate-700 text-slate-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-slate-700 text-slate-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-600'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {intervals.map((int) => (
              <button
                key={int.id}
                onClick={() => setInterval(int.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  interval === int.id
                    ? theme === 'dark'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {int.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="p-4">
        {activeTab === 'charts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MARKET_INDICES.map((index) => (
              <div key={index.symbol} className="h-48">
                <MarketChartWidget
                  symbol={index.symbol}
                  name={index.name}
                  theme={theme}
                  interval={interval}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MARKET_INDICES.map((index) => (
              <SummaryCard key={index.symbol} symbol={index.symbol} name={index.name} theme={theme} />
            ))}
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="overflow-x-auto">
            <ReturnsTable indices={MARKET_INDICES} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
};
const SummaryCard = ({ symbol, name, theme }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/stocks/candles?symbol=${symbol}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [symbol]);

  const isPositive = data?.changePercent >= 0;

  return (
    <div className={`p-4 rounded-lg ${
      theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-medium text-sm ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {name}
        </h3>
        {data && (
          <span className={`text-xs font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {data?.currentPrice?.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }) || '---'}
      </div>
      <div className={`text-xs mt-1 ${
        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
      }`}>
        {data?.change !== undefined && (
          <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
            {isPositive ? '+' : ''}{data.change?.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};
const ReturnsTable = ({ indices, theme }) => {
  const [data, setData] = useState({});

  useEffect(() => {
    indices.forEach(index => {
      fetch(`/api/stocks/candles?symbol=${index.symbol}`)
        .then(res => res.json())
        .then(result => setData(prev => ({ ...prev, [index.symbol]: result })))
        .catch(console.error);
    });
  }, [indices]);

  return (
    <table className="w-full">
      <thead>
        <tr className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
          <th className="text-left text-xs font-medium py-2 px-3">Index</th>
          <th className="text-right text-xs font-medium py-2 px-3">Price</th>
          <th className="text-right text-xs font-medium py-2 px-3">Change</th>
          <th className="text-right text-xs font-medium py-2 px-3">% Change</th>
          <th className="text-right text-xs font-medium py-2 px-3">52W High</th>
          <th className="text-right text-xs font-medium py-2 px-3">52W Low</th>
        </tr>
      </thead>
      <tbody>
        {indices.map(index => {
          const d = data[index.symbol];
          const isPositive = d?.changePercent >= 0;
          return (
            <tr 
              key={index.symbol}
              className={`border-t ${
                theme === 'dark' ? 'border-slate-700/50' : 'border-gray-100'
              }`}
            >
              <td className={`py-2 px-3 text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {index.name}
              </td>
              <td className={`py-2 px-3 text-sm text-right ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {d?.currentPrice?.toFixed(2) || '---'}
              </td>
              <td className={`py-2 px-3 text-sm text-right ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {d?.change !== undefined ? `${isPositive ? '+' : ''}${d.change.toFixed(2)}` : '---'}
              </td>
              <td className={`py-2 px-3 text-sm text-right ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {d?.changePercent !== undefined ? `${isPositive ? '+' : ''}${d.changePercent.toFixed(2)}%` : '---'}
              </td>
              <td className={`py-2 px-3 text-sm text-right ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {d?.high52Week?.toFixed(2) || '---'}
              </td>
              <td className={`py-2 px-3 text-sm text-right ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {d?.low52Week?.toFixed(2) || '---'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default BroadMarketPerformance;
