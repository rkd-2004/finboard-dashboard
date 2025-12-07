'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
const CandlestickBar = (props) => {
  const { x, y, width, height, payload, yAxisScale } = props;
  
  if (!payload || !yAxisScale) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#22c55e' : '#ef4444'; // Green for up, red for down
  const candleWidth = Math.max(width * 0.8, 2);
  const candleX = x + (width - candleWidth) / 2;
  
  const openY = yAxisScale(open);
  const closeY = yAxisScale(close);
  const highY = yAxisScale(high);
  const lowY = yAxisScale(low);
  
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.abs(closeY - openY) || 1;
  
  return (
    <g>
      {}
      <line
        x1={x + width / 2}
        x2={x + width / 2}
        y1={highY}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      {}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isUp ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};
const CustomTooltip = ({ active, payload, theme }) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0].payload;
  const isUp = data.close >= data.open;
  
  return (
    <div className={`px-3 py-2 rounded-lg shadow-lg border ${
      theme === 'dark' 
        ? 'bg-slate-800 border-slate-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <p className="text-xs text-slate-400 mb-1">{data.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-slate-400">Open:</span>
        <span className="font-medium">{data.open?.toFixed(2)}</span>
        <span className="text-slate-400">High:</span>
        <span className="font-medium text-green-500">{data.high?.toFixed(2)}</span>
        <span className="text-slate-400">Low:</span>
        <span className="font-medium text-red-500">{data.low?.toFixed(2)}</span>
        <span className="text-slate-400">Close:</span>
        <span className={`font-medium ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {data.close?.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const CandlestickChart = ({ data, theme = 'dark', height = 200 }) => {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((candle, index) => ({
      ...candle,
      barValue: Math.abs(candle.close - candle.open) || 0.01,
      isUp: candle.close >= candle.open,
      index,
    }));
  }, [data]);
  const { minY, maxY } = useMemo(() => {
    if (chartData.length === 0) return { minY: 0, maxY: 100 };
    const lows = chartData.map(d => d.low);
    const highs = chartData.map(d => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const padding = (max - min) * 0.1;
    return {
      minY: min - padding,
      maxY: max + padding,
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (!value) return '';
            const parts = value.split('-');
            return `${parts[1]}/${parts[2]}`;
          }}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        <YAxis
          domain={[minY, maxY]}
          tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return value.toFixed(value < 10 ? 2 : 0);
          }}
          width={45}
          orientation="right"
        />
        <Tooltip 
          content={<CustomTooltip theme={theme} />}
          cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        />
        
        {}
        <Bar
          dataKey="high"
          shape={(props) => {
            const { x, width, payload, yAxis } = props;
            if (!payload || !yAxis) return null;
            
            const scale = yAxis.scale;
            const { open, close, high, low, isUp } = payload;
            const color = isUp ? '#22c55e' : '#ef4444';
            
            const candleWidth = Math.max(width * 0.7, 3);
            const candleX = x + (width - candleWidth) / 2;
            const wickX = x + width / 2;
            
            const openY = scale(open);
            const closeY = scale(close);
            const highY = scale(high);
            const lowY = scale(low);
            
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
            
            return (
              <g>
                {}
                <line
                  x1={wickX}
                  x2={wickX}
                  y1={highY}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1}
                />
                {}
                <rect
                  x={candleX}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                />
              </g>
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
