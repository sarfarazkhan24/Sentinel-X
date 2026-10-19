import React from 'react';

interface Props {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

export const SentinelXLogo: React.FC<Props> = ({
  size = 32,
  className = '',
  withWordmark = false,
}) => {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Domain-Native Mining Safety Smart-Helmet Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
        aria-label="SentinelX Mining Safety Logo"
      >
        {/* Base Subterranean Charcoal Chassis */}
        <rect width="36" height="36" rx="9" fill="#18191B" />
        <rect
          x="0.75"
          y="0.75"
          width="34.5"
          height="34.5"
          rx="8.25"
          stroke="#2E333D"
          strokeWidth="1.5"
        />

        {/* Ambient Warm Amber Telemetry Glow */}
        <circle cx="18" cy="16" r="10" fill="#F59E0B" fillOpacity="0.14" />

        {/* Radiating Telemetry / Lidar Pulse Arcs (Sub-surface Beacon) */}
        <path
          d="M12.5 6.5C14.2 5 16 4.2 18 4.2C20 4.2 21.8 5 23.5 6.5"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14.5 8.2C15.6 7.4 16.8 7 18 7C19.2 7 20.4 7.4 21.5 8.2"
          stroke="#FBBF24"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Miner's Safety Hard-Hat Dome (Crisp Industrial High-Visibility White) */}
        <path
          d="M10 21C10 14.2 13.5 10.5 18 10.5C22.5 10.5 26 14.2 26 21H10Z"
          fill="#F8FAFC"
        />

        {/* Helmet Center Reinforcement Ridge */}
        <path
          d="M16.5 10.5C17.2 9.8 18 9.5 18 9.5C18 9.5 18.8 9.8 19.5 10.5V14.5H16.5V10.5Z"
          fill="#E2E8F0"
        />

        {/* Rigid Protective Helmet Brim */}
        <path
          d="M7.5 22.5C7.5 21.7 8.2 21 9 21H27C27.8 21 28.5 21.7 28.5 22.5C28.5 23.3 27.8 24 27 24H9C8.2 24 7.5 23.3 7.5 22.5Z"
          fill="#CBD5E1"
        />

        {/* Smart Helmet Sensor Beacon & Headlamp (Safety Amber) */}
        <rect x="15" y="14.5" width="6" height="4.5" rx="1.5" fill="#F59E0B" />
        <circle cx="18" cy="16.75" r="1.2" fill="#FEF3C7" />

        {/* Structural Sub-level Shaft Truss Accent (Geometric 'X' Anchor) */}
        <path
          d="M11.5 27.5L18 30.5L24.5 27.5"
          stroke="#475569"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark with Clear Visual Hierarchy */}
      {withWordmark && (
        <div className="flex items-center select-none">
          <span className="text-base font-black tracking-tight text-slate-900 font-sans">
            SENTINEL<span className="text-amber-500 font-black">X</span>
          </span>
        </div>
      )}
    </div>
  );
};
