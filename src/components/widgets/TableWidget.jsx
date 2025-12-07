'use client';

import { useState, useMemo } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import useApiData from '@/hooks/useApiData';
import { getValueByPath } from '@/utils/apiUtils';
import { formatTime, formatCurrency, formatPercentage, formatLargeNumber, formatDateTime } from '@/utils/formatters';
const getLastKey = (path) => {
  if (!path) return path;
  const bracketMatch = path.match(/\['([^']+)'\]$/);
  if (bracketMatch) {
    return bracketMatch[1];
  }
  const parts = path.split('.');
  return parts[parts.length - 1];
};

const TableWidget = ({ widget }) => {
  const { theme, removeWidget } = useDashboardStore();
  const { data, loading, error, lastUpdated, refresh } = useApiData(
    widget.apiUrl,
    0 // Disable auto-refresh, only refresh on button click
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableData = useMemo(() => {
    if (!data) return [];
    const arrayData = widget.arrayPath ? getValueByPath(data, widget.arrayPath) : data;
    const result = Array.isArray(arrayData) ? arrayData : [];
    if (result.length > 0) {
      console.log('[TableWidget Debug] First item data structure:', result[0]);
      console.log('[TableWidget Debug] Widget fields:', widget.selectedFields);
    }
    
    return result;
  }, [data, widget.arrayPath]);
  const processedData = useMemo(() => {
    let result = [...tableData];
    if (searchTerm) {
      result = result.filter((item) =>
        widget.selectedFields.some((field) => {
          const fieldKey = getLastKey(field.path);
          const value = getValueByPath(item, fieldKey);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = getValueByPath(a, sortConfig.key);
        const bVal = getValueByPath(b, sortConfig.key);

        if (aVal === bVal) return 0;
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [tableData, searchTerm, sortConfig, widget.selectedFields]);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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
      <div className={`px-4 py-2 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="relative">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search table..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            } border focus:outline-none focus:ring-2 focus:ring-emerald-500`}
          />
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto">
        {loading && !data ? (
          <div className="flex items-center justify-center h-full">
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error && !data ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>{error}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className={`sticky top-0 ${
              theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
            }`}>
              <tr>
                {widget.selectedFields.map((field) => {
                  const fieldKey = getLastKey(field.path);
                  return (
                    <th
                      key={field.path}
                      onClick={() => handleSort(fieldKey)}
                      className={`text-left px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap ${
                        theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {field.label}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={widget.selectedFields.length}
                    className={`px-4 py-8 text-center ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                    }`}
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      theme === 'dark'
                        ? 'border-slate-700 hover:bg-slate-800/50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {widget.selectedFields.map((field) => {
                      const fieldKey = getLastKey(field.path);
                      const value = getValueByPath(item, fieldKey);
                      if (paginatedData.indexOf(item) === 0) {
                        console.log(`[TableWidget Debug] Field: ${field.path} -> Key: ${fieldKey} -> Value:`, value);
                      }
                      
                      let formattedValue = '-';
                      if (value !== undefined && value !== null && value !== '') {
                        if (field.type === 'string') {
                          formattedValue = String(value);
                        } else {
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
                      }
                      return (
                        <td
                          key={field.path}
                          className={`px-4 py-3 text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                          }`}
                        >
                          {formattedValue}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {}
      <div className={`flex items-center justify-between px-4 py-2 border-t ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <span className={`text-xs ${
          theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
        }`}>
          {lastUpdated && `Last updated: ${formatTime(lastUpdated)}`}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {processedData.length} of {tableData.length} items
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-1 rounded ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-slate-400 disabled:text-slate-600'
                    : 'hover:bg-gray-100 text-gray-500 disabled:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className={`text-xs ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-1 rounded ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-slate-400 disabled:text-slate-600'
                    : 'hover:bg-gray-100 text-gray-500 disabled:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableWidget;
