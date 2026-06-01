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
    t
  } = options;

  if (!payload || !urlInput.trim()) {
    alert(t.alertInputFirst);
    return;
  }

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

  // Trigger download
  const mimeType = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
  const fileExtension = downloadFormat;
  const dataUrl = tempCanvas.toDataURL(mimeType, 1.0);
  
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
    t
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
