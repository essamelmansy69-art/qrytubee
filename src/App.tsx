import React, { useState, useEffect } from 'react';
import { Language, translations } from './translations';
import { QrytubeLogo } from './components/QrytubeLogo';
import { QRGenerator } from './components/QRGenerator';
import { ArticlesView } from './components/ArticlesView';
import { ChaptersGeneratorView } from './components/ChaptersGeneratorView';
import { RestaurantQRView } from './components/RestaurantQRView';
import { GymQRView } from './components/GymQRView';
import { LegalView } from './components/LegalView';
import { FAQView } from './components/FAQView';
import { FooterView } from './components/FooterView';
import { 
  Globe, 
  Menu, 
  X, 
  Sparkles, 
  BookOpen, 
  Home, 
  Utensils, 
  Dumbbell, 
  PlayCircle 
} from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [view, setView] = useState<'home' | 'articles' | 'chapters' | 'restaurant' | 'gym' | 'terms' | 'privacy' | 'about' | 'contact'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync lang with document title and direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Sync browser tab title
    document.title = lang === 'ar' 
      ? 'أفضل مولد QR Code ليوتيوب | فتح مباشر داخل التطبيق (Deep Link)' 
      : 'Best YouTube QR Code Generator | Open directly in app (Deep Link)';
  }, [lang]);

  // Read language parameter from URL query string if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam === 'en' || langParam === 'ar') {
      setLang(langParam as Language);
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    // Optional: push URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.pushState({}, '', url.toString());
  };

  const handleNavigate = (newView: typeof view) => {
    setView(newView);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfafe] selection:bg-red-500 selection:text-white" id="qrytube_app">
      
      {/* GLOBAL HEADER HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-18 w-full flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-8">
          <button onClick={() => handleNavigate('home')} className="cursor-pointer">
            <QrytubeLogo />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button 
              onClick={() => handleNavigate('home')} 
              className={`hover:text-red-600 transition-all cursor-pointer ${view === 'home' ? 'text-red-600 border-b-2 border-red-500 pb-1' : ''}`}
            >
              {t.navHome}
            </button>
            <button 
              onClick={() => handleNavigate('articles')} 
              className={`hover:text-red-600 transition-all cursor-pointer ${view === 'articles' ? 'text-red-600 border-b-2 border-red-500 pb-1' : ''}`}
            >
              {t.navArticles}
            </button>
            <button 
              onClick={() => handleNavigate('chapters')} 
              className={`hover:text-red-600 transition-all cursor-pointer ${view === 'chapters' ? 'text-red-600 border-b-2 border-red-500 pb-1' : ''}`}
            >
              {t.navChapters}
            </button>
            <button 
              onClick={() => handleNavigate('restaurant')} 
              className={`hover:text-red-600 transition-all cursor-pointer ${view === 'restaurant' ? 'text-red-600 border-b-2 border-red-500 pb-1' : ''}`}
            >
              {t.navRestaurant}
            </button>
            <button 
              onClick={() => handleNavigate('gym')} 
              className={`hover:text-red-600 transition-all cursor-pointer ${view === 'gym' ? 'text-red-600 border-b-2 border-red-500 pb-1' : ''}`}
            >
              {t.navGym}
            </button>
          </nav>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Lang toggle */}
          <button
            onClick={() => handleLanguageChange(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>

          <button
            onClick={() => handleNavigate('home')}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            اصنع الكود مجاناً ✨
          </button>
        </div>

        {/* Mobile menu and Language toggle combined for portability */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <button
            onClick={() => handleLanguageChange(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-18 bg-white border-b border-slate-100 shadow-lg z-30 p-6 flex flex-col gap-4 animate-fade-in" id="mobile_drawer_nav">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-sm text-right cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-500" />
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavigate('articles')}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-sm text-right cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            {t.navArticles}
          </button>
          <button
            onClick={() => handleNavigate('chapters')}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-sm text-right cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-slate-500" />
            {t.navChapters}
          </button>
          <button
            onClick={() => handleNavigate('restaurant')}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-sm text-right cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-slate-500" />
            {t.navRestaurant}
          </button>
          <button
            onClick={() => handleNavigate('gym')}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-sm text-right cursor-pointer"
          >
            <Dumbbell className="w-4 h-4 text-slate-500" />
            {t.navGym}
          </button>

          <button
            onClick={() => handleNavigate('home')}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md text-sm cursor-pointer mt-2"
          >
            اصنع الكود مجاناً ✨
          </button>
        </div>
      )}

      {/* CORE CONTENT LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 flex flex-col gap-12" id="app_core_content">
        
        {/* view: home */}
        {view === 'home' && (
          <>
            {/* Elegant Hero Banner */}
            <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 md:mb-4">
              <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-xs font-black tracking-wide w-max mx-auto flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                تحديثات منصة ٢٠٢٦ الذكية
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {t.title}
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-sans">
                {t.subtitle}
              </p>
            </div>

            {/* QR Generator Tool */}
            <QRGenerator lang={lang} />

            {/* FAQs collapsible */}
            <FAQView lang={lang} />
          </>
        )}

        {/* view: articles (SEO Growth Blog) */}
        {view === 'articles' && (
          <ArticlesView lang={lang} />
        )}

        {/* view: chapters (YouTube chapters gen) */}
        {view === 'chapters' && (
          <ChaptersGeneratorView lang={lang} />
        )}

        {/* view: restaurant menu */}
        {view === 'restaurant' && (
          <RestaurantQRView onSelectPreset={() => handleNavigate('home')} />
        )}

        {/* view: gym marketing */}
        {view === 'gym' && (
          <GymQRView onSelectPreset={() => handleNavigate('home')} />
        )}

        {/* view: legal documents (terms / privacy / about / contact) */}
        {(view === 'terms' || view === 'privacy' || view === 'about' || view === 'contact') && (
          <LegalView lang={lang} initialTab={view} />
        )}

      </main>

      {/* FOOTER FOOTER */}
      <FooterView lang={lang} onChangeLanguage={handleLanguageChange} onNavigate={handleNavigate} />

    </div>
  );
};
export default App;
