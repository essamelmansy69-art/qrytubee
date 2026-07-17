import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { getDeepLink } from '../utils';
import { downloadAsPNG, downloadAsSVG, downloadAsPDF } from '../utils/qrDownloadHelper';
import { Language, translations } from '../translations';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Maximize2, 
  Info,
  Palette,
  Layout,
  QrCode,
  Link as LinkIcon
} from 'lucide-react';

interface QRGeneratorProps {
  lang: Language;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ lang }) => {
  const t = translations[lang];

  // Primary states
  const [url, setUrl] = useState('');
  const [dotsColor, setDotsColor] = useState('#EF4444');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoScale, setLogoScale] = useState(0.2);
  const [frameText, setFrameText] = useState('امسح للاشتراك');
  const [frameColor, setFrameColor] = useState('#EF4444');
  const [frameType, setFrameType] = useState<'none' | 'basic' | 'modern'>('modern');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrStyle, setQrStyle] = useState<'square' | 'dots' | 'rounded'>('rounded');
  
  // Extra states
  const [activeTab, setActiveTab] = useState<'design' | 'logo' | 'frame'>('design');
  const [matrix, setMatrix] = useState<boolean[][]>([]);
  const stats = {
    scansToday: 1542,
    linksCreated: 4892,
    activeCampaigns: 310
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR matrix whenever URL or settings change
  useEffect(() => {
    try {
      const activeUrl = url.trim() || 'https://qrytube.com';
      const deepLinkInfo = getDeepLink(activeUrl);
      
      const qr = QRCode.create(deepLinkInfo.deepUrl, {
        errorCorrectionLevel: errorCorrectionLevel,
      });

      const size = qr.modules.size;
      const newMatrix: boolean[][] = [];
      for (let r = 0; r < size; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < size; c++) {
          row.push(qr.modules.get(r, c) === 1);
        }
        newMatrix.push(row);
      }
      setMatrix(newMatrix);
    } catch (err) {
      console.error('QR Generation Error:', err);
    }
  }, [url, errorCorrectionLevel]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Templates Config
  const applyTemplate = (theme: 'youtube' | 'tiktok' | 'gym' | 'restaurant') => {
    if (theme === 'youtube') {
      setDotsColor('#E51C1C');
      setBgColor('#FFFFFF');
      setFrameColor('#E51C1C');
      setFrameType('modern');
      setFrameText(lang === 'ar' ? 'امسح للاشتراك بالقناة' : 'Scan to Subscribe');
      setQrStyle('rounded');
      setLogoScale(0.2);
    } else if (theme === 'tiktok') {
      setDotsColor('#010101');
      setBgColor('#FFFFFF');
      setFrameColor('#00F2FE');
      setFrameType('modern');
      setFrameText(lang === 'ar' ? 'تابع حسابي تيك توك' : 'Scan to Follow');
      setQrStyle('dots');
      setLogoScale(0.2);
    } else if (theme === 'gym') {
      setDotsColor('#B59410');
      setBgColor('#111827');
      setFrameColor('#B59410');
      setFrameType('basic');
      setFrameText(lang === 'ar' ? 'جدول تمارين الجيم المحدث' : 'Scan Gym Workout');
      setQrStyle('rounded');
      setLogoScale(0.22);
    } else if (theme === 'restaurant') {
      setDotsColor('#065F46');
      setBgColor('#FDFBF7');
      setFrameColor('#065F46');
      setFrameType('modern');
      setFrameText(lang === 'ar' ? 'امسح لمشاهدة المنيو' : 'Scan to View Menu');
      setQrStyle('rounded');
      setLogoScale(0.18);
    }
  };

  // Render SVG QR modules
  const size = matrix.length;
  const viewBoxSize = 100;
  const cellSize = viewBoxSize / (size || 21);

  const renderQRContent = () => {
    if (size === 0) return null;

    const paths: React.ReactNode[] = [];

    // Helper to determine if a cell belongs to a finder pattern
    const isFinderPattern = (r: number, c: number) => {
      if (r < 7 && c < 7) return true; // Top-Left
      if (r < 7 && c >= size - 7) return true; // Top-Right
      if (r >= size - 7 && c < 7) return true; // Bottom-Left
      return false;
    };

    // Helper to check if we should mask center for logo
    const isCenterMask = (r: number, c: number) => {
      if (!logoUrl) return false;
      const center = size / 2;
      const margin = Math.ceil(size * logoScale * 0.7);
      return (
        r >= center - margin &&
        r <= center + margin &&
        c >= center - margin &&
        c <= center + margin
      );
    };

    // Render cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] && !isFinderPattern(r, c) && !isCenterMask(r, c)) {
          const x = c * cellSize;
          const y = r * cellSize;

          if (qrStyle === 'dots') {
            paths.push(
              <circle
                key={`c-${r}-${c}`}
                cx={x + cellSize / 2}
                cy={y + cellSize / 2}
                r={cellSize * 0.4}
                fill={dotsColor}
              />
            );
          } else if (qrStyle === 'rounded') {
            paths.push(
              <rect
                key={`r-${r}-${c}`}
                x={x + cellSize * 0.05}
                y={y + cellSize * 0.05}
                width={cellSize * 0.9}
                height={cellSize * 0.9}
                rx={cellSize * 0.35}
                fill={dotsColor}
              />
            );
          } else {
            // Square style
            paths.push(
              <rect
                key={`s-${r}-${c}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={dotsColor}
              />
            );
          }
        }
      }
    }

    // Helper to draw clean nested finder patterns
    const drawFinderPattern = (cx: number, cy: number, keyPrefix: string) => {
      const outerSize = cellSize * 7;
      const innerSize = cellSize * 3;
      return (
        <g key={keyPrefix}>
          {/* Outer ring */}
          <rect
            x={cx}
            y={cy}
            width={outerSize}
            height={outerSize}
            rx={qrStyle !== 'square' ? cellSize * 1.5 : 0}
            fill="none"
            stroke={dotsColor}
            strokeWidth={cellSize}
          />
          {/* Inner solid module */}
          <rect
            x={cx + cellSize * 2}
            y={cy + cellSize * 2}
            width={innerSize}
            height={innerSize}
            rx={qrStyle !== 'square' ? cellSize * 0.6 : 0}
            fill={dotsColor}
          />
        </g>
      );
    };

    // Finder pattern positions
    paths.push(drawFinderPattern(0, 0, 'f-tl'));
    paths.push(drawFinderPattern((size - 7) * cellSize, 0, 'f-tr'));
    paths.push(drawFinderPattern(0, (size - 7) * cellSize, 'f-bl'));

    return paths;
  };

  const hasLogo = !!logoUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full" id="qr_generator_workspace">
      {/* LEFT COLUMN: Controls & Form */}
      <div className="lg:col-span-7 flex flex-col gap-6" id="qr_controls_sidebar">
        
        {/* Step 1: Input URL */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <LinkIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-sans">{t.inputLabel}</h2>
          </div>
          
          <div className="relative">
            <input
              type="text"
              id="qr_main_url_input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.placeholder}
              dir="ltr"
              className="w-full h-14 pl-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 font-sans focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none text-base"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          {/* Quick Templates Buttons */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              {t.quickTemplates}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('youtube')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
              >
                🎥 يوتيوب
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('tiktok')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                🎵 تيك توك
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('gym')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-yellow-200 bg-slate-900 text-yellow-500 hover:bg-slate-800 text-xs font-bold transition-colors"
              >
                🏋️ جيم ذهبي
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('restaurant')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
              >
                🍔 منيو مطعم
              </button>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'design'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              {t.customize}
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'logo'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              الشعار (Logo)
            </button>
            <button
              onClick={() => setActiveTab('frame')}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'frame'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              الإطار (Frame)
            </button>
          </div>

          {/* TAB 1: DESIGN */}
          {activeTab === 'design' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="design_tab_controls">
              {/* Pattern Style */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">{t.qrStyle}</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setQrStyle('square')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                      qrStyle === 'square'
                        ? 'border-red-500 bg-red-50/50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.qrStyleSquare}
                  </button>
                  <button
                    onClick={() => setQrStyle('dots')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                      qrStyle === 'dots'
                        ? 'border-red-500 bg-red-50/50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.qrStyleDots}
                  </button>
                  <button
                    onClick={() => setQrStyle('rounded')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                      qrStyle === 'rounded'
                        ? 'border-red-500 bg-red-50/50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.qrStyleRounded}
                  </button>
                </div>
              </div>

              {/* Color Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">{t.dotsColor}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={dotsColor}
                      onChange={(e) => setDotsColor(e.target.value)}
                      className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={dotsColor}
                      onChange={(e) => setDotsColor(e.target.value)}
                      className="flex-1 h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">{t.bgColor}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Error correction */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-400" />
                  {t.errorCorrection} (أمان قراءة الكود المخدوش)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setErrorCorrectionLevel(level)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                        errorCorrectionLevel === level
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {level} {level === 'H' ? '(أعلى أمان/أكبر حجم)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO */}
          {activeTab === 'logo' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="logo_tab_controls">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">{t.logoUpload}</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    اختر صورة أو شعار
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {logoUrl && (
                    <button
                      onClick={() => setLogoUrl(undefined)}
                      className="text-red-500 hover:text-red-600 text-sm font-bold"
                    >
                      {t.logoClear}
                    </button>
                  )}
                </div>
              </div>

              {logoUrl && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <label className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>حجم الشعار في الكود</span>
                    <span className="font-mono text-slate-500">{Math.round(logoScale * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.3"
                    step="0.02"
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                  <span className="text-xs text-slate-400">
                    * ملاحظة: يوصى بـ 20% كحد أقصى للحفاظ على سهولة القراءة الفورية للكود.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FRAME */}
          {activeTab === 'frame' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="frame_tab_controls">
              {/* Frame Style */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">{t.frameType}</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFrameType('none')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                      frameType === 'none'
                        ? 'border-red-500 bg-red-50/50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.frameNone}
                  </button>
                  <button
                    onClick={() => setFrameType('basic')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                      frameType === 'basic'
                        ? 'border-red-500 bg-red-50/50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.frameBasic}
                  </button>
                  <button
                    onClick={() => setFrameType('modern')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                      frameType === 'modern'
                        ? 'border-red-500 bg-red-50/50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.frameModern}
                  </button>
                </div>
              </div>

              {frameType !== 'none' && (
                <>
                  {/* Frame Text */}
                  <div className="flex flex-col gap-2 animate-fade-in">
                    <label className="text-sm font-bold text-slate-700">{t.frameTextLabel}</label>
                    <input
                      type="text"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-sans"
                    />
                  </div>

                  {/* Frame Color */}
                  <div className="flex flex-col gap-2 animate-fade-in">
                    <label className="text-sm font-bold text-slate-700">لون الإطار</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                      />
                      <input
                        type="text"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="flex-1 h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW & EXPORT */}
      <div className="lg:col-span-5 flex flex-col gap-6" id="qr_preview_column">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center justify-center gap-6 relative">
          
          {/* Dynamic Interactive QR Wrapper Frame */}
          <div 
            id="qr_complete_wrapper" 
            style={{ backgroundColor: bgColor }}
            className={`p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-100 transition-all shadow-md relative ${
              frameType === 'modern' ? 'pt-8 pb-10' : ''
            }`}
          >
            {/* Top Frame indicator */}
            {frameType === 'basic' && (
              <div 
                style={{ color: frameColor }}
                className="text-xs font-black tracking-widest text-center mb-4 uppercase font-sans border-b pb-1 px-4"
              >
                {frameText || 'SCAN ME'}
              </div>
            )}

            {/* Main QR Code SVG */}
            <div className="relative p-3 rounded-xl bg-white shadow-inner" id="qr_svg_container">
              <svg
                id="generated_qr_svg"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className="w-64 h-64 md:w-72 md:h-72"
              >
                {/* SVG background */}
                <rect width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" rx={2} />
                
                {/* Matrix modules path */}
                {renderQRContent()}

                {/* Draw embedded logo */}
                {hasLogo && (
                  <g>
                    {/* Background clipping shield */}
                    <rect
                      x={viewBoxSize / 2 - (viewBoxSize * logoScale) / 2 - 1}
                      y={viewBoxSize / 2 - (viewBoxSize * logoScale) / 2 - 1}
                      width={viewBoxSize * logoScale + 2}
                      height={viewBoxSize * logoScale + 2}
                      rx={(viewBoxSize * logoScale + 2) * 0.25}
                      fill="#FFFFFF"
                    />
                    {/* Embedded logo image */}
                    <image
                      href={logoUrl}
                      x={viewBoxSize / 2 - (viewBoxSize * logoScale) / 2}
                      y={viewBoxSize / 2 - (viewBoxSize * logoScale) / 2}
                      width={viewBoxSize * logoScale}
                      height={viewBoxSize * logoScale}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Frame (Modern Style Banner) */}
            {frameType === 'modern' && (
              <div 
                style={{ backgroundColor: frameColor }}
                className="absolute bottom-0 left-0 right-0 py-3.5 rounded-b-2xl flex items-center justify-center gap-2 text-white font-extrabold text-sm shadow-md font-sans px-4 text-center"
              >
                <Maximize2 className="w-4 h-4 animate-pulse shrink-0" />
                <span className="truncate">{frameText || 'امسح للاشتراك'}</span>
              </div>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="flex flex-col gap-3.5 w-full">
            <button
              onClick={() => downloadAsPNG('qr_complete_wrapper', `qrytube_${Date.now()}`)}
              className="w-full h-13 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4.5 h-4.5" />
              {t.downloadPNG}
            </button>

            <button
              onClick={() => downloadAsSVG('generated_qr_svg', `qrytube_${Date.now()}`)}
              className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              {t.downloadSVG}
            </button>

            <button
              onClick={() => downloadAsPDF('qr_complete_wrapper', `qrytube_${Date.now()}`)}
              className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              📊 {t.downloadPDF}
            </button>
          </div>
        </div>

        {/* Live Statistics Block */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-extrabold text-sm tracking-wide text-slate-200 uppercase">{t.analyticsTitle}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-emerald-400 font-sans">{stats.scansToday}</span>
              <span className="text-[11px] font-semibold text-slate-400">{t.scansToday}</span>
            </div>
            <div className="flex flex-col border-l border-r border-slate-800 px-4">
              <span className="text-2xl font-black text-red-400 font-sans">{stats.linksCreated}</span>
              <span className="text-[11px] font-semibold text-slate-400">{t.linksCreated}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-blue-400 font-sans">{stats.activeCampaigns}</span>
              <span className="text-[11px] font-semibold text-slate-400">{t.activeCampaigns}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
