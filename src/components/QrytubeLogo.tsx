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
      {/* Scalable vector Q logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm transition-transform hover:scale-105 duration-200"
      >
        {/* Crisp circular background block in vibrant YouTube Red */}
        <circle cx="50" cy="50" r="48" fill="#D30A0A" />

        {/* Compound "Q" letterform (Ring & thick modern tail) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 50,22 A 25,25 0 1,0 68,66 L 79,77.5 C 81,79.5 84,79.5 86.5,78 L 86.5,71.5 C 82,71.5 78.5,69 75,64.5 L 67.5,56 A 25,25 0 0,0 50,22 Z M 50,30.5 A 16.5,16.5 0 1,1 33.5,47 A 16.5,16.5 0 0,1 50,30.5 Z"
          fill="white"
        />

        {/* Central visual indicator: Play Button triangle */}
        <polygon points="46,38 46,56 59,47" fill="white" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`text-md sm:text-lg font-extrabold tracking-tight leading-none ${isDarkBg ? 'text-white' : textColor}`}>
            Qrytube
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
            Smart QR deep links
          </span>
        </div>
      )}
    </div>
  );
}
