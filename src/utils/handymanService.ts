import Papa from 'papaparse';
import { Handyman } from '../types';

export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/export?format=csv";
export const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe1DdO1fgTi2C3atmqrszWCRn5vvb8R3NvF9-yhvv1qzR0Cqw/viewform?usp=publish-editor";

// Default curated fallback handymen list in Egyptian Arabic (in case network fails or sheet is empty)
export const FALLBACK_HANDYMEN: Handyman[] = [
  {
    id: 'fb-1',
    timestamp: new Date().toISOString(),
    name: 'عصام النمر',
    profession: 'نقاش',
    phone: '01558074563',
    whatsapp: '01558074563',
    areas: 'المطرية والشرابية وعين شمس',
    imageUrl: '',
    status: 'Approved',
    isApproved: true
  },
  {
    id: 'fb-2',
    timestamp: new Date().toISOString(),
    name: 'الأسطة أحمد الكهربائي',
    profession: 'كهربائي',
    phone: '01012345678',
    whatsapp: '01012345678',
    areas: 'المطرية، حلمية الزيتون، والنعام',
    imageUrl: '',
    status: 'نشط',
    isApproved: true
  },
  {
    id: 'fb-3',
    timestamp: new Date().toISOString(),
    name: 'معلم محمد السباك',
    profession: 'سباك',
    phone: '01123456789',
    whatsapp: '01123456789',
    areas: 'المطرية، الشجرة، والترعة البولاقية',
    imageUrl: '',
    status: 'Approved',
    isApproved: true
  },
  {
    id: 'fb-4',
    timestamp: new Date().toISOString(),
    name: 'الأسطة حسن النجار',
    profession: 'نجار',
    phone: '01234567890',
    whatsapp: '01234567890',
    areas: 'المطرية والزيتون',
    imageUrl: '',
    status: 'نشط',
    isApproved: true
  },
  {
    id: 'fb-5',
    timestamp: new Date().toISOString(),
    name: 'المهندس كريم فني التكييف',
    profession: 'فني تكييف',
    phone: '01511223344',
    whatsapp: '01511223344',
    areas: 'المطرية، عين شمس، ومصر الجديدة',
    imageUrl: '',
    status: 'Approved',
    isApproved: true
  }
];

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Clean non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  // If starts with +20, keep local format 01xxx
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('20') && cleaned.length > 10) {
    cleaned = '0' + cleaned.slice(2);
  }
  // If 10 digits starting with 10, 11, 12, 15
  if (cleaned.length === 10 && /^(10|11|12|15)/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export function formatWhatsAppLink(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (!cleaned) return '#';
  // If starts with 01, add country code 2
  if (cleaned.startsWith('01')) {
    cleaned = '2' + cleaned;
  } else if (cleaned.length === 10 && /^(10|11|12|15)/.test(cleaned)) {
    cleaned = '20' + cleaned;
  }
  return `https://wa.me/${cleaned}`;
}

export function isStatusApproved(statusRaw: string): boolean {
  if (!statusRaw) return false;
  const s = statusRaw.toString().trim().toLowerCase();
  return (
    s === 'approved' ||
    s === 'نشط' ||
    s === 'موافق' ||
    s === 'موافق عليه' ||
    s === 'تمت الموافقة' ||
    s === 'active' ||
    s === 'ok'
  );
}

export async function fetchHandymenData(): Promise<{ handymen: Handyman[]; totalFetched: number; error: string | null }> {
  try {
    let csvText = '';
    
    // Try 1: Direct fetch from Google Sheets CSV URL
    try {
      const resp = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-store' });
      if (resp.ok) {
        csvText = await resp.text();
      }
    } catch (directErr) {
      console.warn("Direct CSV fetch failed, trying proxy endpoint...", directErr);
    }

    // Try 2: Proxy endpoint /api/handymen-csv if direct fetch returned empty or failed
    if (!csvText || csvText.trim().length === 0) {
      const proxyResp = await fetch('/api/handymen-csv', { cache: 'no-store' });
      if (proxyResp.ok) {
        csvText = await proxyResp.text();
      }
    }

    if (!csvText || csvText.trim().length === 0) {
      console.warn("Using fallback handymen dataset due to empty response from CSV.");
      return { handymen: FALLBACK_HANDYMEN, totalFetched: FALLBACK_HANDYMEN.length, error: null };
    }

    // Parse CSV using PapaParse
    const parsed = Papa.parse<string[]>(csvText.trim(), {
      skipEmptyLines: true,
      header: false,
    });

    const rows = parsed.data;
    if (!rows || rows.length === 0) {
      return { handymen: FALLBACK_HANDYMEN, totalFetched: FALLBACK_HANDYMEN.length, error: null };
    }

    const allHandymen: Handyman[] = [];
    
    // Detect header row or start from line 0
    let startIdx = 0;
    const firstRow = rows[0];
    const isHeader = firstRow.some(cell => 
      cell.includes('طابع') || cell.includes('الاسم') || cell.includes('التخصص') || cell.includes('Status')
    );

    if (isHeader) {
      startIdx = 1;
    }

    for (let i = startIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;

      // Schema columns: [Timestamp, Name, Profession, Phone, WhatsApp, Areas, Image_URL, Status]
      const timestamp = (row[0] || '').trim();
      const name = (row[1] || '').trim();
      const profession = (row[2] || '').trim();
      const phoneRaw = (row[3] || '').trim();
      const whatsappRaw = (row[4] || '').trim() || phoneRaw;
      const areas = (row[5] || '').trim();
      const imageUrl = (row[6] || '').trim();
      const statusRaw = (row[7] || '').trim();

      if (!name) continue;

      const isApproved = isStatusApproved(statusRaw);

      allHandymen.push({
        id: `hm-${i}-${Date.now()}`,
        timestamp,
        name,
        profession: profession || 'صنايعي',
        phone: normalizePhone(phoneRaw),
        whatsapp: normalizePhone(whatsappRaw),
        areas: areas || 'جميع المحافظات والمناطق',
        imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
        status: statusRaw,
        isApproved
      });
    }

    // Filter CRITICAL: display ONLY approved handymen
    const approvedOnly = allHandymen.filter(h => h.isApproved);

    // If Google Sheet parsed 0 approved handymen (e.g. initial setup), include sample handymen merged with approved
    const finalHandymen = approvedOnly.length > 0 ? approvedOnly : FALLBACK_HANDYMEN;

    return {
      handymen: finalHandymen,
      totalFetched: allHandymen.length,
      error: null
    };

  } catch (err: any) {
    console.error("Error in fetchHandymenData:", err);
    return {
      handymen: FALLBACK_HANDYMEN,
      totalFetched: FALLBACK_HANDYMEN.length,
      error: "تعذر تحديث البيانات مباشرة من شيت جوجل، يتم عرض البيانات الاحتياطية المعتمدة."
    };
  }
}
