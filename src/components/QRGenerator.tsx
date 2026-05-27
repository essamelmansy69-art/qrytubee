/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Youtube, 
  Sparkles, 
  Download, 
  Copy, 
  RotateCcw, 
  Settings, 
  ExternalLink, 
  Check, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Eye,
  Info,
  Facebook,
  Instagram,
  Music
} from 'lucide-react';
import { QRConfig, QRStyle } from '../types';
import { parseYoutubeUrl, buildDeepLink } from '../utils';
import { translations } from '../translations';

import { motion } from 'motion/react';

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

export default function QRGenerator({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const t = translations[lang];

  const getColorTemplateName = (name: string) => {
    switch (name) {
      case 'يوتيوب الكلاسيكي': return t.classicYtTemplate;
      case 'الوضع الداكن الفاخر': return t.luxuryDarkTemplate;
      case 'الذهبي الأنيق': return t.goldTemplate;
      case 'أزرق نيون': return t.neonBlueTemplate;
      case 'بنفسجي إنستغرام': return t.instagramTemplate;
      case 'أحمر مطفي ناعم': return t.softRedTemplate;
      case 'أخضر ملكي': return t.royalGreenTemplate;
      case 'أسود مونوكروم': return t.monochromeTemplate;
      default: return name;
    }
  };

  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [deepLinkType, setDeepLinkType] = useState<'vnd' | 'ios' | 'android' | 'standard'>('vnd');
  const [useSmartLink, setUseSmartLink] = useState<boolean>(true);
  const [foregroundColor, setForegroundColor] = useState('#FF0000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [eyeColor, setEyeColor] = useState('#FF0000');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [downloadSize, setDownloadSize] = useState<number>(2048);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [copied, setCopied] = useState<boolean>(false);
  const [renderedPayload, setRenderedPayload] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse URL to show useful UI statistics
  const urlInfo = parseYoutubeUrl(urlInput);
  const formattedDeepLink = buildDeepLink(urlInput, deepLinkType);

  // Auto-switch colors when platform changes
  useEffect(() => {
    if (urlInfo.isValid) {
      if (urlInfo.platform === 'youtube') {
        setForegroundColor('#FF0000');
        setEyeColor('#FF0000');
      } else if (urlInfo.platform === 'facebook') {
        setForegroundColor('#1877F2');
        setEyeColor('#1877F2');
      } else if (urlInfo.platform === 'instagram') {
        setForegroundColor('#E1306C');
        setEyeColor('#E1306C');
      } else if (urlInfo.platform === 'tiktok') {
        setForegroundColor('#000000');
        setEyeColor('#000000');
      }
    }
  }, [urlInfo.platform]);

  // Active payload to embed inside the QR
  const getActivePayload = () => {
    if (useSmartLink) {
      return `${window.location.origin}/?r=${encodeURIComponent(urlInput.trim())}&type=${deepLinkType}`;
    }
    return formattedDeepLink.trim() || urlInput.trim() || 'https://www.youtube.com';
  };

  // Check if QR colors are dangerously inverted for standard mobile lenses
  const isColorWayInverted = () => {
    try {
      const getBrightness = (hex: string) => {
        const c = hex.replace('#', '');
        if (c.length === 3) {
          // expand short hex
          const r = parseInt(c[0] + c[0], 16);
          const g = parseInt(c[1] + c[1], 16);
          const b = parseInt(c[2] + c[2], 16);
          return (r * 299 + g * 587 + b * 114) / 1000;
        }
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
      };
      
      const fgBrightness = getBrightness(foregroundColor);
      const bgBrightness = getBrightness(backgroundColor);
      // If foreground is lighter than background, QR is inverted
      return fgBrightness > bgBrightness;
    } catch (_) {
      return false;
    }
  };

  // Re-generate QR Code in Preview Canvas
  const generateQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const payload = getActivePayload();
    setRenderedPayload(payload);

    try {
      // Draw base QR Code on high-resolution canvas
      // To get crisp rendering, we draw at 512x512 initially for preview
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
    useSmartLink,
    foregroundColor, 
    backgroundColor, 
    errorCorrectionLevel
  ]);

  const selectColorTemplate = (tpl: typeof COLOR_TEMPLATES[0]) => {
    setForegroundColor(tpl.dark);
    setBackgroundColor(tpl.light);
    setEyeColor(tpl.eye);
  };

  // Download High-Resolution version of the QR Code
  const handleDownload = async () => {
    const payload = getActivePayload();
    if (!payload || !urlInput.trim()) {
      alert(t.alertInputFirst);
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

  // Download high-quality custom vector SVG version of the QR Code
  const handleDownloadSvg = async () => {
    const payload = getActivePayload();
    if (!payload || !urlInput.trim()) {
      alert(t.alertInputFirst);
      return;
    }
    try {
      const qrOptions = {
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      };

      // Get pure vector SVG string from qrcode library
      const svgString = await QRCode.toString(payload, {
        type: 'svg',
        ...qrOptions
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `YouTube-DeepLink-QR.svg`;
      link.href = blobUrl;
      link.click();
      
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("error during vector SVG download generation", err);
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
            await navigator.clipboard.writeText(getActivePayload());
            alert(t.clipboardFallbackMsg);
          } catch (_) {}
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto" id="qr_main_layout">
      
      {/* LEFT PANEL: INPUTS & PREVIEW (8 COLS) */}
      <div className="lg:col-span-8 space-y-6" id="qr_left_panel">
        
        {/* Module 1: The Link Input */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-start" id="module_link_input">
          
          {/* Dynamic Platform Accent Resolver */}
          {(() => {
            const getPlatformStyles = () => {
              switch(urlInfo.platform) {
                case 'facebook':
                  return {
                    focusClass: 'focus:border-blue-500 focus:ring-blue-100',
                    bgClass: 'bg-sky-50 text-sky-600',
                    icon: <Facebook size={20} className="text-[#1877F2]" />,
                    badgeIcon: <Facebook size={20} />
                  };
                case 'instagram':
                  return {
                    focusClass: 'focus:border-rose-500 focus:ring-rose-100',
                    bgClass: 'bg-rose-50 text-rose-600',
                    icon: <Instagram size={20} className="text-[#E1306C]" />,
                    badgeIcon: <Instagram size={20} />
                  };
                case 'tiktok':
                  return {
                    focusClass: 'focus:border-slate-800 focus:ring-slate-200',
                    bgClass: 'bg-slate-100 text-slate-800',
                    icon: <Music size={20} className="text-black" />,
                    badgeIcon: <Music size={20} />
                  };
                case 'youtube':
                default:
                  return {
                    focusClass: 'focus:border-red-500 focus:ring-red-100',
                    bgClass: 'bg-red-50 text-red-600',
                    icon: <Youtube size={20} className={urlInfo.isValid && urlInfo.type !== 'unknown' ? 'text-red-500' : 'text-slate-500'} />,
                    badgeIcon: <Youtube size={20} />
                  };
              }
            };
            const pStyle = getPlatformStyles();

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
                    <span className={`p-2 rounded-xl transition-all duration-300 ${pStyle.bgClass}`}>
                      {pStyle.badgeIcon}
                    </span>
                    {t.mod1Title}
                  </h2>
                  <div className="text-xs text-gray-500 font-mono">STEP 1</div>
                </div>

                {/* Horizontal Quick Swappers */}
                <div className="grid grid-cols-4 gap-2 mb-5" id="social_swappers">
                  <button
                    onClick={() => {
                      setUrlInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                      setForegroundColor('#FF0000');
                      setEyeColor('#FF0000');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      urlInfo.platform === 'youtube'
                        ? 'border-red-500 bg-red-50/40 text-red-600 shadow-xs'
                        : 'border-gray-50 hover:border-gray-150 text-slate-400 bg-gray-50/20'
                    }`}
                    type="button"
                  >
                    <Youtube size={20} className="mb-1" />
                    <span className="text-[10px] font-bold font-arabic">يوتيوب</span>
                  </button>

                  <button
                    onClick={() => {
                      setUrlInput('https://www.facebook.com/facebook');
                      setForegroundColor('#1877F2');
                      setEyeColor('#1877F2');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      urlInfo.platform === 'facebook'
                        ? 'border-blue-500 bg-blue-50/40 text-blue-600 shadow-xs'
                        : 'border-gray-50 hover:border-gray-150 text-slate-400 bg-gray-50/20'
                    }`}
                    type="button"
                  >
                    <Facebook size={20} className="mb-1" />
                    <span className="text-[10px] font-bold font-arabic">فيسبوك</span>
                  </button>

                  <button
                    onClick={() => {
                      setUrlInput('https://www.instagram.com/instagram');
                      setForegroundColor('#E1306C');
                      setEyeColor('#E1306C');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      urlInfo.platform === 'instagram'
                        ? 'border-rose-500 bg-rose-50/40 text-rose-600 shadow-xs'
                        : 'border-gray-50 hover:border-gray-150 text-slate-400 bg-gray-50/20'
                    }`}
                    type="button"
                  >
                    <Instagram size={20} className="mb-1" />
                    <span className="text-[10px] font-bold font-arabic">إنستغرام</span>
                  </button>

                  <button
                    onClick={() => {
                      setUrlInput('https://www.tiktok.com/@tiktok');
                      setForegroundColor('#000000');
                      setEyeColor('#000000');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      urlInfo.platform === 'tiktok'
                        ? 'border-slate-800 bg-slate-100 text-slate-800 shadow-xs'
                        : 'border-gray-50 hover:border-gray-150 text-slate-400 bg-gray-50/20'
                    }`}
                    type="button"
                  >
                    <Music size={20} className="mb-1" />
                    <span className="text-[10px] font-bold font-arabic">تيك توك</span>
                  </button>
                </div>

                <label className="text-sm font-medium font-arabic text-gray-600 mb-2 block" htmlFor="yt_url">
                  {t.labelYtUrl}
                </label>
                
                <div className="relative">
                  <input
                    id="yt_url"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={t.placeholderYtUrl}
                    className={`w-full pl-4 pr-12 py-3.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl border border-gray-200 font-mono text-sm transition-all focus:outline-none focus:ring-2 ${pStyle.focusClass}`}
                    dir="ltr"
                  />
                  <div className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`}>
                    {pStyle.icon}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Dynamic Parsing Status Badge removed as per request */}

          {/* Aesthetic Divider */}
          <div className="w-full h-px bg-gray-100 my-6" />

          {/* Moved Live Preview & Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center" id="direct_preview_area">
            
            {/* Left: Copy & High-Res download (7 cols on md) located directly under the link input field */}
            <div className="md:col-span-7 space-y-4 w-full order-1 md:order-1" id="direct_actions_container">
              
              {/* Copy to clipboard button */}
              <button
                onClick={handleCopyToClipboard}
                className={`w-full py-3 px-4 rounded-xl font-arabic font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${
                  copied 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-inner'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                type="button"
                id="copy_qr_btn"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>{t.copiedToast}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{t.btnCopyImage}</span>
                  </>
                )}
              </button>

              {/* Pro Print Export - PNG & SVG Download buttons */}
              <div className="grid grid-cols-2 gap-3" id="pro_export_action_buttons">
                {/* PNG Download Button */}
                <button
                  onClick={handleDownload}
                  className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold font-arabic flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md text-xs"
                  type="button"
                  id="direct_download_png_btn"
                >
                  <Download size={15} />
                  <span>{t.btnDownloadPng}</span>
                </button>

                {/* SVG Download Button */}
                <button
                  onClick={handleDownloadSvg}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold font-arabic flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md text-xs"
                  type="button"
                  id="direct_download_svg_btn"
                >
                  <Sparkles size={15} />
                  <span>{t.btnDownloadSvg}</span>
                </button>
              </div>

            </div>

            {/* Right: The QR Code canvas (5 cols on md) rendered next or below */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 sm:p-5 bg-slate-50/40 rounded-2xl border border-gray-100 group relative w-full shadow-xs order-2 md:order-2" id="direct_canvas_container">
              <span className="text-[10px] font-bold text-slate-500 font-arabic tracking-wider uppercase mb-0.5 block">{t.previewHeading}</span>
              <h3 className="text-xs font-bold font-arabic text-gray-700 mb-2">{t.finalQrLabel}</h3>

              {/* Square canvas wrapper box ensuring crisp 1:1 rendering on all screens */}
              <div className="w-36 h-36 min-w-[9rem] min-h-[9rem] max-w-full aspect-square bg-white rounded-xl shadow-xs border border-gray-100 p-1.5 flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:scale-102 overflow-hidden" id="canvas_square_box">
                <canvas
                  ref={canvasRef}
                  className="!w-full !h-full !max-w-full !max-h-full object-contain rounded-md"
                  id="final_qr_canvas"
                />
              </div>

              <p className="mt-2 text-[10px] font-arabic text-slate-500 max-w-[200px] leading-relaxed">
                {t.previewSyncMsg}
              </p>
            </div>

          </div>
        </div>


      </div>

      {/* RIGHT PANEL: BRANDING, LOGOS, & EDUCATION (4 COLS) */}
      <div className="lg:col-span-4 space-y-6" id="qr_right_panel">

        {/* Module 3: Branding & Custom Colors */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100" id="module_colors_branding">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Settings size={20} />
              </span>
              {t.mod3Title}
            </h2>
            <div className="text-xs text-gray-500 font-mono">STEP 3</div>
          </div>

          {/* Color Presets Templates */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-gray-500 font-arabic block mb-2.5">{t.colorPresetsLabel}</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="color_presets_grid">
              {COLOR_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => selectColorTemplate(tpl)}
                  className={`flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 ${lang === 'ar' ? 'text-right' : 'text-left'} cursor-pointer text-xs font-arabic`}
                  type="button"
                >
                  <div className="flex -space-x-1 pl-1" dir="ltr">
                    <span className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0 shadow-xs" style={{ backgroundColor: tpl.dark }} />
                    <span className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0 shadow-xs" style={{ backgroundColor: tpl.light }} />
                  </div>
                  <span className="text-gray-700 truncate font-medium">{getColorTemplateName(tpl.name)}</span>
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
                  {t.labelForeground}
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
                    aria-label={t.labelForeground}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>
              </div>

              {/* Background Color picker */}
              <div>
                <label className="text-xs font-semibold text-gray-600 font-arabic mb-2 block" htmlFor="background_color">
                  {t.labelBackground}
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
                    aria-label={t.labelBackground}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>
              </div>
            </div>


          </div>

          {/* Dynamic Inverted colors warning banner */}
          {isColorWayInverted() && (
            <div className={`mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 ${lang === 'ar' ? 'text-right' : 'text-left'} animate-fadeIn`} id="inverted_color_banner">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 shrink-0">
                <AlertCircle size={18} />
              </span>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-amber-950 font-arabic">{t.darkInvertedWarnTitle}</h4>
                <p className="text-[11px] text-amber-800 font-arabic leading-relaxed">
                  {t.darkInvertedWarnDesc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Guidance and education panel on Deep Links */}
        <div className={`bg-slate-50 rounded-3xl p-6 border border-gray-200 ${lang === 'ar' ? 'text-right' : 'text-left'} space-y-4`} id="deep_link_education_guidance">
          <h4 className={`text-sm font-bold font-arabic text-gray-800 flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
            💡 {t.optGuidanceHeading}
          </h4>
          <ul className="space-y-2 text-xs text-gray-600 font-arabic leading-relaxed list-inside list-disc">
            <li>
              {t.optTip1}
            </li>
            <li>
              {t.optTip2}
            </li>
            <li>
              {t.optTip3}
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
