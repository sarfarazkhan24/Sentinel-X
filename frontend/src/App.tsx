import React, { useState } from 'react';
import { SafetyProvider } from './context/SafetyContext';
import { Navbar } from './components/common/Navbar';
import { EmergencyBanner } from './components/emergency/EmergencyBanner';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { WorkerDetailsPage } from './pages/WorkerDetailsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { CommsPage } from './pages/CommsPage';

import { SidebarIconRail } from './components/common/SidebarIconRail';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('W-101');
  const [selectedZone, setSelectedZone] = useState<string>('All');

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setActiveTab('workers');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECEEF1] text-slate-800 font-sans selection:bg-amber-200">
      {/* Top Sticky Industrial Navigation + Emergency Banner */}
      <div className="sticky top-0 z-40 w-full bg-[#ECEEF1]/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
        />
        <EmergencyBanner onGoToEmergency={() => setActiveTab('emergency')} />
      </div>

      {/* Main Container with Left Sidebar Rail and Dashboard Canvas */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Left Circular Icon Rail */}
        <SidebarIconRail activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dashboard Main Content */}
        <main className="flex-1 w-full p-2 sm:p-4 overflow-x-clip">
          {activeTab === 'overview' && (
            <OverviewPage
              onSelectWorker={handleSelectWorker}
              onGoToEmergency={() => setActiveTab('emergency')}
            />
          )}

          {activeTab === 'monitoring' && (
            <LiveMonitoringPage onSelectWorker={handleSelectWorker} />
          )}

          {activeTab === 'workers' && (
            <WorkerDetailsPage
              selectedWorkerId={selectedWorkerId}
              onSelectWorker={setSelectedWorkerId}
            />
          )}

          {activeTab === 'emergency' && <EmergencyPage />}

          {activeTab === 'comms' && <CommsPage />}

          {activeTab === 'history' && <IncidentHistoryPage />}
        </main>
      </div>

      {/* Industrial Footer */}
      <footer className="bg-white/80 border-t border-slate-200/90 py-3 text-xs font-mono text-slate-500">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>SentinelX Industrial Safety Prototype &bull; Real-time Multi-Sensor Telemetry</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Educational prototype. Sensor readings and alerts require validation; no medical or mine-safety certification.
          </div>
        </div>
      </footer>
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <SafetyProvider>
      <AppContent />
    </SafetyProvider>
  );
};

export default App;
