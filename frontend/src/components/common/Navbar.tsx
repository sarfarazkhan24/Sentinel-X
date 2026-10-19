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
  ChevronDown,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

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
    { id: 'history', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="w-full bg-[#ECEEF1] pt-3 px-4 sm:px-6">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Hazard Mark */}
        <div className="flex items-center space-x-3">
          {/* Yellow/Black hazard stripe mark */}
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-md bg-hazard-stripes shadow-sm" />
            <span className="text-base font-extrabold tracking-wider text-slate-900 font-sans">
              SENTINEL<span className="text-amber-500">X</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          {/* Site Title with refresh icon */}
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Rocanville Mine
            </h1>
            <button
              onClick={() => refreshData()}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-white/60 transition"
              title="Refresh live data"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Level / Entrance Dropdown Pills */}
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            <div className="flex items-center bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-sm text-slate-700 font-medium">
              <span>Level 8</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </div>

            <div className="flex items-center bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-sm text-slate-700 font-medium">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent border-none text-slate-700 text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Entrances &amp; Zones</option>
                <option value="Zone A - Extraction Pit">Entrance B — Extraction Pit</option>
                <option value="Zone B - Shaft 3">Entrance C — Shaft 3</option>
                <option value="Zone C - Processing Plant">Entrance D — Processing Plant</option>
              </select>
            </div>
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

          {/* Operator Profile Avatar with Hard Hat */}
          <div className="flex items-center space-x-2 bg-white pl-1 pr-3 py-1 rounded-full border border-slate-200/80 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-slate-900 font-bold text-xs shadow-inner">
              👷
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">Chief Officer</div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">Supervisor</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
