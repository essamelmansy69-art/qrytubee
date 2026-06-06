/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from './supabaseClient';
import QRCode from 'qrcode';
import { 
  Link2, 
  Sparkles, 
  Copy, 
  Download, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Globe, 
  Moon, 
  Sun, 
  Database, 
  Loader2, 
  QrCode,
  Share2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Multilingual support - Arabic & English
const localTranslations = {
  ar: {
    title: "Qrytube - مولد الروابط وأكواد QR الديناميكية",
    subtitle: "نظام ذكي متكامل لتقصير الروابط ومزامنتها لحظياً مع Supabase",
    inputLabel: "أدخل الرابط الطويل المراد تقصيره",
    inputPlaceholder: "مثال: https://youtube.com/watch?v=...",
    btnGenerate: "توليد الرابط القصير والـ QR كود",
    btnGenerating: "جاري المعالجة والأرشفة...",
    customSlugLabel: "خصّص اسم الرابط القصير (اختياري)",
    customSlugPlaceholder: "مثال: my-video",
    resultTitle: "الرمز والرابط الذكي جاهزان!",
    shortLink: "الرابط المختصر الفعال:",
    originalLink: "الرابط الأصلي:",
    copyBtn: "نسخ الرابط",
    copied: "تم النسخ!",
    downloadBtn: "تحميل الـ QR كود (PNG)",
    openBtn: "زيارة الرابط المختصر",
    errorTitle: "حدث خطأ أثناء العمل:",
    successSave: "✓ تم الحفظ والمزامنة بنجاح مع Supabase!",
    dbStatus: "حالة قاعدة البيانات:",
    dbConnected: "متصل بـ Supabase",
    dbUnconfigured: "غير مهيأ - استخدم المكونات الافتراضية",
    dbError: "فشل الاتصال بـ Supabase",
    invalidUrl: "يرجى إدخال رابط مغذى ببروتوكول صحيح (http:// أو https://)",
    redirecting: "جاري تحويلك الآن...",
    redirectDesc: "برمجيات التوجيه الذكية تقوم بفتح الرابط الأصلي، انتظر لحظة واحدة...",
    slugNotFound: "العنوان القصير غير موجود!",
    slugNotFoundDesc: "نأسف، لم نجد أي رابط مخزن يطابق الرمز الذي تبحث عنه في قاعدة البيانات.",
    backHomeBtn: "العودة للرئيسية",
    recentHeading: "الروابط الأخيرة التي قمت بتقصيرها",
    noRecent: "لا توجد روابط منشأة حديثاً في هذه الجلسة.",
    clearHistory: "مسح السجل المؤقت",
    copiedShortLink: "تم نسخ الرابط القصير للمحافظة!",
    copiedOriginalLink: "تم نسخ الرابط الأصلي للمحافظة!"
  },
  en: {
    title: "Qrytube - Dynamic QR & Short Link Generator",
    subtitle: "A smart system to shorten URLs and sync them in real-time with Supabase",
    inputLabel: "Enter the long URL to shorten",
    inputPlaceholder: "Example: https://youtube.com/watch?v=...",
    btnGenerate: "Generate Short Link & QR Code",
    btnGenerating: "Processing and Archiving...",
    customSlugLabel: "Customize short slug (Optional)",
    customSlugPlaceholder: "Example: my-video",
    resultTitle: "Smart Link & QR Ready!",
    shortLink: "Shortened Smart Link:",
    originalLink: "Original URL:",
    copyBtn: "Copy Link",
    copied: "Copied!",
    downloadBtn: "Download QR Code (PNG)",
    openBtn: "Visit Short Link",
    errorTitle: "An error occurred:",
    successSave: "✓ Saved and synced successfully with Supabase!",
    dbStatus: "Database Status:",
    dbConnected: "Connected to Supabase",
    dbUnconfigured: "Unconfigured - Using stand-alone placeholders",
    dbError: "Supabase connection failed",
    invalidUrl: "Please enter a valid URL starting with http:// or https://",
    redirecting: "Redirecting you now...",
    redirectDesc: "Smart routing software is opening the target URL, please wait...",
    slugNotFound: "Short Link Not Found!",
    slugNotFoundDesc: "Sorry, we could not find any URL matching this short code in our database.",
    backHomeBtn: "Back to Home",
    recentHeading: "Recently Shortened Links",
    noRecent: "No recently generated links in this session.",
    clearHistory: "Clear session history",
    copiedShortLink: "Short link copied to clipboard!",
    copiedOriginalLink: "Original link copied to clipboard!"
  }
};

interface LocalizedItem {
  id: string;
  originalUrl: string;
  slug: string;
  shortUrl: string;
  qrDataUrl: string;
  createdAt: string;
}

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('qr_language');
      if (saved === 'en' || saved === 'ar') return saved;
      const sysLang = navigator.language || '';
      return sysLang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
    } catch (_) {
      return 'ar';
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  });

  // URL routing states
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<'connected' | 'unconfigured' | 'error'>('unconfigured');
  const [dbDetails, setDbDetails] = useState<string>('');

  // Main Generator States
  const [urlInput, setUrlInput] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Output QR Code & Shortlink Status
  const [activeResult, setActiveResult] = useState<{
    originalUrl: string;
    slug: string;
    shortUrl: string;
    qrDataUrl: string;
  } | null>(null);

  // Session History for instant user satisfaction
  const [recentLinks, setRecentLinks] = useState<LocalizedItem[]>(() => {
    try {
      const saved = localStorage.getItem('qrytube_recent');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Track copy feedback state
  const [copiedField, setCopiedField] = useState<'short' | 'original' | null>(null);

  const t = localTranslations[lang];

  // Apply Theme class
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

  // Adjust Document direction on Language Change
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('qr_language', lang);
  }, [lang]);

  // Handle URL Redirection Router
  useEffect(() => {
    const handleNavigation = async () => {
      const path = window.location.pathname;
      // Capture anything after /r/ or /s/ or direct /[slug]
      const match = path.match(/^\/(?:r|s)?\/?([a-zA-Z0-9_-]{3,20})$/);
      
      if (match) {
        const slug = match[1];
        console.log('[Router] Detected short slug route:', slug);
        setIsRedirecting(true);

        try {
          // Attempt self-healing fetch from Supabase
          const fetchResult = (await safeFetchFromSupabase(slug)) as any;
          if (fetchResult.success && fetchResult.originalUrl) {
            console.log('[Router] Redirecting to original URL:', fetchResult.originalUrl);
            window.location.replace(fetchResult.originalUrl);
          } else {
            console.warn('[Router] Short slug not found in database:', slug);
            setRedirectError(slug);
          }
        } catch (err: any) {
          console.error('[Router] Redirect routing crashed:', err);
          setRedirectError(slug);
        }
      }
    };

    handleNavigation();
  }, []);

  // Check Database on initial render
  useEffect(() => {
    const checkConn = async () => {
      try {
        const { success, error } = await testSupabaseConnection();
        if (success) {
          setDbStatus('connected');
          setDbDetails('Successfully authenticated and table "links" is queryable.');
        } else {
          if (error && error.message && error.message.includes('credentials')) {
            setDbStatus('unconfigured');
            setDbDetails('Defaulting to standalone local preview. Configure SUPABASE_URL & SUPABASE_ANON_KEY to persist.');
          } else {
            setDbStatus('error');
            setDbDetails(error?.message || 'Failed connecting to real database. Double check table settings and keys.');
          }
        }
      } catch (err: any) {
        setDbStatus('error');
        setDbDetails(err.message || 'Error executing connection check.');
      }
    };

    checkConn();
  }, []);

  // Safe Insertion logic with robust multi-column matching
  const safeInsertToSupabase = async (originalUrl: string, slug: string) => {
    try {
      // Combination 1 (Primary standard): { original_url, slug }
      console.log('[Supabase] Attempting Combination 1: original_url & slug');
      const { error: err1 } = await supabase
        .from('links')
        .insert({ original_url: originalUrl, slug: slug });
      
      if (!err1) return { success: true };
      console.warn('[Supabase] Combination 1 failed:', err1.message);

      // Combination 2: { url, slug }
      console.log('[Supabase] Attempting Combination 2: url & slug');
      const { error: err2 } = await supabase
        .from('links')
        .insert({ url: originalUrl, slug: slug });
      
      if (!err2) return { success: true };
      console.warn('[Supabase] Combination 2 failed:', err2.message);

      // Combination 3: { url, code }
      console.log('[Supabase] Attempting Combination 3: url & code');
      const { error: err3 } = await supabase
        .from('links')
        .insert({ url: originalUrl, code: slug });
      
      if (!err3) return { success: true };
      console.warn('[Supabase] Combination 3 failed:', err3.message);

      // Combination 4: { original_url, code }
      console.log('[Supabase] Attempting Combination 4: original_url & code');
      const { error: err4 } = await supabase
        .from('links')
        .insert({ original_url: originalUrl, code: slug });
      
      if (!err4) return { success: true };
      console.warn('[Supabase] Combination 4 failed:', err4.message);

      // Combination 5: { long_url, short_slug }
      console.log('[Supabase] Attempting Combination 5: long_url & short_slug');
      const { error: err5 } = await supabase
        .from('links')
        .insert({ long_url: originalUrl, short_slug: slug });
      
      if (!err5) return { success: true };

      // Return ultimate fail back
      return { success: false, error: err5 || err4 || err3 || err2 || err1 };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // Safe Retrieval logic with fallback schema matches
  const safeFetchFromSupabase = async (slug: string) => {
    try {
      // First try to select * to auto-discover column structures
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .limit(1);

      if (error) {
        console.warn('[Supabase] Select * failed, trying direct queries:', error.message);
        // Fallback directly to querying default combinations
        return await safeDirectFetchFallback(slug);
      }

      if (data && data.length > 0) {
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        
        const urlKey = keys.find(k => ['original_url', 'long_url', 'url', 'long_link', 'original_link'].includes(k));
        const slugKey = keys.find(k => ['slug', 'code', 'short_slug', 'short_code', 'short_url', 'short_link'].includes(k));

        if (urlKey && slugKey) {
          console.log(`[Supabase] Auto-detected column mappings: url => ${urlKey}, slug => ${slugKey}`);
          const { data: matchedRows, error: eqError } = await supabase
            .from('links')
            .select('*')
            .eq(slugKey, slug)
            .limit(1);

          if (!eqError && matchedRows && matchedRows.length > 0) {
            return { success: true, originalUrl: matchedRows[0][urlKey] };
          }
        }
      }

      // If database is empty or auto-detection yields nothing, fall back to sequential checks
      return await safeDirectFetchFallback(slug);
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // Safe manual query fallback
  const safeDirectFetchFallback = async (slug: string) => {
    // 1. Check original_url & slug
    try {
      const { data } = await supabase.from('links').select('original_url').eq('slug', slug).limit(1);
      if (data && data.length > 0 && data[0].original_url) return { success: true, originalUrl: data[0].original_url };
    } catch (_) {}

    // 2. Check url & slug
    try {
      const { data } = await supabase.from('links').select('url').eq('slug', slug).limit(1);
      if (data && data.length > 0 && data[0].url) return { success: true, originalUrl: data[0].url };
    } catch (_) {}

    // 3. Check original_url & code
    try {
      const { data } = await supabase.from('links').select('original_url').eq('code', slug).limit(1);
      if (data && data.length > 0 && data[0].original_url) return { success: true, originalUrl: data[0].original_url };
    } catch (_) {}

    // 4. Check long_url & short_slug
    try {
      const { data } = await supabase.from('links').select('long_url').eq('short_slug', slug).limit(1);
      if (data && data.length > 0 && data[0].long_url) return { success: true, originalUrl: data[0].long_url };
    } catch (_) {}

    return { success: true, originalUrl: null };
  };

  // Trigger link shortened creation
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    // Basic Validation
    let formattedUrl = urlInput.trim();
    if (!formattedUrl) return;

    if (!/^https?:\/\//i.test(formattedUrl)) {
      setErrorText(t.invalidUrl);
      return;
    }

    setIsGenerating(true);

    // 1. Generate local short code (alphanumeric random 6 chars if custom not chosen)
    let finalSlug = customSlug.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!finalSlug) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let rand = '';
      for (let i = 0; i < 6; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      finalSlug = rand;
    }

    // 2. Formulate shortened target Link
    const currentOrigin = window.location.origin;
    const shortenedUrl = `${currentOrigin}/r/${finalSlug}`;

    try {
      // 3. Render QR Code as DataURL
      const qrDataUrl = await QRCode.toDataURL(shortenedUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: theme === 'dark' ? '#0f172a' : '#1e293b', // Rich dark slate
          light: '#ffffff'
        }
      });

      // 4. Save to Supabase (Only if configured)
      if (dbStatus === 'connected') {
        const { success, error } = await safeInsertToSupabase(formattedUrl, finalSlug);
        if (success) {
          setSuccessText(t.successSave);
        } else {
          console.error('[Supabase] Failed to write link safely:', error);
          setErrorText(`${t.errorTitle} ${error?.message || 'Postgres validation error'}`);
          setIsGenerating(false);
          return;
        }
      } else {
        // standalone mode
        setSuccessText(lang === 'ar' ? '✓ تم التوليد بنجاح! الرابط والـ QR يعملان محلياً (وضع محاكي بدون اتصال)' : '✓ Generated successfully! Running in local simulation mode.');
      }

      const newResult = {
        originalUrl: formattedUrl,
        slug: finalSlug,
        shortUrl: shortenedUrl,
        qrDataUrl
      };

      // Set active display
      setActiveResult(newResult);

      // Save to local session history
      const updatedHistory = [
        { id: Math.random().toString(), ...newResult, createdAt: new Date().toLocaleTimeString() },
        ...recentLinks.slice(0, 9) // Limit to last 10
      ];
      setRecentLinks(updatedHistory);
      localStorage.setItem('qrytube_recent', JSON.stringify(updatedHistory));

      // Reset fields
      setUrlInput('');
      setCustomSlug('');
    } catch (err: any) {
      console.error('Failed to process shortlink sequence:', err);
      setErrorText(err.message || 'Fatal error generating QR code or writing link data.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, field: 'short' | 'original') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (_) {}
  };

  const handleDownloadQR = () => {
    if (!activeResult) return;
    const link = document.createElement('a');
    link.href = activeResult.qrDataUrl;
    link.download = `qrytube-qr-${activeResult.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    setRecentLinks([]);
    localStorage.removeItem('qrytube_recent');
  };

  // Rendering the Redirect Screen
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-350">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl text-center flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!redirectError ? (
              <motion.div 
                key="redirecting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 animate-spin"></div>
                  <QrCode className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
                </div>
                
                <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100 font-sans tracking-tight mb-2">
                  {t.redirecting}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  {t.redirectDesc}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-full mb-5">
                  <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
                </div>
                
                <h1 className="text-2xl font-black text-red-600 dark:text-red-400 font-sans tracking-tight mb-2">
                  {t.slugNotFound}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                  {t.slugNotFoundDesc}
                  <span className="block mt-2 font-mono text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-slate-850">
                    SLUG: {redirectError}
                  </span>
                </p>

                <button
                  onClick={() => {
                    setIsRedirecting(false);
                    setRedirectError(null);
                    window.history.pushState({}, '', '/');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 text-white font-medium text-sm py-3 px-6 rounded-2xl transition-all cursor-pointer shadow-md shadow-slate-900/10 active:scale-98"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span>{t.backHomeBtn}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Regular dashboard screen representation
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between">
      
      {/* Dynamic Navigation Header */}
      <header className="sticky top-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-100 dark:border-slate-850 z-50 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-600/10">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-md md:text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
              Qrytube
            </h1>
            <p className="text-[10px] text-slate-400 -mt-0.5 block font-medium">Link & QR Portal v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Supabase Connection Status Badge - Show only when connected */}
          {dbStatus === 'connected' && (
            <div className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs" />
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {t.dbConnected}
              </span>
            </div>
          )}

          {/* Toggle Language */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="p-2 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-600 dark:text-slate-350"
            title="Switch Language"
          >
            <Globe className="h-4 w-4" />
          </button>

          {/* Toggle Theme */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-600 dark:text-slate-350"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Dashboard */}
      <main className="w-full max-w-4xl mx-auto px-6 py-8 md:py-12 flex-1">
        
        {/* Upper Slogan Grid */}
        <section className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center gap-2 py-1.5 px-3 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold tracking-wide leading-none border border-indigo-150 dark:border-indigo-900/60 font-mono uppercase">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Supabase Stable-Before-Dynamic-QR Integration ready</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans max-w-2xl mx-auto leading-tight mb-3">
            {t.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-sm md:text-base max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left panel Form Box (Holds 7 columns) */}
          <div className="md:col-span-12 lg:col-span-7 space-y-6">
            <form onSubmit={handleGenerateLink} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-850 shadow-md">
              <div className="space-y-5">
                
                {/* Long URL Source input field */}
                <div>
                  <label htmlFor="url-input" className="block text-xs font-bold font-arabic text-slate-700 dark:text-slate-300 mb-2 mr-1">
                    {t.inputLabel}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Link2 className="h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="url-input"
                      type="url"
                      required
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 hover:bg-slate-100/50 dark:hover:bg-slate-950 border border-slate-200 focus:border-indigo-500 dark:border-slate-800 dark:focus:border-indigo-500 rounded-2xl outline-hidden text-sm transition-all text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Slug customized identifier placeholder */}
                <div>
                  <label htmlFor="slug-input" className="block text-xs font-bold font-arabic text-slate-700 dark:text-slate-300 mb-2 mr-1">
                    {t.customSlugLabel}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                      /r/
                    </div>
                    <input
                      id="slug-input"
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder={t.customSlugPlaceholder}
                      maxLength={20}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 hover:bg-slate-100/50 dark:hover:bg-slate-950 border border-slate-200 focus:border-indigo-500 dark:border-slate-800 dark:focus:border-indigo-500 rounded-2xl outline-hidden text-sm transition-all text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                {/* Submitting Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !urlInput}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-2xl cursor-pointer transition shadow-md ${
                    isGenerating || !urlInput
                      ? 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-slate-200/50 dark:border-slate-800'
                      : 'bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-indigo-600/10 active:scale-98'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{t.btnGenerating}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4.5 w-4.5" />
                      <span>{t.btnGenerate}</span>
                    </>
                  )}
                </button>

              </div>
            </form>

            {/* Error & Success Toasting Notices */}
            <AnimatePresence>
              {errorText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs md:text-sm flex gap-2.5 shadow-sm"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="font-bold">{t.errorTitle}</h4>
                    <p className="mt-0.5 opacity-90">{errorText}</p>
                  </div>
                </motion.div>
              )}

              {successText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-450 text-xs md:text-sm flex gap-2.5 shadow-sm"
                >
                  <Check className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{successText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel Output layout (Holds 5 columns) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {activeResult ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-850 shadow-md text-center flex flex-col items-center"
                >
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight font-sans mb-4">
                    {t.resultTitle}
                  </h3>

                  {/* High Quality Rendered QR Image Box */}
                  <div className="p-3 bg-white border border-slate-100 dark:border-slate-200 rounded-2xl shadow-sm mb-6 max-w-[210px] aspect-square flex items-center justify-center">
                    <img
                      src={activeResult.qrDataUrl}
                      alt="Generated Dynamic QR Code"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain select-none"
                    />
                  </div>

                  {/* Actions Details */}
                  <div className="w-full space-y-4 text-left">
                    {/* Short link row */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t.shortLink}
                      </span>
                      <div className="flex bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-850 items-center justify-between gap-2 overflow-hidden">
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate">
                          {activeResult.shortUrl}
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeResult.shortUrl, 'short')}
                          className="p-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                        >
                          {copiedField === 'short' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedField === 'short' ? t.copied : t.copyBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* Original link row */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t.originalLink}
                      </span>
                      <div className="flex bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200/65 dark:border-slate-850 items-center justify-between gap-2 overflow-hidden">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {activeResult.originalUrl}
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeResult.originalUrl, 'original')}
                          className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600 transition shrink-0 cursor-pointer"
                          title="Copy Original Link"
                        >
                          {copiedField === 'original' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Download & Check button actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleDownloadQR}
                        className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'الـ QR كود' : 'QR Code'}</span>
                      </button>

                      <a
                        href={activeResult.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition active:scale-95 text-center shadow-md shadow-indigo-600/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'زيارة الرابط' : 'Visit Link'}</span>
                      </a>
                    </div>

                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 min-h-[350px] flex flex-col items-center justify-center">
                  <QrCode className="h-12 w-12 text-slate-300 dark:text-slate-700 stroke-1 mb-3" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {lang === 'ar' ? 'سيتم عرض كود QR والروابط الذكية المنتجة هنا فور توليدها.' : 'Generated dynamic QR codes & deep-links will render here immediately.'}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* History Area in session */}
        {recentLinks.length > 0 && (
          <section className="mt-12 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-850 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-200">
                {t.recentHeading}
              </h3>
              <button
                onClick={handleClearHistory}
                className="text-[10px] md:text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.clearHistory}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {recentLinks.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                        {item.shortUrl}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                        ({item.createdAt})
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-lg">
                      {item.originalUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        copyToClipboard(item.shortUrl, 'short');
                        alert(t.copiedShortLink);
                      }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                      title="Copy Short URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveResult(item);
                        // scroll up smoothly on mobile
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                      title="View QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer copyright space */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-850 text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-500 transition-colors bg-white/50 dark:bg-slate-900/50">
        <p className="font-medium">
          {lang === 'ar' ? 'البوابة الذكية لتقصير الروابط وإنشاء رموز الاستجابة السريعة © Qrytube 2026' : 'Qrytube Smart URL Shortener & Dynamic QR Code Portal © 2026'}
        </p>
        <p className="mt-1 opacity-75 font-mono">
          {dbStatus === 'connected' ? '⚡ CLOUD ACTIVE: POSTGRESQL' : '🛡️ ISOLATED ENVIRONMENT LOCAL ENGINE'}
        </p>
      </footer>

    </div>
  );
}
