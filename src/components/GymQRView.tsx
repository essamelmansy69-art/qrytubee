/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  Flame, 
  HeartPulse, 
  Zap, 
  Calendar, 
  Download, 
  Copy, 
  RotateCcw, 
  Check, 
  Info, 
  Sparkles, 
  MapPin, 
  HelpCircle, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  Trash2, 
  UploadCloud, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

// Cache to dynamically load qrcode
let _cachedQRCode: any = null;
const getQRCodeLib = async () => {
  if (!_cachedQRCode) {
    const mod = await import('qrcode');
    _cachedQRCode = mod.default || mod;
  }
  return _cachedQRCode;
};

// Cache to dynamically load jsPDF for flyer exports
let _cachedJsPDF: any = null;
const getJsPDFLib = async () => {
  if (!_cachedJsPDF) {
    const mod = await import('jspdf');
    _cachedJsPDF = mod.jsPDF || mod.default || mod;
  }
  return _cachedJsPDF;
};

const ICON_SVGS: Record<string, string> = {
  dumbbell: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5 4 9"/><path d="m15 15 2.5 2.5"/><path d="m3 21 3-3"/><path d="M11 3v4"/><path d="M13 3v4"/><path d="M11 17v4"/><path d="M13 17v4"/><path d="M3 11h4"/><path d="M3 13h4"/><path d="M17 11h4"/><path d="M17 13h4"/><path d="M18 3.5a2.5 2.5 0 0 1 0 5H18"/><path d="M6 15.5a2.5 2.5 0 0 1 0 5H6"/><path d="M18 15.5a2.5 2.5 0 0 1 0 5H18"/><path d="M6 3.5a2.5 2.5 0 0 1 0 5H6"/><path d="m21 3-3 3"/><path d="m9 9 6 6"/><path d="m6 6 3-3"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  heartPulse: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.78"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2500/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`
};

interface GymQRViewProps {
  lang: 'ar' | 'en';
  onNavigateToYouTube: () => void;
}

export default function GymQRView({ lang, onNavigateToYouTube }: GymQRViewProps) {
  const [urlInput, setUrlInput] = useState<string>('https://mygym.com/subscribe');
  const [foregroundColor, setForegroundColor] = useState<string>('#0F172A'); // Rich Midnight Slate
  const [backgroundColor, setBackgroundColor] = useState<string>('#F8FAFC'); // Extra Light Slate BG
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H'); // High level for custom logo center
  const [selectedIcon, setSelectedIcon] = useState<string>('dumbbell'); // dumbbell, flame, heartPulse, zap, award, custom, none
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.24);
  const [logoMargin, setLogoMargin] = useState<boolean>(true);
  
  // Custom display flyer setups
  const [gymFrame, setGymFrame] = useState<'none' | 'beast' | 'zen' | 'energy'>('beast');
  const [frameTextTop, setFrameTextTop] = useState<string>(lang === 'ar' ? 'أيقظ الوحش الكامن بداخلِك! 🔥' : 'UNLEASH THE BEAST WITHIN! 🔥');
  const [frameTextBottom, setFrameTextBottom] = useState<string>(lang === 'ar' ? 'امسح للاشتراك وتسجيل الحضور 🏋️‍♂️' : 'SCAN TO SUBSCRIBE & CHECK-IN 🏋️‍♂️');

  // Download parameters
  const [downloadSize, setDownloadSize] = useState<number>(2048);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [copied, setCopied] = useState<boolean>(false);
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
  const [generationTrigger, setGenerationTrigger] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Modern Gym Visual Presets
  const GYM_PRESETS = [
    {
      nameAr: 'الحديد وبناء الأجسام 🏋️‍♂️',
      nameEn: 'Iron & Bodybuilding',
      fg: '#1E293B', // Deep Charcoal Slate
      bg: '#FACC15', // Gold Metallic Yellow
      icon: 'dumbbell',
      frameColor: '#0F172A'
    },
    {
      nameAr: 'وحش الطاقة والتحدي ⚡',
      nameEn: 'Neon Hyper Fitness',
      fg: '#ECEFF1', // Ice white
      bg: '#D01111', // Blood Red
      icon: 'zap',
      frameColor: '#991B1B'
    },
    {
      nameAr: 'يوغا واستشفاء هادئ 🧘‍♀️',
      nameEn: 'Serene Yoga & Pilates',
      fg: '#064E3B', // Deep Pine Green
      bg: '#F0FDF4', // Calm Sage Mint Cream
      icon: 'heartPulse',
      frameColor: '#047857'
    },
    {
      nameAr: 'كارديو وحرق سعرات 🔥',
      nameEn: 'Cardio & Sweat Zone',
      fg: '#7C2D12', // Burnt Amber
      bg: '#FFF7ED', // Soft Peach
      icon: 'flame',
      frameColor: '#EA580C'
    },
    {
      nameAr: 'الأبطال والجوائز 🏆',
      nameEn: 'Elite Athletes Club',
      fg: '#0F172A',
      bg: '#FFFFFF',
      icon: 'award',
      frameColor: '#854D0E'
    }
  ];

  // Rough URL validator
  useEffect(() => {
    if (!urlInput.trim()) {
      setIsUrlValid(false);
      return;
    }
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?$/i;
      setIsUrlValid(urlPattern.test(urlInput));
    } catch (_) {
      setIsUrlValid(false);
    }
  }, [urlInput]);

  // Apply gym presets instantly
  const handleApplyPreset = (preset: typeof GYM_PRESETS[0]) => {
    setForegroundColor(preset.fg);
    setBackgroundColor(preset.bg);
    setSelectedIcon(preset.icon);
    
    if (preset.icon === 'dumbbell') {
      setFrameTextTop(lang === 'ar' ? 'طريقك للقمة يبدأ من هنا! 💪' : 'YOUR ROAD TO GLORY STARTS HERE! 💪');
      setFrameTextBottom(lang === 'ar' ? 'امسح للتسجيل وجدول التمارين 📅' : 'SCAN TO JOIN & GET WORKOUT 📅');
    } else if (preset.icon === 'zap') {
      setFrameTextTop(lang === 'ar' ? 'تجاوز حدود مستواك المعتاد! ⚡' : 'GO BEYOND YOUR LIMITS TODAY! ⚡');
      setFrameTextBottom(lang === 'ar' ? 'امسح للحصول على خصم اشتراك 🎁' : 'SCAN TO UNLOCK SPECIAL DISCOUNT 🎁');
    } else if (preset.icon === 'heartPulse') {
      setFrameTextTop(lang === 'ar' ? 'توازن العقل والجسد والنقاء 🌿' : 'BALANCE MIND, BODY & SENSES 🌿');
      setFrameTextBottom(lang === 'ar' ? 'امسح لحجز حصة اليوغا القادمة 🧘‍♀️' : 'SCAN TO BOOK YOGA CLASS 🧘‍♀️');
    } else if (preset.icon === 'flame') {
      setFrameTextTop(lang === 'ar' ? 'احرق الدهون وابدأ غداً بقوة! 🔥' : 'BURN CALORIES & BUILD MUSCLE! 🔥');
      setFrameTextBottom(lang === 'ar' ? 'امسح لتنزيل خطة التغذية المجانية 🥦' : 'SCAN FOR FREE NUTRITION GUIDE 🥦');
    } else {
      setFrameTextTop(lang === 'ar' ? 'مجتمع الأبطال الحقيقيين! 🏆' : 'THE HOUSE OF CHAMPIONS! 🏆');
      setFrameTextBottom(lang === 'ar' ? 'مرحباً بك في تحدي اللياقة 👑' : 'WELCOME TO THE ELITE CLUB 👑');
    }
    setGenerationTrigger(prev => prev + 1);
  };

  // Canvas Drawing Core
  useEffect(() => {
    const drawQR = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const QRCode = await getQRCodeLib();
        
        // Setup internal layout parameters (1024x1024 for high resolution quality preview)
        const size = 1000;
        canvas.width = size;
        canvas.height = size;

        // Draw general Background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Render basic QR structure code using high quality qr calculations
        const qrMatrixCanvas = document.createElement('canvas');
        await QRCode.toCanvas(qrMatrixCanvas, urlInput, {
          errorCorrectionLevel: errorCorrectionLevel,
          margin: 1,
          color: {
            dark: foregroundColor,
            light: backgroundColor
          }
        });

        // Stretch/draw the pure matrix on our main card canvas smoothly
        const padding = 60;
        const qrSize = size - (padding * 2);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qrMatrixCanvas, padding, padding, qrSize, qrSize);
        ctx.imageSmoothingEnabled = true;

        // Custom logo overlays / High Quality Icons
        let logoImageToRender: HTMLImageElement | null = null;
        if (selectedIcon !== 'none') {
          logoImageToRender = new Image();
          if (selectedIcon === 'custom' && customLogo) {
            logoImageToRender.src = customLogo;
          } else if (ICON_SVGS[selectedIcon]) {
            // Build the dynamic SVG based on selected foreground colors for proper high contrast blending
            const coloredSvg = ICON_SVGS[selectedIcon]
              .replace('stroke="currentColor"', `stroke="${foregroundColor}"`)
              .replace('fill="none"', `fill="${backgroundColor}"`);
            const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
            logoImageToRender.src = URL.createObjectURL(blob);
          }
        }

        if (logoImageToRender) {
          logoImageToRender.onload = () => {
            const logoW = size * logoScale;
            const logoH = size * logoScale;
            const logoX = (size - logoW) / 2;
            const logoY = (size - logoH) / 2;

            if (logoMargin) {
              ctx.fillStyle = backgroundColor;
              // Clean circular backdrop area
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, (logoW / 2) + 16, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.drawImage(logoImageToRender!, logoX, logoY, logoW, logoH);
          };
          
          // Trigger instant refresh
          if (logoImageToRender.complete) {
            logoImageToRender.onload?.(null as any);
          }
        }
      } catch (err) {
        console.error('Gym QR Render failure', err);
      }
    };

    drawQR();
  }, [urlInput, foregroundColor, backgroundColor, selectedIcon, customLogo, logoScale, logoMargin, errorCorrectionLevel, generationTrigger]);

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomLogo(reader.result as string);
      setSelectedIcon('custom');
      setGenerationTrigger(prev => prev + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(urlInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  // Reset tool
  const handleResetSettings = () => {
    setUrlInput('https://mygym.com/subscribe');
    setForegroundColor('#0F172A');
    setBackgroundColor('#F8FAFC');
    setSelectedIcon('dumbbell');
    setCustomLogo(null);
    setGymFrame('beast');
    setFrameTextTop(lang === 'ar' ? 'أيقظ الوحش الكامن بداخلِك! 🔥' : 'UNLEASH THE BEAST WITHIN! 🔥');
    setFrameTextBottom(lang === 'ar' ? 'امسح للاشتراك وتسجيل الحضور 🏋️‍♂️' : 'SCAN TO SUBSCRIBE & CHECK-IN 🏋️‍♂️');
    setGenerationTrigger(prev => prev + 1);
  };

  // Download high-resolution PNG/JPG
  const handleDownloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create offscreen canvas with target selected download size
      const offscreen = document.createElement('canvas');
      offscreen.width = downloadSize;
      offscreen.height = downloadSize;
      const oCtx = offscreen.getContext('2d');
      if (oCtx) {
        oCtx.drawImage(canvas, 0, 0, downloadSize, downloadSize);
        const mimeType = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
        const link = document.createElement('a');
        link.download = `qrytube-gym-qr-${downloadSize}x${downloadSize}.${downloadFormat}`;
        link.href = offscreen.toDataURL(mimeType, 0.95);
        link.click();
      }
    } catch (_) {
      // Fallback
      const link = document.createElement('a');
      link.download = `qrytube-gym-qr.${downloadFormat}`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Exquisite Poster Printable PDF Frame Export
  const handlePrintFlyerPDF = async () => {
    try {
      const jsPDF = await getJsPDFLib();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const wWidth = pdf.internal.pageSize.getWidth();
      const wHeight = pdf.internal.pageSize.getHeight();

      // Background Colors based on active styles
      pdf.setFillColor(foregroundColor === '#0F172A' ? '#1E293B' : foregroundColor);
      pdf.rect(0, 0, wWidth, wHeight, 'F');

      // Decorative gym stripe styling on lateral margins
      pdf.setFillColor(backgroundColor === '#F8FAFC' ? '#FACC15' : backgroundColor);
      pdf.rect(0, 0, 8, wHeight, 'F');
      pdf.rect(wWidth - 8, 0, 8, wHeight, 'F');

      // Top Promotional Call to action Header Text with safety checks
      pdf.setTextColor(backgroundColor === '#F8FAFC' ? '#FFFFFF' : backgroundColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      
      const cleanTopText = frameTextTop.trim().substring(0, 48);
      pdf.text(cleanTopText, wWidth / 2, 35, { align: 'center' });

      // Embed high quality QR Code directly onto the poster center
      const qrWidth = 120;
      const qrHeight = 120;
      const qrX = (wWidth - qrWidth) / 2;
      const qrY = (wHeight - qrHeight) / 2 - 10;
      
      const qrDataUrl = canvas.toDataURL('image/png');
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrWidth, qrHeight);

      // Bottom Instructions with safety checks
      pdf.setFontSize(14);
      pdf.setTextColor('#94A3B8'); // Slate silver subtext
      pdf.text(lang === 'ar' ? 'مسح فوري آمن بواسطة الجوال' : 'FAST SECURE SCAN VIA MOBILE', wWidth / 2, qrY + qrHeight + 15, { align: 'center' });

      pdf.setTextColor(backgroundColor === '#F8FAFC' ? '#FACC15' : backgroundColor);
      pdf.setFontSize(16);
      const cleanBottomText = frameTextBottom.trim().substring(0, 52);
      pdf.text(cleanBottomText, wWidth / 2, qrY + qrHeight + 28, { align: 'center' });

      // Core Footer branding
      pdf.setFontSize(10);
      pdf.setTextColor('#64748B');
      pdf.text('⚡ Powered by Qrytube Gym QR Tool (SEO 2026 Ready) ⚡', wWidth / 2, wHeight - 15, { align: 'center' });

      pdf.save(`qrytube_gym_flyer_a4.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto" id="gym_generator_container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Dynamic top banner informing search engines and users of SEO 2026 compliance */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4 text-center md:text-start shadow-xs">
        <div className="p-2.5 bg-yellow-500/15 rounded-xl shrink-0 text-yellow-500">
          <Award size={24} className="animate-pulse" />
        </div>
        <div>
          <h4 className="font-arabic font-extrabold text-sm text-yellow-600 dark:text-yellow-400">
            {lang === 'ar' 
              ? 'توليد أكواد ذكية للجيم مدمجة بأفضل ممارسات السيو 2026' 
              : 'SEO 2026 Optimized Gym & Health Club QR Generator'}
          </h4>
          <p className="font-arabic text-xs text-slate-505 dark:text-slate-400 mt-1 leading-relaxed">
            {lang === 'ar'
              ? 'تم تصميم هذه الأكواد لتوفر وصول سريع جداً (Instant Deep Link) لخطط الاشتراك ومقاطع الفيديو التوضيحية للأجهزة الرياضية وتجاوز المتصفحات الداخلية بمستويات تفاعل فائقة.'
              : 'Generate secure athletic and heavy-metal QR codes that load with instant deep-linking to boost client checkins and app installations directly.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Configurations (7 cols) */}
        <div className="lg:col-span-7 space-y-6" id="gym_controls_pane">
          
          {/* Section 1: Presets selection */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              <span>{lang === 'ar' ? 'اختر النمط البصري لصالة الجيم' : 'Select Gym Brand Style'}</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GYM_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-all text-start cursor-pointer hover:bg-slate-50/50"
                  type="button"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/10"
                    style={{ background: p.bg, color: p.fg }}
                  >
                    {p.icon === 'dumbbell' && <Dumbbell size={18} />}
                    {p.icon === 'zap' && <Zap size={18} />}
                    {p.icon === 'heartPulse' && <HeartPulse size={18} />}
                    {p.icon === 'flame' && <Flame size={18} />}
                    {p.icon === 'award' && <Award size={18} />}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">
                      {lang === 'ar' ? p.nameAr : p.nameEn}
                    </h5>
                    <span className="text-[9.5px] text-gray-400 block mt-0.5">
                      {p.fg} | {p.bg}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Input URL & Target Destination */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
            <div>
              <label htmlFor="gym_target_url" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {lang === 'ar' ? 'أدخل رابط صالة الجيم (صفحة الاشتراك، موقع صالة الجيم، أو فيديو تدريبي)' : 'Gym Target Destination URL (Subscription form, Google Map location, or workout playlist)'}
              </label>
              
              <div className="relative">
                <input
                  id="gym_target_url"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://mygym.com/subscribe-deals"
                  className={`w-full p-4 rounded-xl border ${
                    isUrlValid ? 'border-gray-200 focus:border-indigo-500' : 'border-red-400 focus:border-red-500'
                  } bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none transition-all text-xs sm:text-sm font-semibold`}
                />
                
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-750 text-slate-600 hover:text-slate-900 shadow-3xs hover:shadow-2xs cursor-pointer"
                  title={lang === 'ar' ? 'نسخ الرابط الحالي' : 'Copy link'}
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              
              {!isUrlValid && (
                <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 font-arabic">
                  <span>⚠️</span>
                  <span>{lang === 'ar' ? 'يرجى إدخال رابط إنترنت صحيح وقابل للترقية الفورية لرمز الكيو آر.' : 'Please enter a valid target URL for gym generation.'}</span>
                </p>
              )}
            </div>

            {/* Custom texts for Flyer boards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'نص العنوان العلوي للبوستر والمطابيح' : 'Top Heading Text for Flyer/Poster'}
                </label>
                <input
                  type="text"
                  value={frameTextTop}
                  onChange={(e) => setFrameTextTop(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'نص الدعوة لاتخاذ إجراء (أسفل الكود)' : 'Call To Action Text (Below Code)'}
                </label>
                <input
                  type="text"
                  value={frameTextBottom}
                  onChange={(e) => setFrameTextBottom(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fine Aesthetics Customization */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xs">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-slate-800 pb-3">
              <span>🎨</span>
              <span>{lang === 'ar' ? 'تخصيص الهوية الرياضية للألوان والشعارات' : 'Branding Colors & Middle Logo'}</span>
            </h4>

            {/* Sub 1: Hex Colors Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {lang === 'ar' ? 'لون الكود والأيقونة (المقدمة)' : 'Code & Icon Color (Foreground)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => {
                      setForegroundColor(e.target.value);
                      setGenerationTrigger(prev => prev + 1);
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => {
                      setForegroundColor(e.target.value);
                      setGenerationTrigger(prev => prev + 1);
                    }}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold w-full uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {lang === 'ar' ? 'لون الخلفية المضيء لرمز كاشف' : 'Backdrop Color (Background)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setGenerationTrigger(prev => prev + 1);
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setGenerationTrigger(prev => prev + 1);
                    }}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold w-full uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Sub 2: Center Vector Symbols */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                {lang === 'ar' ? 'تحديد رمز الجيم المركزي' : 'Select Center Gym Icon/Symbol'}
              </label>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedIcon('dumbbell'); setGenerationTrigger(prev => prev + 1); }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedIcon === 'dumbbell' ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <Dumbbell size={14} />
                  <span>{lang === 'ar' ? 'دمبل حديد' : 'Dumbbell'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedIcon('flame'); setGenerationTrigger(prev => prev + 1); }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedIcon === 'flame' ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <Flame size={14} />
                  <span>{lang === 'ar' ? 'شعلة طاقة' : 'Calorie Burn'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedIcon('heartPulse'); setGenerationTrigger(prev => prev + 1); }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedIcon === 'heartPulse' ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <HeartPulse size={14} />
                  <span>{lang === 'ar' ? 'نبض القلب' : 'Heart Rate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedIcon('zap'); setGenerationTrigger(prev => prev + 1); }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedIcon === 'zap' ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <Zap size={14} />
                  <span>{lang === 'ar' ? 'صاعقة قوة' : 'Intensity'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedIcon('award'); setGenerationTrigger(prev => prev + 1); }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedIcon === 'award' ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <Award size={14} />
                  <span>{lang === 'ar' ? 'شعار البطولة' : 'Championship'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedIcon('none'); setGenerationTrigger(prev => prev + 1); }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedIcon === 'none' ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <span>{lang === 'ar' ? 'بدون رمز' : 'No Icon'}</span>
                </button>
              </div>
            </div>

            {/* Sub 3: Custom Gym logo image upload */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {lang === 'ar' ? 'أو ارفع شعار صالة الجيم الخاص بك (PNG, JPG)' : 'Or upload your own Gym custom logo (PNG/JPG)'}
              </span>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all select-none">
                  <UploadCloud size={14} />
                  <span>{lang === 'ar' ? 'اختر ملف الشعار' : 'Choose Logo Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomLogoUpload}
                    className="hidden"
                  />
                </label>

                {customLogo && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLogo(null);
                      setSelectedIcon('dumbbell');
                      setGenerationTrigger(prev => prev + 1);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 transition"
                    title={lang === 'ar' ? 'حذف الشعار المرفوع' : 'Remove uploaded logo'}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Sub 4: Advanced Logo margins scale */}
            {selectedIcon !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {lang === 'ar' ? `حجم الشعار: ${Math.round(logoScale * 100)}%` : `Logo Scale: ${Math.round(logoScale * 100)}%`}
                  </label>
                  <input
                    type="range"
                    min="0.15"
                    max="0.28"
                    step="0.01"
                    value={logoScale}
                    onChange={(e) => { setLogoScale(parseFloat(e.target.value)); setGenerationTrigger(prev => prev + 1); }}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="logo_margin_chk"
                    checked={logoMargin}
                    onChange={(e) => { setLogoMargin(e.target.checked); setGenerationTrigger(prev => prev + 1); }}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <label htmlFor="logo_margin_chk" className="text-xs font-bold text-slate-500 dark:text-slate-300 cursor-pointer">
                    {lang === 'ar' ? 'حماية الشعار بخلفية دائرية معزولة' : 'Isolate logo with circular backdrop mask'}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive High Fidelity Live Preview & Actions Panel (5 cols) */}
        <div className="lg:col-span-5" id="gym_preview_pane">
          <div className="sticky top-24 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col items-center">
            
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-4">
              {lang === 'ar' ? 'شاشة العرض الحقيقية للأكواد المطبوعة 🏆' : 'REAL ATHLETIC PREVIEW & EXPORT 🏆'}
            </h4>

            {/* Elegant Poster Frame Rendering */}
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 flex flex-col items-center p-6 bg-slate-950 text-white select-none">
              
              {/* TOP HEADER */}
              <div className="w-full text-center mb-6 px-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-yellow-500 mb-1">
                  <Award size={14} className="animate-spin-slow" />
                  <span>GYM FIT CLUB</span>
                </span>
                <p className="text-sm font-black tracking-tight leading-tight text-slate-100 font-arabic truncate">
                  {frameTextTop}
                </p>
              </div>

              {/* CENTER QR PREVIEW CONTAINER */}
              <div className="p-3 bg-white rounded-2xl shadow-inner relative flex justify-center items-center">
                <canvas 
                  ref={canvasRef} 
                  className="w-56 h-56 max-w-full rounded-lg"
                  id="rendered_gym_image"
                />
              </div>

              {/* BOTTOM CALL TO ACTION */}
              <div className="w-full text-center mt-6 space-y-2">
                <div className="text-[10px] text-slate-400 tracking-wider flex items-center justify-center gap-1">
                  <Smartphone size={10} />
                  <span>{lang === 'ar' ? 'امسح سريع لمزامنة هاتفك' : 'SCAN INSTANT WITH YOUR CAMERA'}</span>
                </div>
                <p className="text-xs font-black tracking-normal text-amber-400 drop-shadow-md font-arabic px-2 leading-relaxed">
                  {frameTextBottom}
                </p>
              </div>
            </div>

            {/* Actions: Download resolutions forms */}
            <div className="w-full mt-6 space-y-4 border-t border-gray-100 dark:border-slate-800 pt-6">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="gym_export_quality" className="block text-[11px] font-bold text-gray-500 mb-1.5">
                    {lang === 'ar' ? 'دقة التصدير والطباعة' : 'Export Resolution'}
                  </label>
                  <select
                    id="gym_export_quality"
                    value={downloadSize}
                    onChange={(e) => setDownloadSize(parseInt(e.target.value))}
                    className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  >
                    <option value={1000}>1000 x 1000 px</option>
                    <option value={2048}>2048 x 2048 px (Ultra HD)</option>
                    <option value={4096}>4096 x 4096 px (Vector Printable)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="gym_export_format" className="block text-[11px] font-bold text-gray-500 mb-1.5">
                    {lang === 'ar' ? 'امتداد الصورة الكاشف' : 'File Format'}
                  </label>
                  <select
                    id="gym_export_format"
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  >
                    <option value="png">PNG (Lossless transparent)</option>
                    <option value="jpg">JPG (High contrast)</option>
                  </select>
                </div>
              </div>

              {/* Master Download button */}
              <button
                onClick={handleDownloadQR}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-101 text-white text-sm font-extrabold rounded-2xl transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-2"
                type="button"
              >
                <Download size={16} />
                <span>{lang === 'ar' ? 'تحميل الكود بجودة عالية للطباعة 📥' : 'Download High-Res QR Code 📥'}</span>
              </button>

              {/* PDF Print Flyer layout */}
              <button
                onClick={handlePrintFlyerPDF}
                className="w-full py-3.5 bg-slate-900 dark:bg-slate-950 text-amber-400 hover:bg-slate-950 dark:hover:bg-black hover:scale-101 text-xs sm:text-sm font-extrabold rounded-2xl transition-all duration-300 cursor-pointer shadow-sm border border-slate-800 flex items-center justify-center gap-2"
                type="button"
              >
                <span>🖨️</span>
                <span>{lang === 'ar' ? 'تصدير بوستر إعلاني جاهز للتعليق (A4 PDF)' : 'Export Hanging Flyer Board (A4 PDF)'}</span>
              </button>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer font-arabic"
                >
                  <RotateCcw size={11} />
                  <span>{lang === 'ar' ? 'استعادة الإعدادات الافتراضية' : 'Reset default presets'}</span>
                </button>

                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 select-none">
                  <ShieldCheck size={11} />
                  <span>{lang === 'ar' ? 'توليد مشفر آمن 100%' : '100% Client-side safe'}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* DETAILED EDUCATIONAL FAQ GUIDE BELOW (SEO 2026 Optimized) */}
      <div className="mt-16 bg-white dark:bg-slate-900 border border-gray-150/60 dark:border-slate-800 rounded-3xl p-8 space-y-10" id="gym_seo_knowledge_guide">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
            SEO 2026 COMPREHENSIVE GUIDE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-arabic">
            {lang === 'ar' 
              ? 'دليل استخدام كيو ار كود الجيم لتحسين محركات البحث والتسويق ٢٠٢٦' 
              : 'The Definitive Guide to Gym QR Codes: Marketing & Crawling Strategy 2026'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-arabic">
            {lang === 'ar'
              ? 'كيف تستغل الصالات الرياضية الذكية رموز كاشف الـ QR في مضاعفة التفاعل والظهور المحلي للباحثين عن الرشاقة في محركات البحث.'
              : 'How leading fitness clubs leverage dynamic QR landing points to dominate voice searches, local map listings, and member renewals effortlessly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 font-arabic">
          
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {lang === 'ar' ? 'ربط الأجهزة بفيديوهات الشرح 🏋️‍♂️' : 'Video Tutorial QR on Equipment'}
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'ar'
                ? 'الصق كود QR على الأجهزة المعقدة لفتح فيديو يوتيوب يوضح طريقة الاستخدام الصحيحة. هذا يقلل الإصابات ويزرع ثقة هائلة في خدماتك الرياضية.'
                : 'Attach custom QR codes atop complex equipment. Scan redirects users to specific Youtube tutorials on proper workout stance and form directly in-app.'}
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {lang === 'ar' ? 'التسجيل الفوري لحصص اليوم 📅' : 'Workout Class Registration'}
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'ar'
                ? 'استخدم أكواد كيو ار ذكية على الحائط ليقوم المشتركون بمسحها وحجز حصة الكروسفت أو الزومبا فوراً، متخطين مشاكل تسجيل الدخول التقليدية.'
                : 'Place custom reservation QR stands at the entrance reception. Scan opens current day workout booking inside the member mobile app directly.'}
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {lang === 'ar' ? 'زيادة تقييمات جوجل وماب سيو 🌟' : 'Local SEO Google Map reviews'}
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'ar'
                ? 'اطبع البوستر وعلّقه في صالة الخروج، وحث الأعضاء بمسح الكود لتقييم صالة الجيم على خرائط جوجل، مما يضمن ظهورك في مقدمة نتائج البحث المحلي (GMB).'
                : 'Accelerate your Local Google Maps optimization. Request reviews using direct redirect QR codes inside the changing locker rooms.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
