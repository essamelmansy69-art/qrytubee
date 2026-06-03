/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { translations } from '../translations';
import QrytubeLogo from './QrytubeLogo';

interface FooterViewProps {
  lang: 'ar' | 'en';
  onNavigate: (tab: any, event: React.MouseEvent) => void;
}

export default function FooterView({ lang, onNavigate }: FooterViewProps) {
  const t = translations[lang];

  return (
    <footer className={`bg-slate-900 text-slate-300 py-12 border-t border-slate-800 ${lang === 'ar' ? 'text-right' : 'text-left'} mt-16`} id="app_footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Column 1: Branding block */}
          <div className="md:col-span-7 space-y-4">
            <div className={`flex items-center gap-2.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <QrytubeLogo size={32} />
              <span className="text-lg font-bold font-arabic text-white">qrytube for Creators</span>
            </div>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed font-arabic">
              {t.footerDesc}
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-5 space-y-3 font-arabic">
            <span className="text-xs font-bold text-white uppercase block">{t.quickLinks}</span>
            <div className="flex flex-col gap-2 text-xs items-start">
              <a href="/" onClick={(e) => onNavigate('generator', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navGenerator}</a>
              <a href="/articles" onClick={(e) => onNavigate('articles', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navArticles}</a>
              <a href="/faq" onClick={(e) => onNavigate('faq', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.faqDetailsLabel}</a>
              <a href="/about" onClick={(e) => onNavigate('about', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navAbout}</a>
              <a href="/contact" onClick={(e) => onNavigate('contact', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navContact}</a>
              <a href="/privacy" onClick={(e) => onNavigate('privacy', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navPrivacy}</a>
              <a href="/terms" onClick={(e) => onNavigate('terms', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navTerms}</a>
            </div>
          </div>

        </div>

        <div className={`border-t border-slate-800 mt-10 pt-6 flex flex-col ${lang === 'ar' ? 'sm:flex-row' : 'sm:flex-row-reverse'} items-center justify-between text-xs text-slate-400 font-arabic gap-4`}>
          <span dir="ltr">{t.copyrightText}</span>
          <span>{t.loveText}</span>
        </div>

        <div className="border-t border-slate-800/60 mt-4 pt-4 text-[10px] text-slate-500 font-arabic leading-relaxed text-center font-normal">
          <p className="max-w-4xl mx-auto">{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
