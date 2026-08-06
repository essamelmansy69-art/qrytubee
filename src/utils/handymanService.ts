import Papa from 'papaparse';
import { Handyman } from '../types';

export const HANDYMEN_CACHE_KEY = 'egypt_handymen_cache_v5';

// Check if string contains corrupted/garbled double-encoded characters
function isGarbledText(str: string): boolean {
  if (!str) return false;
  // Common double-encoded UTF-8 artifact patterns
  return /[\u00C0-\u00FF]{2,}|Ã|Ø|Ù|Ã™|Ã˜|ï¿½|\uFFFD/.test(str);
}

export function getCachedHandymen(): Handyman[] | null {
  try {
    const cached = localStorage.getItem(HANDYMEN_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean out legacy fallback items and any corrupted text
      const realOnly = parsed.filter((item: Handyman) => {
        if (!item || !item.id || item.id.startsWith('fb-')) return false;
        if (isGarbledText(item.name) || isGarbledText(item.profession) || isGarbledText(item.areas)) return false;
        return true;
      });
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
      // Never store fallback items or garbled items
      const cleanHandymen = handymen.filter((item) => {
        if (!item || !item.id || item.id.startsWith('fb-')) return false;
        if (isGarbledText(item.name) || isGarbledText(item.profession) || isGarbledText(item.areas)) return false;
        return true;
      });
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
export const GOOGLE_SHEET_GVIZ_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:json";
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
  if (!statusRaw || statusRaw.trim() === '') return true;
  const s = statusRaw.toString().trim().toLowerCase();
  if (s === 'rejected' || s === 'مرفوض' || s === 'غير موافق' || s === 'pending' || s === 'قيد المراجعة') {
    return false;
  }
  return true;
}

// JSONP loader for Google Sheets gviz API (works on live domains, bypasses CORS completely)
function fetchGvizJsonp(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error("Window/Document not available"));
    }

    const callbackName = '__gviz_cb_' + Math.random().toString(36).substring(2, 9);
    const timeoutId = setTimeout(() => {
      delete (window as any)[callbackName];
      const script = document.getElementById(callbackName);
      if (script) script.remove();
      reject(new Error("JSONP request timed out"));
    }, 7000);

    (window as any)[callbackName] = (data: any) => {
      clearTimeout(timeoutId);
      delete (window as any)[callbackName];
      const script = document.getElementById(callbackName);
      if (script) script.remove();
      resolve(data);
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=responseHandler:${callbackName}`;
    script.onerror = (err) => {
      clearTimeout(timeoutId);
      delete (window as any)[callbackName];
      script.remove();
      reject(err);
    };
    document.body.appendChild(script);
  });
}

// Parse gviz JSON structure into Handyman[]
function parseGvizStructure(json: any): Handyman[] {
  if (!json || !json.table || !json.table.cols || !json.table.rows) {
    return [];
  }

  const cols = json.table.cols.map((c: any) => (c && c.label) ? String(c.label).trim() : '');
  
  const getValueByPatterns = (cellValues: string[], patterns: string[]): string => {
    for (const p of patterns) {
      const idx = cols.findIndex(colName => colName.toLowerCase().includes(p.toLowerCase()));
      if (idx !== -1 && cellValues[idx] !== undefined && cellValues[idx] !== null) {
        return String(cellValues[idx]).trim();
      }
    }
    return '';
  };

  const handymen: Handyman[] = [];

  json.table.rows.forEach((r: any, i: number) => {
    if (!r || !r.c) return;
    const cellValues = r.c.map((cell: any) => {
      if (!cell || cell.v === null || cell.v === undefined) return '';
      return (cell.f !== undefined && cell.f !== null) ? String(cell.f) : String(cell.v);
    });

    const name = getValueByPatterns(cellValues, ['اسم', 'name']) || cellValues[1] || '';
    if (!name || isGarbledText(name)) return;

    const timestamp = getValueByPatterns(cellValues, ['طابع', 'وقت', 'تاريخ']) || cellValues[0] || '';
    const profession = getValueByPatterns(cellValues, ['تخصص', 'مهن', 'حرف', 'صنعة']) || cellValues[2] || 'صنايعي';
    const phoneRaw = getValueByPatterns(cellValues, ['هاتف', 'تليفون', 'موبايل', 'جوال']) || cellValues[3] || '';
    const whatsappRaw = getValueByPatterns(cellValues, ['واتس', 'whatsapp', 'wa']) || cellValues[4] || phoneRaw;
    const areas = getValueByPatterns(cellValues, ['مناطق', 'منطق', 'محافظ', 'عنوان', 'مكان']) || cellValues[5] || 'جميع المحافظات والمناطق';
    const imageUrl = getValueByPatterns(cellValues, ['صور', 'معرض']) || cellValues[6] || '';
    const statusRaw = getValueByPatterns(cellValues, ['status', 'حالة', 'موافق']) || cellValues[7] || '';

    const isApproved = isStatusApproved(statusRaw);

    handymen.push({
      id: `hm-gviz-${i}-${Date.now()}`,
      timestamp,
      name,
      profession: isGarbledText(profession) ? 'صنايعي' : profession,
      phone: normalizePhone(phoneRaw),
      whatsapp: normalizePhone(whatsappRaw),
      areas: isGarbledText(areas) ? 'جميع المحافظات والمناطق' : areas,
      imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
      status: statusRaw,
      isApproved
    });
  });

  return handymen;
}

export async function fetchHandymenData(): Promise<{ handymen: Handyman[]; totalFetched: number; error: string | null }> {
  try {
    let allHandymen: Handyman[] = [];

    // 1. Attempt GVIZ JSON fetch directly
    try {
      const gvizRes = await fetch(GOOGLE_SHEET_GVIZ_URL, { cache: 'no-store' });
      if (gvizRes.ok) {
        const text = await gvizRes.text();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonStr = text.substring(start, end + 1);
          const json = JSON.parse(jsonStr);
          allHandymen = parseGvizStructure(json);
        }
      }
    } catch (gvizErr) {
      console.warn("Direct GVIZ fetch failed, trying JSONP fallback...", gvizErr);
    }

    // 2. Attempt JSONP fallback (guaranteed cross-origin delivery for live site)
    if (allHandymen.length === 0) {
      try {
        const jsonpData = await fetchGvizJsonp();
        allHandymen = parseGvizStructure(jsonpData);
      } catch (jsonpErr) {
        console.warn("JSONP GVIZ fetch failed, trying CSV proxy/direct...", jsonpErr);
      }
    }

    // 3. Attempt CSV endpoints (Proxy & Direct) if GVIZ did not populate
    if (allHandymen.length === 0) {
      let csvText = '';
      const csvEndpoints = [
        '/api/handymen-csv',
        GOOGLE_SHEET_CSV_URL
      ];

      for (const endpoint of csvEndpoints) {
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
          console.warn(`CSV fetch attempt from ${endpoint} failed:`, e);
        }
      }

      if (csvText && csvText.trim().length > 0) {
        const headerParsed = Papa.parse<Record<string, any>>(csvText.trim(), {
          header: true,
          skipEmptyLines: true,
        });

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

        if (headerParsed.data && headerParsed.data.length > 0) {
          headerParsed.data.forEach((row, i) => {
            const name = getValueByPatterns(row, ['اسم', 'name']);
            if (!name || isGarbledText(name)) return;

            const timestamp = getValueByPatterns(row, ['طابع', 'وقت', 'تاريخ']);
            const profession = getValueByPatterns(row, ['تخصص', 'مهن', 'حرف', 'صنعة']) || 'صنايعي';
            const phoneRaw = getValueByPatterns(row, ['هاتف', 'تليفون', 'موبايل', 'جوال']);
            const whatsappRaw = getValueByPatterns(row, ['واتس', 'whatsapp', 'wa']) || phoneRaw;
            const areas = getValueByPatterns(row, ['مناطق', 'منطق', 'محافظ', 'عنوان', 'مكان']) || 'جميع المحافظات والمناطق';
            const imageUrl = getValueByPatterns(row, ['صور', 'معرض']);
            const statusRaw = getValueByPatterns(row, ['status', 'حالة', 'موافق']);

            allHandymen.push({
              id: `hm-csv-${i}-${Date.now()}`,
              timestamp,
              name,
              profession: isGarbledText(profession) ? 'صنايعي' : profession,
              phone: normalizePhone(phoneRaw),
              whatsapp: normalizePhone(whatsappRaw),
              areas: isGarbledText(areas) ? 'جميع المحافظات والمناطق' : areas,
              imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
              status: statusRaw,
              isApproved: isStatusApproved(statusRaw)
            });
          });
        }
      }
    }

    // Filter CRITICAL: display ONLY approved handymen from Google Sheets
    const approvedOnly = allHandymen.filter(h => h.isApproved);

    // Cache clean data
    setCachedHandymen(approvedOnly);

    return {
      handymen: approvedOnly,
      totalFetched: allHandymen.length,
      error: approvedOnly.length === 0 ? "لم يتم العثور على بيانات في شيت جوجل أو أن القائمة قيد المراجعة." : null
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

