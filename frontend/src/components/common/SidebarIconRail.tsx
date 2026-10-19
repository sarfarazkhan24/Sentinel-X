import React from 'react';
import {
  HardHat,
  Heart,
  Activity,
  ShieldAlert,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarIconRail: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  // Only distinct, functional views with zero redundant duplicate routes
  const items = [
    { id: 'overview', icon: HardHat, label: 'Overview & Mine Map' },
    { id: 'monitoring', icon: Heart, label: 'Live Biometrics' },
    { id: 'workers', icon: Activity, label: 'Worker Telemetry & History' },
    { id: 'emergency', icon: ShieldAlert, label: 'Emergency Triage' },
    { id: 'comms', icon: MessageSquare, label: 'Tactical Radio & Comms' },
    { id: 'history', icon: FileText, label: 'Audit Trail & Reports' },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-14 bg-white/80 backdrop-blur rounded-[26px] border border-slate-200/90 shadow-sm py-4 my-2 ml-4 self-stretch">
      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-3 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                isActive
                  ? 'bg-[#18191B] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100/80'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Bottom Circular Status Ring */}
      <div className="pt-2">
        <div className="w-6 h-6 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-sm">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
        </div>
      </div>
    </aside>
  );
};
