import React from 'react';
import { SeverityLevel } from '../../types';

interface Props {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<Props> = ({ severity, size = 'md' }) => {
  const styles = {
    NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200/80',
    HIGH_RISK: 'bg-orange-50 text-orange-700 border-orange-200/80',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold animate-pulse',
  };

  const dotColors = {
    NORMAL: 'bg-emerald-500',
    WARNING: 'bg-amber-500',
    HIGH_RISK: 'bg-orange-500',
    CRITICAL: 'bg-rose-600',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1 tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${styles[severity] || styles.NORMAL} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[severity] || 'bg-slate-400'}`} />
      {severity.replace('_', ' ')}
    </span>
  );
};
