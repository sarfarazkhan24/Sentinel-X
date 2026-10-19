import React, { useState } from 'react';
import {
  AlertTriangle,
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
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

import { useSafety, getWorkerSeverityTier, SeverityTier } from '../context/SafetyContext';
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
    criticalPersonnelCount,
    warningPersonnelCount,
    isConnected,
  } = useSafety();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Unified Central Panel Tab Switcher: Sector Map vs Regional Activity vs Live Ingestion
  const [centerTab, setCenterTab] = useState<'sectors' | 'regional' | 'telemetry'>('sectors');
  const [expandAllSectors, setExpandAllSectors] = useState<boolean>(false);
  const [expandAllRegional, setExpandAllRegional] = useState<boolean>(false);

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
      setLastScrapedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
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
  const avgGas =
    readingsWithGas.length > 0
      ? Math.round(readingsWithGas.reduce((a, b) => a + b, 0) / readingsWithGas.length)
      : 168;

  // Active status indicators for sticky bar & tabs
  const hasEmergency = activeIncidents.some((i) => i.severity === 'CRITICAL');
  const hasActiveBlasting = activities.some(
    (a) => a.category === 'Blasting' || a.riskLevel === 'HIGH'
  );

  // Map 3 workers to specific mine sectors
  const worker1 = workers.find((w) => w.workerId === 'W-101') || workers[0];
  const worker2 = workers.find((w) => w.workerId === 'W-102') || workers[1];
  const worker3 = workers.find((w) => w.workerId === 'W-103') || workers[2];

  // Helper mapping each regional notice to specific safety impact
  const getSafetyImpact = (act: NearbyMiningActivity) => {
    if (act.category === 'Blasting') {
      return 'May affect: Sector BB (Shaft 3) — Ground vibration & micro-seismic sensor displacement risk';
    }
    if (act.category === 'Heavy Transport') {
      return 'May affect: Sector BA (Extraction Pit) — Shared haul corridor, surface dust surge & diesel exhaust';
    }
    if (act.category === 'Drilling') {
      return 'May affect: Sub-surface water table pressure & acoustic sensor baselines';
    }
    if (act.category === 'Excavation') {
      return 'May affect: South perimeter seismic monitors — Hydraulic rock breaking within 8 km';
    }
    return 'May affect: Sub-level air circulation & ambient exhaust flow';
  };

  // Sort activities so most relevant (e.g. Blasting affecting Shaft 3) is always first
  const filteredActivities = activities.filter(
    (act) => filterCategory === 'ALL' || act.category === filterCategory
  );
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (a.category === 'Blasting' && b.category !== 'Blasting') return -1;
    if (b.category === 'Blasting' && a.category !== 'Blasting') return 1;
    if (a.riskLevel === 'HIGH' && b.riskLevel !== 'HIGH') return -1;
    if (b.riskLevel === 'HIGH' && a.riskLevel !== 'HIGH') return 1;
    return 0;
  });

  const primaryActivity = sortedActivities[0];
  const otherActivities = sortedActivities.slice(1);

  // Helper to render supervisor-friendly worker safety cards with a 4px left-edge accent bar
  const renderWorkerSafetyCard = (
    worker: Worker | undefined,
    defaultName: string,
    defaultHelmet: string,
    entranceZone: string,
    sectorCode: string
  ) => {
    const r = worker?.latestReading;
    const isOnline = worker?.connectivityStatus === 'ONLINE';
    const severityTier: SeverityTier = worker ? getWorkerSeverityTier(worker) : 'NORMAL';
    const isCritical = severityTier === 'CRITICAL';
    const isWarning = severityTier === 'WARNING';

    const hr = r?.heartRate;
    const spo2 = r?.spo2;
    const gas = r?.gasRaw;
    const temp = r?.temperature;

    // Strict severity-based metric thresholds
    const hrCritical = hr != null && (hr >= 150 || hr < 45);
    const hrWarning = !hrCritical && hr != null && (hr >= 120 || hr < 50);

    const spo2Critical = spo2 != null && spo2 <= 88;
    const spo2Warning = !spo2Critical && spo2 != null && spo2 < 92;

    const gasCritical = gas != null && gas >= 850;
    const gasWarning = !gasCritical && gas != null && gas >= 600;

    return (
      <div
        key={worker?.workerId || defaultHelmet}
        onClick={() => worker && onSelectWorker(worker.workerId)}
        className={`group cursor-pointer bg-white rounded-[20px] p-4 border border-slate-200/90 transition duration-200 relative overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 border-l-4 ${
          isCritical
            ? 'border-l-rose-500'
            : isWarning
            ? 'border-l-amber-500'
            : 'border-l-emerald-500'
        }`}
      >
        {/* Top Row: Status badge, Sector tag & Helmet ID */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-2xs flex items-center space-x-1 ${
                isCritical
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isWarning
                  ? 'bg-amber-500 text-white'
                  : isOnline
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCritical || isWarning || isOnline ? 'bg-white' : 'bg-slate-400'
                }`}
              />
              <span>
                {isCritical ? 'CRITICAL ALERT' : isWarning ? 'WARNING' : isOnline ? 'ONLINE' : 'STANDBY'}
              </span>
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
              hrCritical
                ? 'bg-rose-50 border-rose-300'
                : hrWarning
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Heart
                className={`w-3 h-3 ${
                  hrCritical
                    ? 'text-rose-500 animate-pulse'
                    : hrWarning
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              />
              <span>Heart Rate</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span
                className={`text-base font-extrabold font-sans ${
                  hrCritical
                    ? 'text-rose-600'
                    : hrWarning
                    ? 'text-amber-600'
                    : 'text-slate-900'
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
              spo2Critical
                ? 'bg-rose-50 border-rose-300'
                : spo2Warning
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Activity
                className={`w-3 h-3 ${
                  spo2Critical
                    ? 'text-rose-500 animate-pulse'
                    : spo2Warning
                    ? 'text-amber-500'
                    : 'text-cyan-600'
                }`}
              />
              <span>Blood SpO2</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span
                className={`text-base font-extrabold font-sans ${
                  spo2Critical
                    ? 'text-rose-600'
                    : spo2Warning
                    ? 'text-amber-600'
                    : 'text-slate-900'
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
              gasCritical
                ? 'bg-rose-50 border-rose-300'
                : gasWarning
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Wind
                className={`w-3 h-3 ${
                  gasCritical
                    ? 'text-rose-500 animate-pulse'
                    : gasWarning
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              />
              <span>Gas (MQ-5)</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span
                className={`text-base font-extrabold font-sans ${
                  gasCritical
                    ? 'text-rose-600'
                    : gasWarning
                    ? 'text-amber-600'
                    : 'text-slate-900'
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
              {isCritical ? (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              ) : isWarning ? (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
              ) : null}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP SHIFT TIMELINE RULER */}
      <section className="bg-white/80 backdrop-blur rounded-[20px] border border-slate-200/80 shadow-xs px-4 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Shift Badges */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Shift Rotation Day Pill (Clarified context, non-red) */}
            <div
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-2xs transition cursor-help"
              title="Shift Rotation: Day 15 of 28-day continuous mine extraction cycle"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-900">Day 15</span>
              <span className="text-slate-500 text-[11px] font-mono">/ 28</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">&bull; Shift Rotation</span>
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

      {/* 2. STICKY EXECUTIVE INDUSTRIAL SAFETY KPI STRIP (Item 9 & 8) */}
      <section
        className={`sticky ${
          hasEmergency ? 'top-[96px] sm:top-[100px]' : 'top-[54px] sm:top-[58px]'
        } z-30 bg-[#ECEEF1]/95 backdrop-blur-md pt-1 pb-3 -mt-2 transition-all duration-200 grid grid-cols-2 lg:grid-cols-4 gap-3.5`}
      >
        {/* Card 1: Active Personnel */}
        <div className="bg-white/90 backdrop-blur rounded-[20px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
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
        <div className="bg-white/90 backdrop-blur rounded-[20px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Telemetry Stream
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight font-sans mt-0.5">
              {isConnected ? '100% Active' : 'Disconnected'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>QoS 1 &bull; Real-time MQTT</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Pit Atmosphere Gas */}
        <div className="bg-white/90 backdrop-blur rounded-[20px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
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
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
              avgGas > 600
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-slate-100 border-slate-200/80 text-slate-700'
            }`}
          >
            <Wind className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Card 4: Incident Triage (Derived strictly from monitored worker list <= total monitored) */}
        <div
          onClick={onGoToEmergency}
          className="cursor-pointer bg-white/90 backdrop-blur rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between group"
        >
          <div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Safety Triage
            </div>
            <div
              className={`text-xl font-extrabold tracking-tight font-sans mt-0.5 ${
                criticalPersonnelCount > 0
                  ? 'text-rose-600 animate-pulse'
                  : warningPersonnelCount > 0
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}
            >
              {criticalPersonnelCount > 0
                ? `${criticalPersonnelCount} CRITICAL`
                : warningPersonnelCount > 0
                ? `${warningPersonnelCount} WARNING`
                : `0 CRITICAL`}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 group-hover:text-amber-600 transition flex items-center gap-1">
              <span>
                {criticalPersonnelCount > 0
                  ? `${criticalPersonnelCount} of ${workers.length} Monitored \u2022 Tier 1`
                  : warningPersonnelCount > 0
                  ? `${warningPersonnelCount} of ${workers.length} Monitored \u2022 Tier 2`
                  : `All ${workers.length} Personnel Nominal`}
              </span>
              <span>&rarr;</span>
            </div>
          </div>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
              criticalPersonnelCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-bounce'
                : warningPersonnelCount > 0
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 3. MAIN 2-COLUMN INDUSTRIAL COMMAND GRID (Items 2, 6, 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Worker Cards Stack (4 cols on xl, 5 on lg)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold font-sans text-slate-800 uppercase tracking-wider">
              Monitored Personnel ({workers.length})
            </span>
            <span className="text-[11px] font-mono text-slate-400">Live Biometrics</span>
          </div>

          {/* Worker 1: Arjun Verma (W-101) - WARNING (Gas MQ-5 800ppm) */}
          {renderWorkerSafetyCard(worker1, 'Arjun Verma', 'H-201', 'Entrance B — Extraction Pit', 'BA')}

          {/* Worker 2: Vikram Patel (W-102) - CRITICAL (Fall & Hypoxia 86.5%) */}
          {renderWorkerSafetyCard(worker2, 'Vikram Patel', 'H-202', 'Entrance C — Shaft 3', 'BB')}

          {/* Worker 3: Ananya Sharma (W-103) - NOMINAL */}
          {renderWorkerSafetyCard(worker3, 'Ananya Sharma', 'H-203', 'Entrance D — Processing Plant', 'DA')}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Unified Tabbed Panel (Sector Map / Radar)   */}
        {/* (Items 2, 3, 4, 5, 7, 8)                                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[22px] border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Panel Header with Segmented Tab Switcher & Quick Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Tab Switcher (Item 2) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/80 shadow-2xs">
              {/* Tab 1: Sector Map */}
              <button
                onClick={() => setCenterTab('sectors')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  centerTab === 'sectors'
                    ? 'bg-[#18191B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Sector Map</span>
                {/* Notification indicator for active alarm if inactive */}
                {centerTab !== 'sectors' && criticalPersonnelCount > 0 && (
                  <span
                    className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1"
                    title="Critical Alert in Sectors"
                  />
                )}
              </button>

              {/* Tab 2: Regional Activity */}
              <button
                onClick={() => setCenterTab('regional')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition relative ${
                  centerTab === 'regional'
                    ? 'bg-[#18191B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radar className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                <span>Regional Activity</span>
                {/* Notification indicator for active blasting notice if inactive */}
                {centerTab !== 'regional' && hasActiveBlasting && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-500 ml-1"
                    title="Active Regional Blasting Notice"
                  />
                )}
              </button>

              {/* Tab 3: Live Ingestion Feed */}
              <button
                onClick={() => setCenterTab('telemetry')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  centerTab === 'telemetry'
                    ? 'bg-[#18191B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Telemetry</span>
                {recentEvents.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500 text-white font-bold">
                    {recentEvents.length}
                  </span>
                )}
              </button>
            </div>

            {/* Right: Tab-Contextual Controls */}
            {centerTab === 'sectors' && (
              <div className="flex items-center space-x-2">
                {/* Expand All / Collapse Toggle (Item 3) */}
                <button
                  onClick={() => setExpandAllSectors(!expandAllSectors)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition border shadow-2xs ${
                    expandAllSectors
                      ? 'bg-[#18191B] text-white border-[#18191B]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={expandAllSectors ? 'Collapse nominal sectors' : 'Expand all sector cells'}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{expandAllSectors ? 'Collapse Nominal' : 'Expand All'}</span>
                </button>

                {/* Collapsed Sector Legend (ⓘ) Info Icon Popover (Item 7) */}
                <div className="relative group">
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition shadow-2xs"
                    aria-label="Sector Map Legend"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {/* Tooltip / Popover on hover or focus */}
                  <div className="pointer-events-none absolute right-0 top-full mt-2 z-50 w-80 p-3.5 bg-[#18191B] text-white rounded-2xl shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 text-xs">
                    <div className="font-bold text-[11px] text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Sector Grid Legend</span>
                      <span className="text-[10px] text-slate-400 font-mono">Reference</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono text-slate-300">
                      <div className="flex items-center space-x-2.5">
                        <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong className="text-white">Haul Fleet:</strong> Active trucks operating in sector
                        </span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <HardHat className="w-4 h-4 text-slate-300 shrink-0" />
                        <span>
                          <strong className="text-white">Crew Count:</strong> Deployed mining personnel
                        </span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <Box className="w-4 h-4 text-slate-300 shrink-0" />
                        <span>
                          <strong className="text-white">Tonnage (mt):</strong> Extracted mineral volume
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-700/80 mt-3 pt-2.5 flex items-center justify-between text-[10px] font-mono">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-rose-400 font-semibold">Critical</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-amber-400 font-semibold">Warning</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-400 font-semibold">Nominal</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-0.5 bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
                    className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
                    title="Zoom in"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                    className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
                    title="Zoom out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
                    title="Reset zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {centerTab === 'regional' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadScraperData()}
                  disabled={isScraping}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition shadow-2xs text-xs font-mono font-medium"
                  title="Re-scrape nearby activity notices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                  <span>Sync Feed</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: SPATIAL SECTOR GRID (Items 2, 3, 7) */}
          {centerTab === 'sectors' && (
            <div className="p-4 space-y-3.5">
              {/* Section 9 Header Subtitle & Quick Metrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold font-sans text-slate-800 text-sm">
                    Section 9 &bull; Sub-Level Grid
                  </span>
                  {selectedSector && (
                    <span className="bg-[#18191B] text-white font-mono px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                      Sector {selectedSector}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <div className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1 text-slate-700 shadow-2xs">
                    <Box className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">2,490,671</span>
                    <span className="text-[10px] text-slate-400">mt</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1 text-slate-700 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">{onlineCount}</span>
                    <span className="text-[10px] text-slate-400">on</span>
                    {offlineCount > 0 && <span className="text-[10px] text-amber-500">({offlineCount})</span>}
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1 text-slate-700 shadow-2xs">
                    <HardHat className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">296</span>
                  </div>
                </div>
              </div>

              {/* Spatial Grid Canvas Container */}
              <div
                className="rounded-[22px] border-2 border-[#526460]/30 bg-[#F4F6F8] p-4 shadow-inner transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <div className="space-y-3">
                  {/* Row 1: AA, AB, BA, N/A */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
                    {/* Sector AA (Nominal/Standby: compact unless expandAllSectors is true) */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => setSelectedSector('AA')}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 text-sm">AA</span>
                          <span className="text-[10px] font-mono text-slate-400">Standby</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2">
                          <span>🚛 18</span>
                          <span>👷 22</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">120K mt</div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSector('AA')}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'AA'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">AA</span>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Standby</span>
                      </div>
                    )}

                    {/* Sector AB (Clear: compact unless expandAllSectors is true) */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => setSelectedSector('AB')}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 text-sm">AB</span>
                          <span className="text-[10px] font-mono text-slate-400">Clear</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2">
                          <span>🚛 12</span>
                          <span>👷 16</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">95K mt</div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSector('AB')}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'AB'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">AB</span>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Clear</span>
                      </div>
                    )}

                    {/* Sector BA (Active with Worker 1: Arjun Verma - FLAGGED WARNING) */}
                    <div
                      onClick={() => {
                        setSelectedSector('BA');
                        worker1 && onSelectWorker(worker1.workerId);
                      }}
                      className="rounded-2xl bg-white border border-amber-300/80 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-400 transition relative overflow-hidden border-l-4 border-l-amber-500 min-h-[96px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>BA</span>
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500"
                            title="Elevated Gas Warning"
                          />
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded uppercase">
                          WARNING
                        </span>
                      </div>

                      {/* Active Worker Beacon */}
                      <div className="my-1">
                        <div className="font-bold text-slate-900 text-[11px] truncate">
                          {worker1?.name || 'Arjun Verma'}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                          <span className="flex items-center space-x-0.5" title="Haul Fleet">
                            <Truck className="w-3 h-3 text-slate-400" />
                            <span>33</span>
                          </span>
                          <span className="flex items-center space-x-0.5" title="Crew Deployed">
                            <HardHat className="w-3 h-3 text-slate-400" />
                            <span>29</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1 pt-1 border-t border-slate-100">
                        <Box className="w-3 h-3 text-slate-400" />
                        <span>233,018 mt</span>
                      </div>
                    </div>

                    {/* Sector N/A (Buffer Zone) */}
                    <div
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        expandAllSectors
                          ? 'h-28 bg-[#E2E6EA] border-slate-300/60 flex-col justify-between text-left'
                          : 'bg-[#E2E6EA] border-slate-300/60 shadow-2xs'
                      }`}
                    >
                      <span className="font-mono font-bold text-slate-400 text-xs">N/A</span>
                      <span className="text-[10px] font-mono text-slate-400">Buffer Zone</span>
                    </div>
                  </div>

                  {/* Row 2: BC, AD, BB */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
                    {/* Sector BC (Clear: compact unless expandAllSectors is true) */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => setSelectedSector('BC')}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 text-sm">BC</span>
                          <span className="text-[10px] font-mono text-slate-400">Clear</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                          <span>🚛 15</span>
                          <span>👷 14</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">347K mt</div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSector('BC')}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'BC'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">BC</span>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Upper Stope</span>
                      </div>
                    )}

                    {/* Sector AD (Clear: compact unless expandAllSectors is true) */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => setSelectedSector('AD')}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 text-sm">AD</span>
                          <span className="text-[10px] font-mono text-slate-400">Clear</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                          <span>🚛 12</span>
                          <span>👷 16</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">279K mt</div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSector('AD')}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'AD'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">AD</span>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Aux Drift</span>
                      </div>
                    )}

                    {/* Sector BB (Active with Worker 2: Vikram Patel - FLAGGED CRITICAL) */}
                    <div
                      onClick={() => {
                        setSelectedSector('BB');
                        worker2 && onSelectWorker(worker2.workerId);
                      }}
                      className="rounded-2xl bg-white border border-rose-300/80 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-rose-400 transition relative overflow-hidden border-l-4 border-l-rose-500 min-h-[96px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>BB</span>
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                            title="Critical Emergency: Confirmed Fall & Hypoxia"
                          />
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded uppercase animate-pulse">
                          CRITICAL
                        </span>
                      </div>

                      <div className="my-1">
                        <div className="font-bold text-slate-900 text-[11px] truncate">
                          {worker2?.name || 'Vikram Patel'}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                          <span className="flex items-center space-x-0.5" title="Haul Fleet">
                            <Truck className="w-3 h-3 text-slate-400" />
                            <span>38</span>
                          </span>
                          <span className="flex items-center space-x-0.5" title="Crew Deployed">
                            <HardHat className="w-3 h-3 text-slate-400" />
                            <span>36</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono font-semibold text-slate-700 flex items-center space-x-1 pt-1 border-t border-slate-100">
                        <Box className="w-3 h-3 text-slate-400" />
                        <span>797,856 mt</span>
                      </div>
                    </div>

                    {/* Empty cell alignment for grid symmetry */}
                    <div className="hidden md:block" />
                  </div>

                  {/* Striped Diagonal Hazard Walkway Divider */}
                  <div className="walkway-pattern h-4 rounded-full my-1 bg-slate-300/70 border border-slate-300 shadow-inner" />

                  {/* Row 3: CA, CB, DA, DC */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
                    {/* Sector CA */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => setSelectedSector('CA')}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 text-sm">CA</span>
                          <span className="text-[10px] font-mono text-slate-400">Shaft 3</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2">
                          <span>🚛 10</span>
                          <span>👷 18</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">180K mt</div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSector('CA')}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'CA'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">CA</span>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Shaft 3</span>
                      </div>
                    )}

                    {/* Sector CB */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => setSelectedSector('CB')}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:border-slate-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 text-sm">CB</span>
                          <span className="text-[10px] font-mono text-slate-400">Clear</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                          <span>🚛 84</span>
                          <span>👷 59</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">489K mt</div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSector('CB')}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'CB'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">CB</span>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Haul Way</span>
                      </div>
                    )}

                    {/* Sector DA (Worker 3: Ananya Sharma - NOMINAL) */}
                    {expandAllSectors ? (
                      <div
                        onClick={() => {
                          setSelectedSector('DA');
                          worker3 && onSelectWorker(worker3.workerId);
                        }}
                        className="h-28 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-emerald-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>DA</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                            NOMINAL
                          </span>
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-slate-800 text-[11px] truncate">
                            {worker3?.name || 'Ananya Sharma'}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                            <span>🚛 136</span>
                            <span>👷 142</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono font-semibold text-slate-700">
                          344,190 mt
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setSelectedSector('DA');
                          worker3 && onSelectWorker(worker3.workerId);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                          selectedSector === 'DA'
                            ? 'bg-white border-slate-400 ring-2 ring-slate-200'
                            : 'bg-[#E2E6EA] border-slate-300/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs">DA</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">Ananya S.</span>
                      </div>
                    )}

                    {/* Sector DC (Exit) */}
                    <div
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        expandAllSectors
                          ? 'h-28 bg-[#E2E6EA] border-slate-300/60 flex-col justify-between text-left'
                          : 'bg-[#E2E6EA] border-slate-300/60 shadow-2xs'
                      }`}
                    >
                      <span className="font-mono font-bold text-slate-400 text-xs">DC</span>
                      <span className="text-[10px] font-mono text-slate-400">Exit Portal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGIONAL ACTIVITY FEED (Items 4 & 5) */}
          {centerTab === 'regional' && (
            <div className="p-4 space-y-4">
              {/* Scraper Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
                <span className="flex items-center space-x-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Monitored Perimeter: &le; 10 km Radius</span>
                </span>
                <span className="text-slate-400">Sync: {lastScrapedTime}</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px] font-mono">
                {['ALL', 'Blasting', 'Heavy Transport', 'Drilling', 'Excavation'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition border ${
                      filterCategory === cat
                        ? 'bg-[#18191B] text-white border-[#18191B] font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Most Relevant Event Card (Featured Top Event - Item 4 & 5) */}
              {primaryActivity && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold px-0.5">
                    Primary Sector-Relevant Notice
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-amber-300/80 shadow-xs space-y-3 border-l-4 border-l-amber-500">
                    {/* Top Row: Category tag, Distance & Status */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center space-x-1.5 shadow-2xs">
                          {primaryActivity.category === 'Blasting' && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                          {primaryActivity.category === 'Heavy Transport' && <Truck className="w-3.5 h-3.5 text-amber-500" />}
                          {primaryActivity.category === 'Drilling' && <Compass className="w-3.5 h-3.5 text-blue-500" />}
                          {primaryActivity.category === 'Excavation' && <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                          <span>{primaryActivity.category}</span>
                        </span>
                        <span className="text-slate-500 font-semibold">
                          {primaryActivity.distanceKm} km {primaryActivity.direction}
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider bg-rose-600 text-white animate-pulse">
                        {primaryActivity.status}
                      </span>
                    </div>

                    {/* Notice Title */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug font-sans">
                        {primaryActivity.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 font-sans leading-relaxed">
                        {primaryActivity.impactDescription}
                      </p>
                    </div>

                    {/* Direct Safety Impact Banner (Item 5) */}
                    <div className="bg-amber-50/90 border border-amber-200/90 p-2.5 rounded-xl flex items-start space-x-2 text-xs font-sans text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Safety Impact: </span>
                        <span>{getSafetyImpact(primaryActivity)}</span>
                      </div>
                    </div>

                    {/* Clean Footer: Source & Timestamp */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center space-x-1">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[240px]">{primaryActivity.source}</span>
                      </span>
                      <span className="text-slate-500 font-medium">{primaryActivity.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsed Secondary Events Behind Trigger (Item 4) */}
              {otherActivities.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={() => setExpandAllRegional(!expandAllRegional)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition shadow-2xs"
                  >
                    <span>
                      {expandAllRegional
                        ? 'Collapse nearby regional notices'
                        : `+${otherActivities.length} more nearby notices in perimeter`}
                    </span>
                    {expandAllRegional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandAllRegional && (
                    <div className="space-y-3 pt-2">
                      {otherActivities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 border-l-4 border-l-slate-300 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 shadow-2xs">
                                {act.category}
                              </span>
                              <span className="text-slate-500">
                                {act.distanceKm} km {act.direction}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-slate-500">
                              {act.status}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-snug">
                              {act.title}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 font-sans">
                              {act.impactDescription}
                            </p>
                          </div>

                          {/* Concise Safety Impact Statement (Item 5) */}
                          <div className="bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-[11px] font-sans text-slate-700 flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900">Impact:</span>
                            <span className="text-slate-600">{getSafetyImpact(act)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                            <span className="truncate max-w-[200px]">{act.source}</span>
                            <span>{act.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE MQTT TELEMETRY INGESTION FEED */}
          {centerTab === 'telemetry' && (
            <div className="p-4 space-y-3.5">
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
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
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

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs group-hover:text-amber-600 transition">
                          {evt.workerName || evt.workerId}
                        </span>
                        <SeverityBadge severity={evt.riskLevel} size="sm" />
                      </div>

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
  );
};
