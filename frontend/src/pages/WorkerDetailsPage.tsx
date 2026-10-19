import React, { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HardHat, Activity, Heart, Wind, Thermometer, ShieldAlert, RefreshCw } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';
import { fetchWorkerHistory } from '../services/api';
import { SensorReading } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SourceBadge, sourceLabel } from '../components/common/SourceBadge';

interface Props {
  selectedWorkerId: string;
  onSelectWorker: (workerId: string) => void;
}

export const WorkerDetailsPage: React.FC<Props> = ({ selectedWorkerId, onSelectWorker }) => {
  const { workers, activeIncidents } = useSafety();
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyWorkerId, setHistoryWorkerId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState('all');
  const historyRequest = useRef(0);

  const currentWorker = workers.find((w) => w.workerId === selectedWorkerId) || workers[0];

  const loadHistory = async (workerId: string) => {
    const requestId = ++historyRequest.current;
    setLoading(true);
    try {
      const data = await fetchWorkerHistory(workerId, 40);
      if (requestId === historyRequest.current) {
        setHistory(data);
        setHistoryWorkerId(workerId);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      if (requestId === historyRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (currentWorker) {
      loadHistory(currentWorker.workerId);
    }
    return () => { historyRequest.current += 1; };
  }, [currentWorker?.workerId]);

  const currentHistory = historyWorkerId === currentWorker?.workerId ? history : [];
  const filteredHistory = currentHistory.filter((item) => selectedSource === 'all'
    || (selectedSource === 'hardware' && item.isSimulated === false)
    || (selectedSource === 'simulated' && item.isSimulated === true)
    || (selectedSource === 'unknown' && item.isSimulated == null));

  // Format chart data with short time labels
  const chartData = filteredHistory.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    heartRate: item.heartRate,
    spo2: item.spo2,
    gasRaw: item.gasRaw,
    temperature: item.temperature,
    source: sourceLabel(item.isSimulated),
  }));

  const workerIncidents = activeIncidents.filter((i) => i.workerId === currentWorker?.workerId);

  return (
    <div className="space-y-4">
      {/* Top Header & Worker Selector Bar */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 font-sans">{currentWorker?.name}</h1>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {currentWorker?.workerId}
              </span>
              <SeverityBadge severity={currentWorker?.riskLevel || 'NORMAL'} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Zone: {currentWorker?.assignedZone} &bull; Helmet: {currentWorker?.helmetId} &bull; Status: {currentWorker?.connectivityStatus}
            </p>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
              <span>Telemetry Source:</span>
              {currentWorker?.latestReading
                ? <SourceBadge isSimulated={currentWorker.latestReading.isSimulated} />
                : <span>Awaiting reading</span>}
            </div>
          </div>
        </div>

        {/* Worker Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Switch:</span>
          {workers.map((w) => (
            <button
              key={w.workerId}
              onClick={() => onSelectWorker(w.workerId)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition border shadow-2xs ${
                w.workerId === currentWorker?.workerId
                  ? 'bg-[#18191B] text-white border-[#18191B]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {w.workerId}
            </button>
          ))}
          <button
            onClick={() => currentWorker && loadHistory(currentWorker.workerId)}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-mono shadow-xs">
        <div>
          History Sample: <span className="font-bold text-slate-900">{currentHistory.length}</span> readings &bull;{' '}
          <span className="text-emerald-700 font-semibold">{currentHistory.filter((item) => item.isSimulated === false).length} hardware</span> &bull;{' '}
          <span className="text-amber-700 font-semibold">{currentHistory.filter((item) => item.isSimulated === true).length} simulated</span>
        </div>
        <label className="flex items-center gap-2 font-sans font-medium text-xs">
          Filter source:
          <select
            value={selectedSource}
            onChange={(event) => setSelectedSource(event.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">All sources</option>
            <option value="hardware">Hardware</option>
            <option value="simulated">Simulated</option>
            <option value="unknown">Source unknown</option>
          </select>
        </label>
      </div>

      {/* Sensor Graphs Grid (4 Recharts graphs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Graph 1: Heart Rate */}
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>HEART RATE (MAX30102 - bpm)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Nominal: 50 - 125 bpm
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis domain={[40, 160]} stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  labelFormatter={(label, payload) => `${label} · ${payload[0]?.payload.source ?? 'Source unknown'}`}
                  contentStyle={{ backgroundColor: '#18191B', borderRadius: '8px', color: '#FFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#E11D48"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#E11D48' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: SpO2 */}
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>BLOOD OXYGEN SpO2 (%)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Safe: &gt;92%
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis domain={[80, 100]} stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  labelFormatter={(label, payload) => `${label} · ${payload[0]?.payload.source ?? 'Source unknown'}`}
                  contentStyle={{ backgroundColor: '#18191B', borderRadius: '8px', color: '#FFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#0284C7"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#0284C7' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Gas Raw */}
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <Wind className="w-4 h-4 text-amber-500" />
              <span>COMBUSTIBLE GAS (MQ-5 ADC)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Threshold: &gt;650 High
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis domain={[100, 1024]} stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  labelFormatter={(label, payload) => `${label} · ${payload[0]?.payload.source ?? 'Source unknown'}`}
                  contentStyle={{ backgroundColor: '#18191B', borderRadius: '8px', color: '#FFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="gasRaw"
                  stroke="#D97706"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#D97706' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Temperature */}
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>AMBIENT TEMPERATURE (DHT11 - °C)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Safe: &lt;38°C
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis domain={[15, 45]} stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  labelFormatter={(label, payload) => `${label} · ${payload[0]?.payload.source ?? 'Source unknown'}`}
                  contentStyle={{ backgroundColor: '#18191B', borderRadius: '8px', color: '#FFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EA580C"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#EA580C' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Incidents for this worker */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 p-4.5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Active Emergencies for {currentWorker?.name}</span>
        </h3>

        {workerIncidents.length === 0 ? (
          <div className="text-xs font-mono text-slate-400 py-3">
            No active emergencies logged for this worker. Nominal telemetry recorded.
          </div>
        ) : (
          <div className="space-y-2">
            {workerIncidents.map((inc) => (
              <div
                key={inc.incidentId}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <SeverityBadge severity={inc.severity} size="sm" />
                    <SourceBadge isSimulated={inc.isSimulated} />
                    <span className="font-bold text-slate-900">{inc.incidentType}</span>
                    <span className="text-slate-500 font-mono text-[11px]">[{inc.status}]</span>
                  </div>
                  <div className="text-slate-600 mt-1">{inc.description}</div>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {new Date(inc.detectedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
