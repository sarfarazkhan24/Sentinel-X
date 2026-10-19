import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Plus,
  Minus,
  Filter,
  X,
  Flag,
  Globe,
  RotateCcw,
  ArrowLeftRight,
  Scale,
  HardHat,
  Truck,
  Box,
  Layers,
  FileText,
  Bell,
  Activity,
  Heart,
  Wind,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts';

import { useSafety } from '../context/SafetyContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SourceBadge } from '../components/common/SourceBadge';

interface Props {
  onSelectWorker: (workerId: string) => void;
  onGoToEmergency: () => void;
}

// Organic multi-layer wave data matching the Rocanville mine curve
const waveData = [
  { node: 'AA', upper: 45, mid: 28, lower: 12 },
  { node: 'AB', upper: 52, mid: 34, lower: 16 },
  { node: 'BA', upper: 68, mid: 48, lower: 25 },
  { node: 'CA', upper: 82, mid: 62, lower: 38 },
  { node: 'DA', upper: 75, mid: 54, lower: 30 },
  { node: 'AC', upper: 58, mid: 40, lower: 20 },
  { node: 'AD', upper: 62, mid: 44, lower: 24 },
  { node: 'BB', upper: 85, mid: 66, lower: 42 },
  { node: 'CB', upper: 72, mid: 50, lower: 28 },
  { node: 'DA', upper: 60, mid: 38, lower: 18 },
];

