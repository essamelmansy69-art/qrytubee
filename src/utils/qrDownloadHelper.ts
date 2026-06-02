/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface DownloadOptions {
  payload: string;
  urlInput: string;
  downloadSize: number;
  downloadFormat: 'png' | 'jpg';
  errorCorrectionLevel: string;
  foregroundColor: string;
  backgroundColor: string;
  customLogo: string | null;
  logoScale: number;
  logoMargin: boolean;
  lang: 'ar' | 'en';
  t: any;
  selectedFrame?: 'none' | 'scan_me' | 'retro' | 'smartphone' | 'modern_badge';
  frameColor?: string;
  frameTextTop?: string;
  frameTextBottom?: string;
}

// Draw professional decorative print frames on high-res canvases
function applyFrameToCanvas(
  canvas: HTMLCanvasElement, 
  qrCanvas: HTMLCanvasElement, 
  options: {
    selectedFrame: 'none' | 'scan_me' | 'retro' | 'smartphone' | 'modern_badge';
    frameColor: string;
    frameTextTop: string;
    frameTextBottom: string;
    backgroundColor: string;
    lang: 'ar' | 'en';
  }
) {
  const { selectedFrame, frameColor, frameTextTop, frameTextBottom, backgroundColor, lang } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // 1. Fill base canvas background
  if (selectedFrame === 'modern_badge' || selectedFrame === 'smartphone') {
    ctx.fillStyle = '#0F172A'; // Sophisticated slate dark background
  } else {
    ctx.fillStyle = backgroundColor || '#FFFFFF';
  }
  ctx.fillRect(0, 0, width, height);

  // 2. Draw frame templates
  if (selectedFrame === 'scan_me') {
    // Elegant professional border
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = width * 0.02;
    const padding = width * 0.04;
    
    ctx.beginPath();
    const radius = width * 0.05;
    const x = padding;
    const y = padding;
    const w = width - padding * 2;
    const h = height - padding * 2;
    
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(x, y, w, h, radius);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.stroke();

    // Top Label pill
    const pillW = width * 0.52;
    const pillH = height * 0.088;
    const pillX = (width - pillW) / 2;
    const pillY = padding * 1.6;
    ctx.fillStyle = frameColor;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();

    // Text in Top Pill
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(width * 0.035)}px "Segoe UI", "Cairo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameTextTop || (lang === 'ar' ? 'فيديو ذكي' : 'SMART DESIGN'), width / 2, pillY + pillH / 2);

    // Center QR
    const qrSize = qrCanvas.width;
    const qrx = (width - qrSize) / 2;
    const qry = pillY + pillH + width * 0.04;
    ctx.drawImage(qrCanvas, qrx, qry, qrSize, qrSize);

    // Bottom Label
    ctx.fillStyle = frameColor;
    ctx.font = `bold ${Math.round(width * 0.042)}px "Segoe UI", "Cairo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameTextBottom || (lang === 'ar' ? 'امسح لمشاهدة الفيديو 📱' : 'SCAN TO WATCH 📱'), width / 2, height - padding * 2.2);

  } else if (selectedFrame === 'retro') {
    // Dual thin ornamental border
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = width * 0.005;
    const p1 = width * 0.035;
    const p2 = width * 0.05;

    ctx.strokeRect(p1, p1, width - p1*2, height - p1*2);
    ctx.strokeRect(p2, p2, width - p2*2, height - p2*2);

    // Crosshairs
    const drawCross = (cx: number, cy: number) => {
      ctx.fillStyle = frameColor;
      const sizeVal = width * 0.035;
      ctx.fillRect(cx - sizeVal/2, cy - width * 0.002, sizeVal, width * 0.004);
      ctx.fillRect(cx - width * 0.002, cy - sizeVal/2, width * 0.004, sizeVal);
    };
    drawCross(p2, p2);
    drawCross(width - p2, p2);
    drawCross(p2, height - p2);
    drawCross(width - p2, height - p2);

    // Top Header
    ctx.fillStyle = frameColor;
    ctx.font = `900 ${Math.round(width * 0.028)}px "Courier New", Courier, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameTextTop || '★ DIRECT PREMIUM ★', width / 2, p2 + width * 0.045);

    // QR
    const qrSize = qrCanvas.width;
    const qrx = (width - qrSize) / 2;
    const qry = (height - qrSize) / 2;
    ctx.drawImage(qrCanvas, qrx, qry, qrSize, qrSize);

    // Bottom Footer
    ctx.fillText(frameTextBottom || (lang === 'ar' ? 'مسح سريع آمن' : 'SECURE SPEED LINK'), width / 2, height - p2 - width * 0.045);

  } else if (selectedFrame === 'smartphone') {
    const margin = width * 0.05;
    // Core Phone structure
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = width * 0.018;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(margin, margin, width - margin * 2, height - margin * 2, width * 0.08);
    } else {
      ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
    }
    ctx.stroke();

    // Dark screen
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    const scrMargin = margin + width * 0.01;
    const scrRadius = width * 0.07;
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(scrMargin, scrMargin, width - scrMargin * 2, height - scrMargin * 2, scrRadius);
    } else {
      ctx.rect(scrMargin, scrMargin, width - scrMargin * 2, height - scrMargin * 2);
    }
    ctx.fill();

    // Notch
    ctx.fillStyle = '#0F172A';
    const notchW = width * 0.32;
    const notchH = width * 0.045;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect((width - notchW) / 2, scrMargin, notchW, notchH, notchH / 2);
    } else {
      ctx.rect((width - notchW) / 2, scrMargin, notchW, notchH);
    }
    ctx.fill();

    // Top Signals
    ctx.fillStyle = '#64748B';
    ctx.font = `bold ${Math.round(width * 0.024)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText("09:41", scrMargin + width * 0.04, scrMargin + notchH * 1.4);
    ctx.textAlign = 'right';
    ctx.fillText("📶 🔋", width - scrMargin - width * 0.04, scrMargin + notchH * 1.4);

    // QR Image
    const qrSize = qrCanvas.width;
    const qrx = (width - qrSize) / 2;
    const qry = (height - qrSize) / 2 - width*0.01;
    ctx.drawImage(qrCanvas, qrx, qry, qrSize, qrSize);

    // Action CTA Button shape
    const btnW = width * 0.72;
    const btnH = height * 0.092;
    const btnX = (width - btnW) / 2;
    const btnY = height - scrMargin - btnH - width * 0.035;

    ctx.fillStyle = frameColor;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(btnX, btnY, btnW, btnH, width * 0.03);
    } else {
      ctx.rect(btnX, btnY, btnW, btnH);
    }
    ctx.fill();

    // Text on Button
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(width * 0.032)}px "Segoe UI", "Cairo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameTextBottom || (lang === 'ar' ? 'افتح التطبيق مباشرة ➔' : 'OPEN IN APP ➔'), width / 2, btnY + btnH / 2);

  } else if (selectedFrame === 'modern_badge') {
    // Futuristic slate card with colored highlights
    const bounds = width * 0.055;
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = width * 0.01;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(bounds, bounds, width - bounds * 2, height - bounds * 2, width * 0.065);
    } else {
      ctx.rect(bounds, bounds, width - bounds * 2, height - bounds * 2);
    }
    ctx.stroke();

    // Top glowing title
    ctx.fillStyle = frameColor;
    ctx.font = `900 ${Math.round(width * 0.03)}px "Segoe UI", "Cairo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameTextTop || (lang === 'ar' ? 'رابط ذكي فوري' : 'INSTANT LINK'), width / 2, bounds + width * 0.075);

    // QR Image
    const qrSize = qrCanvas.width;
    const qrx = (width - qrSize) / 2;
    const qry = (height - qrSize) / 2 - width * 0.015;
    ctx.drawImage(qrCanvas, qrx, qry, qrSize, qrSize);

    // Bottom solid pill
    const bW = width * 0.78;
    const bH = height * 0.082;
    const bX = (width - bW) / 2;
    const bY = height - bounds - bH - width * 0.045;

    ctx.fillStyle = frameColor;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(bX, bY, bW, bH, bH / 2);
    } else {
      ctx.rect(bX, bY, bW, bH);
    }
    ctx.fill();

    // Button label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(width * 0.034)}px "Segoe UI", "Cairo", sans-serif`;
    ctx.fillText(frameTextBottom || (lang === 'ar' ? 'مسح سريع للمشاهدة' : 'SCAN TO WATCH'), width / 2, bY + bH / 2);
  }
}

