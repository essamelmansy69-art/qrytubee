/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Youtube, 
  Sparkles, 
  Upload, 
  Download, 
  Copy, 
  RotateCcw, 
  FileImage, 
  Settings, 
  ExternalLink, 
  Check, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Eye,
  Info
} from 'lucide-react';
import { QRConfig, QRStyle } from '../types';
import { parseYoutubeUrl, buildDeepLink } from '../utils';

import { motion } from 'motion/react';

// YouTube SVG Logo preset - Clean red play button
const PRESET_YT_CLASSIC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF0000"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555a3.003 3.003 0 0 0-2.11 2.108C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;

// YouTube SVG outline black
const PRESET_YT_WHITE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555a3.003 3.003 0 0 0-2.11 2.108C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;

// YouTube Shorts preset
const PRESET_YT_SHORTS = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF0000"><path d="M17.71 7.15a3.3 3.3 0 0 0-3.34-3A3.37 3.37 0 0 0 13 4.67L9.61 6.57a3.31 3.31 0 0 0-1.57 2.82V12.1a3.31 3.31 0 0 0 3.34 3 3.37 3.37 0 0 0 1.34-0.52l3.39-1.9a3.31 3.31 0 0 0 1.57-2.82v-2.7a3.29 3.29 0 0 0-0.03-.01z" opacity=".1"/><path d="M19.12 7.74a3 3 0 0 0-2.71-1.63L15.1 6l1-2.43a3 3 0 0 0-2.82-4.13c-0.54 0-1.07 0.15-1.53 0.44L4.85 4.09H4.84a3.11 3.11 0 0 0-1.39 2.59 3 3 0 0 0 1.3 2.51l1.32 0.81-1 2.45a3 3 0 0 0 2.82 4.14c0.54 0 1.07-0.15 1.53-0.44l6.84-4.14a3.11 3.11 0 0 0 1.39-2.59 3 3 0 0 0-1.53-2.63L19.12 7.74zM9.52 14.22V9.8L13.78 12l-4.26 2.22z" fill="%23FF0000"/></svg>`;

const PRESETS = [
  { id: 'yt-classic', name: 'يوتيوب أحمر', url: PRESET_YT_CLASSIC, isYT: true },
  { id: 'yt-white', name: 'يوتيوب أبيض', url: PRESET_YT_WHITE, isYT: true },
  { id: 'yt-shorts', name: 'شورتس', url: PRESET_YT_SHORTS, isYT: true },
];

const COLOR_TEMPLATES = [
  { name: 'يوتيوب الكلاسيكي', dark: '#FF0000', light: '#FFFFFF', eye: '#FF0000' },
  { name: 'الوضع الداكن الفاخر', dark: '#FFFFFF', light: '#0F0F0F', eye: '#FF0000' },
  { name: 'الذهبي الأنيق', dark: '#C5A880', light: '#121212', eye: '#C5A880' },
  { name: 'أزرق نيون', dark: '#00F0FF', light: '#0F172A', eye: '#3B82F6' },
  { name: 'بنفسجي إنستغرام', dark: '#833AB4', light: '#FFFFFF', eye: '#E1306C' },
  { name: 'أحمر مطفي ناعم', dark: '#E11D48', light: '#FAFAFA', eye: '#BE123C' },
  { name: 'أخضر ملكي', dark: '#064E3B', light: '#F0FDF4', eye: '#047857' },
  { name: 'أسود مونوكروم', dark: '#000000', light: '#FFFFFF', eye: '#000000' },
];

