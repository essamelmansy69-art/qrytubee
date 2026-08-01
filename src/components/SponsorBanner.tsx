import React from 'react';
import { Globe, ShieldCheck, MapPin, ExternalLink, Sparkles, Paintbrush, Hammer } from 'lucide-react';
import { GOOGLE_FORM_URL } from '../utils/handymanService';

export const SponsorBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 my-8 border border-amber-500/30 shadow-xl relative overflow-hidden">
      {/* Decorative SVG Icons Background */}
      <div className="absolute top-4 left-4 opacity-5 pointer-events-none">
        <Sparkles className="w-32 h-32 text-amber-500" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-right max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3.5 py-1 rounded-full text-amber-300 text-xs font-bold">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>الراعي الرسمي لـ دليل صنايعية مصر</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            موقع ديكورا — Dkora Online
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            الموقع العربي الأول المتخصص في عالم الديكور الحديث، أحدث صيحات الدهانات، حلول التشطيب الفاخر، وأفضل النصائح لترتيب وتجميل المنازل بأيدي أمهر الفنيين والصنايعية في مصر.
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-semibold text-slate-300">
            <a
              href="https://dkora.online"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-extrabold shadow-md shadow-amber-500/20 transition-all active:scale-95"
              id="sponsor_visit_dkora_btn"
            >
              <Globe className="w-4 h-4" />
              <span>زيارة موقع ديكورا الرسمى (dkora.online)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              أحدث كتالوجات الديكور والتشطيبات
            </span>
          </div>
        </div>

        {/* Call to action card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center w-full md:w-auto shrink-0 space-y-3">
          <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">
            هل أنت فني أو صنايعي في مصر؟
          </p>
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            id="sponsor_register_btn"
          >
            <span>انضم لـ دليل الصنايعية مجاناً</span>
          </a>
          <p className="text-[11px] text-slate-400">
            * التسجيل مجاني 100% ويشمل جميع المحافظات
          </p>
        </div>
      </div>
    </div>
  );
};
