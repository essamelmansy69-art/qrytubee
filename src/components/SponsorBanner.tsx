import React from 'react';
import { Store, ShieldCheck, MapPin, Phone, Paintbrush, Hammer, Wrench } from 'lucide-react';
import { GOOGLE_FORM_URL } from '../utils/handymanService';

export const SponsorBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 my-8 border border-amber-500/30 shadow-xl relative overflow-hidden">
      {/* Decorative SVG Icons Background */}
      <div className="absolute top-4 left-4 opacity-5 pointer-events-none">
        <Hammer className="w-32 h-32 text-amber-500" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-right max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3.5 py-1 rounded-full text-amber-300 text-xs font-bold">
            <Store className="w-4 h-4 text-amber-400" />
            <span>راعي الدليل المحلي الرسمى</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            محل حدايد وبويات مصر
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            نوفر لكم جميع مستلزمات السباكة، الكهرباء، الحدايد، والألوان والدهانات المعجونة والمخلوطة بالكمبيوتر. خامات عالية الجودة بأسعار الجملة لجميع أهالي وصنايعية مصر وبجميع المحافظات.
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-amber-400" />
              خدمة وصيانة وتوريدات لجميع المحافظات
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              أسعار خاصة وفواتير معتمدة للصنايعية
            </span>
          </div>
        </div>

        {/* Call to action card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center w-full md:w-auto shrink-0 space-y-3">
          <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">
            هل أنت فني أو صنايعي في المنطقة؟
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
            * التسجيل مجاني 100% ويشمل جميع التخصصات
          </p>
        </div>
      </div>
    </div>
  );
};