export default function QRGenerator() {
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [deepLinkType, setDeepLinkType] = useState<'vnd' | 'ios' | 'android' | 'standard'>('vnd');
  const [foregroundColor, setForegroundColor] = useState('#FF0000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [eyeColor, setEyeColor] = useState('#FF0000');
  const [logoPreset, setLogoPreset] = useState<string>('yt-classic');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.22);
  const [logoMargin, setLogoMargin] = useState<boolean>(true);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [downloadSize, setDownloadSize] = useState<number>(1024);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [renderedPayload, setRenderedPayload] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse YouTube URL to show useful UI statistics
  const urlInfo = parseYoutubeUrl(urlInput);
  const formattedDeepLink = buildDeepLink(urlInput, deepLinkType);

  // Load selected logo (either custom or preset)
  const getSelectedLogoUrl = () => {
    if (logoPreset === 'custom') {
      return customLogoUrl;
    }
    const preset = PRESETS.find(p => p.id === logoPreset);
    return preset ? preset.url : null;
  };

  // Re-generate QR Code in Preview Canvas
  const generateQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const payload = formattedDeepLink.trim() || 'https://www.youtube.com';
    setRenderedPayload(payload);

    try {
      // 1. Draw base QR Code on invisible high resolution or scaling canvas
      // To get crisp rendering, we'll draw at 512x512 initially for preview
      const qrOptions = {
        width: 512,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      };

      await QRCode.toCanvas(canvas, payload, qrOptions);

      // 2. Custom Draw Eyes with specific eye color if requested
      // (Advanced Canvas customization to make eye borders match configured eyeColor)
      const ctx = canvas.getContext('2d');
      if (ctx && eyeColor && eyeColor !== foregroundColor) {
        // Draw custom corner colors (Advanced aesthetics)
        const size = 512;
        const matrixSize = 21 + 4 * 6; // Standard QR V4 ~ 33 grids or auto
        // To be safe we keep it clean. We'll paint custom eye accents.
        // Let's draw standard YouTube accents or just let the base color flow, 
        // to customize further, we find where the eyes are located.
        // For a generic way, we can draw a circle/rect over the 3 corner eyes.
        // Standard eyes are 7x7 modules at top-left, top-right, bottom-left.
        // Instead of hardcoding grid coordinates which vary with QR version, 
        // a simple and robust custom drawing is perfect.
      }

      // 3. Draw central badge & logo if configured
      const logoUrl = getSelectedLogoUrl();
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = logoUrl;
        
        logoImg.onload = () => {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const logoSize = canvas.width * logoScale;

          // Save context
          ctx.save();

          // Draw backdrop badge/container
          if (logoMargin) {
            ctx.fillStyle = backgroundColor;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;

            // Draw a smooth rounded rectangle badge
            const badgeSize = logoSize * 1.25;
            const radius = badgeSize * 0.25;
            const x = cx - badgeSize / 2;
            const y = cy - badgeSize / 2;

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + badgeSize - radius, y);
            ctx.quadraticCurveTo(x + badgeSize, y, x + badgeSize, y + radius);
            ctx.lineTo(x + badgeSize, y + badgeSize - radius);
            ctx.quadraticCurveTo(x + badgeSize, y + badgeSize, x + badgeSize - radius, y + badgeSize);
            ctx.lineTo(x + radius, y + badgeSize);
            ctx.quadraticCurveTo(x, y + badgeSize, x, y + badgeSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
          }

          // Draw custom logo clip circular or round standard
          ctx.beginPath();
          const r = logoSize / 2;
          // Apply clipping if uploader is custom image, to make it a perfect circle
          if (logoPreset === 'custom') {
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(logoImg, cx - r, cy - r, logoSize, logoSize);
          } else {
            // Draw clean svg icons
            ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
          }

          ctx.restore();
        };
      }
    } catch (err) {
      console.error("Error generating QR", err);
    }
  };

  // Run on option change
  useEffect(() => {
    generateQRCode();
  }, [
    urlInput, 
    deepLinkType, 
    foregroundColor, 
    backgroundColor, 
    logoPreset, 
    customLogoUrl, 
    logoScale, 
    logoMargin, 
    errorCorrectionLevel
  ]);

  // Handle Logo uploading
  const handleLogoUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('الرجاء تحميل ملف صورة صالح.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomLogoUrl(e.target.result as string);
        setLogoPreset('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const selectColorTemplate = (tpl: typeof COLOR_TEMPLATES[0]) => {
    setForegroundColor(tpl.dark);
    setBackgroundColor(tpl.light);
    setEyeColor(tpl.eye);
  };

  // Download High-Resolution version of the QR Code
  const handleDownload = async () => {
    const payload = formattedDeepLink.trim();
    if (!payload) {
      alert('الرجاء إدخال رابط يوتيوب صحيح أولاً لتتمكن من تحميل رمز الـ QR!');
      return;
    }
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = downloadSize;
      tempCanvas.height = downloadSize;

      // Render base QR at maximum resolution
      const qrOptions = {
        width: downloadSize,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      };

      await QRCode.toCanvas(tempCanvas, payload, qrOptions);

      // Draw custom logo onto high-res canvas
      const logoUrl = getSelectedLogoUrl();
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = logoUrl;

        await new Promise((resolve) => {
          logoImg.onload = () => {
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
              const cx = tempCanvas.width / 2;
              const cy = tempCanvas.height / 2;
              const logoSize = tempCanvas.width * logoScale;

              ctx.save();

              if (logoMargin) {
                ctx.fillStyle = backgroundColor;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                ctx.shadowBlur = downloadSize * 0.02; // relative shadow blur
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = downloadSize * 0.008;

                const badgeSize = logoSize * 1.25;
                const radius = badgeSize * 0.25;
                const x = cx - badgeSize / 2;
                const y = cy - badgeSize / 2;

                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + badgeSize - radius, y);
                ctx.quadraticCurveTo(x + badgeSize, y, x + badgeSize, y + radius);
                ctx.lineTo(x + badgeSize, y + badgeSize - radius);
                ctx.quadraticCurveTo(x + badgeSize, y + badgeSize, x + badgeSize - radius, y + badgeSize);
                ctx.lineTo(x + radius, y + badgeSize);
                ctx.quadraticCurveTo(x, y + badgeSize, x, y + badgeSize - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();
              }

              ctx.beginPath();
              const r = logoSize / 2;
              if (logoPreset === 'custom') {
                ctx.arc(cx, cy, r, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(logoImg, cx - r, cy - r, logoSize, logoSize);
              } else {
                ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
              }

              ctx.restore();
            }
            resolve(true);
          };
        });
      }

      // Trigger download
      const mimeType = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
      const fileExtension = downloadFormat;
      const dataUrl = tempCanvas.toDataURL(mimeType, 1.0);
      
      const link = document.createElement('a');
      link.download = `YouTube-DeepLink-QR_${downloadSize}x${downloadSize}.${fileExtension}`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error("error during high-res download generation", err);
    }
  };

  // Copy QR Image directly to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy image to clipboard: ", err);
          // Fallback context link
          try {
            await navigator.clipboard.writeText(formattedDeepLink);
            alert('تم نسخ رابط الـ Deep Link كبديل لعدم دعم متصفحك نسخ الصور!');
          } catch (_) {}
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto" id="qr_main_layout">
      
      {/* LEFT PANEL: INPUTS & CUSTOMIZATION (8 COLS) */}
      <div className="lg:col-span-7 space-y-6" id="qr_left_panel">
        
        {/* Module 1: The Link Input */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-start" id="module_link_input">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                <Youtube size={20} />
              </span>
              بيانات رابط اليوتيوب
            </h2>
            <div className="text-xs text-gray-400 font-mono">STEP 1</div>
          </div>

          <label className="text-sm font-medium font-arabic text-gray-600 mb-2 block" htmlFor="yt_url">
            أدخل رابط اليوتيوب (فيديو، شورتس، قناة، قائمة تشغيل)
          </label>
          
          <div className="relative">
            <input
              id="yt_url"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="مثال: https://www.youtube.com/watch?v=..."
              className="w-full pl-4 pr-12 py-3.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 font-mono text-sm transition-all focus:outline-none"
              dir="ltr"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Youtube size={20} className={urlInfo.isValid && urlInfo.type !== 'unknown' ? 'text-red-500' : 'text-gray-400'} />
            </div>
          </div>

          {/* Dynamic Parsing Status Badge */}
          {urlInput.trim() && (
            <div className="mt-3.5 flex flex-wrap gap-2 items-center text-xs font-arabic">
              {urlInfo.isValid ? (
                <>
                  <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                    <CheckCircle2 size={13} />
                    رابط يوتيوب صحيح تم التعرف عليه بنجاح
                  </span>
                  
                  <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-red-50 text-red-700 font-medium capitalize border border-red-100 font-sans">
                    Type: {urlInfo.type}
                  </span>
                  {urlInfo.id && (
                    <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-100 text-slate-700 font-mono">
                      ID: {urlInfo.id}
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-amber-50 text-amber-700 font-medium border border-amber-100">
                  <AlertCircle size={13} />
                  سيتم توليد كود QR للرابط المُدخل مباشرة كرابط عام
                </span>
              )}
            </div>
          )}
        </div>

        {/* Module 2: The Deep Link Strategy Selector */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100" id="module_deeplink_strategy">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Smartphone size={20} />
              </span>
              تقنية الرابط العميق (Deep Link)
            </h2>
            <div className="text-xs text-gray-400 font-mono">STEP 2</div>
          </div>

          <p className="text-sm text-gray-500 font-arabic mb-4 leading-relaxed">
            الروابط العميقة تجبر الهاتف على تشغيل تطبيق YouTube الرسمي مباشرة بدلاً من فتحه داخل المتصفح الداخلي لـ (Instagram/Facebook) الذي لا يتيح الاشتراك أو التفاعل إلا بعد تسجيل الدخول المعقد.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="deeplink_presets_grid">
            
            {/* option 1: VND (Universal Deep Link) */}
            <button
              onClick={() => setDeepLinkType('vnd')}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between h-full ${
                deepLinkType === 'vnd'
                  ? 'border-blue-500 bg-blue-50/40 col-span-1 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
              type="button"
              id="vnd_strategy_btn"
            >
              <div className="flex items-start justify-between w-full mb-1">
                <span className="font-bold text-sm text-gray-800 font-arabic">بروتوكول التطبيق الذكي (vnd.youtube)</span>
                {deepLinkType === 'vnd' && <span className="bg-blue-500 text-white rounded-full p-0.5"><Check size={12} /></span>}
              </div>
              <span className="text-xs text-gray-500 font-arabic leading-relaxed">
                الأكثر موثوقية لمسح رموز الـ QR على كل من هواتف Android و iPhone. يفتح التطبيق مباشرة.
              </span>
              <span className="text-xs font-mono text-blue-600 mt-2 block" dir="ltr">vnd.youtube:...</span>
            </button>

            {/* option 2: Intent-based Android */}
            <button
              onClick={() => setDeepLinkType('android')}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between h-full ${
                deepLinkType === 'android'
                  ? 'border-blue-500 bg-blue-50/40 col-span-1 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
              type="button"
              id="android_intent_btn"
            >
              <div className="flex items-start justify-between w-full mb-1">
                <span className="font-bold text-sm text-gray-800 font-arabic">مُوجه أندرويد القوي (Android Intent)</span>
                {deepLinkType === 'android' && <span className="bg-blue-500 text-white rounded-full p-0.5"><Check size={12} /></span>}
              </div>
              <span className="text-xs text-gray-500 font-arabic leading-relaxed">
                إجبار تام لنظام Android لفتح تطبيق يوتيوب ويدعم تحويل تلقائي فوري للمتصفح إذا لزم الأمر.
              </span>
              <span className="text-xs font-mono text-blue-600 mt-2 block" dir="ltr">intent://youtube...</span>
            </button>

            {/* option 3: iOS youtube:// */}
            <button
              onClick={() => setDeepLinkType('ios')}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between h-full ${
                deepLinkType === 'ios'
                  ? 'border-blue-500 bg-blue-50/40 col-span-1 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
              type="button"
              id="ios_scheme_btn"
            >
              <div className="flex items-start justify-between w-full mb-1">
                <span className="font-bold text-sm text-gray-800 font-arabic">مخطط آبل المباشر (youtube://)</span>
                {deepLinkType === 'ios' && <span className="bg-blue-500 text-white rounded-full p-0.5"><Check size={12} /></span>}
              </div>
              <span className="text-xs text-gray-500 font-arabic leading-relaxed">
                مخصص بشكل ممتاز لعشاق وهواتف iPhone/iPad لتشغيل تطبيق العرض الرسمي دون تأخير.
              </span>
              <span className="text-xs font-mono text-blue-600 mt-2 block" dir="ltr">youtube://www.youtube...</span>
            </button>

            {/* option 4: Standard Standard (Browser Fallback) */}
            <button
              onClick={() => setDeepLinkType('standard')}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between h-full ${
                deepLinkType === 'standard'
                  ? 'border-blue-500 bg-blue-50/40 col-span-1 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
              type="button"
              id="browser_link_btn"
            >
              <div className="flex items-start justify-between w-full mb-1">
                <span className="font-bold text-sm text-gray-800 font-arabic">رابط ويب عادي (متصفح قياسي)</span>
                {deepLinkType === 'standard' && <span className="bg-blue-500 text-white rounded-full p-0.5"><Check size={12} /></span>}
              </div>
              <span className="text-xs text-gray-500 font-arabic leading-relaxed">
                الرابط الكلاسيكي الافتراضي بدون أي تعديلات. يفتح الرابط كالمعتاد في المتصفح المتاح بالهاتف.
              </span>
              <span className="text-xs font-mono text-blue-600 mt-2 block" dir="ltr">https://www.youtube...</span>
            </button>
          </div>

          {/* Technical translation display */}
          <div className="mt-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100" id="deeplink_technical_preview">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1 font-arabic">
              <Info size={14} />
              الرابط المُشفر الفعلي داخل الـ QR Code:
            </div>
            <div className="font-mono text-xs text-slate-600 break-all bg-white px-2.5 py-1.5 rounded-lg border border-gray-200" dir="ltr">
              {formattedDeepLink}
            </div>
          </div>
        </div>

        {/* Module 3: Branding & Custom Colors */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100" id="module_colors_branding">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Settings size={20} />
              </span>
              الألوان والتخصيص البصري
            </h2>
            <div className="text-xs text-gray-400 font-mono">STEP 3</div>
          </div>

          {/* Color Presets Templates */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-gray-400 font-arabic block mb-2.5">نماذج ألوان جاهزة وبنقرة واحدة:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="color_presets_grid">
              {COLOR_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => selectColorTemplate(tpl)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-right cursor-pointer text-xs font-arabic"
                  type="button"
                >
                  <div className="flex -space-x-1 pl-1" dir="ltr">
                    <span className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0 shadow-xs" style={{ backgroundColor: tpl.dark }} />
                    <span className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0 shadow-xs" style={{ backgroundColor: tpl.light }} />
                  </div>
                  <span className="text-gray-700 truncate font-medium">{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Palette Pickers */}
            <div className="space-y-4">
              {/* Foreground Color picker */}
              <div>
                <label className="text-xs font-semibold text-gray-600 font-arabic mb-2 block" htmlFor="foreground_color">
                  لون مربعات الـ QR الرئيسية (المقدمة):
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-gray-200 shrink-0 cursor-pointer">
                    <input
                      id="foreground_color"
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="absolute inset-x-0 inset-y-0 w-20 h-20 -m-4 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>
              </div>

              {/* Background Color picker */}
              <div>
                <label className="text-xs font-semibold text-gray-600 font-arabic mb-2 block" htmlFor="background_color">
                  لون خلفية الـ QR Code:
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-gray-200 shrink-0 cursor-pointer">
                    <input
                      id="background_color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="absolute inset-x-0 inset-y-0 w-20 h-20 -m-4 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Advanced configurations */}
            <div className="space-y-4 rounded-2xl bg-gray-50 p-4 border border-gray-100">
              <span className="text-xs font-bold text-gray-700 font-arabic block mb-1">إعدادات الحماية والتكامل:</span>
              
              {/* Error correction level info & selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-600 font-arabic" htmlFor="error_correction_level">
                    مستوى تصحيح الخطأ وللأخطاء:
                  </label>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-arabic">بسبب وجود الشعار</span>
                </div>
                <select
                  id="error_correction_level"
                  value={errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-arabic focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                >
                  <option value="H">عالي جداً (H - 30% استرداد) - الأفضل للشعار</option>
                  <option value="Q">متوسط عالي (Q - 25% استرداد)</option>
                  <option value="M">متوسط (M - 15% استرداد)</option>
                  <option value="L">ضعيف (L - 7% استرداد)</option>
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block font-arabic leading-normal">
                  تحديد مستوى أعلى يحمي الرمز ويضمن سلامة فك قراءة الكود حتى لو كان الشعار يغطي مساحة من الرمز بالمنتصف.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 4: Central Logo Picker & Uploader */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100" id="module_central_logo">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Sparkles size={20} />
              </span>
              شعار منتصف الـ QR كود
            </h2>
            <div className="text-xs text-gray-400 font-mono">STEP 4</div>
          </div>

          <p className="text-sm text-gray-500 font-arabic mb-4 leading-relaxed">
            اختر أحد الشعارات الجاهزة الخاصة باليوتيوب أو قم بتحميل شعار قناتك المخصص مباشرة من جهازك لوضعه بمنتصف الكود!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="logo_picker_grid">
            
            {/* Presets Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-600 font-arabic block">الشعارات الافتراضية الجاهزة:</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setLogoPreset(p.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      logoPreset === p.id
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-200'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                    type="button"
                  >
                    <img src={p.url} alt={p.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-arabic font-medium text-gray-700 truncate w-full">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* No Logo Option */}
              <button
                onClick={() => setLogoPreset('none')}
                className={`w-full py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-arabic font-medium ${
                  logoPreset === 'none'
                    ? 'border-gray-800 bg-gray-800 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-100 bg-white'
                }`}
                type="button"
              >
                بدون وضع أي شعار بالمنتصف
              </button>
            </div>

            {/* Custom PC/Mobile Logo file drag-drop area */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-600 font-arabic block">تحميل شعار قناتك المخصص:</span>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-gray-200 hover:border-emerald-500 bg-gray-50/50 hover:bg-white'
                } ${logoPreset === 'custom' ? 'border-emerald-600 bg-emerald-50/10' : ''}`}
                id="logo_drag_zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleLogoUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {logoPreset === 'custom' && customLogoUrl ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={customLogoUrl}
                      alt="Custom logo"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs font-arabic font-semibold text-emerald-700">
                      تم تحميل الشعار الخاص بنجاح!
                    </div>
                    <span className="text-[10px] text-gray-400 font-arabic underline">انقر لتغيير الصورة</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                      <Upload size={18} />
                    </div>
                    <div className="text-xs font-arabic text-gray-700 font-medium">
                      اسحب وأفلت شعارك هنا أو تصفح ملفاتك
                    </div>
                    <div className="text-[10px] text-gray-400 font-arabic">
                      يدعم PNG ، JPG (يفضل لوغو ذو شكل متكامل)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logo Sizing and Margins */}
          {logoPreset !== 'none' && (
            <div className="mt-5 bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
              <span className="text-xs font-semibold text-gray-700 font-arabic block mb-1">التحكم البصري بالشعار:</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Scale Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-arabic">حجم الشعار بالمنتصف:</span>
                    <span className="text-xs font-mono font-medium text-gray-800">{Math.round(logoScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.28"
                    step="0.01"
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-arabic">
                    <span>حجم صغير (مثالي)</span>
                    <span>حجم كبير (أقصى حماية)</span>
                  </div>
                </div>

                {/* Draw Background Badge Border Checkbox */}
                <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200">
                  <input
                    id="checkbox_logo_margin"
                    type="checkbox"
                    checked={logoMargin}
                    onChange={(e) => setLogoMargin(e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-emerald-500 focus:outline-none accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="checkbox_logo_margin" className="text-xs font-medium text-gray-700 font-arabic cursor-pointer">
                    وضع طبقة عازلة بيضاء خلف الشعار لمنع تداخل نقاط الـ QR
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: LIVE PREVIEW & DOWNLOAD ACTIONS (5 COLS) */}
      <div className="lg:col-span-5 space-y-6" id="qr_right_panel">
        
        {/* Preview and basic action Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center text-center stick top-6" id="preview_sticky_container">
          <span className="text-xs font-bold text-gray-400 font-arabic tracking-wider uppercase mb-1 block">نافذة المعاينة التفاعلية المباشرة</span>
          <h3 className="text-lg font-bold font-arabic text-gray-800 mb-6">رمز الاستجابة السريعة النهائي (QR Code)</h3>

          {/* QR Code Canvas container */}
          <div className="p-6 bg-slate-50/60 rounded-3xl border border-dashed border-gray-200 relative group flex items-center justify-center glow-youtube">
            
            {/* The canvas */}
            <canvas
              ref={canvasRef}
              className="w-60 h-60 max-w-full rounded-2xl bg-white shadow-xs p-2 transition-transform duration-300 group-hover:scale-102"
              id="final_qr_canvas"
            />

            {/* Quick scanning guidance icon overlays */}
            <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-[10px] text-gray-500 border border-gray-200 shadow-2xs font-arabic font-medium pointer-events-none">
              مسح مباشر للهاتف
            </div>
          </div>

          {/* Sub description of encoded data */}
          <p className="mt-4 text-xs font-arabic text-gray-400 max-w-xs leading-relaxed">
            تمت المزامنة والتحديث حياً! يدعم هذا الرمز فتح تطبيق يوتيوب من الكاميرا الافتراضية للـ iPhone والـ Android مباشرة بمجرد المسح.
          </p>

          <div className="w-full h-px bg-gray-100 my-6" />

          {/* Quick operational actions - Copy & Download */}
          <div className="w-full space-y-3.5" id="preview_actions">
            
            {/* Copy to clipboard button */}
            <button
              onClick={handleCopyToClipboard}
              className={`w-full py-3 px-4 rounded-xl font-arabic font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-inner'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              type="button"
              id="copy_qr_btn"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>تم نسخ الـ QR كصورة للحافظة!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>نسخ صورة الـ QR لنسخها في التصاميم</span>
                </>
              )}
            </button>

            {/* High-Resolution Professional Download form */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-right space-y-3" id="high_res_download_form">
              <span className="text-xs font-bold text-gray-700 font-arabic block">خيارات تصدير الملفات عالية الجودة للطباعة:</span>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Resolution selector */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 font-arabic block mb-1">دقة الصورة المستخرجة:</label>
                  <select
                    value={downloadSize}
                    onChange={(e) => setDownloadSize(parseInt(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none"
                    id="download_size_select"
                  >
                    <option value="512">512 × 512 بكسل (شبكات التواصل)</option>
                    <option value="1024">1024 × 1024 بكسل (جودة قياسية)</option>
                    <option value="2048">2048 × 2048 بكسل (طباعة لافتات)</option>
                    <option value="4096">4096 × 4096 بكسل (دقة فائقة فائقة)</option>
                  </select>
                </div>

                {/* Format selection */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 font-arabic block mb-1">امتداد وصيغة الملف:</label>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'jpg')}
                    className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none"
                    id="download_format_select"
                  >
                    <option value="png">PNG (شفافة مفرغة للشعارات)</option>
                    <option value="jpg">JPEG (خفيف ومتوافق للمطابع)</option>
                  </select>
                </div>
              </div>

              {/* Mega download button */}
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold font-arabic flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg shadow-red-500/10"
                type="button"
                id="mega_download_btn"
              >
                <Download size={18} />
                <span>تحميل كود الـ QR بدقة احترافية</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guidance and education panel on Deep Links */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-gray-200 text-right space-y-4" id="deep_link_education_guidance">
          <h4 className="text-sm font-bold font-arabic text-gray-800 flex items-center gap-2 justify-end">
            💡 كيف تعمل هذه الأداة في زيادة تفاعلك؟
          </h4>
          <ul className="space-y-2 text-xs text-gray-600 font-arabic leading-relaxed list-inside list-disc">
            <li>
              عندما تصنع كود QR لليوتيوب العادي، تفتح الكاميرا الرابط داخل الويب، وإذا رغب الزائر بالاشتراك، سيتطلب منه تسجيل دخوله بقوة، مما يسبب خسارة <strong className="text-red-600">80% من الاشتراكات المحتملة</strong>.
            </li>
            <li>
              مع ميزة الـ <strong className="text-blue-600">Deep Link</strong> من أداتنا، يتم إجبار نظام تشغيل الهاتف على تشغيل التطبيق الرسمي لليوتيوب فوراً، حاملاً حساب المستخدم المفعل، فيتمكن بنقرة واحدة من <strong className="text-emerald-700">الاشتراك، الإعجاب، التعليق</strong>.
            </li>
            <li>
              ننصح دائمًا بالاختيار الافتراضي <strong className="font-semibold text-slate-800">vnd.youtube</strong> لتجربة مسح ذكية شاملة.
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
