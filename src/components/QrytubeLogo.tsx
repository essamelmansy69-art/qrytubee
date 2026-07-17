import React from 'react';

interface QrytubeLogoProps {
  className?: string;
  size?: number;
}

export const QrytubeLogo: React.FC<QrytubeLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} id="qrytube_logo_container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ borderRadius: '12px', width: size, height: size }}
        id="logo_svg_elem"
      >
        <defs>
          <linearGradient id="glossyRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E51C1C" />
            <stop offset="100%" stopColor="#800202" />
          </linearGradient>
          <linearGradient id="shineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <g id="f_p">
            <rect x="0" y="0" width="18" height="18" rx="4" fill="none" stroke="#FFA6A6" strokeWidth="3" />
            <rect x="5" y="5" width="8" height="8" rx="2" fill="#FFA6A6" />
          </g>
        </defs>

        <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#glossyRed)" stroke="#600101" strokeWidth="1.5" />
        <rect x="3.5" y="3.5" width="93" height="93" rx="20.5" fill="none" stroke="#FF7E7E" strokeWidth="1" opacity="0.25" />

        {/* Finder patterns */}
        <use href="#f_p" x="12" y="12" />
        <use href="#f_p" x="70" y="12" />
        <use href="#f_p" x="12" y="70" />

        {/* Outer styling squares representing matrix */}
        <g fill="#FFA6A6" opacity="0.95">
          <rect x="36" y="12" width="4" height="4" rx="1" />
          <rect x="44" y="12" width="4" height="8" rx="1" />
          <rect x="60" y="12" width="4" height="4" rx="1" />
          <rect x="52" y="16" width="8" height="4" rx="1" />
          <rect x="36" y="24" width="4" height="4" rx="1" />
          <rect x="60" y="24" width="4" height="4" rx="1" />
          <rect x="44" y="24" width="4" height="4" rx="1" />
          <rect x="12" y="36" width="4" height="8" rx="1" />
          <rect x="20" y="36" width="4" height="4" rx="1" />
          <rect x="24" y="40" width="4" height="12" rx="1" />
          <rect x="12" y="48" width="8" height="4" rx="1" />
          <rect x="12" y="56" width="4" height="4" rx="1" />
          <rect x="20" y="56" width="8" height="4" rx="1" />
          <rect x="70" y="36" width="8" height="4" rx="1" />
          <rect x="84" y="36" width="4" height="8" rx="1" />
          <rect x="76" y="44" width="4" height="4" rx="1" />
          <rect x="80" y="48" width="8" height="4" rx="1" />
          <rect x="70" y="56" width="4" height="8" rx="1" />
          <rect x="80" y="56" width="8" height="4" rx="1" />
          <rect x="36" y="72" width="12" height="4" rx="1" />
          <rect x="36" y="80" width="4" height="8" rx="1" />
          <rect x="44" y="76" width="8" height="4" rx="1" />
          <rect x="56" y="72" width="4" height="4" rx="1" />
          <rect x="52" y="80" width="8" height="4" rx="1" />
          <rect x="64" y="76" width="4" height="8" rx="1" />
        </g>

        {/* YouTube style play symbol in center */}
        <path
          d="M 45,34 L 45,66 L 68,50 Z"
          fill="url(#glossyRed)"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Ambient top glass shine */}
        <path d="M 2,24 A 22,22 0 0,1 24,2 L 76,2 A 22,22 0 0,1 98,24 Q 50,28 2,24 Z" fill="url(#shineGrad)" />
      </svg>
      <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans" id="logo_title_txt">
        Qrytube
      </span>
    </div>
  );
};
