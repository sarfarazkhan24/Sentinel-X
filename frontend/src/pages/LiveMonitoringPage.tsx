import React from 'react';
import { Heart, Activity, Wind, Thermometer, Droplets, Radio, Clock, ArrowRight } from 'lucide-react';
import { useSafety, getWorkerSeverityTier, SeverityTier } from '../context/SafetyContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SourceBadge } from '../components/common/SourceBadge';

interface Props {
  onSelectWorker: (workerId: string) => void;
}

export const LiveMonitoringPage: React.FC<Props> = ({ onSelectWorker }) => {
  const { workers } = useSafety();

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Personnel Biometric &amp; Telemetry Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time wearable sensor stream (MAX30102, MQ-5, DHT11, MPU6050) across active mining sectors.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ACTIVE TELEMETRY</span>
          </span>
        </div>
      </div>

      {/* Grid of 3 Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {workers.map((worker) => {
          const r = worker.latestReading;
          const isOnline = worker.connectivityStatus === 'ONLINE';
          const tier: SeverityTier = getWorkerSeverityTier(worker);
          const isCritical = tier === 'CRITICAL';
          const isWarning = tier === 'WARNING';

          return (
            <div
              key={worker.workerId}
              className={`bg-white rounded-[24px] border transition duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                isCritical
                  ? 'border-rose-400 ring-2 ring-rose-200/90 bg-rose-50/15'
                  : isWarning
                  ? 'border-amber-300 ring-1 ring-amber-200/70 bg-amber-50/10'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900">{worker.name}</span>
                    <span className="text-xs font-mono bg-white text-slate-700 font-bold border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                      {worker.workerId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{worker.assignedZone}</div>
                  <div className="mt-1">
                    {r ? <SourceBadge isSimulated={r.isSimulated} /> : <span className="text-xs text-slate-400">No reading</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      {worker.connectivityStatus}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Helmet: {worker.helmetId}
                  </span>
                </div>
              </div>

              {/* Status & Risk Banner */}
              <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Hazard Status:</span>
                <SeverityBadge severity={tier} size="sm" />
              </div>

              {/* Sensor Readings Body */}
              <div className="p-4 space-y-4">
                {/* Vitals Section */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                    Biometric Telemetry (MAX30102)
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Heart Rate */}
                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs">
                        <Heart className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400">HEART RATE</div>
                        <div className="text-lg font-extrabold font-sans text-slate-900">
                          {r?.heartRate ? `${r.heartRate}` : '--'}
                          <span className="text-xs text-slate-400 ml-1 font-normal">bpm</span>
                        </div>
                      </div>
                    </div>

                    {/* SpO2 */}
                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-2xs">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400">SpO2 OXYGEN</div>
                        <div className="text-lg font-extrabold font-sans text-slate-900">
                          {r?.spo2 ? `${r.spo2}` : '--'}
                          <span className="text-xs text-slate-400 ml-1 font-normal">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environmental Section */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                    Atmospheric Quality (MQ-5 &amp; DHT11)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Gas Raw */}
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <Wind className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                      <div className="text-[9px] font-mono text-slate-400">GAS (RAW)</div>
                      <div className="text-base font-bold text-slate-900">
                        {r?.gasRaw ?? '--'}
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                      <div className="text-[9px] font-mono text-slate-400">TEMP</div>
                      <div className="text-base font-bold text-slate-900">
                        {r?.temperature ? `${r.temperature}°C` : '--'}
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <div className="text-[9px] font-mono text-slate-400">HUMIDITY</div>
                      <div className="text-base font-bold text-slate-900">
                        {r?.humidity ? `${r.humidity}%` : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motion Section (MPU6050) */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                    Kinematic Fall &amp; Motion Status (MPU6050)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        r?.fallDetected
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600'
                      }`}
                    >
                      <span>Fall Detection:</span>
                      <span>{r?.fallDetected ? 'FALL DETECTED' : 'NORMAL'}</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        r?.inactivityDetected
                          ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600'
                      }`}
                    >
                      <span>Inactivity:</span>
                      <span>{r?.inactivityDetected ? 'INACTIVE' : 'ACTIVE'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Last Seen & Details Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center text-slate-400 space-x-1 text-[11px] font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {worker.lastSeen ? new Date(worker.lastSeen).toLocaleTimeString() : 'No ping'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectWorker(worker.workerId)}
                    className="flex items-center space-x-1 text-slate-800 hover:text-amber-600 font-bold transition text-xs"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
