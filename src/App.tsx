import React, { useState } from 'react';
import { NexusProvider } from './hooks/useNexus';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transfers } from './components/Transfers';
import { Settings } from './components/Settings';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex w-full h-screen overflow-hidden text-foreground selection:bg-blue-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 relative bg-black/20 backdrop-blur-3xl border-l border-white/5 flex flex-col z-0">
        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'history' && <Transfers />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'files' && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/40 font-mono text-sm">System File Access Not Granted.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <NexusProvider>
      <MainApp />
    </NexusProvider>
  );
}