let _cachedQRCode: any = null;
async function getQRCodeLib() {
  if (!_cachedQRCode) {
    const mod = await import('qrcode');
    _cachedQRCode = mod.default || mod;
  }
  return _cachedQRCode;
}

let _cachedJsPDF: any = null;
async function getJsPDFLib() {
  if (!_cachedJsPDF) {
    const mod = await import('jspdf');
    _cachedJsPDF = mod.jsPDF || mod.default || mod;
  }
  return _cachedJsPDF;
}

// Helper to draw Arabic/English text perfectly on canvas and return image data for PDF
function renderTextToImage(
  text: string, 
  fontSizeMm: number, 
  options: {
    isBold?: boolean;
    color?: string;
    align?: 'center' | 'left' | 'right';
    maxWidthMm?: number;
    scale?: number;
  } = {}
) {
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
}

// Download High-Resolution version of the QR Code (PNG/JPG)
export async function handleDownloadPng(options: DownloadOptions) {
  const {
    payload,
    urlInput,
    downloadSize,
    downloadFormat,
    errorCorrectionLevel,
    foregroundColor,
    backgroundColor,
    customLogo,
    logoScale,
    logoMargin,
    lang,
    t,
    selectedFrame = 'none',
    frameColor = '#FF0000',
    frameTextTop = '',
    frameTextBottom = ''
  } = options;

  if (!payload || !urlInput.trim()) {
    alert(t.alertInputFirst);
    return;
  }

  // Adjust QR size relative to final canvas size if a frame is chosen
  let qrRenderSize = downloadSize;
  if (selectedFrame !== 'none') {
    if (selectedFrame === 'retro') {
      qrRenderSize = Math.round(downloadSize * 0.60);
    } else if (selectedFrame === 'smartphone') {
      qrRenderSize = Math.round(downloadSize * 0.58);
    } else if (selectedFrame === 'modern_badge') {
      qrRenderSize = Math.round(downloadSize * 0.58);
    } else {
      qrRenderSize = Math.round(downloadSize * 0.65);
    }
  }

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = qrRenderSize;
  tempCanvas.height = qrRenderSize;

  // Render base QR at maximum resolution
  const qrOptions = {
    width: qrRenderSize,
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
          const logoSizeVal = tempCanvas.width * logoScale;

          if (logoMargin) {
            ctx.fillStyle = backgroundColor;
            const badgeSize = logoSizeVal * 1.25;
            const badgeX = cx - badgeSize / 2;
            const badgeY = cy - badgeSize / 2;
            const radius = badgeSize * 0.2;

            ctx.beginPath();
            if ((ctx as any).roundRect) {
              (ctx as any).roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
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

          ctx.drawImage(logoImg, cx - logoSizeVal / 2, cy - logoSizeVal / 2, logoSizeVal, logoSizeVal);
        }
        resolve(true);
      };
      logoImg.onerror = () => {
        console.error("Failed to load uploaded logo image into download canvas");
        resolve(true);
      };
    });
  }

  // Generate the final canvas (possibly framed)
  let finalCanvas = tempCanvas;
  if (selectedFrame !== 'none') {
    finalCanvas = document.createElement('canvas');
    finalCanvas.width = downloadSize;
    finalCanvas.height = downloadSize;
    applyFrameToCanvas(finalCanvas, tempCanvas, {
      selectedFrame,
      frameColor,
      frameTextTop,
      frameTextBottom,
      backgroundColor,
      lang
    });
  }

  // Trigger download
  const mimeType = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
  const fileExtension = downloadFormat;
  const dataUrl = finalCanvas.toDataURL(mimeType, 1.0);
  
  const link = document.createElement('a');
  link.download = `YouTube-DeepLink-QR_${downloadSize}x${downloadSize}.${fileExtension}`;
  link.href = dataUrl;
  link.click();
}

