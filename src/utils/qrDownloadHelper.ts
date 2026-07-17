import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadAsPNG(elementId: string, filename: string = 'qrytube_qr') {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // High definition 3x scaling (4K quality equivalent)
      useCORS: true,
      backgroundColor: null,
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error generating PNG:', error);
  }
}

export function downloadAsSVG(svgElementId: string, filename: string = 'qrytube_qr') {
  const svgElement = document.getElementById(svgElementId);
  if (!svgElement) return;

  try {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const preface = '<?xml version="1.0" encoding="utf-8"?>\n';
    const svgBlob = new Blob([preface, source], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${filename}.svg`;
    downloadLink.click();
    
    URL.revokeObjectURL(svgUrl);
  } catch (error) {
    console.error('Error generating SVG:', error);
  }
}

export async function downloadAsPDF(elementId: string, filename: string = 'qrytube_qr') {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Center the QR on the A4 page
    const qrSize = 120; // 120mm wide and tall
    const x = (pdfWidth - qrSize) / 2;
    const y = (pdfHeight - qrSize) / 2 - 20;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('Qrytube Smart QR Code', pdfWidth / 2, 40, { align: 'center' });
    
    pdf.addImage(imgData, 'JPEG', x, y, qrSize, qrSize);
    
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text('Generated via qrytube.com - Bypass Sandbox In-App Browsers', pdfWidth / 2, pdfHeight - 30, { align: 'center' });

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}
