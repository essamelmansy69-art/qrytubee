import { legalData } from '../data/seoContent';
import { translations } from '../translations';
import { Shield, BookOpen, Clock, Info, Mail, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LegalViewProps {
  lang: 'ar' | 'en';
  docType: 'terms' | 'privacy' | 'about' | 'contact';
}

export default function LegalView({ lang, docType }: LegalViewProps) {
  const t = translations[lang];
  const data = legalData[lang][docType];
  const [copied, setCopied] = useState(false);

  const getIcon = () => {
    switch (docType) {
      case 'privacy':
        return <Shield size={22} />;
      case 'terms':
        return <BookOpen size={22} />;
      case 'about':
        return <Info size={22} />;
      case 'contact':
        return <Mail size={22} />;
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('essamelmansy70@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm max-w-3xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} space-y-8 animate-fadeIn`} id={`legal_${docType}_container`}>
      
      {/* Title block */}
      <div className="space-y-3 pb-5 border-b border-slate-100">
        <div className={`flex items-center gap-2.5 ${lang === 'ar' ? 'justify-start' : 'justify-start'}`}>
          <span className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
            {getIcon()}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-arabic text-slate-900">
            {data.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-arabic">
          <Clock size={13} />
          <span>{t.lastUpdated} {data.lastUpdated}</span>
        </div>
      </div>

      {/* List of custom document clauses */}
      <div className="space-y-6">
        {data.sections.map((section, idx) => {
          const isEmailValue = section.body === 'essamelmansy70@gmail.com';
          return (
            <div key={idx} className="space-y-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <h2 className="font-bold text-slate-800 font-arabic text-base">
                {section.heading}
              </h2>
              {isEmailValue ? (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <a 
                    href="mailto:essamelmansy70@gmail.com" 
                    className="text-lg font-bold text-red-600 hover:text-red-700 underline font-mono select-all decoration-red-200"
                  >
                    essamelmansy70@gmail.com
                  </a>
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs transition-all cursor-pointer font-bold font-arabic"
                    title={lang === 'ar' ? 'نسخ البريد الإلكتروني' : 'Copy email address'}
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ البريد' : 'Copy Email')}</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-600 font-arabic leading-relaxed">
                  {section.body}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legal Footer Info */}
      <div className="text-center pt-4">
        <span className="text-[10px] text-slate-600 font-arabic block leading-relaxed max-w-md mx-auto">
          {lang === 'ar' 
            ? 'تمت صياغة هذه البنود والوثائق الرسمية لحفظ الخصوصية البرمجية للمستخدم وضمان الإذعان الكامل لمعايير حوكمة الخصوصية الرقمية وجوجل أدسنس (Google AdSense).' 
            : 'These official layouts and document formulations prevent operational data transmission discrepancies and enforce standard AdSense compliance policies.'}
        </span>
      </div>

    </div>
  );
}