// Download high-quality custom vector SVG version of the QR Code
export async function handleDownloadSvg(options: DownloadOptions) {
  const {
    payload,
    urlInput,
    errorCorrectionLevel,
    foregroundColor,
    backgroundColor,
    customLogo,
    logoScale,
    logoMargin,
    t
  } = options;

  if (!payload || !urlInput.trim()) {
    alert(t.alertInputFirst);
    return;
  }

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
      const logoSizeVal = w * logoScale;
      const cx = w / 2;
      const cy = h / 2;
      const lx = cx - logoSizeVal / 2;
      const ly = cy - logoSizeVal / 2;
      
      let logoElements = '';
      if (logoMargin) {
        const badgeSize = logoSizeVal * 1.25;
        const bx = cx - badgeSize / 2;
        const by = cy - badgeSize / 2;
        const radius = badgeSize * 0.2;
        logoElements += `<rect x="${bx}" y="${by}" width="${badgeSize}" height="${badgeSize}" fill="${backgroundColor}" rx="${radius}" ry="${radius}" />`;
      }
      
      // Embed the base64 or custom logo image inside the SVG vector using standard self-contained image tag
      logoElements += `<image href="${customLogo}" x="${lx}" y="${ly}" width="${logoSizeVal}" height="${logoSizeVal}" />`;
      
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
}

