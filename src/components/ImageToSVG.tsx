/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  FileCode, 
  HelpCircle,
  Scissors,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface ImageToSVGProps {
  lang: 'ar' | 'en';
  onReturn?: () => void;
}

type ConverterStyle = 'pixel' | 'circles' | 'halftone' | 'monochrome' | 'wrapper';

export default function ImageToSVG({ lang, onReturn }: ImageToSVGProps) {
  // Translatable texts
  const t = {
    ar: {
      title: "أداة تحويل الصورة لملف SVG ناقل",
      subtitle: "حول صورك (PNG, JPG) إلى رسومات ناقلة ذكية (Vectored SVG) بالكامل من خلال متصفحك مجاناً وبأعلى دقة.",
      uploadSection: "1. تحميل الصورة المراد تحويلها",
      dropzoneText: "اسحب وأفلت الصورة هنا أو تصفح ملفاتك",
      dropzoneSub: "يدعم صيغ PNG, JPG, JPEG و WebP (تتم المعالجة محلياً 100%)",
      settingsSection: "2. إعدادات وأنماط التحويل",
      styleLabel: "نمط الرسم المتجه (SVG Style):",
      stylePixel: "ألوان بيكسل (Pixel Art Vector)",
      styleCircles: "شبكة الدوائر الملونة (Color Circles Mesh)",
      styleHalftone: "تظليل النقاط الفني (Halftone Dot Art)",
      styleMonochrome: "الرسم الأحادي الأسود والأبيض (Monochrome Silhouette)",
      styleWrapper: "مغلف ناقل قياسي (Standard SVG Wrapper)",
      
      stylePixelDesc: "يقوم بتحويل الصورة لشبكة من مربعات البيكسل المتجهة المستقرة عالية الدقة.",
      styleCirclesDesc: "يرسم الصورة بأسلوب فني مجسم يتكون من مئات الدوائر الملونة الموزعة بالتساوي.",
      styleHalftoneDesc: "يحاكي أسلوب المطبوعات الورقية القديمة حيث يتغير حجم النقاط السوداء بناءً على الظل المتاح.",
      styleMonochromeDesc: "يقوم بتصفية وتتبع الأجزاء الداكنة لاستخراج خيال أو رسم صلب ثنائي الألوان.",
      styleWrapperDesc: "يقوم بتضمين صورتك الأصلية بأمان داخل حاوية SVG متجاوبة بدقة أصلية.",

      gridSizeLabel: "دقة الشبكة والمسح الحجمي:",
      gridSizeDesc: "القيم الأعلى تمنحك دقة بالغة وتفاصيل حية، لكن أحجام ملفات الـ SVG ستصبح أكبر.",
      dotsScaleLabel: "مقياس وحجم وحيز الأشكال المتجهة:",
      thresholdLabel: "مستوى عتبة الظل (الأسود والأبيض):",
      bgColorLabel: "تمويه أو لون الخلفية:",
      bgTransparent: "شفافة بالكامل (المستحسن)",
      bgWhite: "أبيض صلب",
      bgBlack: "أسود صلب",
      bgCustom: "تطابق لون الملف الأصلي",
      
      previewSection: "3. المعاينة المباشرة وتصدير الـ SVG",
      tabResult: "الرسم المتجه النهائي",
      tabOriginal: "الصورة الأصلية",
      btnExportSvg: "تحميل ملف SVG الناقل",
      btnCopyCode: "نسخ الكود المصدري للرمز",
      copiedSuccess: "تم نسخ كود الـ SVG بنجاح!",
      resetBtn: "تحميل صورة أخرى",
      
      loadingProcess: "جاري تحليل ورسم الملف بشكل متجه حياً...",
      noImageTitle: "لم يتم اختيار صورة بعد!",
      noImageDesc: "يرجى تحميل صورة PNG أو JPG في الخطوة الأولى لتنشيط الأداة وتوليد الرسم الحركي والناقل مباشرة.",
      statsLabel: "إحصاءات ملف SVG الناتج:",
      elementsCount: "عدد العناصر الرسومية المتجهية:",
      fileSizeEst: "الحجم التقريبي للملف المتجه:",
      pixelGridSize: "حجم شبكة العمل:",
      widthHeight: "أبعاد الصورة الأصلية:",
      originalSize: "حجم الصورة:",
      kb: "كيلوبايت",
      pixels: "بكسل",
      colorInversion: "عكس تباين الألوان (أبيض/أسود)",
    },
    en: {
      title: "Image to SVG Vector Converter",
      subtitle: "Convert your images (PNG, JPG, WebP) into fully scaleable smart Vector SVG files locally in your browser for free.",
      uploadSection: "1. Upload Your Source Image",
      dropzoneText: "Drag & drop your image here, or browse files",
      dropzoneSub: "Supports PNG, JPG, JPEG and WebP (Processed 100% locally on your computer)",
      settingsSection: "2. Vector Conversion & Style Tuning",
      styleLabel: "Vector Creation Method (SVG Style):",
      stylePixel: "Pixel Art Vector",
      styleCircles: "Color Circles Mesh",
      styleHalftone: "Classic Halftone Dot Art",
      styleMonochrome: "Monochrome Silhouette",
      styleWrapper: "Standard SVG Wrapper",

      stylePixelDesc: "Renders the image into high-resolution modular vector pixels blocks.",
      styleCirclesDesc: "Draws an artistic mosaic composed of hundreds of scaleable color vector circles.",
      styleHalftoneDesc: "Mimics nostalgic newsprint style where circles size changes relative to local pixel shadows.",
      styleMonochromeDesc: "Filters and traces dark modules to pull clean, high-contrast two-tone shapes.",
      styleWrapperDesc: "Embeds the original file safely within a responsive, vector viewport coordinates frame.",

      gridSizeLabel: "Grid Resolution / Detail Rate:",
      gridSizeDesc: "Higher values offer superior resolution and vivid details, but produce larger SVG file sizes.",
      dotsScaleLabel: "Shapes Scaling / Gap Size:",
      thresholdLabel: "Monochrome Shadow Threshold:",
      bgColorLabel: "Target Background Color:",
      bgTransparent: "Transparent Canvas (Recommended)",
      bgWhite: "Solid White Paint",
      bgBlack: "Solid Black Paint",
      bgCustom: "Match Original File Background",

      previewSection: "3. Real-Time View & SVG Export",
      tabResult: "Generated Vector Result",
      tabOriginal: "Original Reference Image",
      btnExportSvg: "Download Scaled SVG Vector",
      btnCopyCode: "Copy SVG Tag Source Code",
      copiedSuccess: "SVG tag code copied successfully!",
      resetBtn: "Convert Another Image",

      loadingProcess: "Analyzing raster contours and plotting vectors...",
      noImageTitle: "No image loaded yet!",
      noImageDesc: "Please drop or select a PNG/JPG file in Step 1 to boot our client trace algorithm and view your vectors instantly.",
      statsLabel: "Generated SVG Metadata Insights:",
      elementsCount: "Vector Elements Rendered:",
      fileSizeEst: "Approximated SVG File Size:",
      pixelGridSize: "Target Work Grid:",
      widthHeight: "Parsed Original Resolution:",
      originalSize: "Original File Weight:",
      kb: "KB",
      pixels: "px",
      colorInversion: "Invert Monochrome Silhouette",
    }
  }[lang];

  // Component state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFilename, setImageFilename] = useState<string>('vector_converted');
  const [originalDetails, setOriginalDetails] = useState<{ width: number; height: number; sizeKb: number } | null>(null);
  
  const [activeStyle, setActiveStyle] = useState<ConverterStyle>('pixel');
  const [gridSize, setGridSize] = useState<number>(48);
  const [shapesScale, setShapesScale] = useState<number>(0.9);
  const [threshold, setThreshold] = useState<number>(128);
  const [bgType, setBgType] = useState<'transparent' | 'white' | 'black'>('transparent');
  const [invertColor, setInvertColor] = useState<boolean>(false);

  const [svgOutputCode, setSvgOutputCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'svg' | 'original'>('svg');
  const [copied, setCopied] = useState<boolean>(false);
  const [elementCount, setElementCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Terminate worker on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Inline Web Worker instantiation to offload heavy tracing iterations from the UI.
  // This guarantees high responsive frame rates (60fps) during active threshold or resolution sliding.
  const getOrCreateWorker = () => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const workerCode = `
      self.onmessage = function(e) {
        var data = e.data.data;
        var targetW = e.data.targetW;
        var targetH = e.data.targetH;
        var activeStyle = e.data.activeStyle;
        var bgType = e.data.bgType;
        var shapesScale = e.data.shapesScale;
        var invertColor = e.data.invertColor;
        var threshold = e.data.threshold;
        
        var shapesMarkup = [];
        var elementCounter = 0;

        // Set target background markup
        var backgroundMarkup = '';
        if (bgType === 'white') {
          backgroundMarkup = '<rect x="0" y="0" width="' + targetW + '" height="' + targetH + '" fill="#ffffff" />';
          elementCounter++;
        } else if (bgType === 'black') {
          backgroundMarkup = '<rect x="0" y="0" width="' + targetW + '" height="' + targetH + '" fill="#000000" />';
          elementCounter++;
        }

        // Process pixel block arrays
        for (var y = 0; y < targetH; y++) {
          for (var x = 0; x < targetW; x++) {
            var index = (y * targetW + x) * 4;
            var r = data[index];
            var g = data[index + 1];
            var b = data[index + 2];
            var a = data[index + 3];

            // Skip completely transparent points
            if (a < 30) continue;

            // Compute average channel brightness
            var brightness = (r + g + b) / 3;

            if (activeStyle === 'pixel') {
              var color = 'rgb(' + r + ',' + g + ',' + b + ')';
              var strokeOffset = (1 - shapesScale) / 2;
              var size = shapesScale;
              shapesMarkup.push('<rect x="' + (x + strokeOffset).toFixed(2) + '" y="' + (y + strokeOffset).toFixed(2) + '" width="' + size.toFixed(2) + '" height="' + size.toFixed(2) + '" fill="' + color + '" fill-opacity="' + (a/255).toFixed(2) + '" />');
              elementCounter++;

            } else if (activeStyle === 'circles') {
              var color = 'rgb(' + r + ',' + g + ',' + b + ')';
              var radius = (shapesScale * 0.5).toFixed(2);
              shapesMarkup.push('<circle cx="' + (x + 0.5).toFixed(2) + '" cy="' + (y + 0.5).toFixed(2) + '" r="' + radius + '" fill="' + color + '" fill-opacity="' + (a/255).toFixed(2) + '" />');
              elementCounter++;

            } else if (activeStyle === 'halftone') {
              var factor = invertColor 
                ? (brightness / 255) 
                : (1 - (brightness / 255));
              
              var radius = (factor * 0.5 * shapesScale * (a/255)).toFixed(2);
              var numRadius = Number(radius);
              
              if (numRadius > 0.05) {
                var color = invertColor ? '#ffffff' : '#000000';
                shapesMarkup.push('<circle cx="' + (x + 0.5).toFixed(2) + '" cy="' + (y + 0.5).toFixed(2) + '" r="' + radius + '" fill="' + color + '" />');
                elementCounter++;
              }

            } else if (activeStyle === 'monochrome') {
              var isDark = brightness < threshold;
              var keepPixel = invertColor ? !isDark : isDark;

              if (keepPixel) {
                var color = invertColor ? '#ffffff' : '#000000';
                var strokeOffset = (1 - shapesScale) / 2;
                var size = shapesScale;
                shapesMarkup.push('<rect x="' + (x + strokeOffset).toFixed(2) + '" y="' + (y + strokeOffset).toFixed(2) + '" width="' + size.toFixed(2) + '" height="' + size.toFixed(2) + '" fill="' + color + '" />');
                elementCounter++;
              }
            }
          }
        }

        var finalSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + targetW + ' ' + targetH + '" width="100%" height="100%">\\n  ' + backgroundMarkup + '\\n  ' + shapesMarkup.join('\\n  ') + '\\n</svg>';

        self.postMessage({ finalSvg: finalSvg, elementCounter: elementCounter });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));
    return workerRef.current;
  };

  // Trigger vector calculation when parameters edit
  useEffect(() => {
    if (imageSrc) {
      calculateSVG();
    }
  }, [imageSrc, activeStyle, gridSize, shapesScale, threshold, bgType, invertColor]);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Convert loaded file to DataURL
  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      alert(lang === 'ar' ? 'الرجاء تحميل ملف صورة فقط!' : 'Please upload an image file only!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setImageSrc(dataUrl);
        
        // Clean filename for saving
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted';
        setImageFilename(`${baseName}_vectorized`);
        
        // Get details
        setOriginalDetails({
          width: 0,
          height: 0,
          sizeKb: Math.round(file.size / 1024)
        });

        // Trigger loading resolution info
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          setOriginalDetails({
            width: img.width,
            height: img.height,
            sizeKb: Math.round(file.size / 1024)
          });
        };

        setActivePreviewTab('svg');
      }
    };
    reader.readAsDataURL(file);
  };

  // SVG tracing engine
  const calculateSVG = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // Keep aspect ratio intact
      const ar = originalWidth / originalHeight;
      let targetW = gridSize;
      let targetH = Math.round(gridSize / ar);
      
      if (targetH < 4) targetH = 4;
      if (targetW < 4) targetW = 4;

      // Handle standard direct SVG embedding wrapper
      if (activeStyle === 'wrapper') {
        const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${originalWidth} ${originalHeight}" width="100%" height="100%">
  ${bgType === 'white' ? `<rect width="100%" height="100%" fill="#ffffff" />` : ''}
  ${bgType === 'black' ? `<rect width="100%" height="100%" fill="#000000" />` : ''}
  <image href="${imageSrc}" x="0" y="0" width="${originalWidth}" height="${originalHeight}" />
</svg>`;
        setSvgOutputCode(svgCode);
        setElementCount(1);
        setIsProcessing(false);
        return;
      }

      // Draw onto simple offscreen canvas to scan pixel elements
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = targetW;
      offscreenCanvas.height = targetH;
      const ctx = offscreenCanvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Render image to scaling resolution
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      // To prevent race conditions or multiple workers firing together,
      // terminate any running worker and launch a fresh one.
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      const activeWorker = getOrCreateWorker();

      activeWorker.onmessage = (e) => {
        const { finalSvg, elementCounter } = e.data;
        setSvgOutputCode(finalSvg);
        setElementCount(elementCounter);
        setIsProcessing(false);
      };

      activeWorker.onerror = (err) => {
        console.error("Worker Error: ", err);
        setIsProcessing(false);
      };

      // Post raw pixels data and parameters to the Web Worker thread
      activeWorker.postMessage({
        data,
        targetW,
        targetH,
        activeStyle,
        bgType,
        shapesScale,
        invertColor,
        threshold
      });
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  // Download SVG file handler
  const triggerSvgDownload = () => {
    if (!svgOutputCode) return;
    try {
      const blob = new Blob([svgOutputCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageFilename || 'converted_vector'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy to clipboard
  const copySvgToClipboard = () => {
    if (!svgOutputCode) return;
    navigator.clipboard.writeText(svgOutputCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Clipboard copy failed: ", err);
    });
  };

  // Estimated SVG File size in KB
  const calculatedSvgSizeKb = svgOutputCode 
    ? Math.round((new Blob([svgOutputCode]).size) / 10.24) / 100
    : 0;

  return (
    <div className="w-full space-y-8" id="svg_tool_wrapper">
      
      {onReturn && (
        <div className="flex justify-start max-w-7xl mx-auto" id="svg_back_navigation">
          <button
            onClick={onReturn}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-150 text-slate-700 hover:text-red-655 rounded-2xl font-bold font-arabic text-xs transition-all cursor-pointer shadow-2xs"
            type="button"
          >
            {lang === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{lang === 'ar' ? 'العودة لمولد كود الـ QR الذكي' : 'Back to Smart QR Generator'}</span>
          </button>
        </div>
      )}

      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3" id="svg_intro_heading">
        <h2 className="text-2xl sm:text-3xl font-black font-arabic text-gray-900 leading-normal flex items-center justify-center gap-2">
          <span className="p-2 bg-red-50 text-red-650 rounded-2xl relative inline-block">
            <Scissors size={24} className="animate-pulse" />
          </span>
          <span>{t.title}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-650 font-arabic leading-relaxed leading-normal">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto" id="svg_workspace_grid">
        
        {/* LEFT COMPILER BLOCK: INPUT & ADJUSTERS (7 COLS) */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-start" id="svg_left_compiler_card">
          
          {/* STEP 1: Upload Dropzone Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-start" id="svg_step1_card">
            <h3 className="text-sm font-bold font-arabic text-gray-855 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              <span>{t.uploadSection}</span>
            </h3>

            {!imageSrc ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-250 hover:border-red-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group flex flex-col justify-center items-center py-12"
                id="svg_upload_dropzone"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="p-4 bg-white rounded-2xl shadow-xs group-hover:scale-105 transition-all mb-4 text-slate-400 group-hover:text-red-500">
                  <Upload size={32} />
                </div>
                <p className="text-xs font-bold font-arabic text-gray-750 max-w-xs leading-normal">
                  {t.dropzoneText}
                </p>
                <p className="text-[10px] text-slate-500 font-arabic mt-1.5 leading-normal max-w-sm">
                  {t.dropzoneSub}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150" id="svg_active_image_details">
                <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-white shadow-xs">
                  <img src={imageSrc} alt="source thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 overflow-hidden flex-1 select-none">
                  <span className="text-xs font-black text-gray-800 font-mono block truncate">{imageFilename}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-arabic">
                    <span>{originalDetails?.width && originalDetails?.height ? `${originalDetails.width}×${originalDetails.height} ${t.pixels}` : ''}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{originalDetails?.sizeKb ? `${originalDetails.sizeKb} ${t.kb}` : ''}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setSvgOutputCode('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-500 rounded-xl font-bold font-arabic text-[11px] transition-all cursor-pointer shadow-2xs"
                  type="button"
                >
                  {t.resetBtn}
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Customization Controls Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-start" id="svg_step2_card">
            <h3 className="text-sm font-bold font-arabic text-gray-855 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <span>{t.settingsSection}</span>
            </h3>

            {/* Inactive prompt */}
            {!imageSrc ? (
              <div className="text-center py-10 px-4 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
                <Sliders className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-[11px] font-arabic text-slate-650 font-bold leading-normal">
                  {t.noImageDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-6" id="svg_active_settings_controls">
                
                {/* Visual style picker selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black font-arabic text-gray-700 leading-normal block">
                    {t.styleLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="svg_style_selector_grid">
                    {[
                      { id: 'pixel', icon: <Sparkles size={14} />, title: t.stylePixel, desc: t.stylePixelDesc },
                      { id: 'circles', icon: <ImageIcon size={14} />, title: t.styleCircles, desc: t.styleCirclesDesc },
                      { id: 'halftone', icon: <FileCode size={14} />, title: t.styleHalftone, desc: t.styleHalftoneDesc },
                      { id: 'monochrome', icon: <Scissors size={14} />, title: t.styleMonochrome, desc: t.styleMonochromeDesc },
                      { id: 'wrapper', icon: <Eye size={14} />, title: t.styleWrapper, desc: t.styleWrapperDesc },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveStyle(item.id as ConverterStyle);
                          if (item.id === 'wrapper') {
                            // Don't need high grid size for wrappers
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-start items-start gap-1 cursor-pointer select-none ${
                          activeStyle === item.id
                            ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-200 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-gray-800 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-bold font-arabic text-xs flex items-center gap-1.5">
                          {item.icon}
                          <span>{item.title}</span>
                        </span>
                        <span className={`text-[9px] leading-relaxed block font-arabic max-w-xs ${activeStyle === item.id ? 'text-red-650' : 'text-slate-500'}`}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100 my-4" />

                {/* SLIDERS MODULES depending on current style selection */}
                {activeStyle !== 'wrapper' && (
                  <div className="space-y-5" id="svg_adjusters_sliders">
                    
                    {/* Grid Resolution Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-black font-arabic text-gray-700">
                        <span>{t.gridSizeLabel}</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-[10px] text-gray-700 font-extrabold">{gridSize} × {gridSize}</span>
                      </div>
                      <input 
                        type="range"
                        min="16"
                        max="128"
                        step="4"
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-arabic leading-relaxed block">
                        {t.gridSizeDesc}
                      </span>
                    </div>

                    {/* Shapes scale slider factor */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-black font-arabic text-gray-700">
                        <span>{t.dotsScaleLabel}</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-[10px] text-gray-700 font-extrabold">{(shapesScale * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0.3"
                        max="1.2"
                        step="0.05"
                        value={shapesScale}
                        onChange={(e) => setShapesScale(Number(e.target.value))}
                        className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg outline-none"
                      />
                    </div>

                    {/* Monochrome Threshold custom controls */}
                    {activeStyle === 'monochrome' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs font-black font-arabic text-gray-700">
                          <span>{t.thresholdLabel}</span>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-[10px] text-gray-700 font-extrabold">{threshold}</span>
                        </div>
                        <input 
                          type="range"
                          min="30"
                          max="220"
                          step="2"
                          value={threshold}
                          onChange={(e) => setThreshold(Number(e.target.value))}
                          className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg outline-none"
                        />
                      </div>
                    )}

                    {/* Halftone / Monochrome Toggle Colors */}
                    {(activeStyle === 'halftone' || activeStyle === 'monochrome') && (
                      <div className="space-y-2 animate-fadeIn">
                        <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox"
                            checked={invertColor}
                            onChange={(e) => setInvertColor(e.target.checked)}
                            className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 accent-red-600 cursor-pointer"
                          />
                          <span className="text-xs font-arabic font-bold text-gray-700 leading-normal">{t.colorInversion}</span>
                        </label>
                      </div>
                    )}

                  </div>
                )}

                {/* Target Background type controls */}
                <div className="space-y-2">
                  <label className="text-xs font-black font-arabic text-gray-700 leading-normal block">
                    {t.bgColorLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2" id="svg_bg_selection">
                    {[
                      { id: 'transparent', label: t.bgTransparent },
                      { id: 'white', label: t.bgWhite },
                      { id: 'black', label: t.bgBlack }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBgType(item.id as any)}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all text-[10px] font-arabic font-bold cursor-pointer select-none truncate ${
                          bgType === item.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* RIGHT DISPLAY PANEL: LIVE PREVIEW & RESULTS (5 COLS) */}
        <div className="lg:col-span-6 space-y-6" id="svg_right_preview_card">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-start" id="svg_preview_workspace">
            <h3 className="text-sm font-bold font-arabic text-gray-855 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">3</span>
              <span>{t.previewSection}</span>
            </h3>

            {/* Visual Screen Loader */}
            {!imageSrc ? (
              <div className="text-center py-24 px-4 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50" id="svg_inactive_preview_state">
                <ImageIcon className="mx-auto text-slate-300 mb-2 animate-pulse" size={40} />
                <p className="text-xs font-arabic text-slate-650 font-black leading-relaxed max-w-sm mx-auto">
                  {t.noImageTitle}
                </p>
                <p className="text-[10px] text-slate-500 font-arabic mt-1 leading-normal max-w-xs mx-auto">
                  {t.noImageDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-5" id="svg_active_preview_workspace">
                
                {/* Result tab buttons */}
                <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('svg')}
                    className={`flex-1 py-2 px-3 rounded-lg font-arabic font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePreviewTab === 'svg'
                        ? 'bg-white text-gray-900 shadow-2xs border border-gray-100'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Eye size={13} />
                    <span>{t.tabResult}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('original')}
                    className={`flex-1 py-2 px-3 rounded-lg font-arabic font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePreviewTab === 'original'
                        ? 'bg-white text-gray-900 shadow-2xs border border-gray-100'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>{t.tabOriginal}</span>
                  </button>
                </div>

                {/* Frame Canvas screen container */}
                <div className="border border-gray-150 rounded-2xl p-4 bg-slate-100 flex items-center justify-center relative min-h-[280px] lg:min-h-[340px] max-h-[420px] overflow-hidden" id="svg_viewport_canvas">
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col justify-center items-center gap-2.5 z-40 animate-fadeIn text-center">
                      <RefreshCw size={24} className="animate-spin text-red-600" />
                      <span className="text-[10px] font-bold font-arabic text-gray-700">{t.loadingProcess}</span>
                    </div>
                  )}

                  {activePreviewTab === 'original' ? (
                    <div className="max-w-full max-h-full flex items-center justify-center p-2 animate-fadeIn">
                      <img 
                        ref={imageElementRef} 
                        src={imageSrc} 
                        alt="original reference" 
                        className="max-w-full max-h-[300px] lg:max-h-[340px] object-contain rounded-xl shadow-xs" 
                      />
                    </div>
                  ) : (
                    <div 
                      className="max-w-full max-h-full flex items-center justify-center p-2 animate-fadeIn" 
                      id="svg_vector_rendering_viewport"
                      dangerouslySetInnerHTML={{ __html: svgOutputCode }}
                    />
                  )}

                </div>

                {/* Vector Metadata summary list insights */}
                {activePreviewTab === 'svg' && activeStyle !== 'wrapper' && svgOutputCode && (
                  <div className="p-3 bg-slate-50 border border-gray-150 rounded-2xl space-y-2 animate-fadeIn text-right" id="svg_stats_box" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <h4 className="text-[10.5px] font-black text-gray-800 font-arabic flex items-center gap-1">
                      <Sliders size={12} className="text-red-650" />
                      <span>{t.statsLabel}</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-arabic text-slate-600 font-medium">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 block">{t.elementsCount}</span>
                        <span className="font-mono text-xs text-gray-900 font-black">{elementCount.toLocaleString()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 block">{t.fileSizeEst}</span>
                        <span className="font-mono text-xs text-gray-900 font-black">{calculatedSvgSizeKb} {t.kb}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 block">{t.pixelGridSize}</span>
                        <span className="font-mono text-xs text-gray-900 font-black">{gridSize} × {gridSize}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 block">{t.widthHeight}</span>
                        <span className="font-mono text-xs text-gray-900 font-black">{originalDetails?.width && originalDetails?.height ? `${originalDetails.width}×${originalDetails.height} ${t.pixels}` : 'Scanning...'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* EXPORT CALL TO ACTION BUTTONS FRAME */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2" id="svg_export_actions">
                  
                  {/* Download Vector File Button */}
                  <button
                    type="button"
                    onClick={triggerSvgDownload}
                    className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic text-xs tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
                    id="download_svg_final_btn"
                  >
                    <Download size={14} />
                    <span>{t.btnExportSvg}</span>
                  </button>

                  {/* Copy code tag to clipboard button */}
                  <button
                    type="button"
                    onClick={copySvgToClipboard}
                    className={`shrink-0 py-3.5 px-4 border text-xs font-bold font-arabic rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98 ${
                      copied 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : 'bg-white hover:bg-slate-50 border-gray-200 text-gray-700'
                    }`}
                    id="copy_svg_element_btn"
                  >
                    {copied ? <Check size={14} className="animate-pulse" /> : <Copy size={14} />}
                    <span>{copied ? t.copiedSuccess : t.btnCopyCode}</span>
                  </button>

                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