export const OverviewPage: React.FC<Props> = ({ onSelectWorker, onGoToEmergency }) => {
  const {
    workers,
    activeIncidents,
    onlineCount,
    offlineCount,
    criticalAlertCount,
  } = useSafety();

  const [selectedSection, setSelectedSection] = useState<'S9' | 'S10' | 'S11' | 'S12'>('S9');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTool, setActiveTool] = useState<'magnet' | 'marquee' | 'polygon'>('magnet');
  const [wagonsOpen, setWagonsOpen] = useState<boolean>(true);
  const [workersOpen, setWorkersOpen] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Map 3 workers to specific mine sectors
  const worker1 = workers.find((w) => w.workerId === 'W-101') || workers[0];
  const worker2 = workers.find((w) => w.workerId === 'W-102') || workers[1];
  const worker3 = workers.find((w) => w.workerId === 'W-103') || workers[2];

  return (
    <div className="space-y-4">
      {/* 1. TOP SHIFT TIMELINE RULER (Matches reference image) */}
      <section className="bg-white/80 backdrop-blur rounded-[24px] border border-slate-200/80 shadow-xs px-4 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Shift Badges */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Warning Day Pill */}
            <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Day 15</span>
              <ChevronDown className="w-3 h-3 text-rose-400" />
            </div>

            {/* Date Pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
              <span className="font-bold text-slate-900">OCT 19</span>
              <span className="text-slate-500">Today</span>
            </div>

            {/* Active Simulation Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold">SIMULATION MODE</span>
            </div>
          </div>

          {/* Continuous Timeline Ruler */}
          <div className="flex-1 overflow-x-auto py-1">
            <div className="min-w-[700px] flex items-center justify-between text-[11px] font-mono text-slate-400 relative">
              {/* Timeline marker items */}
              <div className="flex flex-col items-center">
                <span className="text-slate-600 font-semibold">15K</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>8:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              {/* Active current time block with hatched pattern and bell */}
              <div className="flex items-center px-4 py-1 rounded-md bg-slate-100 border border-slate-300/80 shadow-2xs relative">
                <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#000_0,#000_2px,transparent_0,transparent_6px)] rounded-md" />
                <Bell className="w-3 h-3 text-slate-700 mr-1.5 relative z-10" />
                <span className="text-slate-900 font-bold text-[10px] relative z-10">08:45 SHIFT PEAK</span>
              </div>

              <div className="flex flex-col items-center">
                <span>9:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-slate-600 font-semibold">30K</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>10:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>11:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-slate-600 font-semibold">45K</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>12:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>01:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              {/* Horizontal line under ticks */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200 -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 3-COLUMN INDUSTRIAL COMMAND GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Worker Cards Stack (3 cols on xl)             */}
        {/* ========================================================= */}
        <div className="xl:col-span-3 space-y-3.5">
          {/* Card 1: Worker 1 (Alex Carter / H-201) */}
          <div
            onClick={() => worker1 && onSelectWorker(worker1.workerId)}
            className="group cursor-pointer bg-white rounded-[22px] p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200 relative overflow-hidden"
          >
            {/* Top Row: Status pill & Helmet ID */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500 text-white shadow-2xs">
                IN PROCESS
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                {worker1?.helmetId || 'A001XX92'}
              </span>
            </div>

            {/* Worker Name & Zone Subtitle */}
            <div className="mb-3">
              <div className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition">
                {worker1?.name || 'Alex Carter'}
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>{worker1?.workerId}</span>
                <span>&bull;</span>
                <span className="text-slate-600 font-medium">{worker1?.assignedZone || 'Entrance B'}</span>
                {worker1?.latestReading && (
                  <SourceBadge isSimulated={worker1.latestReading.isSimulated} />
                )}
              </div>
            </div>

            {/* Primary Metrics (Mined / Plan & Engaged / Wagons) */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mb-4">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide flex items-center space-x-1">
                  <span>Mined</span>
                  <span className="text-[9px] font-mono text-slate-400">mt</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  49,976
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide flex items-center space-x-1">
                  <span>Plan</span>
                  <span className="text-[9px] font-mono text-slate-400">mt</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  75,000
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">
                  Engaged
                </div>
                <div className="flex items-center space-x-1.5 text-base font-bold text-slate-800">
                  <span>318</span>
                  <HardHat className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">
                  Equipment
                </div>
                <div className="flex items-center space-x-1.5 text-base font-bold text-slate-800">
                  <span>296</span>
                  <Truck className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            </div>

            {/* Real-time Telemetry Mini-pill Row */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-1 text-slate-700">
                <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="font-bold">{worker1?.latestReading?.heartRate ?? 74}</span>
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-700">
                <Activity className="w-3.5 h-3.5 text-cyan-600" />
                <span className="font-bold">{worker1?.latestReading?.spo2 ?? 98}%</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-700">
                <Wind className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold">{worker1?.latestReading?.gasRaw ?? 142}</span>
              </div>
            </div>

            {/* Gradient Loading Progress Bar (Cyan -> Yellow -> Orange -> Red) */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span>Loading 65%</span>
                <span className="font-mono text-slate-900 font-bold">49,976</span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500"
                  style={{ width: '65%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>0 mt</span>
                <span>75K mt</span>
              </div>
            </div>

            {/* Card Footer: Zone Dropdown & Action Icons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-slate-700 font-medium hover:text-slate-900">
                <span>Entrance B</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center space-x-2 text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    worker1 && onSelectWorker(worker1.workerId);
                  }}
                  className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 transition"
                  title="View worker logs"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToEmergency();
                  }}
                  className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 transition relative"
                  title="Alert status"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {worker1?.hasActiveAlert && (
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Worker 2 (Marcus Vance / H-202) */}
          <div
            onClick={() => worker2 && onSelectWorker(worker2.workerId)}
            className="group cursor-pointer bg-white rounded-[22px] p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-200 text-slate-700">
                COMPLETED
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                {worker2?.helmetId || 'B825BK82'}
              </span>
            </div>

            <div className="mb-3">
              <div className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition">
                {worker2?.name || 'Marcus Vance'}
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>{worker2?.workerId}</span>
                <span>&bull;</span>
                <span className="text-slate-600 font-medium">{worker2?.assignedZone || 'Entrance C'}</span>
                {worker2?.latestReading && (
                  <SourceBadge isSimulated={worker2.latestReading.isSimulated} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mb-3">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Mined mt</div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  54,132
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Plan mt</div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  54,000
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Engaged</div>
                <div className="flex items-center space-x-1.5 text-base font-bold text-slate-800">
                  <span>243</span>
                  <HardHat className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Equipment</div>
                <div className="flex items-center space-x-1.5 text-base font-bold text-slate-800">
                  <span>278</span>
                  <Truck className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-slate-700 font-medium">
                <span>Entrance C</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <FileText className="w-3.5 h-3.5 hover:text-slate-700" />
                <Bell className="w-3.5 h-3.5 hover:text-slate-700" />
              </div>
            </div>
          </div>

          {/* Card 3: Worker 3 (Sarah Chen / H-203) */}
          <div
            onClick={() => worker3 && onSelectWorker(worker3.workerId)}
            className="group cursor-pointer bg-white rounded-[22px] p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-200 text-slate-700">
                COMPLETED
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                {worker3?.helmetId || 'B122BK92'}
              </span>
            </div>

            <div className="mb-3">
              <div className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition">
                {worker3?.name || 'Sarah Chen'}
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>{worker3?.workerId}</span>
                <span>&bull;</span>
                <span className="text-slate-600 font-medium">{worker3?.assignedZone || 'Entrance D'}</span>
                {worker3?.latestReading && (
                  <SourceBadge isSimulated={worker3.latestReading.isSimulated} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mb-3">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Mined mt</div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  47,114
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Plan mt</div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  47,000
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Engaged</div>
                <div className="flex items-center space-x-1.5 text-base font-bold text-slate-800">
                  <span>113</span>
                  <HardHat className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">Equipment</div>
                <div className="flex items-center space-x-1.5 text-base font-bold text-slate-800">
                  <span>149</span>
                  <Truck className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-slate-700 font-medium">
                <span>Entrance D</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <FileText className="w-3.5 h-3.5 hover:text-slate-700" />
                <Bell className="w-3.5 h-3.5 hover:text-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Spatial Sector Grid (6 cols on xl)          */}
        {/* ========================================================= */}
        <div className="xl:col-span-6 space-y-3">
          {/* Top Floating Controls Bar */}
          <div className="flex items-center justify-between">
            {/* Tool selection buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setActiveTool('magnet')}
                className={`p-2 rounded-xl transition ${
                  activeTool === 'magnet'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
                title="Magnet selection"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('marquee')}
                className={`p-2 rounded-xl transition ${
                  activeTool === 'marquee'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
                title="Marquee select"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTool('polygon')}
                className={`p-2 rounded-xl transition ${
                  activeTool === 'polygon'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
                title="Polygon boundary"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom & Fullscreen Controls */}
            <div className="flex items-center space-x-1 bg-white border border-slate-200/80 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Zoom in"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Zoom out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Reset zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 9 Header Pill & Metrics */}
          <div className="flex items-center justify-between">
            {/* Section 9 Pill */}
            <div className="bg-[#4E615D] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-2xs flex items-center space-x-1.5">
              <span>Section 9</span>
              {selectedSector && (
                <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {selectedSector}
                </span>
              )}
            </div>

            {/* Metrics Pills: 2,490,671 mt | online/offline | 296 */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <div className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1 text-slate-700 shadow-2xs">
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold">2,490,671</span>
                <span className="text-[10px] text-slate-400">mt</span>
              </div>
              <div className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1 text-slate-700 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">{onlineCount}</span>
                <span className="text-[10px] text-slate-400">on</span>
                {offlineCount > 0 && <span className="text-[10px] text-amber-500">({offlineCount})</span>}
              </div>
              <div className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1 text-slate-700 shadow-2xs">
                <HardHat className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold">296</span>
              </div>
            </div>

          </div>

          {/* Spatial Grid Canvas Container */}
          <div
            className="rounded-[28px] border-2 border-[#526460]/40 bg-[#F4F6F8] p-4.5 shadow-inner transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            <div className="space-y-3">
              {/* Row 1: AA, AB, BA, N/A */}
              <div className="grid grid-cols-4 gap-3">
                {/* Sector AA */}
                <div
                  onClick={() => setSelectedSector('AA')}
                  className="h-28 rounded-2xl bg-[#E2E6EA] border border-slate-300/60 p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                >
                  <span className="font-mono font-bold text-slate-500 text-sm">AA</span>
                  <div className="text-[10px] font-mono text-slate-400">Standby</div>
                </div>

                {/* Sector AB */}
                <div
                  onClick={() => setSelectedSector('AB')}
                  className="h-28 rounded-2xl bg-[#E2E6EA] border border-slate-300/60 p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                >
                  <span className="font-mono font-bold text-slate-500 text-sm">AB</span>
                  <div className="text-[10px] font-mono text-slate-400">Clear</div>
                </div>

                {/* Sector BA (Active with Worker 1: Alex Carter) */}
                <div
                  onClick={() => {
                    setSelectedSector('BA');
                    worker1 && onSelectWorker(worker1.workerId);
                  }}
                  className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-400 transition relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>BA</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                    <span className="text-slate-400 text-xs">&bull;&bull;&bull;</span>
                  </div>

                  {/* Active Worker Beacon */}
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {worker1?.name || 'Alex Carter'}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                      <span className="flex items-center space-x-0.5">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>33</span>
                      </span>
                      <span className="flex items-center space-x-0.5">
                        <HardHat className="w-3 h-3 text-slate-400" />
                        <span>29</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span>233,018 mt</span>
                  </div>
                </div>

                {/* Sector N/A (Tall right vertical pillar) */}
                <div className="row-span-2 rounded-2xl bg-[#E2E6EA] border border-slate-300/60 p-3 flex flex-col justify-between">
                  <span className="font-mono font-bold text-slate-400 text-sm">N/A</span>
                  <div className="text-[10px] font-mono text-slate-400 rotate-90 origin-bottom-left ml-4">
                    BUFFER ZONE
                  </div>
                </div>
              </div>

              {/* Row 2: BA, AD, BB */}
              <div className="grid grid-cols-4 gap-3">
                {/* Sector BA 2 */}
                <div
                  onClick={() => setSelectedSector('BA-2')}
                  className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">BA</span>
                    <span className="text-slate-400 text-xs">&bull;&bull;&bull;</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center space-x-0.5">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>15</span>
                    </span>
                    <span className="flex items-center space-x-0.5">
                      <HardHat className="w-3 h-3 text-slate-400" />
                      <span>14</span>
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span>347K mt</span>
                  </div>
                </div>

                {/* Sector AD */}
                <div
                  onClick={() => setSelectedSector('AD')}
                  className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">AD</span>
                    <span className="text-slate-400 text-xs">&bull;&bull;&bull;</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center space-x-0.5">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>12</span>
                    </span>
                    <span className="flex items-center space-x-0.5">
                      <HardHat className="w-3 h-3 text-slate-400" />
                      <span>16</span>
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span>279K mt</span>
                  </div>
                </div>

                {/* Sector BB (Worker 2: Marcus Vance) */}
                <div
                  onClick={() => {
                    setSelectedSector('BB');
                    worker2 && onSelectWorker(worker2.workerId);
                  }}
                  className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>BB</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-slate-400 text-xs">&bull;&bull;&bull;</span>
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {worker2?.name || 'Marcus Vance'}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                      <span className="flex items-center space-x-0.5">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>38</span>
                      </span>
                      <span className="flex items-center space-x-0.5">
                        <HardHat className="w-3 h-3 text-slate-400" />
                        <span>36</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span>797,856 mt</span>
                  </div>
                </div>

                {/* Empty cell placeholder to align with N/A pillar */}
                <div className="hidden" />
              </div>

              {/* Striped Diagonal Hazard Walkway Divider */}
              <div className="walkway-pattern h-5 rounded-full my-2 bg-slate-300/70 border border-slate-300 shadow-inner" />

              {/* Row 3: CA, CB, DA */}
              <div className="grid grid-cols-4 gap-3">
                {/* Sector CA (Tall vertical soft gray) */}
                <div
                  onClick={() => setSelectedSector('CA')}
                  className="h-28 rounded-2xl bg-[#E2E6EA] border border-slate-300/60 p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                >
                  <span className="font-mono font-bold text-slate-500 text-sm">CA</span>
                  <div className="text-[10px] font-mono text-slate-400">Shaft 3</div>
                </div>

                {/* Sector CB */}
                <div
                  onClick={() => setSelectedSector('CB')}
                  className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">CB</span>
                    <span className="text-slate-400 text-xs">&bull;&bull;&bull;</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center space-x-0.5">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>84</span>
                    </span>
                    <span className="flex items-center space-x-0.5">
                      <HardHat className="w-3 h-3 text-slate-400" />
                      <span>59</span>
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span>489K mt</span>
                  </div>
                </div>

                {/* Sector DA (Worker 3: Sarah Chen) */}
                <div
                  onClick={() => {
                    setSelectedSector('DA');
                    worker3 && onSelectWorker(worker3.workerId);
                  }}
                  className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>DA</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-slate-400 text-xs">&bull;&bull;&bull;</span>
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {worker3?.name || 'Sarah Chen'}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                      <span className="flex items-center space-x-0.5">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>136</span>
                      </span>
                      <span className="flex items-center space-x-0.5">
                        <HardHat className="w-3 h-3 text-slate-400" />
                        <span>142</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    <span>344,190 mt</span>
                  </div>
                </div>

                {/* Placeholder */}
                <div className="h-28 rounded-2xl bg-[#E2E6EA] border border-slate-300/60 p-3 flex flex-col justify-between">
                  <span className="font-mono font-bold text-slate-400 text-sm">DC</span>
                  <div className="text-[10px] font-mono text-slate-400">Exit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Headline Analytics & Wagons (3 cols on xl)   */}
        {/* ========================================================= */}
        <div className="xl:col-span-3 space-y-3.5">
          {/* Top Compliance & Remaining Ore Headline Card */}
          <div className="bg-white rounded-[24px] p-4.5 border border-slate-200/90 shadow-xs space-y-3">
            {/* Headline Metric with Quick Action Buttons */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  19,300,175 <span className="text-sm font-semibold text-slate-400">mt</span>
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Entrance B &mdash; Tin remaining
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  className="p-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                  title="Filter view"
                >
                  <Filter className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                  title="Close section"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-tabs: S9 (Active), S10, S11, S12 */}
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-2 text-xs font-semibold">
              {(['S9', 'S10', 'S11', 'S12'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSection(tab)}
                  className={`pb-1 transition ${
                    selectedSection === tab
                      ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tags: Place of development & Remaining Pill */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Place of development
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="bg-[#FFAA4C] text-slate-900 font-bold px-2 py-0.5 rounded-full text-[10px] shadow-2xs">
                    S9-BA
                  </span>
                  <span className="bg-[#FFAA4C] text-slate-900 font-bold px-2 py-0.5 rounded-full text-[10px] shadow-2xs">
                    S9-BB
                  </span>
                </div>

                <div className="bg-blue-600 text-white font-bold px-3 py-0.5 rounded-full text-[11px] shadow-2xs">
                  1,030,874 mt
                </div>
              </div>
            </div>

            {/* Organic Multi-Layer Stream / Wave Area Graph */}
            <div className="h-32 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waveData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waveUpper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D3748" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#1A202C" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="waveMid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#718096" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A0AEC0" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="node" stroke="#A0AEC0" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18191B', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="#1A202C"
                    fill="url(#waveUpper)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="mid"
                    stroke="#4A5568"
                    fill="url(#waveMid)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Baseline Metric Numbers: 0.0 | 298,721 | 0.0 */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-2">
              <span>0.0</span>
              <span className="font-bold text-slate-800 text-xs">298,721</span>
              <span>0.0</span>
            </div>

            {/* Segmented Pill Filters */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="bg-slate-100 text-slate-700 font-semibold p-1.5 rounded-lg text-center border border-slate-200/80">
                BA &mdash; 233K / 896K MT
              </div>
              <div className="bg-slate-100 text-slate-700 font-semibold p-1.5 rounded-lg text-center border border-slate-200/80">
                BB &mdash; 797K / 1.1KK MT
              </div>
            </div>
          </div>

          {/* Accordion 1: Workers */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <button
              onClick={() => setWorkersOpen(!workersOpen)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold">Workers</span>
                <span className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                  <HardHat className="w-3.5 h-3.5 text-slate-400" />
                  <span>296/296</span>
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 font-mono text-[11px]">84%</span>
              </div>
              {workersOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {workersOpen && (
              <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50 text-xs font-mono">
                {workers.map((w) => (
                  <div
                    key={w.workerId}
                    onClick={() => onSelectWorker(w.workerId)}
                    className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between cursor-pointer hover:border-slate-300"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{w.name}</div>
                      <div className="text-[10px] text-slate-400">{w.assignedZone}</div>
                    </div>
                    <SeverityBadge severity={w.riskLevel || 'NORMAL'} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accordion 2: Wagons & Emergencies (Matches reference image) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <button
              onClick={() => setWagonsOpen(!wagonsOpen)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold">Wagons &amp; Transports</span>
                <span className={`text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-2xs ${criticalAlertCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-rose-500'}`}>
                  <AlertTriangle className="w-3 h-3 text-white" />
                  <span>{activeIncidents.length > 0 ? `${activeIncidents.length} INCIDENTS` : '317/318'}</span>
                </span>

              </div>
              {wagonsOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {wagonsOpen && (
              <div className="p-3.5 border-t border-slate-100 space-y-3 bg-white">
                {/* Active Wagon Detail Card: WG09-31 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm font-mono">
                        WG09-31
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Transport ID
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-800">
                        5:13:38
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Uptime
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-800">
                        27.5 <span className="text-[10px] font-normal text-slate-400">mt</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Delivered
                      </div>
                    </div>
                  </div>

                  {/* Wagon Loading Bar: Loading 72% */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>Loading 72%</span>
                      <span className="text-slate-400 font-mono text-[10px]">-0:03:28</span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{ width: '72%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>0 kg</span>
                      <span className="font-bold text-slate-700">▲ 602 kg</span>
                      <span>750 kg</span>
                    </div>
                  </div>

                  {/* Toolbar icons: Flag, Globe, Undo, Switch, Sliders, Scale */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-slate-400">
                    <button className="p-1 hover:text-slate-700 transition" title="Mark wagon">
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-slate-700 transition" title="GPS Coordinates">
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-slate-700 transition" title="Re-route wagon">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-slate-700 transition" title="Switch path">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-slate-700 transition" title="Tune payload">
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-slate-700 transition" title="Weigh station">
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Second Wagon Preview: WG09-43 */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-800">WG09-43</span>
                    <span className="text-slate-400 text-[10px] ml-2">4:51:05</span>
                  </div>
                  <div className="text-slate-600 font-semibold">
                    26.8 mt
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
