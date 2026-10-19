import React from 'react';
import {
  HardHat,
  Heart,
  Wind,
  MapPin,
  MessageSquare,
  Thermometer,
  ShieldAlert,
  Compass,
  Radio,
  Scan,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarIconRail: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'overview', icon: HardHat, label: 'Overview' },
    { id: 'monitoring', icon: Heart, label: 'Vitals' },
    { id: 'workers', icon: Wind, label: 'Ecology' },
    { id: 'map', icon: MapPin, label: 'Spatial Sectors' },
    { id: 'telemetry_grid', icon: Compass, label: 'Tactical Grid' },
    { id: 'emergency', icon: ShieldAlert, label: 'Safety' },
    { id: 'messages', icon: MessageSquare, label: 'Comms' },
    { id: 'sensors', icon: Thermometer, label: 'Sensors' },
    { id: 'history', icon: Scan, label: 'Audit Scan' },
    { id: 'radio', icon: Radio, label: 'Radio Dispatch' },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-14 bg-white/80 backdrop-blur rounded-[26px] border border-slate-200/90 shadow-sm py-4 my-2 ml-4 self-stretch">
      {/* Top Icons */}
      <div className="flex flex-col items-center space-y-3 w-full">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'telemetry_grid' && activeTab === 'overview') ||
            (item.id === 'map' && activeTab === 'overview');

          return (
            <button
              key={item.id || idx}
              onClick={() => {
                if (['overview', 'monitoring', 'emergency', 'workers', 'history'].includes(item.id)) {
                  setActiveTab(item.id);
                } else {
                  setActiveTab('overview');
                }
              }}
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

      {/* Bottom Colorful Circular Ring Badge */}
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
