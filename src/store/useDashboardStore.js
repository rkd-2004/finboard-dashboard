import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useDashboardStore = create(
  persist(
    (set, get) => ({
      widgets: [],
      layouts: { lg: [], md: [], sm: [], xs: [] },
      theme: 'dark',
      addWidget: (widgetConfig) => {
        const id = uuidv4();
        const newWidget = {
          id,
          ...widgetConfig,
          createdAt: new Date().toISOString(),
        };
        const newLayoutItem = {
          i: id,
          x: 0,
          y: Infinity,
          w: widgetConfig.displayMode === 'table' ? 6 : widgetConfig.displayMode === 'chart' ? 6 : 3,
          h: widgetConfig.displayMode === 'table' ? 4 : widgetConfig.displayMode === 'chart' ? 4 : 2,
          minW: 2,
          minH: 2,
        };
        
        set((state) => ({
          widgets: [...state.widgets, newWidget],
          layouts: {
            lg: [...state.layouts.lg, newLayoutItem],
            md: [...state.layouts.md, { ...newLayoutItem, w: Math.min(newLayoutItem.w, 6) }],
            sm: [...state.layouts.sm, { ...newLayoutItem, w: Math.min(newLayoutItem.w, 4) }],
            xs: [...state.layouts.xs, { ...newLayoutItem, w: 2 }],
          },
        }));
        
        return id;
      },
      
      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...updates } : widget
          ),
        }));
      },
      
      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
          layouts: {
            lg: state.layouts.lg.filter((item) => item.i !== id),
            md: state.layouts.md.filter((item) => item.i !== id),
            sm: state.layouts.sm.filter((item) => item.i !== id),
            xs: state.layouts.xs.filter((item) => item.i !== id),
          },
        }));
      },

      removeWidgetByName: (name) => {
        const state = get();
        const widgetToRemove = state.widgets.find(w => w.name === name);
        if (widgetToRemove) {
          set((state) => ({
            widgets: state.widgets.filter((widget) => widget.name !== name),
            layouts: {
              lg: state.layouts.lg.filter((item) => item.i !== widgetToRemove.id),
              md: state.layouts.md.filter((item) => item.i !== widgetToRemove.id),
              sm: state.layouts.sm.filter((item) => item.i !== widgetToRemove.id),
              xs: state.layouts.xs.filter((item) => item.i !== widgetToRemove.id),
            },
          }));
        }
      },
      removeWidgetsByPattern: (pattern) => {
        const state = get();
        const widgetsToRemove = state.widgets.filter(w => 
          w.name && w.name.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (widgetsToRemove.length > 0) {
          const idsToRemove = widgetsToRemove.map(w => w.id);
          set((state) => ({
            widgets: state.widgets.filter((widget) => !idsToRemove.includes(widget.id)),
            layouts: {
              lg: state.layouts.lg.filter((item) => !idsToRemove.includes(item.i)),
              md: state.layouts.md.filter((item) => !idsToRemove.includes(item.i)),
              sm: state.layouts.sm.filter((item) => !idsToRemove.includes(item.i)),
              xs: state.layouts.xs.filter((item) => !idsToRemove.includes(item.i)),
            },
          }));
        }
      },
      
      updateLayouts: (newLayouts) => {
        set({ layouts: newLayouts });
      },
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      exportConfig: () => {
        const state = get();
        return JSON.stringify({
          widgets: state.widgets,
          layouts: state.layouts,
          theme: state.theme,
          exportedAt: new Date().toISOString(),
        }, null, 2);
      },
      
      importConfig: (configString) => {
        try {
          const config = JSON.parse(configString);
          set({
            widgets: config.widgets || [],
            layouts: config.layouts || { lg: [], md: [], sm: [], xs: [] },
            theme: config.theme || 'dark',
          });
          return true;
        } catch (error) {
          console.error('Failed to import config:', error);
          return false;
        }
      },
      clearDashboard: () => {
        set({
          widgets: [],
          layouts: { lg: [], md: [], sm: [], xs: [] },
        });
      },
    }),
    {
      name: 'finboard-dashboard-storage',
    }
  )
);

export default useDashboardStore;
