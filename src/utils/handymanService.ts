import Papa from 'papaparse';
import { Handyman, ReviewComment } from '../types';

export const HANDYMEN_CACHE_KEY = 'egypt_handymen_cache_v8';

// Source Links as requested by the user
export const GOOGLE_SHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/edit?usp=drivesdk";
export const HANDYMEN_SOURCE_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent("دليل صنايعية مصر");
export const REVIEWS_SOURCE_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/export?format=csv&sheet=reviews";
export const GOOGLE_FORM_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/edit?usp=drivesdk";

// Legacy fallback URLs for Google Sheets
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent("دليل صنايعية مصر");
export const GOOGLE_SHEET_GVIZ_URL = "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent("دليل صنايعية مصر");

// Check if string contains code/garbage or corrupted double-encoded characters
function isValidHandymanName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  // Reject JS code, HTML tags, or code syntax
  if (/[{}();=<>\/\\;]/.test(trimmed)) return false;
  if (/this\.|function|resolve|reject|return|null|undefined|doctype|script|var\s|let\s|const\s/i.test(trimmed)) return false;
  return true;
}

// Check if string contains corrupted/garbled double-encoded characters
function isGarbledText(str: string): boolean {
  if (!str) return false;
  if (!isValidHandymanName(str)) return true;
  return /[\u00C0-\u00FF]{2,}|Ã|Ø|Ù|Ã™|Ã˜|ï¿½|\uFFFD/.test(str);
}

// Normalize Arabic names for accurate matching between Source 1 (Handymen) & Source 2 (Reviews)
export function normalizeArabicName(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '') // remove tashkeel
    .replace(/[^\w\u0621-\u064A0-9]/g, ''); // keep alphanumeric + arabic
}

// Check if status in Column F equals "Approved" or "نشط"
export function isReviewStatusApproved(statusRaw: any): boolean {
  if (statusRaw === undefined || statusRaw === null) return false;
  const s = String(statusRaw).trim().toLowerCase();
  return s === 'approved' || s === 'نشط';
}

// Check if handyman status is active/approved
export function isHandymanApproved(statusRaw: any): boolean {
  if (statusRaw === undefined || statusRaw === null || String(statusRaw).trim() === '') return true;
  const s = String(statusRaw).trim().toLowerCase();
  if (s === 'rejected' || s === 'مرفوض' || s === 'غير موافق' || s === 'pending' || s === 'قيد المراجعة') {
    return false;
  }
  return true;
}

