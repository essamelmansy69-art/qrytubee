/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QrytubeLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  isDarkBg?: boolean;
}

export default function QrytubeLogo({
  size = 40,
  className = '',
  showText = false,
  textColor = 'text-gray-900',
  isDarkBg = false,
}: QrytubeLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} id="qrytube_brand_logo">
      {/* Header Logo Vector SVG - Zero asset delay */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="transition-transform hover:scale-105 duration-200 object-contain"
        id="qrytube_logo_svg"
      >
        <defs>
          <linearGradient id="glossyRedHeader" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E51C1C" />
            <stop offset="100%" stopColor="#800202" />
          </linearGradient>
          <linearGradient id="shineGradHeader" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <g id="f_p_header">
            <rect x="0" y="0" width="18" height="18" rx="4" fill="none" stroke="#FFA6A6" strokeWidth="3" />
            <rect x="5" y="5" width="8" height="8" rx="2" fill="#FFA6A6" />
          </g>
        </defs>

        {/* Base App Icon Card */}
        <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#glossyRedHeader)" stroke="#600101" strokeWidth="1.5" />
        
        {/* Subtle inner shadow/bevel stroke */}
        <rect x="3.5" y="3.5" width="93" height="93" rx="20.5" fill="none" stroke="#FF7E7E" strokeWidth="1" opacity="0.25" />

        {/* QR Code Dot Matrix Patterns */}
        <use href="#f_p_header" x="12" y="12" />
        <use href="#f_p_header" x="70" y="12" />
        <use href="#f_p_header" x="12" y="70" />

        {/* Other QR Pixels (Semi-translucent light pink/white) */}
        <g fill="#FFA6A6" opacity={0.95}>
          <rect x="36" y="12" width="4" height="4" rx="1" />
          <rect x="44" y="12" width="4" height="8" rx="1" />
          <rect x="60" y="12" width="4" height="4" rx="1" />
          
          <rect x="52" y="16" width="8" height="4" rx="1" />
          <rect x="36" y="24" width="4" height="4" rx="1" />
          <rect x="60" y="24" width="4" height="4" rx="1" />
          <rect x="44" y="24" width="4" height="4" rx="1" />

          {/* Left blocks */}
          <rect x="12" y="36" width="4" height="8" rx="1" />
          <rect x="20" y="36" width="4" height="4" rx="1" />
          <rect x="24" y="40" width="4" height="12" rx="1" />
          <rect x="12" y="48" width="8" height="4" rx="1" />
          <rect x="12" y="56" width="4" height="4" rx="1" />
          <rect x="20" y="56" width="8" height="4" rx="1" />

          {/* Right blocks */}
          <rect x="70" y="36" width="8" height="4" rx="1" />
          <rect x="84" y="36" width="4" height="8" rx="1" />
          <rect x="76" y="44" width="4" height="4" rx="1" />
          <rect x="80" y="48" width="8" height="4" rx="1" />
          <rect x="70" y="56" width="4" height="8" rx="1" />
          <rect x="80" y="56" width="8" height="4" rx="1" />

          {/* Bottom blocks */}
          <rect x="36" y="72" width="12" height="4" rx="1" />
          <rect x="36" y="80" width="4" height="8" rx="1" />
          <rect x="44" y="76" width="8" height="4" rx="1" />
          <rect x="56" y="72" width="4" height="4" rx="1" />
          <rect x="52" y="80" width="8" height="4" rx="1" />
          <rect x="64" y="76" width="4" height="8" rx="1" />
        </g>

        {/* Central Play icon hollow triangle */}
        <path
          d="M 45,34 L 45,66 L 68,50 Z"
          fill="url(#glossyRedHeader)"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Top Glossy Curve Overlay */}
        <path d="M 2,24 A 22,22 0 0,1 24,2 L 76,2 A 22,22 0 0,1 98,24 Q 50,28 2,24 Z" fill="url(#shineGradHeader)" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`text-md sm:text-lg font-extrabold tracking-tight leading-none ${isDarkBg ? 'text-white' : textColor}`}>
            Qrytube
          </span>
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
            Smart QR deep links
          </span>
        </div>
      )}
    </div>
  );
}
