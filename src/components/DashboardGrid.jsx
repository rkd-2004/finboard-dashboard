'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import useDashboardStore from '@/store/useDashboardStore';
import WidgetRenderer from './widgets/WidgetRenderer';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardGrid = ({ onAddWidget }) => {
  const { widgets, layouts, updateLayouts, theme } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLayoutChange = useCallback((layout, allLayouts) => {
    updateLayouts(allLayouts);
  }, [updateLayouts]);

  const layoutsWithItems = useMemo(() => {
    return {
      lg: layouts.lg || [],
      md: layouts.md || [],
      sm: layouts.sm || [],
      xs: layouts.xs || [],
    };
  }, [layouts]);
  const AddWidgetCard = () => (
    <div
      onClick={onAddWidget}
      className={`h-full min-h-[160px] rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
        theme === 'dark'
          ? 'border-slate-600 hover:border-emerald-500 hover:bg-slate-800/50 text-slate-400 hover:text-emerald-400'
          : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50 text-gray-400 hover:text-emerald-500'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
      }`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-sm font-medium">Add Widget</span>
      <span className={`text-xs text-center px-4 ${
        theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
      }`}>
        Connect to a finance API and create a custom widget
      </span>
    </div>
  );

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <div key={widget.id} className="h-64">
            <WidgetRenderer widget={widget} />
          </div>
        ))}
        {onAddWidget && (
          <div className="h-64">
            <AddWidgetCard />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layoutsWithItems}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={80}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".widget-drag-handle"
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`relative group ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {}
      {onAddWidget && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <AddWidgetCard />
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
