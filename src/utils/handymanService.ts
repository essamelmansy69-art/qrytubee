import Papa from 'papaparse';
import { Handyman } from '../types';

export const HANDYMEN_CACHE_KEY = 'egypt_handymen_cache_v3';

export function getCachedHandymen(): Handyman[] | null {
  try {
    const cached = localStorage.getItem(HANDYMEN_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean out any legacy fallback items with 'fb-' ID
      const realOnly = parsed.filter((item: Handyman) => item && item.id && !item.id.startsWith('fb-'));
      if (realOnly.length > 0) {
        return realOnly;
      }
    }
  } catch (err) {
    console.warn("Failed to read handymen cache from localStorage:", err);
  }
  return null;
}

export function setCachedHandymen(handymen: Handyman[]): void {
  try {
    if (handymen && handymen.length > 0) {
      // Never store any fallback items in cache
      const cleanHandymen = handymen.filter((item) => item && item.id && !item.id.startsWith('fb-'));
      if (cleanHandymen.length > 0) {
        localStorage.setItem(HANDYMEN_CACHE_KEY, JSON.stringify(cleanHandymen));
      } else {
        localStorage.removeItem(HANDYMEN_CACHE_KEY);
      }
    } else {
      localStorage.removeItem(HANDYMEN_CACHE_KEY);
    }
  } catch (err) {
    console.warn("Failed to save handymen cache to localStorage:", err);
  }
}
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/export?format=csv";
export const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe1DdO1fgTi2C3atmqrszWCRn5vvb8R3NvF9-yhvv1qzR0Cqw/viewform?usp=publish-editor";

// Empty fallback array (no fake handymen, display ONLY Google Sheet data)
export const FALLBACK_HANDYMEN: Handyman[] = [];

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
  // If status column is empty, approve by default unless explicitly marked rejected or pending
  if (!statusRaw || statusRaw.trim() === '') return true;
  const s = statusRaw.toString().trim().toLowerCase();
  if (s === 'rejected' || s === 'مرفوض' || s === 'غير موافق' || s === 'pending' || s === 'قيد المراجعة') {
    return false;
  }
  return true;
}

export async function fetchHandymenData(): Promise<{ handymen: Handyman[]; totalFetched: number; error: string | null }> {
  try {
    let csvText = '';
    
    // Multi-tier fetch attempts (server proxy, direct export, gviz, public CORS proxies)
    const fetchEndpoints = [
      '/api/handymen-csv',
      GOOGLE_SHEET_CSV_URL,
      "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv",
      `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_SHEET_CSV_URL)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(GOOGLE_SHEET_CSV_URL)}`
    ];

    for (const endpoint of fetchEndpoints) {
      if (csvText && csvText.trim().length > 0) break;
      try {
        const resp = await fetch(endpoint, { cache: 'no-store' });
        if (resp.ok) {
          const text = await resp.text();
          if (text && !text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
            csvText = text;
          }
        }
      } catch (e) {
        console.warn(`Fetch attempt from ${endpoint} failed:`, e);
      }
    }

    if (!csvText || csvText.trim().length === 0) {
      console.warn("No CSV data retrieved from Google Sheets.");
      return { handymen: [], totalFetched: 0, error: "تعذر استجلاب البيانات من شيت جوجل، يرجى التحقق من الاتصال وإعادة المحاولة." };
    }

    const allHandymen: Handyman[] = [];

    // Helper to safely extract column value by header keyword patterns
    const getValueByPatterns = (rowObj: Record<string, any>, patterns: string[]): string => {
      const keys = Object.keys(rowObj);
      for (const p of patterns) {
        const foundKey = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
        if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
          return String(rowObj[foundKey]).trim();
        }
      }
      return '';
    };

    // 1. Primary Attempt: Header-based parsing with PapaParse
    const headerParsed = Papa.parse<Record<string, any>>(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    if (headerParsed.data && headerParsed.data.length > 0) {
      headerParsed.data.forEach((row, i) => {
        const name = getValueByPatterns(row, ['اسم', 'name']);
        if (!name) return;

        const timestamp = getValueByPatterns(row, ['طابع', 'وقت', 'تاريخ', 'time', 'date']);
        const profession = getValueByPatterns(row, ['تخصص', 'مهن', 'حرف', 'صنعة', 'prof']) || 'صنايعي';
        const phoneRaw = getValueByPatterns(row, ['هاتف', 'تليفون', 'موبايل', 'جوال', 'phone']);
        const whatsappRaw = getValueByPatterns(row, ['واتس', 'whatsapp', 'wa']) || phoneRaw;
        const areas = getValueByPatterns(row, ['مناطق', 'منطق', 'محافظ', 'عنوان', 'مكان', 'area']) || 'جميع المحافظات والمناطق';
        const imageUrl = getValueByPatterns(row, ['صور', 'معرض', 'image', 'photo']);
        const statusRaw = getValueByPatterns(row, ['status', 'حالة', 'موافق']);

        const isApproved = isStatusApproved(statusRaw);

        allHandymen.push({
          id: `hm-${i}-${Date.now()}`,
          timestamp,
          name,
          profession,
          phone: normalizePhone(phoneRaw),
          whatsapp: normalizePhone(whatsappRaw),
          areas,
          imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
          status: statusRaw,
          isApproved
        });
      });
    }

    // 2. Secondary Fallback Attempt: Position-indexed array parsing (if header-based returned 0 items)
    if (allHandymen.length === 0) {
      const parsedArray = Papa.parse<string[]>(csvText.trim(), {
        header: false,
        skipEmptyLines: true,
      });

      const rows = parsedArray.data;
      if (rows && rows.length > 0) {
        let startIdx = 0;
        const firstRow = rows[0];
        const isHeaderRow = firstRow.some(cell => 
          cell.includes('طابع') || cell.includes('الاسم') || cell.includes('التخصص') || cell.includes('Status')
        );
        if (isHeaderRow) startIdx = 1;

        for (let i = startIdx; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          const timestamp = (row[0] || '').trim();
          const name = (row[1] || '').trim();
          const profession = (row[2] || '').trim();
          const phoneRaw = (row[3] || '').trim();
          const whatsappRaw = (row[4] || '').trim() || phoneRaw;
          const areas = (row[5] || '').trim();
          const imageUrl = (row[6] || '').trim();
          const statusRaw = (row[7] || '').trim();

          if (!name) continue;

          allHandymen.push({
            id: `hm-pos-${i}-${Date.now()}`,
            timestamp,
            name,
            profession: profession || 'صنايعي',
            phone: normalizePhone(phoneRaw),
            whatsapp: normalizePhone(whatsappRaw),
            areas: areas || 'جميع المحافظات والمناطق',
            imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
            status: statusRaw,
            isApproved: isStatusApproved(statusRaw)
          });
        }
      }
    }

    // Filter CRITICAL: display ONLY approved handymen from Google Sheets
    const approvedOnly = allHandymen.filter(h => h.isApproved);

    // Cache the result in localStorage
    setCachedHandymen(approvedOnly);

    return {
      handymen: approvedOnly,
      totalFetched: allHandymen.length,
      error: null
    };

  } catch (err: any) {
    console.error("Error in fetchHandymenData:", err);
    return {
      handymen: [],
      totalFetched: 0,
      error: "تعذر تحديث البيانات مباشرة من شيت جوجل، يرجى إعادة المحاولة."
    };
  }
}
