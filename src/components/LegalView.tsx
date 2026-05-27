import { legalData } from '../data/seoContent';
import { translations } from '../translations';
import { Shield, BookOpen, Clock } from 'lucide-react';

interface LegalViewProps {
  lang: 'ar' | 'en';
  docType: 'terms' | 'privacy';
}

export default function LegalView({ lang, docType }: LegalViewProps) {
  const t = translations[lang];
  const data = legalData[lang][docType];

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm max-w-3xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} space-y-8 animate-fadeIn`} id={`legal_${docType}_container`}>
      
      {/* Title block */}
      <div className="space-y-3 pb-5 border-b border-slate-100">
        <div className={`flex items-center gap-2.5 ${lang === 'ar' ? 'justify-start' : 'justify-start'}`}>
          <span className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
            {docType === 'privacy' ? <Shield size={22} /> : <BookOpen size={22} />}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-arabic text-slate-900">
            {data.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-arabic">
          <Clock size={13} />
          <span>{t.lastUpdated} {data.lastUpdated}</span>
        </div>
      </div>

      {/* List of custom document clauses */}
      <div className="space-y-6">
        {data.sections.map((section, idx) => (
          <div key={idx} className="space-y-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <h2 className="font-bold text-slate-800 font-arabic text-base">
              {section.heading}
            </h2>
            <p className="text-sm text-slate-600 font-arabic leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>

      {/* Legal Footer Info */}
      <div className="text-center pt-4">
        <span className="text-[10px] text-slate-500 font-arabic block leading-relaxed max-w-md mx-auto">
          {lang === 'ar' 
            ? 'تمت صياغة هذه البنود لحفظ كمال الخصوصية البرمجية للمستخدم وضمان تقديم أعلى مستويات الأمان والجودة.' 
            : 'These elements are formulated to preserve developer security parameters and enforce clean local digital conversions.'}
        </span>
      </div>

    </div>
  );
}
