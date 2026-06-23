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
  Languages,
  BookOpen,
  FileText,
  ShieldAlert,
  Facebook,
  Instagram,
  Music,
  Coins,
  Banknote,
  Play,
  ArrowRight,
  Cloud,
  Sun,
  Moon,
  Globe,
  Utensils,
  Dumbbell
} from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from './translations';
import FooterView from './components/FooterView';
import QrytubeLogo from './components/QrytubeLogo';
import { articlesData } from './data/seoContent';

const QRGenerator = React.lazy(() => import('./components/QRGenerator'));
const ArticlesView = React.lazy(() => import('./components/ArticlesView'));
const LegalView = React.lazy(() => import('./components/LegalView'));
const FAQView = React.lazy(() => import('./components/FAQView'));
const ChaptersGeneratorView = React.lazy(() => import('./components/ChaptersGeneratorView'));
const RestaurantQRView = React.lazy(() => import('./components/RestaurantQRView'));
const GymQRView = React.lazy(() => import('./components/GymQRView'));

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    } catch (_) {}
  }, [theme]);

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
      const systemLanguages = navigator.languages || [];
      const hasArabicPreference = systemLanguages.some(l => l.toLowerCase().startsWith('ar'));
      const mainBrowserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      
      if (hasArabicPreference || mainBrowserLang.startsWith('ar')) {
        return 'ar';
      } else {
        // Default to English for foreigners (any non-Arabic language)
        return 'en';
      }
    } catch (e) {
      // safe fallback
    }
    return 'ar';
  });

  const [activeTab, setActiveTab] = useState<'generator' | 'facebook' | 'instagram' | 'tiktok' | 'website' | 'faq' | 'articles' | 'terms' | 'privacy' | 'about' | 'contact' | 'chapters' | 'restaurant' | 'gym'>(() => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
      if (path === 'terms') return 'terms';
      if (path === 'privacy') return 'privacy';
      if (path === 'about') return 'about';
      if (path === 'contact') return 'contact';
      if (path === 'facebook') return 'facebook';
      if (path === 'instagram') return 'instagram';
      if (path === 'tiktok') return 'tiktok';
      if (path === 'website') return 'website';
      if (path === 'restaurant' || path === 'restaurant-qr' || path === 'menu-barcode') return 'restaurant';
      if (path === 'gym' || path === 'gym-qr' || path === 'gym-qr-generator' || path === 'fitness-barcode') return 'gym';
      if (path === 'chapters' || path === 'timestamp-generator' || path === 'youtube-chapters') return 'chapters';
      if (path === 'articles' || path.startsWith('articles/')) return 'articles';
    } catch (_) {}
    return 'generator';
  });

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(() => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
      if (path.startsWith('articles/')) {
        return path.replace('articles/', '');
      }
    } catch (_) {}
    return null;
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('qr_language', lang);

    // Calculate page-specific Title and Description
    let title = "";
    let desc = "";

    if (activeTab === 'generator') {
      title = lang === 'ar' 
        ? "YouTube QR Code Generator | إنشاء QR كود لرابط فيديو يوتيوب بضغطة واحدة" 
        : "YouTube QR Code Generator | Smart YouTube Deep Link QR Tool";
      desc = lang === 'ar'
        ? "هل تريد تحويل رابط فيديوهاتك إلى QR Code احترافي؟ جرب أسرع أداة مجانية لإنشاء QR كود لروابط اليوتيوب، مخصصة لصناع المحتوى، سهلة الاستخدام وتدعم الهاتف والحاسوب."
        : "Convert your YouTube video urls into high conversion mobile deep links and custom QR codes instantly. Perfect for video creators and marketing.";
    } else if (activeTab === 'facebook') {
      title = lang === 'ar' 
        ? "أداة توليد كود QR ذكي للفيسبوك لفتح التطبيق مباشرة | Qrytube" 
        : "Facebook Smart QR Code & Deep Link Generator | Qrytube";
      desc = lang === 'ar'
        ? "اصنع كود QR ذكي وحملات مجانية لصفحتك أو مجموعتك على فيسبوك. يفتح التطبيق مباشرة دون مغادرة المتصفح الداخلي لتوفير تفاعل فوري."
        : "Create custom deep link QR codes for Facebook. Force links to open directly inside the official Facebook app to boost likes and follows.";
    } else if (activeTab === 'instagram') {
      title = lang === 'ar' 
        ? "أداة توليد كود QR ذكي للإنستغرام لزيادة المتابعين | Qrytube" 
        : "Instagram Smart QR Code & Deep Link Generator | Qrytube";
      desc = lang === 'ar'
        ? "اصنع كود QR ذكي لحسابك أو ريلز إنستغرام لفتح حسابك مباشرة بداخل تطبيق إنستغرام لزيادة المتابعين والتفاعل بسهولة."
        : "Generate custom deep link QR codes for Instagram profiles and reels. Open directly in the Instagram app for maximum followers.";
    } else if (activeTab === 'tiktok') {
      title = lang === 'ar' 
        ? "أداة توليد كود QR ذكي وروابط عميقة للتيك توك | Qrytube" 
        : "TikTok Smart QR Code & Deep Link Generator | Qrytube";
      desc = lang === 'ar'
        ? "أداة مجانية لتوليد كود QR ذكي وروابط عميقة لصفحتك أو مقاطع تيك توك لتوجيه المشاهدين إلى حسابك الرسمي بالتطبيق مباشرة."
        : "Generate smart QR codes and deep links for TikTok profiles and videos. Open directly in the official TikTok app.";
    } else if (activeTab === 'website') {
      title = lang === 'ar' 
        ? "أداة توليد كود QR ذكي لأي موقع إلكتروني أو رابط | Qrytube" 
        : "Smart QR Code Generator for Any Website or URL | Qrytube";
      desc = lang === 'ar'
        ? "أداة مجانية واحترافية تماماً لتوليد كود QR لأي موقع إلكتروني، مدونة، متجر الكتروني أو رابط خارجي مع إمكانية التخصيص الكامل للألوان وإدراج الشعار."
        : "Generate custom QR codes for any website, link, blog, or online store with fully adjustable brand colors and logo alignment.";
    } else if (activeTab === 'faq') {
      title = lang === 'ar'
        ? "الأسئلة الشائعة | Qrytube"
        : "Frequently Asked Questions | Qrytube";
      desc = lang === 'ar'
        ? "أجوبة شاملة على جميع استفساراتك حول الروابط العميقة (Deep Links)، كيفية توليد رموز الـ QR كود الذكية، وتخصيص الألوان وإدراج الشعار بدون تعطل المسح."
        : "Find answers about dynamic deep links, custom brand styling, high-resolution QR scanning, and secure browser-to-app routing on Qrytube.";
    } else if (activeTab === 'articles') {
      if (selectedArticleId) {
        const article = articlesData[lang]?.find(a => a.id.toLowerCase() === selectedArticleId.toLowerCase());
        if (article) {
          title = `${article.title} | Qrytube`;
          desc = article.excerpt;
        } else {
          title = lang === 'ar' ? "المقال غير موجود | Qrytube" : "Article Not Found | Qrytube";
          desc = lang === 'ar' ? "المقال المطلوب غير موجود أو تم نقله." : "The requested article was not found or has been moved.";
        }
      } else {
        title = lang === 'ar'
          ? "المقالات وأدلة السيو | Qrytube"
          : "Articles & SEO Guides | Qrytube";
        desc = lang === 'ar'
          ? "مقالات وأدلة سيو متخصصة وحصرية لمساعدتك في تصدر نتائج البحث، وزيادة المشاهدات والاشتراكات الحقيقية على يوتيوب ومنصات التواصل الاجتماعي لعام 2026."
          : "Explore expert search engine optimization guides, video ranking algorithms, and smart link growth strategies for social media marketers.";
      }
    } else if (activeTab === 'terms') {
      title = lang === 'ar' ? "شروط الخدمة | Qrytube" : "Terms of Service | Qrytube";
      desc = lang === 'ar'
        ? "شروط الخدمة والسياسات المنظمة لاستخدام أداة كاشف الروابط وتوليد رموز الـ QR كيو آر الرسمية من Qrytube."
        : "Terms and conditions of use for Qrytube QR generator tool and professional smart deep links services.";
    } else if (activeTab === 'privacy') {
      title = lang === 'ar' ? "سياسة الخصوصية | Qrytube" : "Privacy Policy | Qrytube";
      desc = lang === 'ar'
        ? "سياسة الخصوصية والأمان لزائري موقع Qrytube. نحن ملتزمون بالكامل بحماية بياناتك وخصوصيتك حيث تتم كافة عمليات توليد الرموز محلياً في متصفحك."
        : "Privacy policy and client data protection pledge for Qrytube QR code generator visitors. Zero tracking cookies, fully secure local creation.";
    } else if (activeTab === 'about') {
      title = lang === 'ar' ? "من نحن | Qrytube" : "About Us | Qrytube";
      desc = lang === 'ar'
        ? "تعرف على قصة Qrytube ورؤيتنا في مساعدة صناع المحتوى والمؤثرين العرب على النمو وزيادة الاشتراكات بنسب تصل إلى 200% باستخدام الروابط العميقة والـ QR الذكي."
        : "Learn about Qrytube’s mission to help creators, influencers, and brands boost engagement and drive mobile app traffic seamlessly.";
    } else if (activeTab === 'chapters') {
      title = lang === 'ar' 
        ? "أداة تنسيق فصول مقاطع اليوتيوب والتايم ستامب | Qrytube" 
        : "YouTube Chapters & Timestamp Generator Tool | Qrytube";
      desc = lang === 'ar'
        ? "أداة مجانية واحترافية لتوليد وتنسيق فصول اليوتيوب والتايم ستامب (Timestamps) متوافقة بالكامل مع قواعد السيو 2026 لتعزيز ظهور فديوهاتك في محركات بحث جوجل."
        : "Free, automated tool to format YouTube video chapters and timestamps perfectly aligned with modern SEO 2026 indexing rules.";
    } else if (activeTab === 'contact') {
      title = lang === 'ar' ? "اتصل بنا | Qrytube" : "Contact Us | Qrytube";
      desc = lang === 'ar'
        ? "تواصل مع فريق الدعم الفني لموقع Qrytube للإبلاغ عن أي مشاكل أو المساعدة في تصميم وطباعة أكواد الـ QR كود والشعارات المخصصة لقنواتك."
        : "Get in touch with the Qrytube professional team for support, feature feedback, partnership proposals, or customized enterprise integration solutions.";
    } else if (activeTab === 'restaurant') {
      title = lang === 'ar'
        ? "أداة توليد كود QR للمطاعم والمقاهي مجاناً | منيو باركود ذكي | Qrytube"
        : "Free Restaurant QR Code Generator | Smart Table Menu Code | Qrytube";
      desc = lang === 'ar'
        ? "أنشئ كود QR ذكي ومجاني لمنيو مطعمك أو مقهاك. يدعم روابط المنيو الإلكتروني ومواقع الخرائط، قابل للتخصيص بالكامل مع إضافة شعار وألوان مميزة للطباعة."
        : "Generate customizable, free QR codes for aggregate restaurant menus, food catalogs, and table stands. Include custom restaurant logos, custom frames, and download vector SVG and PDF flyers.";
    } else if (activeTab === 'gym') {
      title = lang === 'ar'
        ? "أداة توليد كود QR للصالات الرياضية والجيم مجاناً | رمز كاشف ذكي | Qrytube"
        : "Free Gym QR Code Generator | Smart Fitness Club Code | Qrytube";
      desc = lang === 'ar'
        ? "أنشئ كود QR ذكي ومجاني لصالتك الرياضية وناديك الصحي. يدعم روابط الاشتراكات، الحسابات، جداول التمارين، قابل للتخصيص بالكامل مع إضافة رموز الأثقال والشعارات للطباعة."
        : "Generate customizable, free QR codes for fitness centers, gym reception check-ins, and machinery tutorials. Include custom dumbbell symbols, custom frame templates, and download vector flyers/A4 PDF.";
    } else {
      title = lang === 'ar' 
        ? "YouTube QR Code Generator | إنشاء QR كود لرابط فيديو يوتيوب بضغطة واحدة" 
        : "YouTube QR Code Generator | Viral QR Codes & Deep Links";
      desc = lang === 'ar'
        ? "هل تريد تحويل رابط فيديوهاتك إلى QR Code احترافي؟ جرب أسرع أداة مجانية لإنشاء QR كود لروابط اليوتيوب، مخصصة لصناع المحتوى، سهلة الاستخدام وتدعم الهاتف والحاسوب."
        : "Convert YouTube and social video URLs to smart app deep link QR codes. Drive high subscriber engagement today.";
    }

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
    setMetaTag('property', 'og:image', currentOrigin + '/seo_2026_banner.webp');
    setMetaTag('property', 'og:site_name', 'QR Code Best');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', currentOrigin + '/seo_2026_banner.webp');

    // Programmatically render hreflang tags and canonical tag in <head> for search engines
    try {
      document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
      const baseDomain = 'https://qrytube.com';
      let pathSuffix = activeTab === 'generator' ? '' : `/${activeTab}`;
      if (activeTab === 'articles' && selectedArticleId) {
        pathSuffix = `/articles/${selectedArticleId}`;
      }
      const canonicalPath = pathSuffix === '' ? `${baseDomain}/` : `${baseDomain}${pathSuffix}`;
      const arPath = pathSuffix === '' ? `${baseDomain}/?lang=ar` : `${baseDomain}${pathSuffix}?lang=ar`;
      const enPath = pathSuffix === '' ? `${baseDomain}/?lang=en` : `${baseDomain}${pathSuffix}?lang=en`;
      const defPath = canonicalPath;

      // 1. Alternate Arabic
      const arLink = document.createElement('link');
      arLink.rel = 'alternate';
      arLink.setAttribute('hreflang', 'ar');
      arLink.href = arPath;
      document.head.appendChild(arLink);

      // 2. Alternate English
      const enLink = document.createElement('link');
      enLink.rel = 'alternate';
      enLink.setAttribute('hreflang', 'en');
      enLink.href = enPath;
      document.head.appendChild(enLink);

      // 3. Alternate x-default
      const defLink = document.createElement('link');
      defLink.rel = 'alternate';
      defLink.setAttribute('hreflang', 'x-default');
      defLink.href = defPath;
      document.head.appendChild(defLink);

      // 4. Update Canonical
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', defPath);
    } catch (_) {}

    // Update URL query parameters based on language without page reload
    try {
      const url = new URL(window.location.href);
      if (lang === 'en') {
        url.searchParams.set('lang', 'en');
      } else {
        url.searchParams.set('lang', 'ar');
      }
      
      // Keep state clean and safe
      if (window.location.search !== url.search) {
        window.history.pushState(null, '', url.pathname + url.search + url.hash);
      }
    } catch (e) {
      console.error(e);
    }
  }, [lang, activeTab, selectedArticleId]);

  const t = translations[lang];

  useEffect(() => {
    try {
      const currentPath = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
      // Include the language parameter in the target path during transitions so it persists if active
      const langParam = lang === 'en' ? '?lang=en' : '?lang=ar';
      
      let targetBase = activeTab === 'generator' ? '/' : `/${activeTab}`;
      if (activeTab === 'articles' && selectedArticleId) {
        targetBase = `/articles/${selectedArticleId}`;
      }
      const targetPath = targetBase + langParam;
      
      if (currentPath !== targetBase.replace(/^\/|\/$/g, '')) {
        window.history.pushState({ tab: activeTab, articleId: selectedArticleId }, '', targetPath);
      }
    } catch (_) {}
  }, [activeTab, lang, selectedArticleId]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
        setSelectedArticleId(e.state.articleId || null);
      } else {
        const path = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
        if (['terms', 'privacy', 'about', 'contact', 'facebook', 'instagram', 'tiktok', 'website', 'chapters', 'restaurant', 'gym'].includes(path)) {
          setActiveTab(path as any);
          setSelectedArticleId(null);
        } else if (path === 'articles') {
          setActiveTab('articles');
          setSelectedArticleId(null);
        } else if (path.startsWith('articles/')) {
          setActiveTab('articles');
          setSelectedArticleId(path.replace('articles/', ''));
        } else {
          setActiveTab('generator');
          setSelectedArticleId(null);
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

  // Performance-optimized lazy loading for Google Analytics (GA4) G-QWM83Z109Z
  useEffect(() => {
    let initialized = false;

    const initGA = () => {
      if (initialized) return;
      initialized = true;

      // Create tracking script element with async attribute
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-QWM83Z109Z';
      document.head.appendChild(script);

      // Create/Initialize dataLayer and gtag function
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(..._args: any[]) {
        (window as any).dataLayer.push(arguments);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-QWM83Z109Z');
    };

    const handleLoad = () => {
      // Defer execution slightly to not block the current rendering cycle
      setTimeout(initGA, 0);
    };

    // Lazy load approach: load after window has fully loaded, or after a 3-second fallback delay
    const timeoutId = setTimeout(initGA, 3000);

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const handleNavClick = (tab: 'generator' | 'facebook' | 'instagram' | 'tiktok' | 'website' | 'articles' | 'faq' | 'terms' | 'privacy' | 'about' | 'contact' | 'restaurant' | 'gym', event: React.MouseEvent) => {
    event.preventDefault();
    setActiveTab(tab);
    if (tab === 'articles') {
      setSelectedArticleId(null);
    }
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

  const { queryParams, redirectUrl, redirectType, isRedirectRoute } = React.useMemo(() => {
    try {
      const qParams = new URL(window.location.href).searchParams;
      const rUrl = qParams.get('url') || qParams.get('r');
      const rType = qParams.get('type') || 'vnd';
      const isRed = window.location.pathname.startsWith('/redirect') || !!rUrl;
      return {
        queryParams: qParams,
        redirectUrl: rUrl,
        redirectType: rType,
        isRedirectRoute: isRed
      };
    } catch (_) {
      return {
        queryParams: new URLSearchParams(),
        redirectUrl: null,
        redirectType: 'vnd',
        isRedirectRoute: false
      };
    }
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <button 
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity text-left outline-none border-none bg-transparent p-0 shrink-0"
              id="header_logo_home_btn"
            >
              <QrytubeLogo size={40} />
              <div className={`flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h1 className="text-md sm:text-base font-black font-arabic text-gray-900 tracking-tight leading-none">
                  {t.appTitle}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-medium font-arabic text-slate-650 dark:text-slate-400 mt-0.5">
                  {t.appSubTitle}
                </span>
              </div>
            </button>
          </div>
          
          {/* Right badge / Action badge, Theme & Language Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-1 px-2.5 py-1.25 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-bold rounded-xl font-arabic transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title={lang === 'ar' ? (theme === 'dark' ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع المظلم') : (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
              id="theme_toggle_btn"
            >
              {theme === 'dark' ? <Sun size={12} className="text-yellow-500 animate-[spin_12s_linear_infinite]" /> : <Moon size={12} className="text-slate-600" />}
              <span>{lang === 'ar' ? (theme === 'dark' ? 'مضيء' : 'داكن') : (theme === 'dark' ? 'Light' : 'Dark')}</span>
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2.5 py-1.25 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-bold rounded-xl font-arabic transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title={lang === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
              id="language_toggle_btn"
            >
              <Languages size={12} />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-1 py-1 px-2.5 bg-red-50 text-red-600 text-[10px] font-semibold rounded-full font-arabic">
              <Flame size={11} />
              {t.navFreeBadge}
            </span>
          </div>

        </div>
      </header>

      {/* 2. HERO CONTENT SECTION */}
      {activeTab !== 'articles' && (
        <section className="bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 py-16 border-b border-slate-100 dark:border-slate-800/60 text-center relative overflow-hidden" id="hero_section">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-5 right-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-sm shadow-2xs mb-6 text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase font-arabic" id="hero_badge_pill">
              <Sparkles size={12} className="text-yellow-500 animate-pulse shrink-0" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-arabic text-slate-900 dark:text-white leading-snug tracking-tight max-w-3xl">
              {t.heroTitlePart1}
              <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent block sm:inline-block sm:ms-1.5 pb-1">
                {t.heroTitlePart2}
              </span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal font-arabic max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

          </div>
        </section>
      )}

      {/* 3. MAIN WORKSPACE / INTERACTIVE PLATFORM */}
      <main className={`${activeTab === 'articles' ? 'w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}`} id="main_workspace">
        
        {/* Sleek Platform Sub-navigation tabs */}
        {(activeTab === 'generator' || activeTab === 'facebook' || activeTab === 'instagram' || activeTab === 'tiktok' || activeTab === 'website' || activeTab === 'restaurant' || activeTab === 'gym') && (
          <div className="mb-8 bg-slate-50/70 p-1.5 rounded-2xl border border-slate-100 flex items-center justify-start gap-1.5 sm:gap-2 max-w-2xl mx-auto overflow-x-auto scrollbar-none shadow-xs" id="platform_sub_navbar">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Youtube size={16} />
              <span>{lang === 'ar' ? 'يوتيوب' : 'YouTube'}</span>
            </button>

            <button
              onClick={() => setActiveTab('facebook')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'facebook'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1877F2] hover:bg-slate-100/50'
              }`}
            >
              <Facebook size={16} />
              <span>{lang === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
            </button>

            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'instagram'
                  ? 'bg-[#E1306C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#E1306C] hover:bg-slate-100/50'
              }`}
            >
              <Instagram size={16} />
              <span>{lang === 'ar' ? 'إنستغرام' : 'Instagram'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tiktok')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'tiktok'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Music size={16} />
              <span>{lang === 'ar' ? 'تيك توك' : 'TikTok'}</span>
            </button>

            <button
              onClick={() => setActiveTab('website')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'website'
                  ? 'bg-indigo-650 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50'
              }`}
            >
              <Globe size={16} />
              <span>{lang === 'ar' ? 'مواقع أخرى' : 'Other Websites'}</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurant')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'restaurant'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-650 hover:bg-slate-100/50'
              }`}
            >
              <Utensils size={16} />
              <span>{lang === 'ar' ? 'منيو ومطاعم 🍽️' : 'Menus & Cafes'}</span>
            </button>

            <button
              onClick={() => setActiveTab('gym')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === 'gym'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-650 hover:bg-slate-100/50'
              }`}
            >
              <Dumbbell size={16} />
              <span>{lang === 'ar' ? 'كود الجيم 🏋️‍♂️' : 'Gym & Fitness'}</span>
            </button>
          </div>
        )}

        {/* Dynamic Navigation Tabs Content render */}
        {(activeTab === 'generator' || activeTab === 'facebook' || activeTab === 'instagram' || activeTab === 'tiktok' || activeTab === 'website') && (
          <div className="transition-opacity duration-300 animate-fade-in" key={activeTab}>
            <React.Suspense fallback={
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto animate-pulse" id="qr_skeleton_loader">
                {/* Simulated Left Panel (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Module 1 Skeleton */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col h-[320px] justify-between">
                    <div className="space-y-4">
                      <div className="h-6 w-1/3 bg-slate-200 rounded-lg"></div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-14 bg-slate-100 rounded-2xl"></div>
                        <div className="h-14 bg-slate-100 rounded-2xl"></div>
                        <div className="h-14 bg-slate-100 rounded-2xl"></div>
                        <div className="h-14 bg-slate-100 rounded-2xl"></div>
                      </div>
                      <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
                      <div className="h-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"></div>
                    </div>
                  </div>
                  {/* Module 2 Skeleton */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 h-[240px]">
                    <div className="h-6 w-1/4 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-10 bg-slate-100 rounded-xl"></div>
                      <div className="h-10 bg-slate-100 rounded-xl w-5/6"></div>
                    </div>
                  </div>
                </div>
                {/* Simulated Right Panel (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 h-[500px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-6 w-2/3 bg-slate-200 rounded-lg"></div>
                      <div className="h-32 bg-slate-100 rounded-2xl"></div>
                      <div className="h-4 w-1/2 bg-slate-200 rounded-md"></div>
                    </div>
                    <div className="h-12 bg-slate-200 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            }>
              <QRGenerator 
                lang={lang} 
                forcePlatform={activeTab === 'generator' ? 'youtube' : activeTab}
                onSwitchTab={(tab) => {
                  setActiveTab(tab);
                  const targetPath = tab === 'generator' ? '/' : `/${tab}`;
                  try {
                    window.history.pushState({ tab }, '', targetPath);
                  } catch (_) {}
                }}
              />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'restaurant' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <RestaurantQRView 
                lang={lang} 
                onNavigateToYouTube={() => {
                  setActiveTab('generator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'gym' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <GymQRView 
                lang={lang} 
                onNavigateToYouTube={() => {
                  setActiveTab('generator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
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
              <ArticlesView 
                lang={lang} 
                selectedArticleId={selectedArticleId}
                onSelectArticle={(id) => setSelectedArticleId(id)}
              />
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

        {activeTab === 'chapters' && (
          <div className="transition-opacity duration-300">
            <React.Suspense fallback={<div className="text-center py-10 font-arabic text-gray-500 animate-pulse">جاري التحميل...</div>}>
              <ChaptersGeneratorView lang={lang} onReturn={() => setActiveTab('generator')} />
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

        {/* TeraBox Responsive Affiliate Banner - Standard Leaderboard 728x90 */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center" id="terabox_promotion_container">
          <a
            href="https://www.terabox.com/referral/4401985151231"
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="group relative block overflow-hidden rounded-lg bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border border-blue-900/50 shadow-xs hover:shadow-md transition-all duration-300 w-full max-w-[728px] md:h-[90px] min-h-[90px]"
            id="terabox_affiliate_banner"
          >
            {/* Outer absolute visual sparks and background glow overlay */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500" />
            
            {/* Action speed lines background overlay to represent the "fast monetization / speed" visual */}
            <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_75%)]" />
              <div className="absolute top-0 left-0 right-0 h-full w-full bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.03)_50%,transparent_55%)] bg-[length:20px_20px] animate-[pulse_3s_infinite_ease-in-out]" />
            </div>

            {/* Flex orientation respects language dir - optimized to look strictly horizontal and rectangular */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${lang === 'ar' ? 'sm:flex-row-reverse text-right' : 'text-left'} relative z-10 w-full h-full p-3 md:py-0 md:px-5 md:flex`}>
              
              <div className={`flex flex-col sm:flex-row items-center gap-3 ${lang === 'ar' ? 'sm:flex-row-reverse' : ''} w-full sm:w-auto`}>
                {/* 3D-styled visual folder/box illustration (Overflowing with coins & money) */}
                <div className="relative shrink-0 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-500/35 rounded-md shadow-inner group-hover:scale-105 duration-300 transition-all">
                  {/* Glowing coins */}
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-955 p-0.5 rounded-full text-[8px] font-extrabold flex items-center justify-center animate-bounce shadow-md border border-amber-300">
                    <Coins size={9} className="text-amber-955" />
                  </div>
                  {/* Floating dollar bill */}
                  <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-0.5 rounded-md text-[7px] font-extrabold flex items-center justify-center shadow-md animate-pulse border border-emerald-300">
                    <Banknote size={9} />
                  </div>

                  {/* Video Player Card */}
                  <div className="w-7 h-7 bg-white/10 rounded-md border border-white/20 flex items-center justify-center relative overflow-hidden backdrop-blur-xs">
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-blue-950/40" />
                    <Play size={12} className="text-blue-400 fill-blue-400/80 animate-pulse" />
                  </div>
                </div>

                {/* Main banner body */}
                <div className={`space-y-0.5 ${lang === 'ar' ? 'text-center sm:text-right' : 'text-center sm:text-left'}`}>
                  {lang === 'ar' ? (
                    <div className="flex items-center justify-center sm:justify-start sm:flex-row-reverse gap-1 mb-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        <Sparkles size={9} className="animate-pulse text-amber-300" />
                        رعاية تيرابوكس الرسمية
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-1 mb-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        <Sparkles size={9} className="animate-pulse text-amber-300" />
                        Official TeraBox Sponsor
                      </span>
                    </div>
                  )}

                  {lang === 'ar' ? (
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-black font-arabic leading-tight text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-amber-300 transition-colors">
                        فيديوهاتك بتجيب فلوس! 💥
                      </h3>
                      <p className="text-[10.5px] font-arabic text-slate-100 leading-normal font-semibold">
                        ابدأ رحلتك في الربح من المحتوى مع تيرابوكس الآن.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-black tracking-tight leading-tight text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-amber-300 transition-colors">
                        MONETIZE YOUR VIDEOS! 💥
                      </h3>
                      <p className="text-[10.5px] font-sans text-slate-100 leading-normal font-semibold">
                        Start earning from your content with TeraBox now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Call-to-action button & branding info */}
              <div className={`shrink-0 flex flex-col items-center gap-0.5 w-full sm:w-auto ${lang === 'ar' ? 'sm:items-end' : 'sm:items-start'}`}>
                <div className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-center text-[10.5px] tracking-wide transition-all duration-300 group-hover:scale-102 shadow-xs hover:shadow-md border border-amber-400 select-none flex items-center justify-center gap-1">
                  <span>{lang === 'ar' ? 'ابدأ الآن مجاناً!' : 'START NOW FOR FREE!'}</span>
                  <ArrowRight size={11} className={`shrink-0 transition-transform ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </div>
                <div className="flex items-center gap-1 text-[7.5px] text-gray-400 font-bold tracking-tight">
                  <Cloud size={8} className="text-blue-400 shrink-0" />
                  <span>TERABOX 728x90 LEADERBOARD</span>
                </div>
              </div>

            </div>
          </a>
        </div>

      </main>

      {/* 4. PROFESSIONAL BEAUTIFUL FOOTER */}
      <FooterView lang={lang} onNavigate={handleNavClick} />

    </div>
  );
}