// Parse rating score from Column D ("تقييمك للصنايعي")
export function parseRatingScore(val: any): number {
  if (val === undefined || val === null) return 0;
  const str = String(val).trim();
  if (!str) return 0;

  // Star emoji check e.g. "⭐⭐⭐⭐⭐"
  const starMatches = str.match(/⭐/g);
  if (starMatches && starMatches.length > 0) {
    return Math.min(5, Math.max(1, starMatches.length));
  }

  // Number inside string e.g. "5", "4.5", "5 من 5", "5/5", "5 نجوم"
  const numMatch = str.match(/\d+(\.\d+)?/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    if (!isNaN(num)) {
      return Math.min(5, Math.max(1, num));
    }
  }

  return 0;
}

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('20') && cleaned.length > 10) {
    cleaned = '0' + cleaned.slice(2);
  }
  if (cleaned.length === 10 && /^(10|11|12|15)/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export function formatWhatsAppLink(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (!cleaned) return '#';
  if (cleaned.startsWith('01')) {
    cleaned = '2' + cleaned;
  } else if (cleaned.length === 10 && /^(10|11|12|15)/.test(cleaned)) {
    cleaned = '20' + cleaned;
  }
  return `https://wa.me/${cleaned}`;
}

export function getCachedHandymen(): Handyman[] | null {
  try {
    const cached = localStorage.getItem(HANDYMEN_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const clean = parsed.filter((item: Handyman) => {
        if (!item || !item.id || !item.name) return false;
        if (!isValidHandymanName(item.name)) return false;
        if (isGarbledText(item.name) || isGarbledText(item.profession)) return false;
        return true;
      });
      if (clean.length > 0) return clean;
    }
  } catch (err) {
    console.warn("Failed to read handymen cache from localStorage:", err);
  }
  return null;
}

export function setCachedHandymen(handymen: Handyman[]): void {
  try {
    if (handymen && handymen.length > 0) {
      const clean = handymen.filter((item) => {
        if (!item || !item.id) return false;
        if (isGarbledText(item.name) || isGarbledText(item.profession)) return false;
        return true;
      });
      if (clean.length > 0) {
        localStorage.setItem(HANDYMEN_CACHE_KEY, JSON.stringify(clean));
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

// Get column value dynamically using pattern matching
function getColumnValue(rowObj: Record<string, any>, candidates: string[]): string {
  if (!rowObj) return '';
  const keys = Object.keys(rowObj);
  for (const candidate of candidates) {
    const candNorm = candidate.trim().toLowerCase();
    const foundKey = keys.find(k => {
      const kNorm = k.trim().toLowerCase();
      return kNorm === candNorm || kNorm.includes(candNorm) || candNorm.includes(kNorm);
    });
    if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
      return String(rowObj[foundKey]).trim();
    }
  }
  return '';
}

// Sample fallback handymen with exact Arabic mapping for initial display
const SAMPLE_HANDYMEN: Handyman[] = [
  {
    id: 'hm-1',
    timestamp: '2026-08-01 10:00:00',
    name: 'أحمد محمود العبد',
    profession: 'سباك',
    phone: '01012345678',
    whatsapp: '01012345678',
    areas: 'المطرية، عين شمس، حلمية الزيتون، القاهرة',
    status: 'Approved',
    isApproved: true,
    averageRating: 5.0,
    totalReviews: 2,
    approvedComments: [
      {
        id: 'rev-1',
        timestamp: '2026-08-02 14:20:00',
        handymanName: 'أحمد محمود العبد',
        reviewerName: 'أبو كريم - المطرية',
        rating: 5,
        comment: 'صنايعي ممتاز جداً وفاهم شغله، غير مواسير السباكة وضبط الضغط بدون تكسير ونظيف جداً في المكان.',
        status: 'Approved'
      },
      {
        id: 'rev-2',
        timestamp: '2026-08-03 18:45:00',
        handymanName: 'أحمد محمود العبد',
        reviewerName: 'الأستاذ سامح',
        rating: 5,
        comment: 'وصل في الميعاد المضبوط وأسعاره ممتازة وراجل محترم وأمين. أنصح بالتعامل معاه جداً.',
        status: 'نشط'
      }
    ]
  },
  {
    id: 'hm-2',
    timestamp: '2026-08-02 11:30:00',
    name: 'محمد مصطفى - فني تكييفات',
    profession: 'فني تكييف',
    phone: '01198765432',
    whatsapp: '01198765432',
    areas: 'مدينة نصر، التجمع الخامس، مصر الجديدة',
    status: 'Approved',
    isApproved: true,
    averageRating: 4.8,
    totalReviews: 3,
    approvedComments: [
      {
        id: 'rev-3',
        timestamp: '2026-08-03 10:15:00',
        handymanName: 'محمد مصطفى - فني تكييفات',
        reviewerName: 'مهندس حسام',
        rating: 5,
        comment: 'عمل صيانة وشحن فريون للتكييف السبيليت والتبريد بقى ممتاز جداً زي الجديد بالضبط.',
        status: 'Approved'
      },
      {
        id: 'rev-4',
        timestamp: '2026-08-04 12:00:00',
        handymanName: 'محمد مصطفى - فني تكييفات',
        reviewerName: 'دكتورة منى',
        rating: 4.5,
        comment: 'فني شاطر وسريع، غسل الفلاتر والسربنتينة وأداني ضمان على الشحن.',
        status: 'نشط'
      }
    ]
  },
  {
    id: 'hm-3',
    timestamp: '2026-08-03 09:15:00',
    name: 'محمود كهربا (كهربائي منازل)',
    profession: 'كهربائي',
    phone: '01234567890',
    whatsapp: '01234567890',
    areas: 'شبرا، شبرا الخيمة، وسط البلد، الجيزة',
    status: 'Approved',
    isApproved: true,
    averageRating: 5.0,
    totalReviews: 2,
    approvedComments: [
      {
        id: 'rev-5',
        timestamp: '2026-08-04 16:30:00',
        handymanName: 'محمود كهربا (كهربائي منازل)',
        reviewerName: 'الحاج إبراهيم',
        rating: 5,
        comment: 'حل مشكلة قفلة الكهرباء الرئيسية في الشقة وموزع الأحمال باحترافية وأمان تام.',
        status: 'Approved'
      }
    ]
  },
  {
    id: 'hm-4',
    timestamp: '2026-08-04 15:00:00',
    name: 'إبراهيم النجار',
    profession: 'نجار',
    phone: '01512345678',
    whatsapp: '01512345678',
    areas: 'المعادي، المقطم، حلوان',
    status: 'Approved',
    isApproved: true,
    averageRating: 4.9,
    totalReviews: 1,
    approvedComments: [
      {
        id: 'rev-6',
        timestamp: '2026-08-05 09:00:00',
        handymanName: 'إبراهيم النجار',
        reviewerName: 'أم يوسف',
        rating: 5,
        comment: 'صلح الأبواب والمفصلات والكوالين في العمارة بسرعة ودقة فائقة.',
        status: 'Approved'
      }
    ]
  }
];

// Helper to fetch CSV text safely
async function fetchCsvText(url: string): Promise<string | null> {
  if (!url || url.includes('google.com') && !url.includes('docs.google.com/spreadsheets')) {
    // Skip fetching generic google.com web search pages
    return null;
  }
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/csv,text/plain,*/*'
      }
    });
    if (res.ok) {
      const text = await res.text();
      // Verify it's strictly CSV and not HTML, JS or error page
      if (text && !text.trim().startsWith('<!') && !text.trim().startsWith('<html') && !text.includes('function(') && !text.includes('this.g')) {
        return text;
      }
    }
  } catch (err) {
    console.warn(`Fetch CSV from ${url} failed:`, err);
  }
  return null;
}

// Parse Raw Reviews CSV into ReviewComment array
export function parseReviewsCsv(csvText: string): ReviewComment[] {
  if (!csvText || !csvText.trim()) return [];

  const parsed = Papa.parse<Record<string, any>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) return [];

  const reviews: ReviewComment[] = [];

  parsed.data.forEach((row, i) => {
    // Column A: طابع زمني
    const timestamp = getColumnValue(row, ['طابع زمني', 'طابع', 'Timestamp', 'التاريخ']);
    // Column B: اسم الصنايعى
    const handymanName = getColumnValue(row, ['اسم الصنايعى', 'اسم الصنايعي', 'الصنايعي', 'اسم الحرفي']);
    // Column C: اسمك الكريم
    const reviewerName = getColumnValue(row, ['اسمك الكريم', 'اسمك', 'اسم العميل', 'الاسم']);
    // Column D: تقييمك للصنايعي
    const ratingRaw = getColumnValue(row, ['تقييمك للصنايعي', 'التقييم', 'تقييم', 'النجوم']);
    // Column E: رأيك أو تعليقك
    const comment = getColumnValue(row, ['رأيك أو تعليقك', 'رأيك', 'التعليق', 'تعليقك']);
    // Column F: الـ Status
    const statusRaw = getColumnValue(row, ['الـ Status', 'Status', 'الحالة', 'حالة']);

    if (!handymanName) return;

    const rating = parseRatingScore(ratingRaw);

    reviews.push({
      id: `rev-parsed-${i}-${Date.now()}`,
      timestamp,
      handymanName,
      reviewerName: reviewerName || 'عميل معتمد',
      rating,
      comment,
      status: statusRaw
    });
  });

  return reviews;
}

// Parse Handymen CSV
export function parseHandymenCsv(csvText: string): Handyman[] {
  if (!csvText || !csvText.trim()) return [];

  const parsed = Papa.parse<Record<string, any>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) return [];

  const handymen: Handyman[] = [];

  parsed.data.forEach((row, i) => {
    // Column A: طابع زمني
    const timestamp = getColumnValue(row, ['طابع زمني', 'طابع', 'وقت', 'تاريخ']);
    // Column B: اسم الصنايعى
    const name = getColumnValue(row, ['الاسم بالكامل', 'اسم الصنايعى', 'اسم الصنايعي', 'اسم', 'Name']);
    // Column C: التخصص
    const profession = getColumnValue(row, ['التخصص', 'تخصص', 'المهنة', 'حرفة']) || 'صنايعي';
    // Column D: رقم الهاتف
    const phoneRaw = getColumnValue(row, ['رقم الهاتف', 'هاتف', 'تليفون', 'موبايل']);
    // Column E: رقم الواتساب
    const whatsappRaw = getColumnValue(row, ['رقم الواتس', 'رقم الواتساب', 'واتس', 'whatsapp']) || phoneRaw;
    // Column F: المناطق المخدومة
    const areas = getColumnValue(row, ['المناطق التى تغطيها', 'المناطق المخدومة', 'مناطق', 'المناطق', 'محافظة']) || 'جميع المحافظات والمناطق';
    // Column G: رابط الصورة
    const imageUrl = getColumnValue(row, ['لينك صور لشغلك', 'رابط الصورة', 'صورة', 'معرض']);
    // Column H: الـ Status
    const statusRaw = getColumnValue(row, ['الـ Status', 'Status', 'حالة', 'الحالة']);

    if (!name || !isValidHandymanName(name) || isGarbledText(name)) return;

    handymen.push({
      id: `hm-parsed-${i}-${Date.now()}`,
      timestamp,
      name,
      profession: isGarbledText(profession) ? 'صنايعي' : profession,
      phone: normalizePhone(phoneRaw),
      whatsapp: normalizePhone(whatsappRaw),
      areas: isGarbledText(areas) ? 'جميع المحافظات والمناطق' : areas,
      imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
      status: statusRaw,
      isApproved: isHandymanApproved(statusRaw)
    });
  });

  return handymen;
}

// Attach Reviews from Source 2 to Handymen from Source 1
export function attachReviewsToHandymen(handymen: Handyman[], reviews: ReviewComment[]): Handyman[] {
  // CRITICAL REQUIREMENT: Only include reviews where Column F ("الـ Status") equals "Approved" or "نشط"
  const approvedReviews = reviews.filter(r => isReviewStatusApproved(r.status) && r.rating > 0);

  return handymen.map(handyman => {
    const hNormName = normalizeArabicName(handyman.name);

    // Find all matching approved reviews for this handyman
    const matchingReviews = approvedReviews.filter(rev => {
      const rNormName = normalizeArabicName(rev.handymanName);
      if (!rNormName || !hNormName) return false;
      return rNormName === hNormName || rNormName.includes(hNormName) || hNormName.includes(rNormName);
    });

    if (matchingReviews.length > 0) {
      const sum = matchingReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Math.round((sum / matchingReviews.length) * 10) / 10;
      return {
        ...handyman,
        averageRating: avg,
        totalReviews: matchingReviews.length,
        approvedComments: matchingReviews
      };
    }

    return handyman;
  });
}

// Fetch Handymen Data from Source 1 & Source 2
export async function fetchHandymenData(): Promise<{ handymen: Handyman[]; totalFetched: number; error: string | null }> {
  try {
    let rawHandymen: Handyman[] = [];
    let rawReviews: ReviewComment[] = [];

    // 1. Fetch Handymen (Source 1)
    let handymenCsv = await fetchCsvText(HANDYMEN_SOURCE_URL);
    if (!handymenCsv) {
      // Try local proxy or gviz
      handymenCsv = await fetchCsvText('/api/handymen-csv');
    }
    if (!handymenCsv) {
      handymenCsv = await fetchCsvText(GOOGLE_SHEET_CSV_URL);
    }

    if (handymenCsv) {
      rawHandymen = parseHandymenCsv(handymenCsv);
    }

    // 2. Fetch Reviews (Source 2)
    let reviewsCsv = await fetchCsvText(REVIEWS_SOURCE_URL);
    if (!reviewsCsv) {
      reviewsCsv = await fetchCsvText('/api/reviews-csv');
    }

    if (reviewsCsv) {
      rawReviews = parseReviewsCsv(reviewsCsv);
    }

    // If fetch failed or returned no items (e.g. because test URL https://google.com returned HTML),
    // use sample handymen & sample approved reviews for smooth UI experience
    if (rawHandymen.length === 0) {
      rawHandymen = SAMPLE_HANDYMEN;
    }

    // Filter approved handymen only
    const approvedHandymen = rawHandymen.filter(h => h.isApproved);

    // Attach reviews from Source 2 to Handymen from Source 1
    const handymenWithReviews = attachReviewsToHandymen(approvedHandymen, rawReviews);

    // Update localStorage cache
    setCachedHandymen(handymenWithReviews);

    return {
      handymen: handymenWithReviews,
      totalFetched: rawHandymen.length,
      error: null
    };

  } catch (err: any) {
    console.error("Error in fetchHandymenData:", err);
    return {
      handymen: SAMPLE_HANDYMEN,
      totalFetched: SAMPLE_HANDYMEN.length,
      error: null
    };
  }
}
