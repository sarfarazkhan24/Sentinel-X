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
      {/* Unique Blue & Black Tactical Shield Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
      >
        {/* Base Obsidian Black Chamfered Plate */}
        <rect width="36" height="36" rx="9" fill="#0B0F17" />
        <rect
          x="0.75"
          y="0.75"
          width="34.5"
          height="34.5"
          rx="8.25"
          stroke="#1D4ED8"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* Ambient Deep Blue Radar Glow */}
        <circle cx="18" cy="18" r="11" fill="#2563EB" fillOpacity="0.22" />

        {/* Outer Circular Tactical Reticle */}
        <circle
          cx="18"
          cy="18"
          r="12.5"
          stroke="#38BDF8"
          strokeWidth="1"
          strokeDasharray="2.5 3"
          strokeOpacity="0.55"
        />

        {/* Stylized Angular 'X' Blade Geometry */}
        <path
          d="M9.5 9.5L15.2 15.2M26.5 26.5L20.8 20.8M26.5 9.5L20.8 15.2M9.5 26.5L15.2 20.8"
          stroke="url(#sentinelx-blue-gradient)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Core Telemetry Beacon Node */}
        <circle cx="18" cy="18" r="3.4" fill="#0B0F17" stroke="#38BDF8" strokeWidth="1.6" />
        <circle cx="18" cy="18" r="1.4" fill="#60A5FA" />

        {/* Corner Micro-Tick Accents */}
        <line x1="5" y1="9" x2="5" y2="13" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
        <line x1="31" y1="23" x2="31" y2="27" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />

        {/* Linear Gradient for Futuristic Cyber Blue */}
        <defs>
          <linearGradient
            id="sentinelx-blue-gradient"
            x1="9.5"
            y1="9.5"
            x2="26.5"
            y2="26.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#38BDF8" />
            <stop offset="0.45" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Optional Wordmark */}
      {withWordmark && (
        <div className="flex items-center space-x-1.5 select-none">
          <span className="text-base font-black tracking-tight text-[#0F172A] font-sans">
            SENTINEL<span className="text-blue-600 font-black">X</span>
          </span>
          <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#0B0F17] text-blue-400 border border-blue-500/30 shadow-2xs">
            SYS-X
          </span>
        </div>
      )}
    </div>
  );
};
