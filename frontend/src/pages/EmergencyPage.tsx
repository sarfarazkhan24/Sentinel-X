import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Check, User, Clock, AlertTriangle } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SourceBadge } from '../components/common/SourceBadge';

export const EmergencyPage: React.FC = () => {
  const { activeIncidents, acknowledge, resolve } = useSafety();
  const [operatorName, setOperatorName] = useState<string>('Control Room Lead');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleAck = async (id: string) => {
    setActionInProgress(id);
    try {
      await acknowledge(id, operatorName);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRes = async (id: string) => {
    setActionInProgress(id);
    try {
      await resolve(id);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Safety Triage &amp; Emergency Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active industrial hazard response queue with verified database persistence.
          </p>
        </div>

        {/* Supervisor Profile Selector */}
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-sans">Officer:</span>
          <input
            type="text"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            className="bg-transparent border-b border-slate-300 text-slate-900 focus:outline-none focus:border-slate-600 text-xs font-mono w-32 font-bold"
            placeholder="Operator Name"
          />
        </div>
      </div>

      {/* Incidents Queue */}
      {activeIncidents.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Active Emergencies</h3>
          <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
            All worker safety telemetry is operating within nominal thresholds. No fall detections, gas spikes, or distress signals are currently unaddressed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeIncidents.map((incident) => {
            const isCritical = incident.severity === 'CRITICAL';
            const isWarning = incident.severity === 'WARNING' || incident.severity === 'HIGH_RISK';
            const isAcknowledged = incident.status === 'ACKNOWLEDGED';
            const isBusy = actionInProgress === incident.incidentId;

            return (
              <div
                key={incident.incidentId}
                className={`rounded-[24px] border p-5 transition duration-200 shadow-xs ${
                  isCritical
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-100'
                    : isWarning
                    ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-100'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Incident Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={incident.severity} size="md" />
                      <SourceBadge isSimulated={incident.isSimulated} />
                      <span className="font-bold text-sm text-slate-900 font-sans">
                        {incident.incidentType}
                      </span>
                      <span className="text-xs font-mono bg-white text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        Worker: {incident.workerId}
                      </span>
                      <span className="text-xs font-mono bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        Helmet: {incident.helmetId}
                      </span>
                      <span
                        className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${
                          isAcknowledged
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : isCritical
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-800 font-medium font-sans">
                      {incident.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Detected: {new Date(incident.detectedAt).toLocaleString()}</span>
                      </div>
                      {incident.acknowledgedAt && (
                        <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Ack by {incident.acknowledgedBy} at{' '}
                            {new Date(incident.acknowledgedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center space-x-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAck(incident.incidentId)}
                        disabled={isBusy}
                        className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-xs"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRes(incident.incidentId)}
                      disabled={isBusy}
                      className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>RESOLVE INCIDENT</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
