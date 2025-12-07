'use client';

import { useState } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import StockChartWidget from './widgets/StockChartWidget';
import StockTable from './tables/StockTable';
import { WatchlistCard, MarketGainersCard, PerformanceCard, FinancialDataCard } from './cards/FinanceCards';
const DEMO_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

const StockDashboard = () => {
  const { theme } = useDashboardStore();
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [showStockSelector, setShowStockSelector] = useState(false);

  const handleStockSelect = (symbol) => {
    setSelectedStock(symbol);
    setShowStockSelector(false);
  };

  return (
    <div className="space-y-6">
      {}
      <div className={`rounded-xl border p-4 ${
        theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Stock Dashboard
            </h2>
            
            {}
            <div className="relative">
              <button
                onClick={() => setShowStockSelector(!showStockSelector)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="font-mono">{selectedStock}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showStockSelector && (
                <div className={`absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-xl z-50 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-2">
                    <div className={`text-xs font-medium mb-2 px-2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Select Stock
                    </div>
                    {DEMO_STOCKS.map((stock) => (
                      <button
                        key={stock}
                        onClick={() => handleStockSelect(stock)}
                        className={`w-full text-left px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
                          selectedStock === stock
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : theme === 'dark' 
                              ? 'text-white hover:bg-slate-700' 
                              : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {stock}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            Real-time stock data • Auto-refresh enabled
          </div>
        </div>
      </div>

      {}
      <div className="h-[500px]">
        <StockChartWidget 
          symbol={selectedStock}
          height={500}
          showControls={true}
        />
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WatchlistCard 
          stocks={DEMO_STOCKS.slice(0, 5)} 
        />
        <MarketGainersCard />
        <PerformanceCard 
          symbol={selectedStock} 
        />
        <FinancialDataCard 
          symbol={selectedStock} 
        />
      </div>

      {}
      <StockTable 
        stocks={['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'JPM', 'BAC', 'WMT', 'DIS', 'V']}
        pageSize={10}
      />

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[350px]">
          <StockChartWidget 
            symbol="MSFT"
            height={350}
            defaultChartType="line"
            showControls={true}
          />
        </div>
        <div className="h-[350px]">
          <StockChartWidget 
            symbol="NVDA"
            height={350}
            defaultChartType="area"
            showControls={true}
          />
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
