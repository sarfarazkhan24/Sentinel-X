import React from 'react';

export const sourceLabel = (isSimulated?: boolean | null): string => {
  if (isSimulated === true) return 'Simulated';
  if (isSimulated === false) return 'Hardware';
  return 'Source unknown';
};

export const SourceBadge: React.FC<{ isSimulated?: boolean | null }> = ({ isSimulated }) => {
  const color = isSimulated === true
    ? 'bg-amber-50 text-amber-800 border-amber-200/90'
    : isSimulated === false
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
    : 'bg-slate-100 text-slate-600 border-slate-200/90';

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium shadow-2xs ${color}`}
      title={isSimulated == null ? 'This record has no saved source information.' : 'Source reported by the device or simulator.'}
    >
      {sourceLabel(isSimulated)}
    </span>
  );
};

