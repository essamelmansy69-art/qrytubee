/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRGenerator from './components/QRGenerator';
import { buildDeepLink, parseYoutubeUrl } from './utils';
import { 
  Youtube, 
  Sparkles, 
  Smartphone, 
  Tv, 
  Flame, 
  TrendingUp, 
  HelpCircle, 
  Github, 
  CheckCircle2, 
  Share2, 
  ShieldCheck, 
  Layers,
  Languages,
  BookOpen,
  FileText,
  ShieldAlert,
  Facebook,
  Instagram,
  Music
} from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from './translations';
const ArticlesView = React.lazy(() => import('./components/ArticlesView'));
const LegalView = React.lazy(() => import('./components/LegalView'));

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('qr_language');
    if (saved === 'en' || saved === 'ar') return saved;

    // Detect visitor's language
    try {
      const browserLang = navigator.language || (navigator as any).userLanguage || '';
      if (browserLang.toLowerCase().startsWith('en')) {
        return 'en';
      }
    } catch (e) {
      // safe fallback
    }
    return 'ar';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('qr_language', lang);
  }, [lang]);

  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'generator' | 'faq' | 'tips' | 'articles' | 'terms' | 'privacy' | 'about' | 'contact'>(() => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
      if (path === 'terms') return 'terms';
      if (path === 'privacy') return 'privacy';
      if (path === 'about') return 'about';
      if (path === 'contact') return 'contact';
      if (path === 'articles') return 'articles';
    } catch (_) {}
    return 'generator';
  });

  useEffect(() => {
    try {
      const currentPath = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
      const targetPath = activeTab === 'generator' ? '/' : `/${activeTab}`;
      if (currentPath !== targetPath.replace(/^\/|\/$/g, '')) {
        window.history.pushState({ tab: activeTab }, '', targetPath);
      }
    } catch (_) {}
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        const path = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
        if (['terms', 'privacy', 'about', 'contact', 'articles'].includes(path)) {
          setActiveTab(path as any);
        } else {
          setActiveTab('generator');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavClick = (tab: 'generator' | 'tips' | 'articles' | 'faq' | 'terms' | 'privacy' | 'about' | 'contact', event: React.MouseEvent) => {
    event.preventDefault();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Detect and handle deep-link redirected scans
  const getRedirectionTypeForDevice = (): 'ios' | 'android' | 'standard' => {
    if (typeof window === 'undefined') return 'standard';
    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera || '';
    
    // Android detection
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    
    // iOS detection (iPhone, iPad, iPod)
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'ios';
    }
    
    // iPadOS on newer Safari
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      return 'ios';
    }
    
    return 'standard';
  };

  const queryParams = new URL(window.location.href).searchParams;
  const redirectUrl = queryParams.get('r') || queryParams.get('url');
  const redirectType = queryParams.get('type') || 'vnd';

  useEffect(() => {
    if (redirectUrl) {
      try {
        const decodedUrl = decodeURIComponent(redirectUrl);
        const resolvedType = redirectType === 'vnd' ? getRedirectionTypeForDevice() : redirectType;
        const deepLink = buildDeepLink(decodedUrl, resolvedType as any);
        
        // If standard redirection is determined, open immediately
        if (resolvedType === 'standard') {
          window.location.href = deepLink;
          return;
        }

        // Record time to monitor transition status
        const startTime = Date.now();
        
        // Try launching native mobile app
        window.location.href = deepLink;

        // Failsafe fallback: if app isn't installed, the browser stays here.
        // After 1.5 seconds, we redirect them to standard Web browser URL to avoid error pages.
        const retryTimer = setTimeout(() => {
          const elapsed = Date.now() - startTime;
          // If browser is active (it didn't go to background)
          if (elapsed < 2200) {
            window.location.href = decodedUrl;
          }
        }, 1500);

        return () => clearTimeout(retryTimer);
      } catch (err) {
        console.error("Redirection failure", err);
      }
    }
  }, [redirectUrl, redirectType]);

  // If redirect parameter is active, render a loading screen instead of the full landing page
  if (redirectUrl) {
    let decodedUrl = '';
    let deepLink = '';
    let platform = 'youtube';
    try {
      decodedUrl = decodeURIComponent(redirectUrl);
      const resolvedType = redirectType === 'vnd' ? getRedirectionTypeForDevice() : redirectType;
      deepLink = buildDeepLink(decodedUrl, resolvedType as any);
      platform = parseYoutubeUrl(decodedUrl).platform;
    } catch (_) {}

    const getLoadingIconStyles = () => {
      switch(platform) {
        case 'facebook':
          return {
            bgClass: 'bg-[#1877F2] shadow-blue-500/40',
            icon: <Facebook size={48} />
          };
        case 'instagram':
          return {
            bgClass: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-pink-500/40',
            icon: <Instagram size={48} />
          };
        case 'tiktok':
          return {
            bgClass: 'bg-black border border-slate-800 shadow-slate-950/40',
            icon: <Music size={48} />
          };
        case 'youtube':
        default:
          return {
            bgClass: 'bg-red-600 shadow-red-500/40',
            icon: <Youtube size={48} />
          };
      }
    };
    const loadingStyle = getLoadingIconStyles();

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center" id="redirect_fallback_screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full space-y-8">
          
          {/* Animated pulsing massive Brand logo */}
          <div className="flex justify-center">
            <span className={`p-6 text-white rounded-3xl animate-pulse shadow-2xl ${loadingStyle.bgClass}`}>
              {loadingStyle.icon}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black font-arabic text-white leading-normal">
              {t.redirecting}
            </h2>
            <p className="text-xs text-slate-400 font-arabic leading-relaxed">
              {t.redirectDesc}
            </p>
          </div>

          {/* Quick spinner fallback button card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4" id="fallback_actions_card">
            <span className="text-xs text-slate-300 font-arabic block font-semibold leading-relaxed">
              {t.redirectFallback}
            </span>

            <div className="flex flex-col gap-2.5">
              {/* Force App link */}
              <button
                onClick={() => { if (deepLink) window.location.href = deepLink; }}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic text-sm transition-all shadow-md active:scale-98 cursor-pointer"
                type="button"
                id="force_open_app_btn"
              >
                {t.btnForceOpen}
              </button>

              {/* standard web fallback */}
              <button
                onClick={() => { if (decodedUrl) window.location.href = decodedUrl; }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium font-arabic text-xs transition-all cursor-pointer"
                type="button"
                id="open_via_browser_btn"
              >
                {t.btnWebBrowser}
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-600 font-arabic">
            {t.managedBy}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-red-100 selection:text-red-700" id="main_app_wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. STUNNING HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" id="app_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 glow-youtube">
              <Youtube size={22} />
            </span>
            <div className={`flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-md sm:text-lg font-extrabold font-arabic text-gray-900 tracking-tight leading-none">
                {t.appTitle}
              </h1>
              <span className="text-[10px] font-medium font-arabic text-slate-500 mt-0.5">
                {t.appSubTitle}
              </span>
            </div>
          </div>

          {/* Quick navigation links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/75 p-1 rounded-xl font-arabic text-sm" id="main_navigation">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'generator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              {t.navGenerator}
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'tips' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              {t.navTips}
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'articles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              {t.navArticles}
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'faq' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              {t.navFaq}
            </button>
          </nav>

          {/* Right badge / Action badge & Language Toggle */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl font-arabic transition-all cursor-pointer border border-slate-200"
              title={lang === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
              id="language_toggle_btn"
            >
              <Languages size={14} />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1 py-1 px-3 bg-red-50 text-red-600 text-xs font-semibold rounded-full font-arabic">
              <Flame size={12} />
              {t.navFreeBadge}
            </span>
          </div>

        </div>
      </header>

      {/* 2. HERO CONTENT SECTION */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-12 border-b border-slate-100 text-center relative overflow-hidden" id="hero_section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-20 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center flex flex-col items-center">
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-700 text-xs font-bold rounded-lg font-arabic mb-4">
            <Sparkles size={13} className="text-yellow-600" />
            {t.heroBadge}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-arabic text-slate-900 leading-tight tracking-tight lg:leading-normal">
            {t.heroTitlePart1}<span className="text-red-600 block sm:inline-block">{t.heroTitlePart2}</span>
          </h1>

        </div>
      </section>

      {/* 3. MAIN WORKSPACE / INTERACTIVE PLATFORM */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="main_workspace">
        
        {/* Dynamic Navigation Tabs Content render */}
        {activeTab === 'generator' && (
          <div className="transition-opacity duration-300">
            <QRGenerator lang={lang} />
          </div>
        )}

        {activeTab === 'tips' && (
          <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-xs max-w-4xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} space-y-8`} id="tips_tab_content">
            <div className={`flex items-center gap-3 ${lang === 'ar' ? 'justify-end' : 'justify-start'} pb-4 border-b border-slate-100`}>
              <h2 className="text-2xl font-bold font-arabic text-slate-900">
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
                onClick={() => setActiveTab('generator')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all cursor-pointer shadow-md"
                type="button"
              >
                {t.btnReturn}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
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
                onClick={() => setActiveTab('generator')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all cursor-pointer shadow-md"
                type="button"
              >
                {t.btnReturn}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <ArticlesView lang={lang} />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <LegalView lang={lang} docType="terms" />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <LegalView lang={lang} docType="privacy" />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <LegalView lang={lang} docType="about" />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <LegalView lang={lang} docType="contact" />
            </React.Suspense>
          </div>
        )}

        {['terms', 'privacy', 'about', 'contact'].includes(activeTab) && (
          <div className="text-center pt-8">
            <button
              onClick={() => setActiveTab('generator')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all cursor-pointer shadow-md inline-flex items-center gap-2 hover:scale-102 transition-transform duration-200"
              type="button"
            >
              <span>{t.btnReturn}</span>
            </button>
          </div>
        )}

      </main>

      {/* 4. PROFESSIONAL BEAUTIFUL FOOTER */}
      <footer className={`bg-slate-900 text-slate-300 py-12 border-t border-slate-800 ${lang === 'ar' ? 'text-right' : 'text-left'} mt-16`} id="app_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Column 1: Branding block */}
            <div className="md:col-span-5 space-y-4">
              <div className={`flex items-center gap-2.5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <span className="p-2.5 bg-red-600/90 text-white rounded-2xl flex items-center justify-center">
                  <Youtube size={18} />
                </span>
                <span className="text-lg font-bold font-arabic text-white">QR Deep Linker for Creators</span>
              </div>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-arabic">
                {t.footerDesc}
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-4 space-y-3 font-arabic">
              <span className="text-xs font-bold text-white uppercase block">{t.quickLinks}</span>
              <div className="flex flex-col gap-2 text-xs items-start">
                <a href="/" onClick={(e) => handleNavClick('generator', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navGenerator}</a>
                <a href="/tips" onClick={(e) => handleNavClick('tips', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.optGuidanceLabel}</a>
                <a href="/articles" onClick={(e) => handleNavClick('articles', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navArticles}</a>
                <a href="/faq" onClick={(e) => handleNavClick('faq', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.faqDetailsLabel}</a>
                <a href="/about" onClick={(e) => handleNavClick('about', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navAbout}</a>
                <a href="/contact" onClick={(e) => handleNavClick('contact', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navContact}</a>
                <a href="/privacy" onClick={(e) => handleNavClick('privacy', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navPrivacy}</a>
                <a href="/terms" onClick={(e) => handleNavClick('terms', e)} className="text-slate-300 hover:text-white cursor-pointer transition-colors block">{t.navTerms}</a>
              </div>
            </div>

            {/* Column 3: Quality declarations */}
            <div className="md:col-span-3 space-y-3 font-arabic">
              <span className="text-xs font-bold text-white uppercase block">{t.trustLabel}</span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {t.trustDesc}
              </p>
            </div>

          </div>

          <div className={`border-t border-slate-800 mt-10 pt-6 flex flex-col ${lang === 'ar' ? 'sm:flex-row' : 'sm:flex-row-reverse'} items-center justify-between text-xs text-slate-400 font-arabic gap-4`}>
            <span dir="ltr">{t.copyrightText}</span>
            <span>{t.loveText}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
