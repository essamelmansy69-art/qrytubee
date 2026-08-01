import React from 'react';
import { Wrench, Heart, ShieldCheck, PlusCircle } from 'lucide-react';
import { GOOGLE_FORM_URL } from '../utils/handymanService';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 mt-12 text-center text-sm">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-white block leading-tight font-serif">دليل صنايعية مصر</span>
              <span className="text-xs text-amber-400/90 font-medium">برعاية محل حدايد وبويات مصر</span>
            </div>
          </div>

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-xl transition-all"
            id="footer_register_link"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل صنايعي جديد في الدليل</span>
          </a>
        </div>

        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          جميع البيانات الواردة في الدليل يتم جلبها مباشرة وتحديثها فورياً من استمارة التسجيل الرسمية، ويتم اعتماد الصنايعية والفنيين النشطين لحماية جودة الخدمة.
        </p>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span>صُنِع بـ</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>لخدمة أهالي وصنايعية جمهورية مصر العربية © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
