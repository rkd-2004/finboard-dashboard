'use client';

import { useMemo } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import useApiData from '@/hooks/useApiData';
import { getValueByPath } from '@/utils/apiUtils';
import { formatTime, formatCurrency, formatPercentage, formatLargeNumber, formatDateTime } from '@/utils/formatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
const getLastKey = (path) => {
  if (!path) return path;
  const bracketMatch = path.match(/\['([^']+)'\]$/);
  if (bracketMatch) return bracketMatch[1];
  const parts = path.split('.');
  return parts[parts.length - 1];
};
const getDisplayName = (field) => {
  const lastKey = getLastKey(field.path);
  if (field.path.includes('.')) {
    const parts = field.path.split('.');
    if (parts.length >= 2) {
      const parentPart = parts[parts.length - 2].replace(/[\[\]']/g, '');
      return parentPart || field.label;
    }
  }
  
  return field.label;
};

const ChartWidget = ({ widget }) => {
  const { theme, removeWidget } = useDashboardStore();
  const { data, loading, error, lastUpdated, refresh } = useApiData(
    widget.apiUrl,
    0 // Disable auto-refresh, only refresh on button click
  );
  const chartData = useMemo(() => {
    if (!data) return [];
    let arrayData = widget.arrayPath ? getValueByPath(data, widget.arrayPath) : data;
    if (typeof arrayData === 'object' && !Array.isArray(arrayData)) {
      if (arrayData.rates) {
        const entries = Object.entries(arrayData.rates).slice(0, 20);
        return entries.map(([key, value]) => ({
          name: key,
          value: parseFloat(value) || 0,
        }));
      }
      if (widget.selectedFields.length > 0) {
        const dataPoint = { name: 'Current' };
        widget.selectedFields.forEach((field, index) => {
          const value = getValueByPath(data, field.path);
          const displayName = getDisplayName(field);
          dataPoint[displayName] = parseFloat(value) || 0;
        });
        return [dataPoint];
      }
      const entries = Object.entries(arrayData);
      return entries.slice(0, 20).map(([key, value]) => ({
        name: key,
        value: typeof value === 'object' ? (value.price || value.value || 0) : (parseFloat(value) || 0),
      }));
    }
    if (Array.isArray(arrayData)) {
      return arrayData.slice(0, 50).map((item, index) => {
        const point = { index };
        widget.selectedFields.forEach((field) => {
          const fieldKey = getLastKey(field.path);
          const displayName = getDisplayName(field);
          point[displayName] = parseFloat(getValueByPath(item, fieldKey)) || 0;
        });
        return point;
      });
    }
    
    return [];
  }, [data, widget.arrayPath, widget.selectedFields]);
  const chartFields = useMemo(() => {
    return widget.selectedFields.map((field, index) => ({
      ...field,
      displayName: getDisplayName(field),
      uniqueKey: `${field.path}-${index}`,
    }));
  }, [widget.selectedFields]);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
      <div className="flex-1 p-4 min-h-0">
        {loading && !data ? (
          <div className="flex items-center justify-center h-full">
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error && !data ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>{error}</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {chartFields.map((field, i) => (
                  <linearGradient key={`grad-${field.uniqueKey}`} id={`gradient-${field.uniqueKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
                <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#334155' : '#e5e7eb'}
                vertical={false}
              />
              <XAxis
                dataKey={chartData[0]?.name !== undefined ? 'name' : 'index'}
                stroke={theme === 'dark' ? '#64748b' : '#9ca3af'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={theme === 'dark' ? '#64748b' : '#9ca3af'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const formatType = chartFields[0]?.formatType || 'number';
                  switch (formatType) {
                    case 'currency':
                      return formatCurrency(value);
                    case 'percentage':
                      return formatPercentage(value);
                    case 'date':
                      return formatDateTime(value);
                    case 'number':
                    default:
                      return formatLargeNumber(value);
                  }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                }}
                formatter={(value, name, props) => {
                  const field = chartFields.find(f => f.displayName === name);
                  if (!field) return value;
                  switch (field.formatType) {
                    case 'currency':
                      return formatCurrency(value);
                    case 'percentage':
                      return formatPercentage(value);
                    case 'date':
                      return formatDateTime(value);
                    case 'number':
                    default:
                      return formatLargeNumber(value);
                  }
                }}
              />
              {chartFields.length > 0 ? (
                chartFields.map((field, i) => (
                  <Area
                    key={`area-${field.uniqueKey}`}
                    type="monotone"
                    dataKey={field.displayName}
                    name={field.label}
                    stroke={colors[i % colors.length]}
                    fill={`url(#gradient-${field.uniqueKey})`}
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="url(#gradient-default)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}>
              No chart data available
            </p>
          </div>
        )}
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

export default ChartWidget;
