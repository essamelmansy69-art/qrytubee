import React from 'react';
import { Language, translations } from '../translations';
import { Globe } from 'lucide-react';

interface FooterViewProps {
  lang: Language;
  onChangeLanguage: (l: Language) => void;
  onNavigate: (view: 'home' | 'articles' | 'chapters' | 'restaurant' | 'gym' | 'terms' | 'privacy' | 'about' | 'contact') => void;
}

export const FooterView: React.FC<FooterViewProps> = ({ lang, onChangeLanguage, onNavigate }) => {
  const t = translations[lang];

  return (
    <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800" id="qrytube_footer">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Brand details */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              width="36"
              height="36"
              style={{ borderRadius: '8px' }}
              id="footer_logo_svg"
            >
              <defs>
                <linearGradient id="glossyRedFooter" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E51C1C" />
                  <stop offset="100%" stopColor="#800202" />
                </linearGradient>
                <g id="f_p_footer">
                  <rect x="0" y="0" width="18" height="18" rx="4" fill="none" stroke="#FFA6A6" strokeWidth="3" />
                  <rect x="5" y="5" width="8" height="8" rx="2" fill="#FFA6A6" />
                </g>
              </defs>
              <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#glossyRedFooter)" stroke="#600101" strokeWidth="1.5" />
              <use href="#f_p_footer" x="12" y="12" />
              <use href="#f_p_footer" x="70" y="12" />
              <use href="#f_p_footer" x="12" y="70" />
              <path d="M 45,34 L 45,66 L 68,50 Z" fill="#FFFFFF" />
            </svg>
            <span className="font-black text-xl tracking-tight text-white font-sans">Qrytube</span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
            المنصة العربية الرائدة لتوليد الروابط العميقة (Deep Links) وأكواد الـ QR كود الاحترافية مجاناً لعام 2026. تواصل مع جمهورك مباشرة واقضِ على عقبات تسجيل الدخول.
          </p>
          
          {/* Language toggle */}
          <button
            onClick={() => onChangeLanguage(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 w-max transition-colors mt-2 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>
        </div>

        {/* Navigation columns */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="font-extrabold text-sm tracking-wide text-slate-200 uppercase border-b border-slate-800 pb-2">الخدمات والأدوات</h4>
          <ul className="space-y-2.5 text-xs font-bold text-slate-400">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                🏠 مولد الكود الرئيسي
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('chapters')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                🎬 {t.navChapters}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('restaurant')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                🍔 {t.navRestaurant}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('gym')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                🏋️ {t.navGym}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 flex flex-col gap-3">
          <h4 className="font-extrabold text-sm tracking-wide text-slate-200 uppercase border-b border-slate-800 pb-2">مركز المساعدة والمعلومات</h4>
          <ul className="space-y-2.5 text-xs font-bold text-slate-400">
            <li>
              <button onClick={() => onNavigate('articles')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                📚 {t.navArticles}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                ℹ️ {t.footerAbout}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                ⚖️ {t.footerTerms}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                🛡️ {t.footerPrivacy}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-red-400 transition-colors cursor-pointer text-right">
                ✉️ {t.footerContact}
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Under footer disclosures */}
      <div className="bg-slate-950 text-slate-500 py-6 text-center text-xs font-medium border-t border-slate-900 px-6">
        <p className="max-w-7xl mx-auto">{t.allRightsReserved}</p>
      </div>
    </footer>
  );
};
