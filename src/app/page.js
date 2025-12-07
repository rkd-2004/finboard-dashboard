'use client';

import { useState, useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import Header from '@/components/Header';
import DashboardGrid from '@/components/DashboardGrid';
import EmptyState from '@/components/EmptyState';
import AddWidgetModal from '@/components/AddWidgetModal';
import SampleApiList from '@/components/SampleApiList';
import StockDashboard from '@/components/StockDashboard';

export default function Home() {
  const { widgets, theme } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, hydrated]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <Header 
        onAddWidget={() => setIsModalOpen(true)} 
        onQuickAdd={() => setIsQuickAddOpen(true)}
      />
      
      <main className="pt-20 px-6 pb-6">
        {}
        <div className="mb-6">
          <StockDashboard />
        </div>

        {}
        {widgets.length === 0 ? (
          <EmptyState 
            onAddWidget={() => setIsModalOpen(true)} 
            onQuickAdd={() => setIsQuickAddOpen(true)}
          />
        ) : (
          <DashboardGrid onAddWidget={() => setIsModalOpen(true)} />
        )}
      </main>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <SampleApiList
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
