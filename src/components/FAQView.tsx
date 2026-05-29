/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { translations } from '../translations';

interface FAQViewProps {
  lang: 'ar' | 'en';
  onReturn: () => void;
}

export default function FAQView({ lang, onReturn }: FAQViewProps) {
  const t = translations[lang];

  return (
    <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-xs max-w-4xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} space-y-6`} id="faq_tab_content">
      <div className={`flex items-center gap-3 ${lang === 'ar' ? 'justify-end' : 'justify-start'} pb-4 border-b border-slate-100`}>
        <h2 className="text-2xl font-bold font-arabic text-slate-900">{t.faqHeading}</h2>
        <span className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
          <HelpCircle size={22} />
        </span>
      </div>

      <div className="space-y-4" id="faq_accordion">
        <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
          <h3 className="font-bold text-slate-800 font-arabic text-sm">{t.faq1Q}</h3>
          <p className="text-xs text-slate-500 font-arabic leading-relaxed">
            {t.faq1A}
          </p>
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
          <h3 className="font-bold text-slate-800 font-arabic text-sm">{t.faq2Q}</h3>
          <p className="text-xs text-slate-500 font-arabic leading-relaxed">
            {t.faq2A}
          </p>
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
          <h3 className="font-bold text-slate-800 font-arabic text-sm">{t.faq3Q}</h3>
          <p className="text-xs text-slate-500 font-arabic leading-relaxed">
            {t.faq3A}
          </p>
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
          <h3 className="font-bold text-slate-800 font-arabic text-sm">{t.faq4Q}</h3>
          <p className="text-xs text-slate-500 font-arabic leading-relaxed">
            {t.faq4A}
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
