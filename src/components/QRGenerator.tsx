/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
let _cachedQRCode: any = null;
const getQRCodeLib = async () => {
  if (!_cachedQRCode) {
    const mod = await import('qrcode');
    _cachedQRCode = mod.default || mod;
  }
  return _cachedQRCode;
};
import { jsPDF } from 'jspdf';
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
  Music,
  UploadCloud,
  Trash2,
  FileText
} from 'lucide-react';
import { QRConfig, QRStyle } from '../types';
import { parseYoutubeUrl, buildDeepLink, convertUrlToDeepLink } from '../utils';
import { translations } from '../translations';

import { motion } from 'motion/react';

// Helper to draw Arabic/English text perfectly on canvas and return image data for PDF
const renderTextToImage = (
  text: string, 
  fontSizeMm: number, 
  options: {
    isBold?: boolean;
    color?: string;
    align?: 'center' | 'left' | 'right';
    maxWidthMm?: number;
    scale?: number;
  } = {}
) => {
  const scale = options.scale || 8; // High multiplier for print quality
  const isBold = options.isBold ?? false;
  const color = options.color || '#1E293B';
  const align = options.align || 'center';
  const maxWidthMm = options.maxWidthMm || 180;
  const maxWidthPx = maxWidthMm * scale;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const fontPx = Math.round(fontSizeMm * scale);
  const fontWeight = isBold ? 'bold' : 'normal';
  const fontStyle = `${fontWeight} ${fontPx}px "Cairo", "Inter", "Segoe UI", sans-serif`;
  ctx.font = fontStyle;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidthPx && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeightPx = Math.round(fontSizeMm * scale * 1.5);
  const paddingPx = Math.round(fontSizeMm * scale * 0.4);
  const canvasWidth = maxWidthPx;
  const canvasHeight = lines.length * lineHeightPx + paddingPx * 2;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.font = fontStyle;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  const isArabic = /[\u0600-\u06FF]/.test(text);
  if (isArabic) {
    ctx.direction = 'rtl';
  } else {
    ctx.direction = 'ltr';
  }

  lines.forEach((line, index) => {
    const y = paddingPx + index * lineHeightPx + lineHeightPx / 2;
    let x = canvasWidth / 2;
    if (align === 'left') {
      x = isArabic ? canvasWidth - paddingPx : paddingPx;
    } else if (align === 'right') {
      x = isArabic ? paddingPx : canvasWidth - paddingPx;
    }
    
    ctx.textAlign = align;
    ctx.fillText(line, x, y);
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthMm: maxWidthMm,
    heightMm: canvasHeight / scale
  };
};

const COLOR_TEMPLATES = [
  { name: 'يوتيوب الكلاسيكي', dark: '#FF0000', light: '#FFFFFF', eye: '#FF0000' },
  { name: 'الوضع الداكن الفاخر', dark: '#FFFFFF', light: '#0F0F0F', eye: '#FF0000' },
  { name: 'الذهبي الأنيق', dark: '#C5A880', light: '#121212', eye: '#C5A880' },
  { name: 'أسود مونوكروم', dark: '#000000', light: '#FFFFFF', eye: '#000000' },
];

export default function QRGenerator({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const t = translations[lang];

  const getColorTemplateName = (name: string) => {
    switch (name) {
      case 'يوتيوب الكلاسيكي': return t.classicYtTemplate;
      case 'الوضع الداكن الفاخر': return t.luxuryDarkTemplate;
      case 'الذهبي الأنيق': return t.goldTemplate;
      case 'أسود مونوكروم': return t.monochromeTemplate;
      default: return name;
    }
  };

   const [urlInput, setUrlInput] = useState('');
  const [trackingId, setTrackingId] = useState<string>(() => 'qr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4));

  useEffect(() => {
    setTrackingId('qr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4));
  }, [urlInput]);

  const [deepLinkType, setDeepLinkType] = useState<'vnd' | 'ios' | 'android' | 'standard'>('vnd');
  const [useSmartLink, setUseSmartLink] = useState<boolean>(false);
  const [foregroundColor, setForegroundColor] = useState('#FF0000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [eyeColor, setEyeColor] = useState('#FF0000');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [downloadSize, setDownloadSize] = useState<number>(2048);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [copied, setCopied] = useState<boolean>(false);
  const [renderedPayload, setRenderedPayload] = useState<string>('');

  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.18);
  const [logoMargin, setLogoMargin] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // File Upload Handlers for custom central logo
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t.alertUploadType);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomLogo(e.target.result as string);
        // Automatically ensure high quality error correction (H) is selected if safe central logo branding is set
        setErrorCorrectionLevel('H');
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse URL to show useful UI statistics
  const urlInfo = parseYoutubeUrl(urlInput);
  const formattedDeepLink = buildDeepLink(urlInput, deepLinkType);

  const isUrlEmpty = !urlInput.trim();
  const isUrlValid = isUrlEmpty || (urlInfo.isValid && urlInfo.platform !== 'other');
  const isInvalid = !isUrlValid || isUrlEmpty;



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
    const trimmed = urlInput.trim();
    const fallbackUrl = trimmed || 'https://www.youtube.com';
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qrytube.com';
    return `${originUrl}/redirect?url=${encodeURIComponent(fallbackUrl)}&tid=${trackingId}`;
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
      const isUrlEmpty = !urlInput.trim();
      const isUrlValid = isUrlEmpty || (urlInfo.isValid && urlInfo.platform !== 'other');
      const isInvalid = !isUrlValid || isUrlEmpty;

      // Draw base QR Code on high-resolution canvas
      // To get crisp rendering, we draw at 512x512 initially for preview
      const qrOptions = {
        width: 512,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: isInvalid ? '#94A3B8' : foregroundColor,
          light: isInvalid ? '#F8FAFC' : backgroundColor
        }
      };

      const qrcodeLib = await getQRCodeLib();
      await qrcodeLib.toCanvas(canvas, payload, qrOptions);

      // Dynamically overlay uploaded custom logo if set
      if (customLogo) {
        const logoImg = new Image();
        logoImg.src = customLogo;
        await new Promise((resolve) => {
          logoImg.onload = () => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const cx = canvas.width / 2;
              const cy = canvas.height / 2;
              const logoSize = canvas.width * logoScale;

              if (logoMargin) {
                ctx.fillStyle = backgroundColor;
                const badgeSize = logoSize * 1.25;
                const badgeX = cx - badgeSize / 2;
                const badgeY = cy - badgeSize / 2;
                const radius = badgeSize * 0.2;

                ctx.beginPath();
                if (ctx.roundRect) {
                  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
                } else {
                  ctx.moveTo(badgeX + radius, badgeY);
                  ctx.lineTo(badgeX + badgeSize - radius, badgeY);
                  ctx.quadraticCurveTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + radius);
                  ctx.lineTo(badgeX + badgeSize, badgeY + badgeSize - radius);
                  ctx.quadraticCurveTo(badgeX + badgeSize, badgeY + badgeSize, badgeX + badgeSize - radius, badgeY + badgeSize);
                  ctx.lineTo(badgeX + radius, badgeY + badgeSize);
                  ctx.quadraticCurveTo(badgeX, badgeY + badgeSize, badgeX, badgeY + badgeSize - radius);
                  ctx.lineTo(badgeX, badgeY + radius);
                  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
                }
                ctx.closePath();
                ctx.fill();
              }

              ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
            }
            resolve(true);
          };
          logoImg.onerror = () => {
            console.error("Failed to load custom logo in preview render");
            resolve(true);
          };
        });
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
    useSmartLink,
    foregroundColor, 
    backgroundColor, 
    errorCorrectionLevel,
    customLogo,
    logoScale,
    logoMargin
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

      const qrcodeLib = await getQRCodeLib();
      await qrcodeLib.toCanvas(tempCanvas, payload, qrOptions);

      // Draw custom logo onto high-res canvas before generating download URL
      if (customLogo) {
        const logoImg = new Image();
        logoImg.src = customLogo;

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
                const radius = badgeSize * 0.2;

                ctx.beginPath();
                if (ctx.roundRect) {
                  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
                } else {
                  ctx.moveTo(badgeX + radius, badgeY);
                  ctx.lineTo(badgeX + badgeSize - radius, badgeY);
                  ctx.quadraticCurveTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + radius);
                  ctx.lineTo(badgeX + badgeSize, badgeY + badgeSize - radius);
                  ctx.quadraticCurveTo(badgeX + badgeSize, badgeY + badgeSize, badgeX + badgeSize - radius, badgeY + badgeSize);
                  ctx.lineTo(badgeX + radius, badgeY + badgeSize);
                  ctx.quadraticCurveTo(badgeX, badgeY + badgeSize, badgeX, badgeY + badgeSize - radius);
                  ctx.lineTo(badgeX, badgeY + radius);
                  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
                }
                ctx.closePath();
                ctx.fill();
              }

              ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
            }
            resolve(true);
          };
          logoImg.onerror = () => {
            console.error("Failed to load uploaded logo image into download canvas");
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

      const qrcodeLib = await getQRCodeLib();
      // Get pure vector SVG string from qrcode library
      const svgString = await qrcodeLib.toString(payload, {
        type: 'svg',
        ...qrOptions
      });

      let finalSvg = svgString;
      if (customLogo) {
        // Compute standard central position inside SVG viewBox coordinate grid
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
            const radius = badgeSize * 0.2;
            logoElements += `<rect x="${bx}" y="${by}" width="${badgeSize}" height="${badgeSize}" fill="${backgroundColor}" rx="${radius}" ry="${radius}" />`;
          }
          
          // Embed the base64 or custom logo image inside the SVG vector using standard self-contained image tag
          logoElements += `<image href="${customLogo}" x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" />`;
          
          // Insert inside SVG root before closing tag
          finalSvg = svgString.replace('</svg>', `${logoElements}</svg>`);
        }
      }

      const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
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

  // Download high-quality custom vector PDF version of the QR Code
  const handleDownloadPdf = async () => {
    const payload = getActivePayload();
    if (!payload || !urlInput.trim()) {
      alert(t.alertInputFirst);
      return;
    }
    try {
      const qrcodeLib = await getQRCodeLib();
      // Generate the raw QR code matrix
      const qr = qrcodeLib.create(payload, { errorCorrectionLevel });
      const { size } = qr.modules;

      // Initialize the jsPDF document in A4 format (210mm x 297mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set meta headers
      doc.setProperties({
        title: 'Qrytube Smart QR Code',
        subject: 'Vector Deep Link QR Code generated by Qrytube.com',
        author: 'Qrytube',
        creator: 'Qrytube.com'
      });

      // 1. Draw elegant top banner
      doc.setFillColor('#FF0000'); // Bold YouTube Red
      doc.rect(0, 0, 210, 8, 'F');

      // 2. Main titles
      doc.setTextColor('#1E293B'); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Qrytube', 105, 22, { align: 'center' });

      if (lang === 'ar') {
        const textImg = renderTextToImage('رمز استجابة سريعة ذكي (روابط عميقة) مجهز للطباعة فائقة الدقة الفيكتور', 3.5, {
          isBold: false,
          color: '#64748B',
          maxWidthMm: 160,
          align: 'center'
        });
        if (textImg) {
          doc.addImage(textImg.dataUrl, 'PNG', 105 - (textImg.widthMm / 2), 28 - (textImg.heightMm / 2), textImg.widthMm, textImg.heightMm);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#64748B'); // slate-500
        doc.text('Smart QR Deep Link - High-Quality Vector Print Template', 105, 28, { align: 'center' });
      }

      // 3. Central card outline container
      doc.setFillColor('#F8FAFC'); // light grey card area
      doc.rect(40, 38, 130, 130, 'F');
      doc.setDrawColor('#E2E8F0');
      doc.setLineWidth(0.3);
      doc.rect(40, 38, 130, 130, 'D');

      // 4. White or custom theme background padding area for the QR code
      doc.setFillColor(backgroundColor || '#FFFFFF');
      doc.rect(45, 43, 120, 120, 'F');

      // 5. Draw the QR code as perfect infinitely-scalable vector rectangles!
      doc.setFillColor(foregroundColor || '#FF0000');
      const qrSize = 120; // 120mm x 120mm QR
      const moduleSize = qrSize / size;
      
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (qr.modules.get(r, c)) {
            const mx = 45 + c * moduleSize;
            const my = 43 + r * moduleSize;
            // Draw filled rectangles. A tiny 0.05mm overlap prevents tiny rendering gaps on some standard PDF reader rendering engines
            doc.rect(mx, my, moduleSize + 0.05, moduleSize + 0.05, 'F');
          }
        }
      }

      // 6. Inline custom logo (if uploaded)
      if (customLogo) {
        // Calculate emblem sizes and coordinates
        const logoSize = qrSize * logoScale;
        const cx = 105;
        const cy = 43 + (qrSize / 2);
        const lx = cx - (logoSize / 2);
        const ly = cy - (logoSize / 2);

        if (logoMargin) {
          // Inner protective color badge block
          const badgeSize = logoSize * 1.25;
          const bx = cx - (badgeSize / 2);
          const by = cy - (badgeSize / 2);
          doc.setFillColor(backgroundColor || '#FFFFFF');
          doc.rect(bx, by, badgeSize, badgeSize, 'F');
        }

        // Embed the logo image natively inside the PDF structure (compatible with PNG / JPEG / base64)
        doc.addImage(customLogo, 'PNG', lx, ly, logoSize, logoSize);
      }

      // 7. Destination URL info block (at the bottom half)
      doc.setFillColor('#F1F5F9'); // slate-100 bg
      doc.rect(20, 180, 170, 42, 'F');
      doc.setDrawColor('#CBD5E1'); // slate-300 border
      doc.setLineWidth(0.35);
      doc.rect(20, 180, 170, 42, 'D');

      // Card Title
      if (lang === 'ar') {
        const textImg = renderTextToImage('الرابط المستهدف / Target Destination URL', 3.8, {
          isBold: true,
          color: '#334155',
          maxWidthMm: 150,
          align: 'center'
        });
        if (textImg) {
          doc.addImage(textImg.dataUrl, 'PNG', 105 - (textImg.widthMm / 2), 187 - (textImg.heightMm / 2), textImg.widthMm, textImg.heightMm);
        }
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor('#334155'); // slate-700
        doc.text('Target Destination URL', 105, 187, { align: 'center' });
      }

      // Print the target URL safely with word wrapping to avoid clipping overflow
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor('#0F172A');
      const wrappedUrl = doc.splitTextToSize(urlInput || 'https://youtube.com', 156);
      doc.text(wrappedUrl, 105, 193, { align: 'center' });

      // Action subtext
      if (lang === 'ar') {
        const textImg = renderTextToImage('المسح الضوئي يحولك تلقائيا داخل تطبيق يوتيوب الرسمي بفضل تقنية الروابط العميقة', 3.2, {
          isBold: false,
          color: '#475569',
          maxWidthMm: 160,
          align: 'center'
        });
        if (textImg) {
          doc.addImage(textImg.dataUrl, 'PNG', 105 - (textImg.widthMm / 2), 214 - (textImg.heightMm / 2), textImg.widthMm, textImg.heightMm);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor('#475569'); // slate-600
        doc.text('Scanning this code redirects visitors straight inside the official YouTube mobile app.', 105, 214, { align: 'center' });
      }

      // 8. Visual instruction banner
      doc.setFillColor('#EFF6FF'); // light blue bg
      doc.rect(15, 232, 180, 24, 'F');
      doc.setDrawColor('#3B82F6'); // bold blue border line highlight
      doc.setLineWidth(0.4);
      doc.line(15, 232, 15, 256); // Highlight bar on left side

      if (lang === 'ar') {
        const textImg = renderTextToImage('كيفية الاستخدام والمسح:', 3.5, {
          isBold: true,
          color: '#1D4ED8',
          maxWidthMm: 160,
          align: 'center'
        });
        if (textImg) {
          doc.addImage(textImg.dataUrl, 'PNG', 105 - (textImg.widthMm / 2), 238 - (textImg.heightMm / 2), textImg.widthMm, textImg.heightMm);
        }
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor('#1D4ED8'); // blue-700
        doc.text('Scan Directions:', 105, 238, { align: 'center' });
      }

      if (lang === 'ar') {
        const textImg = renderTextToImage('١. افتح تطبيق كاميرا هاتفك الافتراضي   ٢. وجّه الكاميرا نحو الرمز بوضوح   ٣. انقر مباشرة لفتح تطبيق يوتيوب العريض', 3.0, {
          isBold: false,
          color: '#1E293B',
          maxWidthMm: 170,
          align: 'center'
        });
        if (textImg) {
          doc.addImage(textImg.dataUrl, 'PNG', 105 - (textImg.widthMm / 2), 244 - (textImg.heightMm / 2), textImg.widthMm, textImg.heightMm);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor('#1E293B');
        doc.text('1. Open your default phone camera app   2. Position the lens over the QR Code   3. Click to open official app directly', 105, 244, { align: 'center' });
      }

      // 9. Document Footer
      doc.setDrawColor('#E2E8F0');
      doc.setLineWidth(0.25);
      doc.line(15, 268, 195, 268);

      if (lang === 'ar') {
        const textImg = renderTextToImage('تم إنشاء الملف كـ ناقل (Vector) ذو أبعاد غير محدودة للطباعة الاحترافية عبر Qrytube.com', 2.8, {
          isBold: false,
          color: '#94A3B8',
          maxWidthMm: 180,
          align: 'center'
        });
        if (textImg) {
          doc.addImage(textImg.dataUrl, 'PNG', 105 - (textImg.widthMm / 2), 274 - (textImg.heightMm / 2), textImg.widthMm, textImg.heightMm);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor('#94A3B8');
        doc.text('Print-ready Vector design generated as scalable document via Qrytube.com', 105, 274, { align: 'center' });
      }

      // Trigger automatic local browser download
      doc.save('YouTube-DeepLink-QR.pdf');
    } catch (err) {
      console.error("error during vector PDF download generation", err);
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

  const renderActionButtons = () => {
    const isUrlEmpty = !urlInput.trim();
    const isUrlValid = isUrlEmpty || (urlInfo.isValid && urlInfo.platform !== 'other');
    const isInvalid = !isUrlValid || isUrlEmpty;

    return (
      <div className="space-y-4 w-full">
        {/* Copy to clipboard button */}
        <button
          onClick={handleCopyToClipboard}
          disabled={isInvalid}
          className={`w-full py-3 px-4 rounded-xl font-arabic font-semibold transition-all flex items-center justify-center gap-2 text-xs ${
            isInvalid
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
              : copied 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-inner cursor-pointer'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
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

        {/* Pro Print Export - PNG, SVG, & PDF Download buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="pro_export_action_buttons">
          {/* PNG Download Button */}
          <button
            onClick={handleDownload}
            disabled={isInvalid}
            className={`py-3 px-2 text-white rounded-xl font-semibold font-arabic flex items-center justify-center gap-1.5 transition-all text-[11px] ${
              isInvalid
                ? 'bg-red-400/60 text-white/75 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-xs hover:shadow-md'
            }`}
            type="button"
            id="direct_download_png_btn"
          >
            <Download size={14} />
            <span>{t.btnDownloadPng}</span>
          </button>

          {/* SVG Download Button */}
          <button
            onClick={handleDownloadSvg}
            disabled={isInvalid}
            className={`py-3 px-2 text-white rounded-xl font-semibold font-arabic flex items-center justify-center gap-1.5 transition-all text-[11px] ${
              isInvalid
                ? 'bg-slate-500/40 text-white/50 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-900 cursor-pointer shadow-xs hover:shadow-md'
            }`}
            type="button"
            id="direct_download_svg_btn"
          >
            <Sparkles size={14} />
            <span>{t.btnDownloadSvg}</span>
          </button>

          {/* PDF Vector Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isInvalid}
            className={`py-3 px-2 text-white rounded-xl font-semibold font-arabic flex items-center justify-center gap-1.5 transition-all text-[11px] ${
              isInvalid
                ? 'bg-blue-400/60 text-white/75 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs hover:shadow-md'
            }`}
            type="button"
            id="direct_download_pdf_btn"
          >
            <FileText size={14} />
            <span>{t.btnDownloadPdf}</span>
          </button>
        </div>
      </div>
    );
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
                    icon: <Youtube size={20} className={urlInfo.isValid && urlInfo.type !== 'unknown' ? 'text-red-500' : 'text-slate-600'} />,
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
                  <div className="text-xs text-slate-600 font-mono">STEP 1</div>
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
                        : 'border-gray-50 hover:border-gray-150 text-slate-600 bg-gray-50/20 font-medium'
                    }`}
                    type="button"
                  >
                    <Youtube size={20} className="mb-1 text-slate-600" />
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
                        : 'border-gray-50 hover:border-gray-150 text-slate-600 bg-gray-50/20 font-medium'
                    }`}
                    type="button"
                  >
                    <Facebook size={20} className="mb-1 text-slate-600" />
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
                        : 'border-gray-50 hover:border-gray-150 text-slate-600 bg-gray-50/20 font-medium'
                    }`}
                    type="button"
                  >
                    <Instagram size={20} className="mb-1 text-slate-600" />
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
                        : 'border-gray-50 hover:border-gray-150 text-slate-600 bg-gray-50/20 font-medium'
                    }`}
                    type="button"
                  >
                    <Music size={20} className="mb-1 text-slate-600" />
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

                {/* Validation Status Badge and Warning Banner */}
                {(() => {
                  const isUrlEmpty = !urlInput.trim();
                  const isUrlValid = isUrlEmpty || (urlInfo.isValid && urlInfo.platform !== 'other');
                  
                  if (!isUrlValid) {
                    return (
                      <div className="mt-3 p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-red-800 text-xs font-arabic leading-relaxed animate-fadeIn" id="url_validation_warning">
                        <span className="p-1 bg-red-100 text-red-600 rounded-lg shrink-0 mt-0.5">
                          <AlertCircle size={14} />
                        </span>
                        <div>
                          <p className="font-bold">{t.unsupportedUrlWarn}</p>
                        </div>
                      </div>
                    );
                  } else if (!isUrlEmpty) {
                    const platformLabels: Record<string, string> = {
                      youtube: 'YouTube',
                      facebook: 'Facebook',
                      instagram: 'Instagram',
                      tiktok: 'TikTok'
                    };
                    const matchedPlatform = platformLabels[urlInfo.platform] || urlInfo.platform;
                    return (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-150 flex items-center gap-2.5 text-emerald-800 text-xs font-arabic animate-fadeIn">
                        <span className="p-1 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                          <Check size={14} />
                        </span>
                        <span>{t.validLink} ({matchedPlatform})</span>
                      </div>
                    );
                  }
                  return null;
                })()}




              </>
            );
          })()}

          {/* Dynamic Parsing Status Badge removed as per request */}

          {/* Aesthetic Divider */}
          <div className="w-full h-px bg-gray-100 my-6" />

          {/* Moved Live Preview & Actions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center" id="direct_preview_area">
            
            {/* Left: Copy & High-Res download (7 cols on lg) - Visible on lg screens and up */}
            <div className="hidden lg:block lg:col-span-7 space-y-4 w-full" id="direct_actions_container">
              {renderActionButtons()}
            </div>

            {/* Right: The QR Code canvas (5 cols on lg) rendered next or below */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4 sm:p-5 bg-slate-50/40 rounded-2xl border border-gray-100 group relative w-full shadow-xs" id="direct_canvas_container">
              <span className="text-[10px] font-bold text-slate-600 font-arabic tracking-wider uppercase mb-0.5 block">{t.previewHeading}</span>
              <h3 className="text-xs font-bold font-arabic text-gray-700 mb-2">{t.finalQrLabel}</h3>

              {/* Square canvas wrapper box ensuring crisp 1:1 rendering on all screens */}
              <div className="w-36 h-36 min-w-[9rem] min-h-[9rem] max-w-full aspect-square bg-white rounded-xl shadow-xs border border-gray-100 p-1.5 flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:scale-102 overflow-hidden" id="canvas_square_box">
                <canvas
                  ref={canvasRef}
                  width={256}
                  height={256}
                  className="!w-full !h-full !max-w-full !max-h-full object-contain rounded-md"
                  id="final_qr_canvas"
                />
              </div>

              {/* Soft overlay or caption for empty/placeholder state */}
              {(!urlInput.trim()) ? (
                <span className="mt-2 text-[10px] font-bold font-arabic text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                  💡 {lang === 'ar' ? 'معاينة افتراضية نشطة' : 'Active default preview'}
                </span>
              ) : (!(urlInfo.isValid && urlInfo.platform !== 'other')) ? (
                <span className="mt-2 text-[10px] font-bold font-arabic text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                  ⚠️ {lang === 'ar' ? 'الرابط غير مدعوم' : 'Unsupported link'}
                </span>
              ) : null}

              <p className="mt-2 text-[10px] font-arabic text-slate-600 max-w-[200px] leading-relaxed">
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
            <div className="text-xs text-slate-600 font-mono">STEP 2</div>
          </div>

          {/* Color Presets Templates */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-600 font-arabic block mb-2.5">{t.colorPresetsLabel}</span>
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

        {/* Module 4: Center Custom Logo (Optional) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100" id="module_center_logo">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-arabic text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Youtube size={20} />
              </span>
              {t.mod4Title}
            </h2>
            <div className="text-xs text-slate-600 font-mono">STEP 3</div>
          </div>

          <p className="text-xs font-arabic text-slate-600 mb-4 leading-relaxed">
            {t.mod4Desc}
          </p>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-6 transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
              isDragging
                ? 'border-red-500 bg-red-50/50'
                : customLogo
                ? 'border-emerald-300 bg-emerald-50/10'
                : 'border-gray-200 bg-gray-50/30 hover:border-gray-300 hover:bg-gray-50/80'
            }`}
            onClick={() => document.getElementById('logo_file_input')?.click()}
            id="logo_dropzone"
          >
            <input
              id="logo_file_input"
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={t.uploadCustomLabel || "Upload Custom Logo"}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoUpload(e.target.files[0]);
                }
              }}
            />

            {customLogo ? (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-xl border border-gray-100 shadow-sm p-1.5 bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={customLogo}
                    alt="Channel Logo Preview"
                    width={64}
                    height={64}
                    loading="lazy"
                    className="w-full h-full object-contain rounded-md animate-scaleIn"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700 font-arabic flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {t.successUploadMsg}
                  </p>
                  <p className="text-[10px] text-slate-600 font-arabic mt-0.5">
                    {t.changeImgTip}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto p-3 bg-red-50 text-red-600 rounded-2xl w-fit">
                  <UploadCloud size={24} />
                </div>
                <p className="text-xs font-bold text-gray-700 font-arabic">
                  {t.dragDropText}
                </p>
                <p className="text-[10px] text-slate-600 font-arabic">
                  {t.uploadFormatTip}
                </p>
              </div>
            )}
          </div>

          {/* Logo visual adjustments controls (appears only when custom logo is set) */}
          {customLogo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 pt-4 border-t border-gray-100 space-y-4"
              id="logo_visual_controls"
            >
              <h3 className="font-bold text-xs font-arabic text-gray-700 block">
                🛠️ {t.visualControlHeading}
              </h3>

              {/* Slider for scaling */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-arabic">
                  <span className="text-gray-650 font-semibold">{t.logoScaleLabel}</span>
                  <span className="text-red-600 font-mono font-bold">{(logoScale * 100).toFixed(0)}%</span>
                </div>
                <input
                  id="logo_scale_slider"
                  type="range"
                  min="0.15"
                  max="0.30"
                  step="0.01"
                  value={logoScale}
                  onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                  className="w-full min-h-[1.5rem] accent-red-600 hover:accent-red-700 cursor-pointer"
                  aria-label={t.logoScaleLabel}
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-arabic font-medium">
                  <span>{t.balancedSmall}</span>
                  <span>{t.largeOverlay}</span>
                </div>
              </div>

              {/* Protective white boundary mask toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-3 rounded-2xl select-none transition-all" htmlFor="logo_margin_checkbox">
                <input
                  id="logo_margin_checkbox"
                  type="checkbox"
                  checked={logoMargin}
                  onChange={(e) => setLogoMargin(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 accent-red-600 cursor-pointer"
                  aria-label={t.maskCheckboxLabel}
                />
                <span className="text-xs text-gray-700 font-arabic leading-relaxed font-semibold">
                  {t.maskCheckboxLabel}
                </span>
              </label>

              {/* Remove current logo button */}
              <button
                type="button"
                onClick={() => setCustomLogo(null)}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold font-arabic rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                id="remove_logo_btn"
              >
                <Trash2 size={14} />
                <span>{t.removeLogoBtn}</span>
              </button>
            </motion.div>
          )}
        </div>


      </div>

      {/* Mobile-Only Download Actions: positioned at the absolute bottom, visible only on screens smaller than lg */}
      <div className="lg:hidden col-span-1 md:col-span-12 bg-white rounded-3xl p-6 shadow-xs border border-gray-100 mt-2" id="mobile_actions_wrapper">
        <h3 className="text-sm font-bold font-arabic text-gray-850 mb-3 text-center flex items-center justify-center gap-2">
          📥 {lang === 'ar' ? 'تحميل وحفظ كود الـ QR' : 'Download & Save QR Code'}
        </h3>
        {renderActionButtons()}
      </div>

    </div>
  );
}
