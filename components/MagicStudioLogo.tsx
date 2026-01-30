
import React from 'react';

interface MagicStudioLogoProps {
  className?: string;
  pulse?: boolean;
}

const MagicStudioLogo: React.FC<MagicStudioLogoProps> = ({ className = "w-10 h-10", pulse = true }) => (
  <div className={`${className} relative flex items-center justify-center group`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <filter id="neural-bloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Orbit */}
      <circle 
        cx="50" cy="50" r="46" 
        fill="none" 
        stroke="url(#ringGradient)" 
        strokeWidth="0.5" 
        strokeDasharray="4 8" 
        className="animate-spin-slow opacity-20" 
      />

      {/* Data Flow Rings */}
      <circle 
        cx="50" cy="50" r="40" 
        fill="none" 
        stroke="url(#ringGradient)" 
        strokeWidth="1" 
        strokeDasharray="15 25" 
        className="animate-spin-reverse opacity-40" 
      />
      
      <circle 
        cx="50" cy="50" r="34" 
        fill="none" 
        stroke="#60a5fa" 
        strokeWidth="2" 
        strokeDasharray="1 10" 
        className="animate-spin-slow opacity-60" 
      />

      {/* Main Hexagon Prism */}
      <path 
        d="M50 25 L71.65 37.5 L71.65 62.5 L50 75 L28.35 62.5 L28.35 37.5 Z" 
        fill="none" 
        stroke="url(#ringGradient)" 
        strokeWidth="1.5" 
        className="opacity-80"
      />

      {/* Inner Core Shield */}
      <path 
        d="M50 35 L63 42.5 L63 57.5 L50 65 L37 57.5 L37 42.5 Z" 
        fill="rgba(37, 99, 235, 0.1)" 
        stroke="#ffffff" 
        strokeWidth="0.5" 
        className="opacity-30"
      />

      {/* The Neural Nucleus */}
      <circle 
        cx="50" cy="50" r="12" 
        fill="url(#coreGlow)" 
        filter="url(#neural-bloom)" 
        className={pulse ? "animate-pulse" : ""} 
      />

      {/* Sparkle Highs */}
      <circle cx="50" cy="50" r="3" fill="white" className="animate-pulse" />
      
      {/* Dynamic Pixels (Rotating dots) */}
      <g className="animate-spin-slow">
        <circle cx="50" cy="15" r="1.5" fill="#60a5fa" />
        <circle cx="85" cy="50" r="1.5" fill="#8b5cf6" />
        <circle cx="50" cy="85" r="1.5" fill="#3b82f6" />
        <circle cx="15" cy="50" r="1.5" fill="#ffffff" />
      </g>
    </svg>
  </div>
);

export default MagicStudioLogo;
