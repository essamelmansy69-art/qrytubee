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
      {/* Header Logo Image */}
      <img
        src="/favicon.png"
        alt="Qrytube Logo"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-xl shadow-xs transition-transform hover:scale-105 duration-200 object-contain bg-white"
        referrerPolicy="no-referrer"
        id="qrytube_logo_img"
      />

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
