import Papa from 'papaparse';
import { Handyman, Review } from '../types';

// Rating parser helper
export function parseRatingValue(val: any): number {
  if (!val) return 5;
  const str = String(val).trim();
  if (str.includes('⭐')) {
    const count = (str.match(/⭐/g) || []).length;
    return count > 0 ? count : 5;
  }
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (!isNaN(num) && num > 0) {
    return Math.min(5, Math.max(1, Math.round(num)));
  }
  if (str.includes('ممتاز') || str.includes('جيد جدا')) return 5;
  if (str.includes('جيد')) return 4;
  if (str.includes('مقبول')) return 3;
  return 5;
}

// Local storage key for reviews
const LOCAL_REVIEWS_KEY = 'local_handyman_reviews_v1';

export function getLocalReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserReview(review: Omit<Review, 'id' | 'timestamp'>): Review {
  const newReview: Review = {
    ...review,
    id: `rev-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    isApproved: true
  };
  const existing = getLocalReviews();
  const updated = [newReview, ...existing];
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save review to localStorage:", e);
  }
  return newReview;
}

// Fetch all reviews from Google Sheets (GID 793398405 / sheet=reviews) + local storage
export async function fetchReviewsData(): Promise<Review[]> {
  const activeSheetId = getActiveSheetId();
  const reviews: Review[] = [];

  // 1. Fetch from Google Sheet GID 793398405 / sheet=reviews
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${activeSheetId}/gviz/tq?tqx=out:json&gid=793398405`;
    const res = await fetch(gvizUrl, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const json = JSON.parse(text.substring(start, end + 1));
        if (json?.table?.rows) {
          json.table.rows.forEach((r: any, idx: number) => {
            if (!r || !r.c) return;
            const cellValues = r.c.map((cell: any) => {
              if (!cell || cell.v === null || cell.v === undefined) return '';
              return (cell.f !== undefined && cell.f !== null) ? String(cell.f) : String(cell.v);
            });

            const timestamp = cellValues[0] || '';
            const handymanName = (cellValues[1] || '').trim();
            const reviewerName = (cellValues[2] || '').trim() || 'عميل';
            const ratingRaw = cellValues[3];
            const comment = (cellValues[4] || '').trim();
            const statusRaw = (cellValues[5] || '').trim();

            if (!handymanName || handymanName.includes('اسم الصنايعى') || handymanName.includes('طابع')) return;

            reviews.push({
              id: `rev-sheet-${idx}-${Date.now()}`,
              handymanName,
              reviewerName,
              rating: parseRatingValue(ratingRaw),
              comment,
              timestamp,
              isApproved: statusRaw ? isStatusApproved(statusRaw) : true
            });
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch reviews from Google Sheet:", e);
  }

  // 2. Combine with local reviews
  const localReviews = getLocalReviews();
  return [...localReviews, ...reviews];
}

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

export const DEFAULT_SHEET_ID = "1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY";

export function extractSheetId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export function getActiveSheetId(): string {
  try {
    const custom = localStorage.getItem('custom_google_sheet_id');
    if (custom && custom.trim()) {
      return custom.trim();
    }
  } catch (e) {
    console.warn("Could not read custom_google_sheet_id from localStorage");
  }
  return DEFAULT_SHEET_ID;
}

export function setCustomSheetId(urlOrId: string): string {
  const cleanId = extractSheetId(urlOrId);
  try {
    if (cleanId) {
      localStorage.setItem('custom_google_sheet_id', cleanId);
      // Clear cache when sheet ID changes to force new fetch
      localStorage.removeItem(HANDYMEN_CACHE_KEY);
    } else {
      localStorage.removeItem('custom_google_sheet_id');
      localStorage.removeItem(HANDYMEN_CACHE_KEY);
    }
  } catch (e) {
    console.warn("Could not save custom_google_sheet_id to localStorage");
  }
  return cleanId || DEFAULT_SHEET_ID;
}

export function getSheetCsvUrl(sheetId: string = getActiveSheetId()): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

export function getSheetGvizUrl(sheetId: string = getActiveSheetId()): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
}

export const GOOGLE_SHEET_CSV_URL = getSheetCsvUrl();
export const GOOGLE_SHEET_GVIZ_URL = getSheetGvizUrl();
export const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe1DdO1fgTi2C3atmqrszWCRn5vvb8R3NvF9-yhvv1qzR0Cqw/viewform?usp=header";

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

// Discover all sheet GIDs (tab IDs) in a Google Sheet
async function discoverSheetGids(sheetId: string): Promise<string[]> {
  const candidateGids = ['913622856', '0', '793398405'];
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`, { cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      const matches = html.match(/gid=([0-9]+)/g);
      if (matches) {
        const extracted = matches.map(m => m.replace('gid=', ''));
        return Array.from(new Set([...candidateGids, ...extracted]));
      }
    }
  } catch (e) {
    console.warn("Could not discover sheet GIDs via htmlview:", e);
  }
  return candidateGids;
}

// JSONP loader for Google Sheets gviz API (works on live domains, bypasses CORS completely)
function fetchGvizJsonp(sheetId: string = getActiveSheetId(), gid?: string): Promise<any> {
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
    const gidParam = gid ? `&gid=${gid}` : '';
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}${gidParam}`;
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

    const name = (getValueByPatterns(cellValues, ['اسم', 'name']) || cellValues[1] || '').trim();
    if (!name || isGarbledText(name)) return;
    // Skip header rows or formula error cells
    if (name.includes('طابع') || name.includes('الاسم') || name === 'اسم الصنايعى' || name === '#REF!') return;

    const timestamp = getValueByPatterns(cellValues, ['طابع', 'وقت', 'تاريخ']) || cellValues[0] || '';
    const profession = getValueByPatterns(cellValues, ['تخصص', 'مهن', 'حرف', 'صنعة']) || cellValues[2] || 'صنايعي';
    if (profession.includes('تخصص') || profession.includes('التخصص')) return;

    const phoneRaw = getValueByPatterns(cellValues, ['هاتف', 'تليفون', 'موبايل', 'جوال']) || cellValues[3] || '';
    const whatsappRaw = getValueByPatterns(cellValues, ['واتس', 'whatsapp', 'wa']) || cellValues[4] || phoneRaw;
    const areas = getValueByPatterns(cellValues, ['مناطق', 'منطق', 'محافظ', 'عنوان', 'مكان']) || cellValues[5] || 'جميع المحافظات والمناطق';
    const imageUrl = getValueByPatterns(cellValues, ['صور', 'معرض']) || cellValues[6] || '';
    const statusRaw = getValueByPatterns(cellValues, ['status', 'حالة', 'موافق']) || cellValues[7] || '';

    const isApproved = isStatusApproved(statusRaw);

    handymen.push({
      id: `hm-gviz-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
    const activeSheetId = getActiveSheetId();
    const gids = await discoverSheetGids(activeSheetId);

    const handymenMap = new Map<string, Handyman>();

    // Try fetching each tab GID
    for (const gid of gids) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${activeSheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
      let tabHandymen: Handyman[] = [];

      // 1. Direct GVIZ fetch
      try {
        const gvizRes = await fetch(gvizUrl, { cache: 'no-store' });
        if (gvizRes.ok) {
          const text = await gvizRes.text();
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            const jsonStr = text.substring(start, end + 1);
            const json = JSON.parse(jsonStr);
            tabHandymen = parseGvizStructure(json);
          }
        }
      } catch (gvizErr) {
        console.warn(`Direct GVIZ fetch failed for GID ${gid}, trying JSONP...`, gvizErr);
      }

      // 2. JSONP fallback
      if (tabHandymen.length === 0) {
        try {
          const jsonpData = await fetchGvizJsonp(activeSheetId, gid);
          tabHandymen = parseGvizStructure(jsonpData);
        } catch (jsonpErr) {
          console.warn(`JSONP GVIZ fetch failed for GID ${gid}...`, jsonpErr);
        }
      }

      // Add to map
      for (const h of tabHandymen) {
        const key = `${h.name}_${h.phone}`;
        if (!handymenMap.has(key)) {
          handymenMap.set(key, h);
        }
      }
    }

    // 3. Attempt CSV endpoints if no handymen found yet
    if (handymenMap.size === 0) {
      let csvText = '';
      const csvEndpoints = [
        `/api/handymen-csv?sheetId=${encodeURIComponent(activeSheetId)}&gid=913622856`,
        `/api/handymen-csv?sheetId=${encodeURIComponent(activeSheetId)}`,
        getSheetCsvUrl(activeSheetId)
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
            const name = (getValueByPatterns(row, ['اسم', 'name']) || Object.values(row)[1] as string || '').trim();
            if (!name || isGarbledText(name) || name.includes('طابع') || name.includes('الاسم') || name === 'اسم الصنايعى' || name === '#REF!') return;

            const timestamp = getValueByPatterns(row, ['طابع', 'وقت', 'تاريخ']);
            const profession = getValueByPatterns(row, ['تخصص', 'مهن', 'حرف', 'صنعة']) || 'صنايعي';
            if (profession.includes('تخصص') || profession.includes('التخصص')) return;

            const phoneRaw = getValueByPatterns(row, ['هاتف', 'تليفون', 'موبايل', 'جوال']);
            const whatsappRaw = getValueByPatterns(row, ['واتس', 'whatsapp', 'wa']) || phoneRaw;
            const areas = getValueByPatterns(row, ['مناطق', 'منطق', 'محافظ', 'عنوان', 'مكان']) || 'جميع المحافظات والمناطق';
            const imageUrl = getValueByPatterns(row, ['صور', 'معرض']);
            const statusRaw = getValueByPatterns(row, ['status', 'حالة', 'موافق']);

            const handymanObj: Handyman = {
              id: `hm-csv-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp,
              name,
              profession: isGarbledText(profession) ? 'صنايعي' : profession,
              phone: normalizePhone(phoneRaw),
              whatsapp: normalizePhone(whatsappRaw),
              areas: isGarbledText(areas) ? 'جميع المحافظات والمناطق' : areas,
              imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
              status: statusRaw,
              isApproved: isStatusApproved(statusRaw)
            };

            const key = `${handymanObj.name}_${handymanObj.phone}`;
            if (!handymenMap.has(key)) {
              handymenMap.set(key, handymanObj);
            }
          });
        }
      }
    }

    const allHandymen = Array.from(handymenMap.values());

    // Filter CRITICAL: display ONLY approved handymen from Google Sheets
    const approvedOnly = allHandymen.filter(h => h.isApproved);

    // Fetch reviews from reviews sheet & local storage
    try {
      const allReviews = await fetchReviewsData();
      approvedOnly.forEach(h => {
        const handymanReviews = allReviews.filter(r => 
          r.isApproved !== false && 
          r.handymanName.trim().toLowerCase() === h.name.trim().toLowerCase()
        );
        if (handymanReviews.length > 0) {
          const totalRating = handymanReviews.reduce((sum, r) => sum + r.rating, 0);
          h.averageRating = Math.round((totalRating / handymanReviews.length) * 10) / 10;
          h.ratingCount = handymanReviews.length;
          h.reviews = handymanReviews;
        } else {
          h.averageRating = undefined;
          h.ratingCount = 0;
          h.reviews = [];
        }
      });
    } catch (e) {
      console.warn("Could not attach reviews to handymen:", e);
    }

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