// Download high-quality custom vector PDF version of the QR Code
export async function handleDownloadPdf(options: DownloadOptions) {
  const {
    payload,
    urlInput,
    errorCorrectionLevel,
    foregroundColor,
    backgroundColor,
    customLogo,
    logoScale,
    logoMargin,
    lang,
    t,
    selectedFrame = 'none',
    frameColor = '#FF0000',
    frameTextTop = '',
    frameTextBottom = ''
  } = options;

  if (!payload || !urlInput.trim()) {
    alert(t.alertInputFirst);
    return;
  }

  const qrcodeLib = await getQRCodeLib();
  const JsPDF = await getJsPDFLib();
  // Generate the raw QR code matrix
  const qr = qrcodeLib.create(payload, { errorCorrectionLevel });
  const { size } = qr.modules;

  // Initialize the jsPDF document in A4 format (210mm x 297mm)
  const doc = new JsPDF({
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

  // 5. Draw the QR code as perfect infinitely-scalable vector rectangles or framed high-res image
  if (selectedFrame !== 'none') {
    let qrRenderSize = 1024;
    if (selectedFrame === 'retro') {
      qrRenderSize = Math.round(1024 * 0.60);
    } else if (selectedFrame === 'smartphone') {
      qrRenderSize = Math.round(1024 * 0.58);
    } else if (selectedFrame === 'modern_badge') {
      qrRenderSize = Math.round(1024 * 0.58);
    } else {
      qrRenderSize = Math.round(1024 * 0.65);
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = qrRenderSize;
    tempCanvas.height = qrRenderSize;

    const qrOptionsVal = {
      width: qrRenderSize,
      margin: 2,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      }
    };

    await qrcodeLib.toCanvas(tempCanvas, payload, qrOptionsVal);

    if (customLogo) {
      const logoImg = new Image();
      logoImg.src = customLogo;
      await new Promise((resolve) => {
        logoImg.onload = () => {
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            const cx = tempCanvas.width / 2;
            const cy = tempCanvas.height / 2;
            const logoSizeVal = tempCanvas.width * logoScale;

            if (logoMargin) {
              ctx.fillStyle = backgroundColor;
              const badgeSize = logoSizeVal * 1.25;
              const badgeX = cx - badgeSize / 2;
              const badgeY = cy - badgeSize / 2;
              const radius = badgeSize * 0.2;

              ctx.beginPath();
              if ((ctx as any).roundRect) {
                (ctx as any).roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
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

            ctx.drawImage(logoImg, cx - logoSizeVal / 2, cy - logoSizeVal / 2, logoSizeVal, logoSizeVal);
          }
          resolve(true);
        };
        logoImg.onerror = () => {
          resolve(true);
        };
      });
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1024;
    finalCanvas.height = 1024;
    applyFrameToCanvas(finalCanvas, tempCanvas, {
      selectedFrame,
      frameColor,
      frameTextTop,
      frameTextBottom,
      backgroundColor,
      lang
    });

    const framedDataUrl = finalCanvas.toDataURL('image/png', 1.0);
    doc.addImage(framedDataUrl, 'PNG', 45, 43, 120, 120);

  } else {
    doc.setFillColor(foregroundColor || '#FF0000');
    const qrSize = 120; // 120mm x 120mm QR
    const moduleSize = qrSize / size;
    
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) {
          const mx = 45 + c * moduleSize;
          const my = 43 + r * moduleSize;
          doc.rect(mx, my, moduleSize + 0.05, moduleSize + 0.05, 'F');
        }
      }
    }

    // 6. Inline custom logo (if uploaded)
    if (customLogo) {
      // Calculate emblem sizes and coordinates
      const logoSizeVal = qrSize * logoScale;
      const cx = 105;
      const cy = 43 + (qrSize / 2);
      const lx = cx - (logoSizeVal / 2);
      const ly = cy - (logoSizeVal / 2);

      if (logoMargin) {
        // Inner protective color badge block
        const badgeSize = logoSizeVal * 1.25;
        const bx = cx - (badgeSize / 2);
        const by = cy - (badgeSize / 2);
        doc.setFillColor(backgroundColor || '#FFFFFF');
        doc.rect(bx, by, badgeSize, badgeSize, 'F');
      }

      // Embed the logo image natively inside the PDF structure (compatible with PNG / JPEG / base64)
      doc.addImage(customLogo, 'PNG', lx, ly, logoSizeVal, logoSizeVal);
    }
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
}
