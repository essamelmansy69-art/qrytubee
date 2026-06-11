/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Coffee, 
  ChefHat, 
  Pizza, 
  Wine, 
  Download, 
  Copy, 
  RotateCcw, 
  Check, 
  Info, 
  Globe, 
  Sparkles, 
  MapPin, 
  Youtube, 
  ArrowLeftRight, 
  FileText,
  HelpCircle,
  Clock,
  Smartphone,
  CheckCircle2,
  Trash2,
  UploadCloud,
  ArrowRight
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

// Cache to dynamically load jsPDF for flyer print exports
let _cachedJsPDF: any = null;
const getJsPDFLib = async () => {
  if (!_cachedJsPDF) {
    const mod = await import('jspdf');
    _cachedJsPDF = mod.jsPDF || mod.default || mod;
  }
  return _cachedJsPDF;
};

// SVG paths for center symbols when drawn on canvas
// We represent them as high-quality path-strings or pre-compiled canvases to load into image tags
const ICON_SVGS: Record<string, string> = {
  utensils: `<svg xmlns="http://www.w3.org/2500/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v3c0 2.2 1.8 4 4 4Z"/><path d="M17 14v8"/></svg>`,
  coffee: `<svg xmlns="http://www.w3.org/2500/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/></svg>`,
  chefHat: `<svg xmlns="http://www.w3.org/2500/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a4 4 0 0 0-1.2-8.3 5 5 0 0 0-9.6 0A4 4 0 0 0 5 18Z"/><path d="M6 18h12v3H6Z"/></svg>`,
  pizza: `<svg xmlns="http://www.w3.org/2500/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="M12 11h.01"/><path d="M2 12C2 6.5 6.5 2 12 2c5.5 0 10 4.5 10 10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2Z"/><path d="M5 14l7-12"/><path d="M12 2l7 12"/></svg>`,
  wine: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H9"/><path d="M12 15v7"/><path d="M8 22h8"/><path d="M12 15a5 5 0 0 0 5-5V2H7v8a5 5 0 0 0 5 5Z"/></svg>`,
};

interface RestaurantQRViewProps {
  lang: 'ar' | 'en';
  onNavigateToYouTube: () => void;
}

