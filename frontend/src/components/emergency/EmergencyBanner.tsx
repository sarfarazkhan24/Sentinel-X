import React from 'react';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { SourceBadge } from '../common/SourceBadge';

interface Props {
  onGoToEmergency: () => void;
}

export const EmergencyBanner: React.FC<Props> = ({ onGoToEmergency }) => {
  const { activeIncidents } = useSafety();

  const criticals = activeIncidents.filter((i) => i.severity === 'CRITICAL');
  if (criticals.length === 0) return null;

  const topIncident = criticals[0];

  return (
    <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-rose-900 shadow-xs">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-md bg-rose-600 text-white animate-pulse shadow-xs">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px] bg-rose-600 px-2 py-0.5 rounded shadow-2xs">
              ACTIVE EMERGENCY
            </span>
            <span className="font-bold text-rose-950">
              {topIncident.incidentType.replace('_', ' ')}
            </span>
            <SourceBadge isSimulated={topIncident.isSimulated} />
            <span className="text-rose-700 hidden sm:inline">
              Worker: <span className="font-mono font-bold text-rose-900">{topIncident.workerId}</span> &bull; {topIncident.description}
            </span>
          </div>
        </div>

        <button
          onClick={onGoToEmergency}
          className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full transition shadow-xs"
        >
          <span>MANAGE ({criticals.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

