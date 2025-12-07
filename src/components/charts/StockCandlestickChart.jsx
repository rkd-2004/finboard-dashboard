'use client';

import { useMemo, memo, useCallback, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
const CustomTooltip = memo(({ active, payload, theme }) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0].payload;
  const isGreen = data.close >= data.open;
  const changePercent = ((data.close - data.open) / data.open * 100).toFixed(2);
  
  return (
    <div className={`p-3 rounded-lg shadow-xl border ${
      theme === 'dark' 
        ? 'bg-slate-800 border-slate-600 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <p className={`text-xs font-medium mb-2 ${
        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
      }`}>
        {data.date}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Open</span>
        <span className="font-mono font-medium text-right">${data.open?.toFixed(2)}</span>
        
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>High</span>
        <span className="font-mono font-medium text-right text-green-500">${data.high?.toFixed(2)}</span>
        
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Low</span>
        <span className="font-mono font-medium text-right text-red-500">${data.low?.toFixed(2)}</span>
        
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Close</span>
        <span className={`font-mono font-medium text-right ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
          ${data.close?.toFixed(2)}
        </span>
        
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Change</span>
        <span className={`font-mono font-medium text-right ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
          {isGreen ? '+' : ''}{changePercent}%
        </span>
        
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Volume</span>
        <span className="font-mono font-medium text-right">
          {(data.volume / 1000000).toFixed(1)}M
        </span>
      </div>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';
const CandlestickBar = memo((props) => {
  const { x, y, width, height, payload, minPrice, maxPrice, chartHeight } = props;
  if (!payload) return null;
  
  const { open, high, low, close, isGreen } = payload;
  const color = isGreen ? '#22c55e' : '#ef4444';
  const priceRange = maxPrice - minPrice;
  const pixelsPerDollar = chartHeight / priceRange;
  const candleWidth = Math.max(width * 0.8, 4);
  const centerX = x + width / 2;
  
  const highY = chartHeight - (high - minPrice) * pixelsPerDollar;
  const lowY = chartHeight - (low - minPrice) * pixelsPerDollar;
  const openY = chartHeight - (open - minPrice) * pixelsPerDollar;
  const closeY = chartHeight - (close - minPrice) * pixelsPerDollar;
  
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
  
  return (
    <g>
      {}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      {}
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
});

CandlestickBar.displayName = 'CandlestickBar';

const StockCandlestickChart = ({ 
  data, 
  theme = 'dark', 
  height = 400,
  showVolume = true,
  showMA = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    return data.map((candle, index) => {
      const ma20Start = Math.max(0, index - 19);
      const ma20Data = data.slice(ma20Start, index + 1);
      const ma20 = ma20Data.reduce((sum, c) => sum + c.close, 0) / ma20Data.length;
      const ma50Start = Math.max(0, index - 49);
      const ma50Data = data.slice(ma50Start, index + 1);
      const ma50 = ma50Data.reduce((sum, c) => sum + c.close, 0) / ma50Data.length;
      
      const isGreen = candle.close >= candle.open;
      
      return {
        ...candle,
        ma20: parseFloat(ma20.toFixed(2)),
        ma50: parseFloat(ma50.toFixed(2)),
        isGreen,
        range: candle.high - candle.low,
        bodyHigh: Math.max(candle.open, candle.close),
        bodyLow: Math.min(candle.open, candle.close),
        placeholder: 1,
      };
    });
  }, [data]);
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (chartData.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 1000000 };
    
    const prices = chartData.flatMap(d => [d.low, d.high]);
    const volumes = chartData.map(d => d.volume || 0);
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.05;
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: Math.max(...volumes) * 1.1,
    };
  }, [chartData]);
  const renderCandlestick = useCallback((props) => {
    const { x, width, index } = props;
    if (index === undefined || !chartData[index]) return null;
    
    const candle = chartData[index];
    const { open, high, low, close, isGreen } = candle;
    const color = isGreen ? '#22c55e' : '#ef4444';
    
    const priceRange = maxPrice - minPrice;
    const chartAreaHeight = showVolume ? (height * 0.75) - 30 : height - 30; // Account for margins
    const pixelsPerDollar = chartAreaHeight / priceRange;
    const highY = 10 + (maxPrice - high) * pixelsPerDollar;
    const lowY = 10 + (maxPrice - low) * pixelsPerDollar;
    const openY = 10 + (maxPrice - open) * pixelsPerDollar;
    const closeY = 10 + (maxPrice - close) * pixelsPerDollar;
    
    const candleWidth = Math.max(width * 0.7, 3);
    const centerX = x + width / 2;
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
    
    return (
      <g key={`candle-${index}`}>
        {}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {}
        <rect
          x={centerX - candleWidth / 2}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={color}
        />
      </g>
    );
  }, [chartData, minPrice, maxPrice, height, showVolume]);

  if (chartData.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center ${
        theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
      }`}>
        No chart data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {}
      <ResponsiveContainer width="100%" height={showVolume ? '75%' : '100%'}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: theme === 'dark' ? '#334155' : '#e5e7eb' }}
            tickFormatter={(value) => {
              if (!value) return '';
              const parts = value.split('-');
              return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : value;
            }}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={55}
            orientation="right"
          />
          <Tooltip 
            content={<CustomTooltip theme={theme} />}
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
          />
          
          {}
          <Bar 
            dataKey="placeholder" 
            isAnimationActive={false}
            shape={renderCandlestick}
          />
          
          {}
          {showMA && (
            <>
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="MA20"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                name="MA50"
                isAnimationActive={false}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      {}
      {showVolume && (
        <ResponsiveContainer width="100%" height="25%">
          <ComposedChart
            data={chartData}
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="date" hide />
            <YAxis
              domain={[0, maxVolume]}
              tick={{ fontSize: 9, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              width={55}
              orientation="right"
            />
            <Bar dataKey="volume" name="Volume" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`vol-${index}`} 
                  fill={entry.isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'} 
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default memo(StockCandlestickChart);
