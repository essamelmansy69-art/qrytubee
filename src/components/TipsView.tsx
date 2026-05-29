/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { translations } from '../translations';

interface TipsViewProps {
  lang: 'ar' | 'en';
  onReturn: () => void;
}

export default function TipsView({ lang, onReturn }: TipsViewProps) {
  const t = translations[lang];

  return (
    <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-xs max-w-4xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} space-y-8`} id="tips_tab_content">
      <div className={`flex items-center gap-3 ${lang === 'ar' ? 'justify-end' : 'justify-start'} pb-4 border-b border-slate-100`}>
        <h2 className="text-2xl font-bold font-arabic text-slate-900 font-medium tracking-tight">
          {t.tipsHeading}
        </h2>
        <span className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-2xl">
          <TrendingUp size={22} />
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
          <h3 className="font-bold text-gray-800 font-arabic text-base">{t.tip1Title}</h3>
          <p className="text-xs text-gray-600 font-arabic leading-relaxed">
            {t.tip1Desc}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
          <h3 className="font-bold text-gray-800 font-arabic text-base">{t.tip2Title}</h3>
          <p className="text-xs text-gray-600 font-arabic leading-relaxed">
            {t.tip2Desc}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
          <h3 className="font-bold text-gray-800 font-arabic text-base">{t.tip3Title}</h3>
          <p className="text-xs text-gray-600 font-arabic leading-relaxed">
            {t.tip3Desc}
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
          <h3 className="font-bold text-gray-800 font-arabic text-base">{t.tip4Title}</h3>
          <p className="text-xs text-gray-600 font-arabic leading-relaxed">
            {t.tip4Desc}
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onReturn}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all cursor-pointer shadow-md"
          type="button"
        >
          {t.btnReturn}
        </button>
      </div>
    </div>
  );
}
