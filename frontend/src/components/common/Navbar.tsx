import React from 'react';
import {
  FileText,
  Sliders,
  Users,
  ShieldAlert,
  Wind,
  Bell,
  Share2,
  Printer,
  RotateCw,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { SentinelXLogo } from './SentinelXLogo';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  selectedZone,
  setSelectedZone,
}) => {
  const { isConnected, criticalAlertCount, activeIncidents, refreshData } = useSafety();

  const navTabs = [
    { id: 'overview', label: 'Administration', icon: Sliders },
    { id: 'monitoring', label: 'Personnel', icon: Users, count: 3 },
    {
      id: 'emergency',
      label: 'Safety',
      icon: ShieldAlert,
      badge: activeIncidents.length,
      isCritical: criticalAlertCount > 0,
    },
    { id: 'workers', label: 'Ecology', icon: Wind },
    { id: 'comms', label: 'Comms', icon: MessageSquare },
    { id: 'history', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="w-full bg-[#ECEEF1] pt-3 px-4 sm:px-6">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Hazard Mark */}
        <div className="flex items-center space-x-3">
          {/* Unique Blue & Black SentinelX Brand */}
          <div className="flex items-center space-x-1">
            <SentinelXLogo size={32} withWordmark={true} />
            <button
              onClick={() => refreshData()}
              className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-white/80 transition shadow-2xs ml-0.5"
              title="Refresh live data"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          {/* Entrance Dropdown Pill (Level 8 box removed) */}
          <div className="hidden sm:flex items-center bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs text-slate-700 font-medium text-xs">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent border-none text-slate-700 text-xs focus:outline-none cursor-pointer pr-1 font-sans"
            >
              <option value="All">All Entrances &amp; Zones</option>
              <option value="Zone A - Extraction Pit">Entrance B — Extraction Pit</option>
              <option value="Zone B - Shaft 3">Entrance C — Shaft 3</option>
              <option value="Zone C - Processing Plant">Entrance D — Processing Plant</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>


        {/* Center: Rounded Pill Navigation (Matches reference image) */}
        <div className="flex items-center bg-white/90 backdrop-blur p-1 rounded-full border border-slate-200/90 shadow-sm overflow-x-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#18191B] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.isCritical
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Action buttons & Operator Avatar */}
        <div className="flex items-center space-x-3">
          {/* Quick Share / Report / Print text actions */}
          <div className="hidden xl:flex items-center space-x-3 text-xs text-slate-600 font-medium">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Dashboard URL copied to clipboard!');
              }}
              className="flex items-center space-x-1 hover:text-slate-900 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center space-x-1 hover:text-slate-900 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1 hover:text-slate-900 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          {/* Broker Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full text-xs text-slate-600 shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-mono text-[11px] font-medium">
              {isConnected ? 'LIVE BROKER' : 'OFFLINE'}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setActiveTab('emergency')}
            className="relative p-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full shadow-sm text-slate-600 transition"
          >
            <Bell className="w-4 h-4" />
            {activeIncidents.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {activeIncidents.length}
              </span>
            )}
          </button>

          {/* Operator Profile Avatar with Indian Name & Blue/Black Accent */}
          <div className="flex items-center space-x-2 bg-white pl-1 pr-3 py-1 rounded-full border border-slate-200/80 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#0B0F17] border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-xs shadow-inner">
              👷
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">Rajesh Nair</div>
              <div className="text-[10px] text-blue-600 font-mono font-medium leading-none">Safety Director</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