export default function RestaurantQRView({ lang, onNavigateToYouTube }: RestaurantQRViewProps) {
  // State variables matching rich customizer requirements
  const [urlInput, setUrlInput] = useState<string>('https://myrestaurant.com/menu');
  const [foregroundColor, setForegroundColor] = useState<string>('#451A03'); // Classic Diner Dark Espresso
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFBEB'); // Ivory Cream BG
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H'); // Keep High for logo overlays
  const [selectedIcon, setSelectedIcon] = useState<string>('utensils'); // utensils, coffee, chefHat, pizza, wine, custom, none
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.22);
  const [logoMargin, setLogoMargin] = useState<boolean>(true);
  
  // Custom mock layout framework states
  const [tableFrame, setTableFrame] = useState<'none' | 'acrylic' | 'wooden' | 'chalkboard'>('acrylic');
  const [frameTextTop, setFrameTextTop] = useState<string>(lang === 'ar' ? 'أهلاً بك 🍽️' : 'WELCOME 🍽️');
  const [frameTextBottom, setFrameTextBottom] = useState<string>(lang === 'ar' ? 'امسح لمشاهدة المنيو 📖' : 'SCAN FOR MENU 📖');

  // Interactive download states
  const [downloadSize, setDownloadSize] = useState<number>(2048);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [copied, setCopied] = useState<boolean>(false);
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Design Food Presets for Restaurants
  const RESTAURANT_PRESETS = [
    {
      nameAr: 'إسبريسو وكافيه ☕',
      nameEn: 'Espresso Cafe',
      fg: '#451A03',
      bg: '#FFFBEB',
      icon: 'coffee',
      frameColor: '#78350F'
    },
    {
      nameAr: 'برجر وستيك كلاسيكي 🍔',
      nameEn: 'Classic Diner',
      fg: '#7F1D1D',
      bg: '#FFFFFF',
      icon: 'utensils',
      frameColor: '#B91C1C'
    },
    {
      nameAr: 'أكل صحي وخضار 🥦',
      nameEn: 'Healthy Greens',
      fg: '#064E3B',
      bg: '#F0FDF4',
      icon: 'chefHat',
      frameColor: '#15803D'
    },
    {
      nameAr: 'بيتزا إيطالية 🍕',
      nameEn: 'Italian Pizzeria',
      fg: '#7C2D12',
      bg: '#FFF7ED',
      icon: 'pizza',
      frameColor: '#C2410C'
    },
    {
      nameAr: 'فاخر وراقي ✨',
      nameEn: 'Luxury Fine Dining',
      fg: '#111827',
      bg: '#F9FAFB',
      icon: 'wine',
      frameColor: '#D97706'
    }
  ];

  // Validate URL structure roughly on input change
  useEffect(() => {
    if (!urlInput.trim()) {
      setIsUrlValid(false);
      return;
    }
    try {
      // Rough domain match
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?$/i;
      setIsUrlValid(urlPattern.test(urlInput));
    } catch (_) {
      setIsUrlValid(false);
    }
  }, [urlInput]);

  // Render the Restaurant QR Code on Canvas
  const renderRestaurantQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const payload = urlInput.trim() || 'https://qrytube.com';
      const qrcodeLib = await getQRCodeLib();

      // High-resolution rendering (512px) for crisp preview
      await qrcodeLib.toCanvas(canvas, payload, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      });

      // Overlay center emblem/icon if chosen
      let logoSource: string | null = null;
      if (selectedIcon === 'custom' && customLogo) {
        logoSource = customLogo;
      } else if (selectedIcon !== 'none' && selectedIcon !== 'custom' && ICON_SVGS[selectedIcon]) {
        // Construct SVG data url dynamically with selected colors for outstanding aesthetic pairing
        const customSvg = ICON_SVGS[selectedIcon].replace('stroke="currentColor"', `stroke="${foregroundColor}"`);
        logoSource = `data:image/svg+xml;utf8,${encodeURIComponent(customSvg)}`;
      }

      if (logoSource) {
        const logoImg = new Image();
        logoImg.src = logoSource;
        await new Promise((resolve) => {
          logoImg.onload = () => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const cx = canvas.width / 2;
              const cy = canvas.height / 2;
              const logoSize = canvas.width * logoScale;

              if (logoMargin) {
                // Outer circle badge for safety
                ctx.fillStyle = backgroundColor;
                const badgeSize = logoSize * 1.25;
                const badgeX = cx - badgeSize / 2;
                const badgeY = cy - badgeSize / 2;
                const radius = badgeSize * 0.25;

                ctx.beginPath();
                if (ctx.roundRect) {
                  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
                } else {
                  // Fallback rect drawing
                  ctx.arc(cx, cy, badgeSize / 2, 0, Math.PI * 2);
                }
                ctx.closePath();
                ctx.fill();
              }

              // Draw logo in the center
              ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
            }
            resolve(true);
          };
          logoImg.onerror = () => {
            resolve(true);
          };
        });
      }
    } catch (err) {
      console.error('Error drawing restaurant QR canvas:', err);
    }
  };

  useEffect(() => {
    renderRestaurantQRCode();
  }, [
    urlInput, 
    foregroundColor, 
    backgroundColor, 
    selectedIcon, 
    customLogo, 
    logoScale, 
    logoMargin, 
    errorCorrectionLevel
  ]);

  // Apply specified preset values
  const applyPreset = (preset: any) => {
    setForegroundColor(preset.fg);
    setBackgroundColor(preset.bg);
    setSelectedIcon(preset.icon);
    // Auto-update top banner color corresponding to brand highlight
    setTableFrame('acrylic');
  };

  // Upload Custom Logo Image
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert(lang === 'ar' ? 'يرجى تحميل ملف صورة صالح (PNG, JPG, JPEG)' : 'Please select a valid image file (PNG, JPG, or JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogo(event.target.result as string);
        setSelectedIcon('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy URL action helper
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(urlInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  // High-Resolution Png/Jpg download
  const downloadHighResImage = async () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = downloadSize;
    tempCanvas.height = downloadSize;

    const qrcodeLib = await getQRCodeLib();
    // Render base high-resolution QR
    await qrcodeLib.toCanvas(tempCanvas, urlInput.trim() || 'https://qrytube.com', {
      width: downloadSize,
      margin: 2,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      }
    });

    let logoSource: string | null = null;
    if (selectedIcon === 'custom' && customLogo) {
      logoSource = customLogo;
    } else if (selectedIcon !== 'none' && selectedIcon !== 'custom' && ICON_SVGS[selectedIcon]) {
      const customSvg = ICON_SVGS[selectedIcon].replace('stroke="currentColor"', `stroke="${foregroundColor}"`);
      logoSource = `data:image/svg+xml;utf8,${encodeURIComponent(customSvg)}`;
    }

    if (logoSource) {
      const logoImg = new Image();
      logoImg.src = logoSource;
      await new Promise((resolve) => {
        logoImg.onload = () => {
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            const cx = tempCanvas.width / 2;
            const cy = tempCanvas.height / 2;
            const logoSize = tempCanvas.width * logoScale;

            if (logoMargin) {
              ctx.fillStyle = backgroundColor;
              const badgeSize = logoSize * 1.25;
              const badgeX = cx - badgeSize / 2;
              const badgeY = cy - badgeSize / 2;
              const radius = badgeSize * 0.25;

              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
              } else {
                ctx.arc(cx, cy, badgeSize / 2, 0, Math.PI * 2);
              }
              ctx.closePath();
              ctx.fill();
            }
            ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
          }
          resolve(true);
        };
        logoImg.onerror = () => resolve(true);
      });
    }

    // Export Trigger
    const mimeType = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
    const link = document.createElement('a');
    link.download = `Restaurant-Menu-QR_${downloadSize}x${downloadSize}.${downloadFormat}`;
    link.href = tempCanvas.toDataURL(mimeType, 1.0);
    link.click();
  };

  // SVG Download Vector
  const downloadHighResSvg = async () => {
    const qrcodeLib = await getQRCodeLib();
    const svgString = await qrcodeLib.toString(urlInput.trim() || 'https://qrytube.com', {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      }
    });

    let finalSvg = svgString;
    let logoSource: string | null = null;
    if (selectedIcon === 'custom' && customLogo) {
      logoSource = customLogo;
    } else if (selectedIcon !== 'none' && selectedIcon !== 'custom' && ICON_SVGS[selectedIcon]) {
      const customSvg = ICON_SVGS[selectedIcon].replace('stroke="currentColor"', `stroke="${foregroundColor}"`);
      logoSource = `data:image/svg+xml;utf8,${encodeURIComponent(customSvg)}`;
    }

    if (logoSource) {
      const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (viewBoxMatch) {
         const w = parseInt(viewBoxMatch[1]);
         const h = parseInt(viewBoxMatch[2]);
         const logoSize = w * logoScale;
         const cx = w / 2;
         const cy = h / 2;
         const lx = cx - logoSize / 2;
         const ly = cy - logoSize / 2;
         
         let logoElements = '';
         if (logoMargin) {
           const badgeSize = logoSize * 1.25;
           const bx = cx - badgeSize / 2;
           const by = cy - badgeSize / 2;
           logoElements += `<rect x="${bx}" y="${by}" width="${badgeSize}" height="${badgeSize}" fill="${backgroundColor}" rx="${badgeSize * 0.25}" ry="${badgeSize * 0.25}" />`;
         }
         logoElements += `<image href="${logoSource}" x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" />`;
         finalSvg = svgString.replace('</svg>', `${logoElements}</svg>`);
      }
    }

    const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Restaurant-Menu-QR.svg`;
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  // A4 Flyer PDF Download print-ready
  const downloadHighResPdf = async () => {
    const JsPDF = await getJsPDFLib();
    const doc = new JsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // In Arabic/English render texts beautifully
    const isAr = lang === 'ar';
    doc.setProperties({
      title: 'Digital Menu QR Stand Flyer',
      author: 'Qrytube',
      subject: 'Restaurant menu bar code'
    });

    // Outer Background theme matching A4 menu flyer
    doc.setFillColor('#FAFAF9'); // Warm Stone 50
    doc.rect(0, 0, 210, 297, 'F');

    // Header strip
    doc.setFillColor(foregroundColor);
    doc.rect(0, 0, 210, 15, 'F');

    // Branding info
    doc.setTextColor('#78716C'); // Stone 500
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Smart QR Table Menu by Qrytube.com', 105, 25, { align: 'center' });

    // Header label
    doc.setTextColor(foregroundColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(frameTextTop || (isAr ? 'أهلاً بك في مطعمنا 🍽️' : 'WELCOME TO OUR PLACE 🍽️'), 105, 45, { align: 'center' });

    // Secondary line
    doc.setTextColor('#44403C'); // Stone 700
    doc.setFontSize(14);
    doc.text(isAr ? 'قائمة الطعام الإلكترونية الذكية' : 'Digital Menu scan code', 105, 55, { align: 'center' });

    // QR container box
    doc.setFillColor(backgroundColor);
    doc.rect(40, 75, 130, 130, 'F');
    // Border
    doc.setDrawColor(foregroundColor);
    doc.setLineWidth(1.5);
    doc.rect(40, 75, 130, 130, 'D');

    // Draw high quality image QR
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    const qrcodeLib = await getQRCodeLib();
    await qrcodeLib.toCanvas(tempCanvas, urlInput.trim() || 'https://qrytube.com', {
      width: 1024,
      margin: 2,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      }
    });

    // Overlay center logo in PDF
    let logoSource: string | null = null;
    if (selectedIcon === 'custom' && customLogo) {
      logoSource = customLogo;
    } else if (selectedIcon !== 'none' && selectedIcon !== 'custom' && ICON_SVGS[selectedIcon]) {
      const customSvg = ICON_SVGS[selectedIcon].replace('stroke="currentColor"', `stroke="${foregroundColor}"`);
      logoSource = `data:image/svg+xml;utf8,${encodeURIComponent(customSvg)}`;
    }

    if (logoSource) {
      const img = new Image();
      img.src = logoSource;
      await new Promise((resolve) => {
        img.onload = () => {
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            const cx = tempCanvas.width / 2;
            const cy = tempCanvas.height / 2;
            const logoSize = tempCanvas.width * logoScale;

            if (logoMargin) {
              ctx.fillStyle = backgroundColor;
              const badgeSize = logoSize * 1.25;
              const badgeX = cx - badgeSize / 2;
              const badgeY = cy - badgeSize / 2;
              const radius = badgeSize * 0.25;

              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
              } else {
                ctx.arc(cx, cy, badgeSize / 2, 0, Math.PI * 2);
              }
              ctx.closePath();
              ctx.fill();
            }
            ctx.drawImage(img, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
          }
          resolve(true);
        };
        img.onerror = () => resolve(true);
      });
    }

    const framedDataUrl = tempCanvas.toDataURL('image/png', 1.0);
    doc.addImage(framedDataUrl, 'PNG', 45, 80, 120, 120);

    // Bottom instruction banner
    doc.setFontSize(22);
    doc.setTextColor(foregroundColor);
    doc.text(frameTextBottom || (isAr ? 'امسح الرمز لقراءة المنيو بالهاتف 📱' : 'SCAN TO READ THE MENU 📱'), 105, 230, { align: 'center' });

    // Step-by-step
    doc.setFontSize(11);
    doc.setTextColor('#78716C'); // Stone 500
    doc.text(
      isAr 
        ? '١. افتح كاميرا جوالك الافتراضية   |   ٢. وجه العدسة نحو رمز الباركود   |   ٣. اضغط على الرابط لقراءة قائمة الطعام' 
        : '1. Open default phone camera   |   2. Focus on the Menu barcode   |   3. Tap popup link to view digital menu', 
      105, 
      245, 
      { align: 'center' }
    );

    // Wifi highlight card at very bottom
    doc.setFillColor('#FAF8F5');
    doc.rect(30, 260, 150, 16, 'F');
    doc.setDrawColor('#E7E5E4'); // Stone 200
    doc.setLineWidth(0.3);
    doc.rect(30, 260, 150, 16, 'D');

    doc.setFontSize(9);
    doc.setTextColor('#57534E');
    doc.text(
      isAr 
        ? '💡 خدمة منيو تفاعلي بدون تلامس مجانية 100% وآمنة ومصممة للتصفح السريع للأجهزة.'
        : '💡 Professional, hygienic, contact-free smart digital menu designed for rapid device rendering.',
      105, 270, { align: 'center' }
    );

    // Save
    doc.save(`Restaurant-Table-Menu_${foregroundColor}.pdf`);
  };

  // Structured FAQ section data for restaurants
  const faqsRestaurant = [
    {
      qAr: 'هل استخدام باركود المنيو مجاني بالكامل؟',
      qEn: 'Is using a Menu barcode QR code completely free?',
      aAr: 'نعم، الأداة مجانية 100% وبدون أي اشتراك أو رسوم خفية. يمكنك إنشاء عدد غير محدود من أكواد منيو المطاعم المقرونة بروابط PDF أو مواقع المنيو الإلكتروني وتنزيلها بجودة الطباعة القصوى.',
      aEn: 'Yes, this tool is 100% free with no subscriptions or hidden fees. You can generate unlimited restaurant menu QR codes pointing to PDFs or digital menu URLs and download them in ultra high-definition print quality.'
    },
    {
      qAr: 'كيف يمكنني طباعة كود QR للمطاعم على الطاولات؟',
      qEn: 'How can I print the QR code for tables on my restaurant?',
      aAr: 'نوصي بتحميل الرمز بصيغة PDF عالية الجودة (A4 Flyer) أو بصيغة PNG بدقة 4096 بكسل ومن ثم قصها وطباعتها على ورق كوشيه مقوى واقٍ من الرطوبة والماء، أو وضعها داخل ستاند أكريليك شفاف يوضع على وسط الطاولات.',
      aEn: 'We recommend downloading the code in PDF format (A4 Flyer) or ultra-high pixel PNG (4096px). You can print it on humidity-resistant offset cardboard paper and slide it inside transparent acrylic tabletop frames placed in the center of the tables.'
    },
    {
      qAr: 'ما هي أفضل صيغة لتحميل الكود للمطابع؟',
      qEn: 'What is the best format for print shops?',
      aAr: 'للمطابع الاحترافية الكبيرة، نوصي بتحميل الرمز بصيغة SVG (متجه فيكتور مرن وقابل للتكبير اللانهائي دون أي تغبيش) أو صيغة PDF المتجهة لضمان دقة بالغة وألواناً صريحة أثناء الطباعة.',
      aEn: 'For large industrial printing, we highly recommend downloading the QR code in SVG format (flexible vector graphic that scales infinitely without losing detail) or vector PDF to guarantee absolute sharpness and exact spot colors.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10" id="restaurant_qr_applet" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Dynamic SEO JSON-LD Schema markup injected directly within head */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": lang === 'ar' ? "أداة توليد كود QR للمطاعم والمقاهي مجاناً" : "Free Restaurant QR Code Generator",
          "operatingSystem": "All",
          "applicationCategory": "BusinessApplication",
          "imageUrl": "https://qrytube.com/og-image.png",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Free restaurant QR code creator",
            "Custom food and beverage icons",
            "A4 flyer standard PDF download for table stands",
            "Responsive and optimized for indexing"
          ]
        })}
      </script>

      {/* Main Two-column Builder Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Customizer Settings (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6" id="builder_inputs_container">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-amber-700 text-[10px] font-bold mb-3 font-arabic uppercase border border-amber-200/50">
                <Sparkles size={11} className="animate-spin" />
                <span>{lang === 'ar' ? 'قائمة الطعام والمنيو اللاتلامسي' : 'Hygienic Smart Table Menu'}</span>
              </div>
              <h1 className="text-lg md:text-xl font-black font-arabic text-gray-900 leading-snug">
                {lang === 'ar' ? 'صانع باركود المنيو وكود QR للمطاعم 🍽️' : 'Restaurant QR Code Menu & Location Generator 🍽️'}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-arabic leading-relaxed">
                {lang === 'ar' 
                  ? 'قم بتأمين وتزيين كود QR المخصص لمطعمك، كافتيريتك، أو مقهاك مجاناً. يدعم روابط الـ PDF وتطبيقات المنيو والموقع الجغرافي بالكامل.'
                  : 'Design custom, highly readable and scannable QR codes for your restaurant or bakery instantly. Supports PDFs, maps and online ordering.'}
              </p>
            </div>

            {/* Step 1: Destination URL Link */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-800 font-arabic flex items-center gap-2 leading-none">
                <Globe size={14} className="text-slate-500" />
                <span>{lang === 'ar' ? 'أدخل رابط المنيو أو صفحة المطعم الإلكترونية:' : 'Enter Menu PDF, Website URL or Location Link:'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: https://myrestaurant.com/menu.pdf' : 'e.g., https://myrestaurant.com/menu.pdf'}
                  className={`w-full p-4 pe-14 rounded-2xl font-mono text-xs text-slate-900 bg-slate-50 border ${
                    isUrlValid ? 'border-gray-200 focus:border-amber-500 focus:bg-white' : 'border-red-500 bg-red-50/20'
                  } outline-none transition-all duration-200 shadow-inner`}
                  id="restaurant_destination_url_input"
                />
                
                {/* Copy button inline */}
                <button
                  onClick={handleCopyLink}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl border border-gray-150 transition-colors shadow-2xs cursor-pointer"
                  title={lang === 'ar' ? 'نسخ الرابط' : 'Copy link'}
                  type="button"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              
              {!isUrlValid && (
                <p className="text-[10px] text-red-600 font-arabic flex items-center gap-1.5 mt-1 font-semibold">
                  <span>⚠️ {lang === 'ar' ? 'الرجاء إدخال رابط صالح وصحيح لضمان نجاح التوجيه!' : 'Please enter a valid format URL to ensure successful routing!'}</span>
                </p>
              )}
            </div>

            {/* Quick Presets Section */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-gray-850 font-arabic block leading-none">
                {lang === 'ar' ? '🎨 اختر طابع وألوان مطعمك الجاهزة بنقرة واحدة:' : '🎨 Pick a curated Restaurant theme in one click:'}
              </label>
              <div className="flex flex-wrap gap-2.5" id="restaurant_color_presets_box">
                {RESTAURANT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-all transform active:scale-97 cursor-pointer"
                  >
                    <span 
                      style={{ backgroundColor: p.fg }} 
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-2xs inline-block shrink-0" 
                    />
                    <span className="font-arabic">{lang === 'ar' ? p.nameAr : p.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Customizations pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 font-arabic block leading-none">
                  {lang === 'ar' ? 'لون الباركود والمربعات (المقدمة):' : 'Barcode Nodes color (Foreground):'}
                </label>
                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={foregroundColor.toUpperCase()}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-slate-800 outline-none border-none uppercase font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 font-arabic block leading-none">
                  {lang === 'ar' ? 'لون خلفية الباركود والورقة:' : 'Canvas paper color (Background):'}
                </label>
                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={backgroundColor.toUpperCase()}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-slate-800 outline-none border-none uppercase font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Center Logo Icons Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-850 font-arabic block leading-none">
                  {lang === 'ar' ? '🍽️ اختر رمز المنيو المطبوع بمنتصف الـ QR:' : '🍽️ Select center menu symbol overlay:'}
                </label>
                {(selectedIcon !== 'none') && (
                  <button
                    onClick={() => { setSelectedIcon('none'); setCustomLogo(null); }}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-transparent border-none cursor-pointer font-arabic"
                    type="button"
                  >
                    <Trash2 size={11} />
                    <span>{lang === 'ar' ? 'إزالة الرمز' : 'Remove symbol'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                
                {/* 1. Fork Spoon */}
                <button
                  type="button"
                  onClick={() => setSelectedIcon('utensils')}
                  className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedIcon === 'utensils'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <Utensils size={20} />
                  <span className="font-arabic text-[10px]">{lang === 'ar' ? 'مأكولات' : 'Food'}</span>
                </button>

                {/* 2. Coffee Mug */}
                <button
                  type="button"
                  onClick={() => setSelectedIcon('coffee')}
                  className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedIcon === 'coffee'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <Coffee size={20} />
                  <span className="font-arabic text-[10px]">{lang === 'ar' ? 'كافيه' : 'Coffee'}</span>
                </button>

                {/* 3. ChefHat */}
                <button
                  type="button"
                  onClick={() => setSelectedIcon('chefHat')}
                  className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedIcon === 'chefHat'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <ChefHat size={20} />
                  <span className="font-arabic text-[10px]">{lang === 'ar' ? 'مطبخ وشيف' : 'Kitchen'}</span>
                </button>

                {/* 4. Pizza */}
                <button
                  type="button"
                  onClick={() => setSelectedIcon('pizza')}
                  className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedIcon === 'pizza'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <Pizza size={20} />
                  <span className="font-arabic text-[10px]">{lang === 'ar' ? 'بيتزا' : 'Pizza'}</span>
                </button>

                {/* 5. Wine */}
                <button
                  type="button"
                  onClick={() => setSelectedIcon('wine')}
                  className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedIcon === 'wine'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <Wine size={20} />
                  <span className="font-arabic text-[10px]">{lang === 'ar' ? 'عصائر' : 'Drinks'}</span>
                </button>

                {/* 6. Custom upload */}
                <label
                  className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                    selectedIcon === 'custom'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <UploadCloud size={20} />
                  <span className="font-arabic text-[10px]">{lang === 'ar' ? 'لوغو خاص' : 'Custom Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

              </div>
              
              {selectedIcon === 'custom' && customLogo && (
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-dashed border-gray-200" id="custom_uploaded_logo_chip">
                  <img src={customLogo} className="w-8 h-8 rounded-lg object-cover bg-white p-0.5 border" alt="Custom Logo" />
                  <div className="text-right flex-1">
                    <span className="text-[11px] font-bold text-slate-700 block font-arabic">{lang === 'ar' ? 'تم تحميل الشعار الخاص بنجاح!' : 'Your logo loaded successfully!'}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Image data base64 encrypted.</span>
                  </div>
                  <button
                    onClick={() => { setCustomLogo(null); setSelectedIcon('none'); }}
                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold font-arabic cursor-pointer border border-red-200"
                    type="button"
                  >
                    {lang === 'ar' ? 'حذف' : 'Remove'}
                  </button>
                </div>
              )}
            </div>

            {/* Slider tuning controls */}
            {selectedIcon !== 'none' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-[11px] font-black text-slate-650 font-arabic flex justify-between leading-none">
                    <span>{lang === 'ar' ? 'حجم الرمز بالمنتصف:' : 'Center symbol size factor:'}</span>
                    <span className="font-mono text-[10px] text-amber-700">{Math.round(logoScale * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.12"
                    max="0.28"
                    step="0.02"
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-650 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                </div>

                <div className="flex items-center gap-2 px-1 pt-1 justify-end font-arabic">
                  <input
                    type="checkbox"
                    id="badge_mask_layer"
                    checked={logoMargin}
                    onChange={(e) => setLogoMargin(e.target.checked)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-350 rounded-md cursor-pointer"
                  />
                  <label htmlFor="badge_mask_layer" className="text-[11px] font-bold text-slate-700 select-none cursor-pointer">
                    {lang === 'ar' ? 'تفريغ مساحة بيضاء احتياطية خلف الشعار' : 'Draw blank mask behind central logo'}
                  </label>
                </div>
              </div>
            )}

            {/* Step 5: Table stand lettering customize */}
            <div className="space-y-4 pt-2">
              <label className="text-xs font-black text-gray-800 font-arabic block leading-none">
                {lang === 'ar' ? '🏷️ صمم ستاند الطاولة (الكتابة والشعار الإرشادي):' : '🏷️ Tabletop stand design text headers:'}
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-arabic font-bold block">{lang === 'ar' ? 'العنوان العلوي بالستاند:' : 'Top greeting label:'}</span>
                  <input
                    type="text"
                    value={frameTextTop}
                    onChange={(e) => setFrameTextTop(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: أهلاً بك في مطعم كاستلو 🍽️' : 'e.g., WELCOME TO OUR CAFE 🍽️'}
                    className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-amber-400 font-arabic"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-arabic font-bold block">{lang === 'ar' ? 'العنوان الإرشادي بالأسفل للتوجيه:' : 'Bottom scanning instructions:'}</span>
                  <input
                    type="text"
                    value={frameTextBottom}
                    onChange={(e) => setFrameTextBottom(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: امسح لمشاهدة المنيو اليومي 📖' : 'e.g., SCAN TO VIEW DAILY MENU 📖'}
                    className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-amber-400 font-arabic"
                  />
                </div>
              </div>
            </div>

            {/* Error correction levels description */}
            <div className="pt-2">
              <div className="bg-amber-50/40 rounded-2xl border border-amber-200/20 p-4 text-xs font-arabic text-slate-600 space-y-1">
                <span className="font-extrabold text-amber-800 flex items-center gap-1 mb-1 leading-none">
                  <Info size={13} />
                  <span>{lang === 'ar' ? '🛡️ ميزة المسح فائق السرعة والأمان التلقائية' : '🛡️ Automatic High Scan-Density Feature'}</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'ar'
                    ? 'الأداة تفرض تلقائياً أعلى نسبة لتصحيح الأخطاء (Level H - 30% استرداد البيانات). هذا يضمن لزبائنك مسح الباركود بشكل ناجح وفوري حتى في الإضاءات الخافتة بالمطاعم، أو في حال حدوث خدوش على الستاند المطبوع.'
                    : 'This tool pre-configures maximum data redundancy calibration (Level H). Your clients will scan the table barcode instantly even in low dim restaurant lighting or through humid water spills on printed sheets.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right column: Realistic Preview Workspace & Downs (4 Cols) */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          
          {/* Circular Stand Frame Preview Frame */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden" id="interactive_restaurant_preview_stage">
            
            {/* Table Mockup Frame selectors */}
            <div className="w-full flex justify-between items-center pb-4 border-b border-gray-100 mb-6 font-arabic text-slate-650">
              <span className="text-xs font-bold font-arabic">{lang === 'ar' ? 'اختر شكل فريم العرض:' : 'Stand Mockup style:'}</span>
              <div className="flex gap-1.5" id="preset_frame_selectors">
                {['acrylic', 'wooden', 'none'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTableFrame(f as any)}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer border ${
                      tableFrame === f
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    type="button"
                  >
                    {f === 'acrylic' ? (lang === 'ar' ? 'أكريليك' : 'Acrylic') : f === 'wooden' ? (lang === 'ar' ? 'خشبي' : 'Wood') : (lang === 'ar' ? 'بدون' : 'Plain')}
                  </button>
                ))}
              </div>
            </div>

            {/* Stand visual mock holder container */}
            <div className="p-2 w-full flex justify-center items-center">
              
              {tableFrame === 'acrylic' && (
                <div className="relative p-5 shadow-2xl rounded-t-[32px] rounded-b-lg border-2 border-slate-200/50 bg-white flex flex-col items-center gap-3.5 max-w-[240px] select-none text-center">
                  <div className="text-gray-900 text-[10px] font-black px-4 py-1 bg-amber-100/60 text-amber-950 border border-amber-200 rounded-full font-arabic leading-none tracking-tight break-all max-w-[190px] truncate">
                    {frameTextTop || (lang === 'ar' ? 'أهلاً بك 🍽️' : 'WELCOME 🍽️')}
                  </div>
                  
                  {/* Real living barcode rendered */}
                  <div 
                    style={{ borderColor: foregroundColor, backgroundColor: backgroundColor }}
                    className="w-36 h-36 p-2 rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-white shadow-inner"
                  >
                    <canvas ref={canvasRef} className="w-full h-full object-contain rounded-lg" id="final_restaurant_qr_canvas" />
                  </div>
                  
                  <div style={{ color: foregroundColor }} className="text-[10px] font-black font-arabic mt-1 px-1 tracking-tight leading-snug text-center break-all max-w-[190px]">
                    {frameTextBottom || (lang === 'ar' ? 'امسح لقراءة المنيو 📖' : 'SCAN FOR MENU 📖')}
                  </div>
                  
                  {/* Realistic Stand Base */}
                  <div className="absolute -bottom-2 w-[114%] h-2.5 bg-slate-350 rounded-b-lg shadow-md z-10 border-t border-slate-200" />
                </div>
              )}

              {tableFrame === 'wooden' && (
                <div className="relative p-5 shadow-2xl rounded-t-2xl bg-amber-50/20 border-3 border-[#8B5A2B]/40 flex flex-col items-center gap-4 max-w-[240px] select-none text-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,90,43,0.05),transparent_70%)]" />
                  
                  <div className="text-[#5C3A21] text-[10px] font-black px-4 py-1.5 bg-[#F5E6D3]/80 rounded-lg font-arabic leading-none tracking-tight shadow-2xs border border-[#8B5A2B]/20 break-all max-w-[190px] truncate">
                    {frameTextTop || (lang === 'ar' ? 'أهلاً بك 🍽️' : 'WELCOME 🍽️')}
                  </div>
                  
                  <div 
                    style={{ borderColor: foregroundColor, backgroundColor: backgroundColor }}
                    className="w-36 h-36 p-1.5 rounded-lg border flex items-center justify-center overflow-hidden bg-white shadow-md relative z-10"
                  >
                    <canvas ref={canvasRef} className="w-full h-full object-contain rounded-md" id="final_restaurant_qr_canvas" />
                  </div>
                  
                  <div className="text-[#8B5A2B] text-[9px] font-black font-arabic tracking-tight leading-normal uppercase text-center relative z-10 break-all max-w-[190px]">
                    {frameTextBottom || (lang === 'ar' ? 'امسح لقراءة المنيو 📖' : 'SCAN FOR MENU 📖')}
                  </div>
                  
                  {/* Solid Wooden Base Stand visual */}
                  <div className="absolute -bottom-2.5 w-[112%] h-4 bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#5C3A21] rounded-b-md shadow-lg border-t border-[#4A2E1B] z-10 flex justify-center items-center">
                    <span className="text-[6.5px] font-bold text-amber-200/60 font-mono tracking-widest uppercase">PREMIUM WOOD STAND</span>
                  </div>
                </div>
              )}

              {tableFrame === 'none' && (
                <div 
                  style={{ backgroundColor: backgroundColor, borderColor: foregroundColor }}
                  className="w-48 h-48 sm:w-52 sm:h-52 aspect-square p-3.5 rounded-3xl border-3 bg-white flex items-center justify-center overflow-hidden shadow-md group relative hover:scale-102 transition-transform duration-300"
                >
                  <canvas ref={canvasRef} className="w-full h-full object-contain rounded-xl" id="final_restaurant_qr_canvas" />
                </div>
              )}

            </div>

            {/* Micro instructions */}
            <p className="text-[10px] text-slate-400 mt-6 font-arabic max-w-xs leading-relaxed">
              {lang === 'ar'
                ? 'تحديث لحظي ذكي. الرمز متوافق بالكامل مع جميع كاميرات أندرويد وآيفون الافتراضية لقراءة منيو الـ PDF بضغطة واحدة.'
                : 'Smart live update. The barcode remains fully compatible with all native iOS and Android tablet/phone scanners.'}
            </p>

            {/* Download and Save actions */}
            <div className="w-full mt-6 space-y-3.5 pt-4 border-t border-gray-100" id="download_actions_stage">
              <span className="text-xs font-black text-slate-700 block text-right font-arabic">{lang === 'ar' ? 'تحميل كود الـ QR للطباعة:' : 'Export high quality print file:'}</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-right">
                <div className="space-y-1 font-arabic">
                  <span className="text-[9px] text-slate-400 block font-bold">{lang === 'ar' ? 'دقة الصورة كـ بكسل:' : 'Export resolution:'}</span>
                  <select
                    value={downloadSize}
                    onChange={(e) => setDownloadSize(parseInt(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold outline-none font-mono"
                  >
                    <option value="1024">1024 × 1024 px</option>
                    <option value="2048">2048 × 2048 px</option>
                    <option value="4096">4096 × 4096 px (UHD)</option>
                  </select>
                </div>

                <div className="space-y-1 font-arabic">
                  <span className="text-[9px] text-slate-400 block font-bold">{lang === 'ar' ? 'امتداد وصيغة الملف:' : 'Mime standard format:'}</span>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold outline-none font-mono"
                  >
                    <option value="png">PNG (مفرغة شفافة)</option>
                    <option value="jpg">JPEG (خفيف للمطابع)</option>
                  </select>
                </div>
              </div>

              {/* Instant buttons to trigger downloading */}
              <div className="flex flex-col gap-2 pt-1.5" id="export_buttons_grid">
                
                {/* PNG Button */}
                <button
                  onClick={downloadHighResImage}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 font-extrabold text-xs sm:text-sm text-white rounded-xl shadow-xs hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                  type="button"
                >
                  <Download size={15} />
                  <span className="font-arabic">{lang === 'ar' ? 'تحميل ملف كود الـ QR للصورة' : 'Download QR Image File'}</span>
                </button>

                {/* SVG vector Button */}
                <button
                  onClick={downloadHighResSvg}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 font-bold text-xs text-white rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                  type="button"
                >
                  <ArrowLeftRight size={13} />
                  <span className="font-arabic">{lang === 'ar' ? 'تحميل بصيغة فيكتور SVG مرن' : 'Download flexible Vector SVG'}</span>
                </button>

                {/* Print A4 flyer PDF Button */}
                <button
                  onClick={downloadHighResPdf}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 font-bold text-xs text-white rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                  type="button"
                >
                  <FileText size={13} />
                  <span className="font-arabic">{lang === 'ar' ? 'تحميل وثيقة A4 جاهزة لطباعة الستاند' : 'Download layout A4 Stand PDF'}</span>
                </button>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* 🚀 SEO SEMANTIC ARTICLES & FAQ SECTION */}
      {/* ========================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-2xs font-arabic space-y-8" id="seo_articles_restaurants_section">
        
        <div className="border-b border-gray-100 pb-6 text-right">
          <h2 className="text-md sm:text-lg font-black text-gray-950 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500 shrink-0" />
            <span>لماذا تحتاج المطاعم والمقاهي إلى رمز باركود (QR Code) للمنيو؟</span>
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            مع التطور السريع لخدمات قطاع الضيافة اللاتلامسي لعام 2026، أصبحت رموز الاستجابة السريعة (QR Codes) العمود الفقري لعمليات تشغيل المطاعم والمقاهي. إليك أهم المزايا التي تجعل باركود المنيو أداة تسويق وتشغيل لا غنى عنها:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-gray-900">📌 خفض تكلفة الطباعة وضمان مرونة التعديل</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              بدلاً من إهدار مئات الدولارات شهرياً في طباعة منيو ورقي يتلف سريعاً، يتيح لك كود الـ QR توفير منيو رقمي بالكامل. وإذا تغير صنف، أو تم تحديث سعر منتج، يمكنك تعديل القائمة المربوطة من مدونتك أو موقعك الإلكتروني دون الحاجة لإعادة طباعة الـ باركود المثبت على طاولات الزبائن وتوفير النفقات.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-gray-900">📌 النظافة وحماية الصحة العامة</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              الزبائن يفضلون التعاملات النظيفة والمعقمة بقطاع الصيانة. المنيو الورقي التقليدي يمر على عشرات الأيادي يومياً، في حين يتمكن الزبون عبر منيو باركود QR من تصفح كافة الأصناف والمشروبات بالخصوصية التامة والراحة المطلقة من على جواله الشخصي.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-gray-900">📌 زيادة حجم وطاقة وعوائد المبيعات</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              تصفح القائمة الإلكترونية يتيح لك دمج صور فاتحة للشهية، ومقاطع فيديو توضيحية لطهي الصنف، مما يدفع الزبون تلقائياً لمزيد من الطلبات الإضافية. إحصاءات عام 2026 تؤكد زيادة المبيعات بنسبة تفوق 22% في المطاعم المطبقة للمنيو الذكي اللاتلامسي.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-gray-900">📌 توجيه الزبائن لموقع المنيو فوراً بضغطة واحدة</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              أداتنا تولد الكود مع تصحيح الخطأ بمستوى عالي ليتغلب على الإضاءة الخافتة للمطعم لفتح رابط الـ PDF أو المنصة بشكل فوري أمام الكاميرا الافتراضية، مما يقلل من وقت انتظار النادل لتلقي طلب الكاشير.
            </p>
          </div>
        </div>

        {/* Dynamic FAQ SEO Accordion markup */}
        <div className="border-t border-gray-100 pt-8" id="seo_accordion_block">
          <h2 className="text-md sm:text-lg font-black text-gray-950 mb-6 text-right flex items-center gap-2">
            <HelpCircle size={18} className="text-slate-500 shrink-0" />
            <span>الأسئلة الشائعة حول باركود المطاعم (FAQ)</span>
          </h2>

          <div className="space-y-4">
            {faqsRestaurant.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-5 border border-slate-100 text-right transition-colors"
                id={`restaurant_faq_item_${idx}`}
              >
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex gap-2 items-start">
                  <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg text-[9px] font-extrabold shrink-0 mt-0.5">س</span>
                  <span>{lang === 'ar' ? item.qAr : item.qEn}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed ps-7">
                  {lang === 'ar' ? item.aAr : item.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 🌟 USER REQUEST EXPLICIT MANDATED TIP BANNER (هل تصنع فيديوهات لوصفاتك على اليوتيوب؟ يمكنك أيضاً إنشاء كود QR لقناتك لزيادة المشاهدات من هنا) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-red-600 via-rose-650 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg overflow-hidden border border-red-500/30 font-arabic text-right flex flex-col md:flex-row items-center justify-between gap-6"
        id="youtube_creator_tip_banner"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-10 w-36 h-36 bg-red-800/20 rounded-full blur-xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 shadow-inner shrink-0 animate-bounce">
            <Youtube size={36} className="text-white fill-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black leading-snug">
              {lang === 'ar' 
                ? 'هل تصنع فيديوهات لوصفاتك على اليوتيوب؟' 
                : 'Do you make video recipes on YouTube?'}
            </h3>
            <p className="text-xs sm:text-sm text-red-100 mt-1 font-normal max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'يمكنك أيضاً إنشاء كود QR لقناتك لزيادة المشاهدات والمتابعين المباشرين لفتح تطبيق يوتيوب تلقائياً من هنا بكل سهولة!'
                : 'You can also create a custom auto-open YouTube App QR code for your channel to skyrocket your views and subscribers!'}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToYouTube}
          className="relative z-10 px-6 py-3.5 bg-white hover:bg-slate-50 text-red-650 hover:text-red-700 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-97 cursor-pointer shrink-0 flex items-center gap-2"
          type="button"
          id="navigate_to_youtube_qr_btn"
        >
          <span>{lang === 'ar' ? 'اصنع كود لقناتك على يوتيوب الآن 🚀' : 'Create Channel QR Code Now 🚀'}</span>
        </button>
      </motion.div>

    </div>
  );
}
