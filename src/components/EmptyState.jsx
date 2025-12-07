'use client';

import useDashboardStore from '@/store/useDashboardStore';

const EmptyState = ({ onAddWidget, onQuickAdd }) => {
  const { theme } = useDashboardStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-lg">
        <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
        }`}>
          <svg
            className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Build Your Finance Dashboard
        </h2>
        <p className={`mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
          Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic indicators — all in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {}
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-left">
              <span className="font-semibold block">Quick Add Widgets</span>
              <span className="text-sm text-emerald-100">Pre-configured templates</span>
            </div>
          </button>

          {}
          <button
            onClick={onAddWidget}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed transition-colors ${
              theme === 'dark'
                ? 'border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                : 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <div className="text-left">
              <span className="font-semibold block">Custom Widget</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                Connect your own API
              </span>
            </div>
          </button>
        </div>

        {}
        <div className={`mt-12 pt-8 border-t ${
          theme === 'dark' ? 'border-slate-800' : 'border-gray-100'
        }`}>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            Available widget types:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              Cards
            </span>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Tables
            </span>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Charts
            </span>
          </div>
        </div>

        {}
        <div className={`mt-8`}>
          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            Supported free APIs:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['CoinGecko', 'ExchangeRate-API', 'Alpha Vantage', 'Finnhub'].map((api) => (
              <span
                key={api}
                className={`px-3 py-1 rounded-full text-xs ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {api}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
