/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { buildDeepLink, parseYoutubeUrl, extractInstagramUsername, extractTiktokUsername, convertUrlToDeepLink } from './utils';
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
import FooterView from './components/FooterView';

const QRGenerator = React.lazy(() => import('./components/QRGenerator'));
const ArticlesView = React.lazy(() => import('./components/ArticlesView'));
const LegalView = React.lazy(() => import('./components/LegalView'));
const FAQView = React.lazy(() => import('./components/FAQView'));

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    // Check URL Parameter first (highest priority)
    try {
      const queryParams = new URL(window.location.href).searchParams;
      const urlLang = queryParams.get('lang');
      if (urlLang === 'en') return 'en';
      if (urlLang === 'ar') return 'ar';
    } catch (_) {}

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

  const [activeTab, setActiveTab] = useState<'generator' | 'faq' | 'articles' | 'terms' | 'privacy' | 'about' | 'contact'>(() => {
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
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('qr_language', lang);

    const title = lang === 'ar' 
      ? "Qrytube | أداة إنشاء رموز QR ذكية لقنوات اليوتيوب" 
      : "Viral QR Code Generator | Open Social Links Directly in Apps";

    const desc = lang === 'ar'
      ? "اصنع رموز QR ذكية (Deep Links) لـقناتك على اليوتيوب مجاناً. تتيح للمتابعين فتح قناتك أو فيديوهاتك داخل تطبيق اليوتيوب مباشرة لزيادة المشاهدات والاشتراكات."
      : "Create smart deep-link QR codes for social media influencers. Force links to open directly inside YouTube, Facebook, Instagram, and TikTok apps.";

    // Update document title
    document.title = title;

    // Helper to safely upsert meta elements
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, contentValue: string) => {
      try {
        let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attrName, attrValue);
          document.head.appendChild(el);
        }
        el.setAttribute('content', contentValue);
      } catch (e) {
        console.error(e);
      }
    };

    // Update core description, Open Graph and Twitter tags
    setMetaTag('name', 'description', desc);

    const currentOrigin = window.location.origin;

    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:url', currentOrigin + '/');
    setMetaTag('property', 'og:image', currentOrigin + '/og-image.png');
    setMetaTag('property', 'og:site_name', 'QR Code Best');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', currentOrigin + '/og-image.png');

    // Programmatically render hreflang tags and canonical tag in <head> for search engines
    try {
      document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
      const baseDomain = currentOrigin;
      const pathSuffix = activeTab === 'generator' ? '/' : `/${activeTab}`;
      const fullPath = `${baseDomain}${pathSuffix}`;

      // 1. Alternate Arabic
      const arLink = document.createElement('link');
      arLink.rel = 'alternate';
      arLink.setAttribute('hreflang', 'ar');
      arLink.href = fullPath;
      document.head.appendChild(arLink);

      // 2. Alternate English
      const enLink = document.createElement('link');
      enLink.rel = 'alternate';
      enLink.setAttribute('hreflang', 'en');
      enLink.href = `${fullPath}?lang=en`;
      document.head.appendChild(enLink);

      // 3. Alternate x-default
      const defLink = document.createElement('link');
      defLink.rel = 'alternate';
      defLink.setAttribute('hreflang', 'x-default');
      defLink.href = fullPath;
      document.head.appendChild(defLink);

      // 4. Update Canonical
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', lang === 'en' ? `${fullPath}?lang=en` : fullPath);
    } catch (_) {}

    // Update URL query parameters based on language without page reload
    try {
      const url = new URL(window.location.href);
      if (lang === 'en') {
        url.searchParams.set('lang', 'en');
      } else {
        url.searchParams.delete('lang');
      }
      
      // Keep state clean and safe
      if (window.location.search !== url.search) {
        window.history.pushState(null, '', url.pathname + url.search + url.hash);
      }
    } catch (e) {
      console.error(e);
    }
  }, [lang, activeTab]);

  const t = translations[lang];

  useEffect(() => {
    try {
      const currentPath = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
      // Include the language parameter in the target path during transitions so it persists if active
      const langParam = lang === 'en' ? '?lang=en' : '';
      const targetBase = activeTab === 'generator' ? '/' : `/${activeTab}`;
      const targetPath = targetBase + langParam;
      
      if (currentPath !== targetBase.replace(/^\/|\/$/g, '')) {
        window.history.pushState({ tab: activeTab }, '', targetPath);
      }
    } catch (_) {}
  }, [activeTab, lang]);

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
      
      // Sync language from URL search parameter on back/forward navigation
      try {
        const queryParams = new URL(window.location.href).searchParams;
        const urlLang = queryParams.get('lang');
        if (urlLang === 'en') {
          setLang('en');
        } else if (urlLang === 'ar') {
          setLang('ar');
        }
      } catch (_) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavClick = (tab: 'generator' | 'articles' | 'faq' | 'terms' | 'privacy' | 'about' | 'contact', event: React.MouseEvent) => {
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

  const fallbackTimerRef = React.useRef<any>(null);
  const t2Ref = React.useRef<any>(null);
  const t3Ref = React.useRef<any>(null);

  const queryParams = new URL(window.location.href).searchParams;
  const redirectUrl = queryParams.get('url') || queryParams.get('r');
  const redirectType = queryParams.get('type') || 'vnd';
  const isRedirectRoute = window.location.pathname.startsWith('/redirect') || !!redirectUrl;

  useEffect(() => {
    if (isRedirectRoute && redirectUrl) {
      try {
        const decodedUrl = decodeURIComponent(redirectUrl);
        const platformInfo = parseYoutubeUrl(decodedUrl);
        const scanId = queryParams.get('tid') || queryParams.get('id');
        
        if (scanId) {
          const platformParam = platformInfo.platform || 'youtube';
          const fetchUrl = `/api/track-scan?tid=${encodeURIComponent(scanId)}&r=${encodeURIComponent(redirectUrl)}&platform=${encodeURIComponent(platformParam)}&type=${encodeURIComponent(redirectType)}`;
          fetch(fetchUrl, { method: 'POST', keepalive: true }).catch(() => {});
        }

        // Generate the native App Scheme using the professional unified helper with active device sensing
        const deviceType = getRedirectionTypeForDevice();
        const deepLink = convertUrlToDeepLink(decodedUrl, deviceType);
        const fallbackUrl = platformInfo.cleanUrl || decodedUrl;

        // Fallback timing parameters: 3000ms (3 seconds) limit before routing browser fallback
        const timeoutDuration = 3000;
        const startTime = Date.now();
        let isRedirected = false;

        const handleBlurOrHide = () => {
          isRedirected = true;
          if (t2Ref.current) clearTimeout(t2Ref.current);
          if (t3Ref.current) clearTimeout(t3Ref.current);
          if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        };

        window.addEventListener('blur', handleBlurOrHide, { once: true });
        window.addEventListener('pagehide', handleBlurOrHide, { once: true });
        
        const handleVisibilityChange = () => {
          if (document.hidden) {
            handleBlurOrHide();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 1. First trigger instantly
        window.location.href = deepLink;

        // 2. Second trigger fallback after 150ms to force launch under low responsive environments
        t2Ref.current = setTimeout(() => {
          if (!isRedirected && !document.hidden) {
            window.location.href = deepLink;
          }
        }, 150);

        // 3. Third trigger fallback after 450ms for slow webviews
        t3Ref.current = setTimeout(() => {
          if (!isRedirected && !document.hidden) {
            window.location.href = deepLink;
          }
        }, 450);

        // 4. Absolute failsafe fallback: standard web page replace redirection after 3 seconds
        fallbackTimerRef.current = setTimeout(() => {
          const elapsed = Date.now() - startTime;
          // Verify that user hasn't successfully switched apps
          if (!isRedirected && elapsed < 4500 && !document.hidden) {
            window.location.replace(fallbackUrl);
          }
        }, timeoutDuration);

        return () => {
          if (t2Ref.current) clearTimeout(t2Ref.current);
          if (t3Ref.current) clearTimeout(t3Ref.current);
          if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
          window.removeEventListener('blur', handleBlurOrHide);
          window.removeEventListener('pagehide', handleBlurOrHide);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      } catch (err) {
        console.error("Redirection failure", err);
      }
    }
  }, [isRedirectRoute, redirectUrl, redirectType]);

  // If redirect parameter is active, render a loading screen instead of the full landing page
  if (isRedirectRoute && redirectUrl) {
    let decodedUrl = '';
    let deepLink = '';
    let platform = 'youtube';
    try {
      decodedUrl = decodeURIComponent(redirectUrl);
      const platformInfo = parseYoutubeUrl(decodedUrl);
      platform = platformInfo.platform;
      const deviceType = getRedirectionTypeForDevice();
      deepLink = convertUrlToDeepLink(decodedUrl, deviceType);
    } catch (_) {}

    const handleForceOpenClick = () => {
      if (t2Ref.current) clearTimeout(t2Ref.current);
      if (t3Ref.current) clearTimeout(t3Ref.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (deepLink) {
        window.location.href = deepLink;
      }
    };

    const getLoadingIconStyles = () => {
      switch(platform) {
        case 'facebook':
          return {
            bgClass: 'bg-[#1877F2] shadow-blue-500/40',
            buttonClass: 'bg-[#1877F2] hover:bg-[#1565C0]',
            icon: <Facebook size={48} />
          };
        case 'instagram':
          return {
            bgClass: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-pink-500/40',
            buttonClass: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90',
            icon: <Instagram size={48} />
          };
        case 'tiktok':
          return {
            bgClass: 'bg-black border border-slate-800 shadow-slate-950/40',
            buttonClass: 'bg-slate-950 hover:bg-black border border-slate-850',
            icon: <Music size={48} />
          };
        case 'youtube':
        default:
          return {
            bgClass: 'bg-red-600 shadow-red-500/40',
            buttonClass: 'bg-red-600 hover:bg-red-700',
            icon: <Youtube size={48} />
          };
      }
    };
    const loadingStyle = getLoadingIconStyles();

    const getDynamicRedirectionContent = () => {
      const isAr = lang === 'ar';
      switch (platform) {
        case 'facebook':
          return {
            title: isAr ? "جاري فتح تطبيق فيسبوك..." : "Opening Facebook App...",
            desc: isAr ? "نقوم بفتح الصفحة مباشرة في تطبيق Facebook الرسمي لضمان أفضل تفاعل وتصفح." : "Opening the page directly inside the official Facebook App for the best interaction and browsing."
          };
        case 'instagram':
          return {
            title: isAr ? "جاري فتح تطبيق إنستغرام..." : "Opening Instagram App...",
            desc: isAr ? "نقوم بفتح الحساب مباشرة في تطبيق Instagram الرسمي لمتابعة الحساب والمنشورات فوراً." : "Opening the account directly inside the official Instagram App to follow and view posts instantly."
          };
        case 'tiktok':
          return {
            title: isAr ? "جاري فتح تطبيق تيك توك..." : "Opening TikTok App...",
            desc: isAr ? "نقوم بفتح الحساب أو الفيديو في تطبيق TikTok الرسمي لتتمكن من التفاعل والمتابعة بسهولة." : "Opening the account or video directly inside the official TikTok App to let you interact and follow smoothly."
          };
        case 'youtube':
        default:
          return {
            title: isAr ? "جاري فتح تطبيق يوتيوب..." : "Opening YouTube App...",
            desc: isAr ? "نقوم بفتح الرابط بشكل مباشر في تطبيق YouTube الرسمي بخصائص الـ Deep Link لتجربة تفاعل فورية." : "We are opening the link directly inside the official YouTube App for an instant, engaging experience."
          };
      }
    };
    const dynamicContent = getDynamicRedirectionContent();

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center" id="redirect_fallback_screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full space-y-8">
          
          {/* Elegant Circular Spinner with Icon Overlay */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Spinning loading concentric ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-800/60 border-t-red-650 animate-spin" style={{ animationDuration: '0.8s' }} />
              
              {/* Pulsing social media icon container */}
              <span className={`p-5 text-white rounded-3xl shadow-2xl z-10 ${loadingStyle.bgClass} flex items-center justify-center`}>
                {loadingStyle.icon}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black font-arabic text-white leading-normal">
              {dynamicContent.title}
            </h2>
            <p className="text-xs text-slate-400 font-arabic leading-relaxed">
              {dynamicContent.desc}
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
                onClick={handleForceOpenClick}
                className={`w-full py-3.5 px-4 text-white rounded-xl font-bold font-arabic text-sm transition-all shadow-md active:scale-98 cursor-pointer ${loadingStyle.buttonClass}`}
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
          
          <button 
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity text-left outline-none border-none bg-transparent p-0"
            id="header_logo_home_btn"
          >
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
          </button>

          {/* Quick navigation links removed to keep interface clean */}
          <div className="hidden md:block" id="main_navigation"></div>

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
        
        {/* Mobile quick tab list removed */}

        {/* Dynamic Navigation Tabs Content render */}
        {activeTab === 'generator' && (
          <div className="transition-opacity duration-300 animate-fade-in">
            <React.Suspense fallback={<div className="text-center py-12 font-arabic text-slate-500 animate-pulse bg-white rounded-3xl border border-slate-100/80 p-8 shadow-xs max-w-xl mx-auto">جاري تحميل أداة كيو آر الذكية...</div>}>
              <QRGenerator lang={lang} />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <FAQView lang={lang} onReturn={() => setActiveTab('generator')} />
            </React.Suspense>
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

        {['terms', 'privacy', 'about', 'contact', 'articles'].includes(activeTab) && (
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
      <FooterView lang={lang} onNavigate={handleNavClick} />

    </div>
  );
}
