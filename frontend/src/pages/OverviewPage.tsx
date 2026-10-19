import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Maximize2,
  Plus,
  Minus,
  HardHat,
  Truck,
  Box,
  FileText,
  Bell,
  Activity,
  Heart,
  Wind,
  Radar,
  RefreshCw,
  ExternalLink,
  Flame,
  MapPin,
  Compass,
} from 'lucide-react';

import { useSafety } from '../context/SafetyContext';
import { SourceBadge } from '../components/common/SourceBadge';
import { fetchNearbyActivities, NearbyMiningActivity } from '../services/api';

interface Props {
  onSelectWorker: (workerId: string) => void;
  onGoToEmergency: () => void;
}

export const OverviewPage: React.FC<Props> = ({ onSelectWorker, onGoToEmergency }) => {
  const {
    workers,
    onlineCount,
    offlineCount,
  } = useSafety();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Regional Mining & Heavy Construction Scraper Feed State
  const [activities, setActivities] = useState<NearbyMiningActivity[]>([]);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [lastScrapedTime, setLastScrapedTime] = useState<string>('Live (1 min ago)');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const loadScraperData = React.useCallback(async () => {
    setIsScraping(true);
    try {
      const data = await fetchNearbyActivities();
      setActivities(data.activities);
      setLastScrapedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('[Scraper] Failed to fetch activities:', err);
    } finally {
      setIsScraping(false);
    }
  }, []);

  React.useEffect(() => {
    loadScraperData();
    // Auto re-poll/scrape every 60 seconds
    const interval = setInterval(loadScraperData, 60000);
    return () => clearInterval(interval);
  }, [loadScraperData]);

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
            <div className="min-w-[650px] flex items-center justify-between text-[11px] font-mono text-slate-400 relative">
              <div className="flex flex-col items-center">
                <span>08:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              {/* Active current time block with hatched pattern and bell */}
              <div className="flex items-center px-3.5 py-1 rounded-md bg-slate-100 border border-slate-300/80 shadow-2xs relative">
                <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#000_0,#000_2px,transparent_0,transparent_6px)] rounded-md" />
                <Bell className="w-3 h-3 text-slate-700 mr-1.5 relative z-10" />
                <span className="text-slate-900 font-bold text-[10px] relative z-10">08:45 SHIFT PEAK</span>
              </div>

              <div className="flex flex-col items-center">
                <span>09:00</span>
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
                <span>12:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>13:00</span>
                <span className="h-2 w-px bg-slate-300 mt-1" />
              </div>

              <div className="flex flex-col items-center">
                <span>14:00</span>
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
        {/* CENTER COLUMN: Spatial Sector Grid (5 cols on xl)          */}
        {/* ========================================================= */}
        <div className="xl:col-span-5 space-y-3">
          {/* Top Floating Controls Bar */}
          <div className="flex items-center justify-between">
            {/* Sector Map Title */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-sans text-slate-800">
                Spatial Sector Matrix
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Sub-Level Grid
              </span>
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
        {/* RIGHT COLUMN: Regional Mining & Construction Scraper Panel */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-3.5">
          <div className="bg-white rounded-[24px] p-4.5 border border-slate-200/90 shadow-xs space-y-3">
            {/* Header with Live Scraper Radar Icon & Refresh */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                    <Radar className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 font-sans leading-tight">
                      Regional Activity Scraper
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400">
                      Nearby Mining &amp; Heavy Construction Feeds
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadScraperData()}
                disabled={isScraping}
                className="p-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition shadow-2xs"
                title="Re-scrape nearby activity notices"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Scraper Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Radius: &le; 10 km</span>
              </span>
              <span className="text-slate-400">
                Sync: {lastScrapedTime}
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px] font-mono">
              {['ALL', 'Blasting', 'Heavy Transport', 'Drilling', 'Excavation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition border ${
                    filterCategory === cat
                      ? 'bg-[#18191B] text-white border-[#18191B] font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scraped Notices List */}
            <div className="space-y-2.5 max-h-[530px] overflow-y-auto pr-1">
              {activities
                .filter((act) => filterCategory === 'ALL' || act.category === filterCategory)
                .map((act) => {
                  const isHigh = act.riskLevel === 'HIGH';
                  const isMod = act.riskLevel === 'MODERATE';

                  return (
                    <div
                      key={act.id}
                      className={`p-3 rounded-2xl border transition duration-200 shadow-2xs space-y-2 ${
                        isHigh
                          ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                          : isMod
                          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                          : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Category tag, Distance & Risk */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs flex items-center space-x-1">
                            {act.category === 'Blasting' && <Flame className="w-3 h-3 text-rose-500" />}
                            {act.category === 'Heavy Transport' && <Truck className="w-3 h-3 text-amber-500" />}
                            {act.category === 'Drilling' && <Compass className="w-3 h-3 text-blue-500" />}
                            {act.category === 'Excavation' && <MapPin className="w-3 h-3 text-emerald-500" />}
                            <span>{act.category}</span>
                          </span>
                          <span className="text-slate-500 font-semibold">
                            {act.distanceKm} km {act.direction}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            isHigh
                              ? 'bg-rose-600 text-white animate-pulse'
                              : isMod
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <div className="font-bold text-xs text-slate-900 leading-snug font-sans">
                          {act.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                          <span>{act.company}</span>
                          <span className="text-slate-400">{act.coordinates}</span>
                        </div>
                      </div>

                      {/* Safety Impact Description */}
                      <p className="text-[11px] text-slate-600 font-sans leading-relaxed bg-white/70 p-2 rounded-xl border border-slate-200/50">
                        {act.impactDescription}
                      </p>

                      {/* Source & Timestamp Footer */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-200/40">
                        <span className="flex items-center space-x-1 truncate max-w-[200px]" title={act.source}>
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span className="truncate">{act.source}</span>
                        </span>
                        <span className="text-slate-500 font-medium shrink-0">{act.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
