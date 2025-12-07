'use client';

import useDashboardStore from '@/store/useDashboardStore';
import useApiData from '@/hooks/useApiData';
import { getValueByPath } from '@/utils/apiUtils';
import { formatTime, formatCurrency, formatPercentage, formatLargeNumber, formatDateTime } from '@/utils/formatters';

const CardWidget = ({ widget }) => {
  const { theme, removeWidget } = useDashboardStore();
  const { data, loading, error, lastUpdated, refresh } = useApiData(
    widget.apiUrl,
    0 // Disable auto-refresh, only refresh on button click
  );

  return (
    <div className={`h-full rounded-xl border overflow-hidden flex flex-col ${
      theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white border-gray-200'
    }`}>
      {}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="widget-drag-handle flex items-center gap-2 flex-1 cursor-move">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <h3 className={`font-semibold truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {widget.name}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
          }`}>
            live
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => refresh()}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
            }`}
            title="Remove Widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 p-4 overflow-auto">
        {loading && !data ? (
          <div className="flex items-center justify-center h-full">
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error && !data ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <svg className="w-10 h-10 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{error}</p>
            {widget.apiUrl.includes('YOUR_API_KEY') || widget.apiUrl.includes('YOUR_TOKEN') ? (
              <p className={`text-xs ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                ⚠️ Replace YOUR_API_KEY with your actual API key
              </p>
            ) : null}
            <button
              onClick={refresh}
              className="mt-2 text-xs text-emerald-500 hover:text-emerald-400 underline"
            >
              Try again
            </button>
          </div>
        ) : data ? (
          <div className="space-y-3">
            {widget.selectedFields.map((field) => {
              const value = getValueByPath(data, field.path);
              let formattedValue = '-';
              if (value !== undefined && value !== null) {
                switch (field.formatType) {
                  case 'currency':
                    formattedValue = formatCurrency(value);
                    break;
                  case 'percentage':
                    formattedValue = formatPercentage(value);
                    break;
                  case 'date':
                    formattedValue = formatDateTime(value);
                    break;
                  case 'number':
                  default:
                    formattedValue = formatLargeNumber(value);
                }
              }
              return (
                <div key={field.path} className="flex justify-between items-baseline">
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {field.label}
                  </span>
                  <span className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {}
      {lastUpdated && (
        <div className={`px-4 py-2 text-xs border-t ${
          theme === 'dark' ? 'border-slate-700 text-slate-500' : 'border-gray-100 text-gray-400'
        }`}>
          Last updated: {formatTime(lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default CardWidget;
