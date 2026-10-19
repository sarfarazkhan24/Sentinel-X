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
  Radio,
  Thermometer,
  ArrowRight,
} from 'lucide-react';

import { useSafety } from '../context/SafetyContext';
import { SourceBadge } from '../components/common/SourceBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { fetchNearbyActivities, NearbyMiningActivity } from '../services/api';
import { Worker } from '../types';

interface Props {
  onSelectWorker: (workerId: string) => void;
  onGoToEmergency: () => void;
}

export const OverviewPage: React.FC<Props> = ({ onSelectWorker, onGoToEmergency }) => {
  const {
    workers,
    activeIncidents,
    recentEvents,
    onlineCount,
    offlineCount,
    criticalAlertCount,
    isConnected,
  } = useSafety();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Right Panel Tabs: Regional Scraper Radar vs Live Telemetry Packet Stream
  const [rightPanelTab, setRightPanelTab] = useState<'scraper' | 'telemetry'>('scraper');

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

  // Compute average pit atmosphere gas (MQ-5)
  const readingsWithGas = workers
    .map((w) => w.latestReading?.gasRaw)
    .filter((g): g is number => typeof g === 'number');
  const avgGas = readingsWithGas.length > 0
    ? Math.round(readingsWithGas.reduce((a, b) => a + b, 0) / readingsWithGas.length)
    : 168;

  // Map 3 workers to specific mine sectors
  const worker1 = workers.find((w) => w.workerId === 'W-101') || workers[0];
  const worker2 = workers.find((w) => w.workerId === 'W-102') || workers[1];
  const worker3 = workers.find((w) => w.workerId === 'W-103') || workers[2];

  // Helper to render high-fidelity, industrial-themed worker safety cards
  const renderWorkerSafetyCard = (
    worker: Worker | undefined,
    defaultName: string,
    defaultHelmet: string,
    entranceZone: string,
    sectorCode: string
  ) => {
    const r = worker?.latestReading;
    const isOnline = worker?.connectivityStatus === 'ONLINE';
    const hasAlert = worker?.hasActiveAlert || worker?.riskLevel === 'CRITICAL';
    const hr = r?.heartRate;
    const spo2 = r?.spo2;
    const gas = r?.gasRaw;
    const temp = r?.temperature;

    const hrAlert = hr && (hr > 120 || hr < 50);
    const spo2Alert = spo2 && spo2 < 92;
    const gasAlert = gas && gas > 650;

    return (
      <div
        key={worker?.workerId || defaultHelmet}
        onClick={() => worker && onSelectWorker(worker.workerId)}
        className={`group cursor-pointer bg-white rounded-[22px] p-4 border transition duration-200 relative overflow-hidden shadow-xs hover:shadow-md ${
          hasAlert
            ? 'border-rose-300 ring-1 ring-rose-200/80'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        {/* Top Row: Status badge, Sector tag & Helmet ID */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-2xs flex items-center space-x-1 ${
                hasAlert
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isOnline
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasAlert || isOnline ? 'bg-white' : 'bg-slate-400'
                }`}
              />
              <span>{hasAlert ? 'ALERT' : isOnline ? 'ONLINE' : 'STANDBY'}</span>
            </span>

            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold border border-slate-200/70">
              Sector {sectorCode}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-xs font-bold text-slate-700 tracking-wider">
              {worker?.helmetId || defaultHelmet}
            </span>
          </div>
        </div>

        {/* Worker Name & Zone Subtitle */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-1">
            <div className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition truncate">
              {worker?.name || defaultName}
            </div>
            {r && <SourceBadge isSimulated={r.isSimulated} />}
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <span>{worker?.workerId}</span>
            <span>&bull;</span>
            <span className="text-slate-600 font-medium truncate">
              {worker?.assignedZone || entranceZone}
            </span>
          </div>
        </div>

        {/* 2x2 Telemetry Metric Matrix */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Heart Rate */}
          <div
            className={`p-2 rounded-xl border transition ${
              hrAlert ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Heart
                className={`w-3 h-3 ${
                  hrAlert ? 'text-rose-500 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span>Heart Rate</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span
                className={`text-base font-extrabold font-sans ${
                  hrAlert ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {hr ? Math.round(hr) : '--'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">bpm</span>
            </div>
          </div>

          {/* SpO2 */}
          <div
            className={`p-2 rounded-xl border transition ${
              spo2Alert ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Activity
                className={`w-3 h-3 ${
                  spo2Alert ? 'text-rose-500 animate-pulse' : 'text-cyan-600'
                }`}
              />
              <span>Blood SpO2</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span
                className={`text-base font-extrabold font-sans ${
                  spo2Alert ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {spo2 ? spo2.toFixed(1) : '--'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">%</span>
            </div>
          </div>

          {/* Gas Raw */}
          <div
            className={`p-2 rounded-xl border transition ${
              gasAlert ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Wind
                className={`w-3 h-3 ${
                  gasAlert ? 'text-amber-500' : 'text-slate-400'
                }`}
              />
              <span>Gas (MQ-5)</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span
                className={`text-base font-extrabold font-sans ${
                  gasAlert ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {gas ? Math.round(gas) : '--'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">ppm</span>
            </div>
          </div>

          {/* Ambient Temp */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-orange-500" />
              <span>Ambient Temp</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-extrabold font-sans text-slate-900">
                {temp ? `${temp.toFixed(1)}` : '--'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">°C</span>
            </div>
          </div>
        </div>

        {/* Kinematic Motion Check */}
        <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/70 mb-3">
          <span className="text-slate-500">Motion Status:</span>
          <span
            className={`font-semibold ${
              r?.fallDetected
                ? 'text-rose-600 animate-pulse font-bold'
                : r?.inactivityDetected
                ? 'text-amber-600 font-bold'
                : 'text-emerald-700'
            }`}
          >
            {r?.fallDetected
              ? '⚠ FALL DETECTED'
              : r?.inactivityDetected
              ? '⚠ INACTIVITY'
              : '✓ Normal Motion'}
          </span>
        </div>

        {/* Card Footer: Zone and Action links */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-slate-600 font-medium">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{entranceZone}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                worker && onSelectWorker(worker.workerId);
              }}
              className="flex items-center space-x-1 text-[11px] font-mono text-slate-600 hover:text-amber-600 font-semibold transition"
              title="View analytics and telemetry history"
            >
              <span>Telemetry</span>
              <ArrowRight className="w-3 h-3" />
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
              {hasAlert && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

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

      {/* 2. EXECUTIVE INDUSTRIAL SAFETY KPI STRIP */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Personnel */}
        <div className="bg-white/85 backdrop-blur rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Active Personnel
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans mt-0.5">
              {workers.length} <span className="text-xs font-normal text-slate-500 font-mono">Monitored</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{onlineCount} Online &bull; {offlineCount} Offline</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
            <HardHat className="w-4 h-4 text-slate-700" />
          </div>
        </div>

        {/* Card 2: MQTT Telemetry Stream */}
        <div className="bg-white/85 backdrop-blur rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Telemetry Stream
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans mt-0.5">
              {isConnected ? '100% Active' : 'Disconnected'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>QoS 1 &bull; Real-time MQTT</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Pit Atmosphere Gas */}
        <div className="bg-white/85 backdrop-blur rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Pit Atmosphere
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans mt-0.5">
              {avgGas} <span className="text-xs font-normal text-slate-500 font-mono">ppm (MQ-5)</span>
            </div>
            <div className="text-[10px] font-medium flex items-center gap-1 mt-0.5 text-emerald-600">
              <span>{avgGas > 600 ? '⚠ Elevated Gas Warning' : '✓ Normal Safe Baseline (<600)'}</span>
            </div>
          </div>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
            avgGas > 600 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200/80 text-slate-700'
          }`}>
            <Wind className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Card 4: Incident Triage */}
        <div
          onClick={onGoToEmergency}
          className="cursor-pointer bg-white/85 backdrop-blur rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between group"
        >
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Safety Triage
            </div>
            <div className={`text-xl font-extrabold tracking-tight font-sans mt-0.5 ${
              criticalAlertCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
            }`}>
              {criticalAlertCount > 0 ? `${criticalAlertCount} CRITICAL` : `${activeIncidents.length} Pending`}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 group-hover:text-amber-600 transition flex items-center gap-1">
              <span>Emergency Center &rarr;</span>
            </div>
          </div>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
            criticalAlertCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-bounce'
              : 'bg-slate-100 border-slate-200/80 text-slate-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 3. MAIN 3-COLUMN INDUSTRIAL COMMAND GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Worker Cards Stack (3 cols on xl)             */}
        {/* ========================================================= */}
        <div className="xl:col-span-3 space-y-3.5">
          {/* Worker 1: Alex Carter (W-101) */}
          {renderWorkerSafetyCard(worker1, 'Alex Carter', 'H-201', 'Entrance B — Extraction Pit', 'BA')}

          {/* Worker 2: Marcus Vance (W-102) */}
          {renderWorkerSafetyCard(worker2, 'Marcus Vance', 'H-202', 'Entrance C — Shaft 3', 'BB')}

          {/* Worker 3: Sarah Chen / Elena Rostova (W-103) */}
          {renderWorkerSafetyCard(worker3, 'Sarah Chen', 'H-203', 'Entrance D — Processing Plant', 'DA')}
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
                      <span className={`w-2 h-2 rounded-full ${
                        worker1?.hasActiveAlert || worker1?.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-500 animate-pulse'
                      }`} />
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
                      <span className={`w-2 h-2 rounded-full ${
                        worker2?.hasActiveAlert || worker2?.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`} />
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
                      <span className={`w-2 h-2 rounded-full ${
                        worker3?.hasActiveAlert || worker3?.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`} />
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
            {/* Header with Dual-Tab Segmented Switcher */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center p-0.5 bg-slate-100 rounded-full border border-slate-200/80 shadow-2xs">
                <button
                  onClick={() => setRightPanelTab('scraper')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                    rightPanelTab === 'scraper'
                      ? 'bg-[#18191B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Radar className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                  <span>Regional Radar</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('telemetry')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                    rightPanelTab === 'telemetry'
                      ? 'bg-[#18191B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live Ingestion</span>
                  {recentEvents.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500 text-white font-bold">
                      {recentEvents.length}
                    </span>
                  )}
                </button>
              </div>

              {rightPanelTab === 'scraper' ? (
                <button
                  onClick={() => loadScraperData()}
                  disabled={isScraping}
                  className="p-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition shadow-2xs"
                  title="Re-scrape nearby activity notices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE INGESTION</span>
                </div>
              )}
            </div>

            {/* TAB 1: REGIONAL ACTIVITY SCRAPER */}
            {rightPanelTab === 'scraper' && (
              <>
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
              </>
            )}

            {/* TAB 2: LIVE MQTT TELEMETRY INGESTION FEED */}
            {rightPanelTab === 'telemetry' && (
              <div className="space-y-3">
                {/* Telemetry QoS Status Strip */}
                <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
                  <span className="flex items-center space-x-1.5 text-slate-600">
                    <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Topic: sentinelx/+/telemetry</span>
                  </span>
                  <span className="text-slate-400">
                    {recentEvents.length} Packets Buffered
                  </span>
                </div>

                {/* Streaming List of MQTT Packets */}
                <div className="space-y-2.5 max-h-[530px] overflow-y-auto pr-1">
                  {recentEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                      <Radio className="w-6 h-6 mx-auto mb-2 text-slate-300 animate-pulse" />
                      <div className="font-semibold text-slate-600">Awaiting Telemetry Packets</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Listening on MQTT broker for incoming worker sensor frames...
                      </div>
                    </div>
                  ) : (
                    recentEvents.map((evt, idx) => (
                      <div
                        key={evt.readingId || idx}
                        onClick={() => onSelectWorker(evt.workerId)}
                        className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition duration-150 shadow-2xs space-y-2 text-xs cursor-pointer group"
                      >
                        {/* Top Line: Helmet ID, Source Badge, and Time */}
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                              {evt.helmetId}
                            </span>
                            <SourceBadge isSimulated={evt.isSimulated} />
                          </div>
                          <span className="text-slate-400 font-medium">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Middle Line: Worker Name and Severity */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs group-hover:text-amber-600 transition">
                            {evt.workerName || evt.workerId}
                          </span>
                          <SeverityBadge severity={evt.riskLevel} size="sm" />
                        </div>

                        {/* Bottom Line: Vitals pills */}
                        <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/60 text-[11px] font-mono">
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>{evt.vitals?.heartRate ? `${Math.round(evt.vitals.heartRate)} bpm` : '--'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Activity className="w-3 h-3 text-cyan-600" />
                            <span>{evt.vitals?.spo2 ? `${evt.vitals.spo2}%` : '--'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Wind className="w-3 h-3 text-amber-500" />
                            <span>{evt.environment?.gasRaw ? `${evt.environment.gasRaw}` : '--'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
