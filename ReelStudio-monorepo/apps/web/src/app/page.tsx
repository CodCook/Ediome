'use client';

import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { LibraryView } from '@/components/views/LibraryView';
import { BriefBuilderView } from '@/components/views/BriefBuilderView';
import { RenderExportView } from '@/components/views/RenderExportView';
import { Library, Wand2, PlayCircle } from 'lucide-react';

type ViewState = 'library' | 'builder' | 'renders';

export default function Home() {
  const [activeView, setActiveView] = useState<ViewState>('library');

  useEffect(() => {
    // Start the local file watcher on app load
    fetch('/api/watch').catch(console.error);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--color-rs-dark)]">
      {/* Top Navigation Bar */}
      <header className="h-16 flex-shrink-0 border-b border-[var(--color-rs-border)] bg-[var(--color-rs-card)] px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--color-rs-amber)] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(239,159,39,0.3)]">
            R
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Reel Studio</h1>
        </div>

        <nav className="flex gap-1 bg-black p-1 rounded-lg border border-[var(--color-rs-border)]">
          <button
            onClick={() => setActiveView('library')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeView === 'library' ? 'bg-[var(--color-rs-card)] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Library size={16} />
            Library
          </button>
          <button
            onClick={() => setActiveView('builder')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeView === 'builder' ? 'bg-[var(--color-rs-card)] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wand2 size={16} />
            Brief Builder
          </button>
          <button
            onClick={() => setActiveView('renders')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeView === 'renders' ? 'bg-[var(--color-rs-card)] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlayCircle size={16} />
            Render & Export
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative">
        {activeView === 'library' && <LibraryView />}
        {activeView === 'builder' && <BriefBuilderView />}
        {activeView === 'renders' && <RenderExportView />}
      </main>

      <Toaster 
        theme="dark" 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: '#f0efe8',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
        }}
      />
    </div>
  );
}
