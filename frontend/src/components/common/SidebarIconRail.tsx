import React from 'react';
import {
  HardHat,
  Heart,
  Activity,
  ShieldAlert,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { SentinelXLogo } from './SentinelXLogo';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarIconRail: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  // Distinct views with short micro-labels and detailed hover tooltips
  const items = [
    { id: 'overview', icon: HardHat, shortLabel: 'Map', label: 'Overview & Mine Map' },
    { id: 'monitoring', icon: Heart, shortLabel: 'Vitals', label: 'Live Biometrics Matrix' },
    { id: 'workers', icon: Activity, shortLabel: 'Sensors', label: 'Worker Telemetry & History' },
    { id: 'emergency', icon: ShieldAlert, shortLabel: 'Triage', label: 'Emergency Safety Triage' },
    { id: 'comms', icon: MessageSquare, shortLabel: 'Comms', label: 'Tactical Radio & Comms' },
    { id: 'history', icon: FileText, shortLabel: 'Reports', label: 'Incident Audit Trail' },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-16 bg-white/85 backdrop-blur rounded-[26px] border border-slate-200/90 shadow-sm py-3.5 my-2 ml-3 self-stretch select-none">
      {/* Top Section: SentinelX Emblem & Navigation Icons */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        {/* Top SentinelX Blue & Black Emblem */}
        <div className="pb-2 border-b border-slate-200/70 w-full flex justify-center">
          <SentinelXLogo size={28} />
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`w-12 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition duration-150 ${
                  isActive
                    ? 'bg-[#18191B] text-amber-400 shadow-md ring-1 ring-amber-500/30'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-semibold tracking-tight leading-none">
                  {item.shortLabel}
                </span>
              </button>

              {/* Instant hover tooltip to the right */}
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 px-2.5 py-1 rounded-lg bg-[#18191B] text-white text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                <div className="flex items-center space-x-1.5">
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {/* Micro caret pointer */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#18191B]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Circular Telemetry Status Ring (Safety Amber & Emerald) */}
      <div className="pt-2">
        <div
          className="w-6 h-6 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 shadow-sm"
          title="Telemetry Core Online"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#18191B]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
