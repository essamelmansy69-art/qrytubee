import Papa from 'papaparse';
import { Handyman, HandymanReview, HandymanRatingSummary } from '../types';

export const RATINGS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKzAMpQpS5kaE7phY0ueKaZhzcUvaoGv1hZ8q5hEHCpMHm4mxUHjyzCguxHKLpYJXKIwY7ZiIBiKV1/pub?gid=793398405&single=true&output=csv";
export const ADD_RATING_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdL1O9iY7utpzWLmtkINYzAY9VGhTuXkLn-DTUmzBfeDWiDqg/viewform";
export const RATINGS_CACHE_KEY = "egypt_handyman_ratings_cache_v1";

export function normalizeName(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\s\-_]+/g, '')
    .replace(/[^\w\u0600-\u06FF]/g, '');
}

export function parseRatingNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') {
    return Math.min(5, Math.max(1, Math.round(val * 10) / 10));
  }

  const str = String(val).trim();
  if (!str) return 0;

  // 1. Count star characters if ⭐ present
  const starCount = (str.match(/⭐/g) || []).length;
  if (starCount > 0) {
    return Math.min(5, starCount);
  }

  // 2. Extract digits (e.g., "5", "4.5", "5 من 5", "4/5")
  const numMatch = str.match(/([1-5](\.\d+)?)/);
  if (numMatch && numMatch[1]) {
    const parsed = parseFloat(numMatch[1]);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
      return Math.round(parsed * 10) / 10;
    }
  }

  // 3. Verbal descriptors
  const lower = str.toLowerCase();
  if (lower.includes('ممتاز') || lower.includes('ممتازة') || lower.includes('رائع')) return 5;
  if (lower.includes('جيد جدا') || lower.includes('جيدجداً')) return 4;
  if (lower.includes('جيد')) return 3;
  if (lower.includes('مقبول') || lower.includes('متوسط')) return 2;
  if (lower.includes('سيء') || lower.includes('ضعيف')) return 1;

  return 5; // Default safe positive score if text is non-empty
}

export function getCachedRatings(): HandymanReview[] | null {
  try {
    const cached = localStorage.getItem(RATINGS_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn("Could not read ratings cache:", e);
  }
  return null;
}

export function setCachedRatings(reviews: HandymanReview[]): void {
  try {
    if (reviews && reviews.length > 0) {
      localStorage.setItem(RATINGS_CACHE_KEY, JSON.stringify(reviews));
    }
  } catch (e) {
    console.warn("Could not save ratings cache:", e);
  }
}

export async function fetchAllRatings(): Promise<HandymanReview[]> {
  const endpoints = [
    '/api/ratings-csv',
    RATINGS_CSV_URL
  ];

  let rawCsv = '';

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
          rawCsv = text;
          break;
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch ratings CSV from ${url}:`, e);
    }
  }

  if (!rawCsv || !rawCsv.trim()) {
    return getCachedRatings() || [];
  }

  const parsed = Papa.parse<Record<string, any>>(rawCsv.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || !Array.isArray(parsed.data)) {
    return getCachedRatings() || [];
  }

  const reviews: HandymanReview[] = [];

  const getValueByPattern = (rowObj: Record<string, any>, patterns: string[]): string => {
    const keys = Object.keys(rowObj);
    for (const p of patterns) {
      const foundKey = keys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
      if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
        return String(rowObj[foundKey]).trim();
      }
    }
    return '';
  };

  parsed.data.forEach((row, index) => {
    const handymanName = getValueByPattern(row, ['اسم الصنايعى', 'اسم الصنايعي', 'صنايعي', 'handyman', 'كود']);
    if (!handymanName || handymanName.includes('اسم الصنايعى') || handymanName === '#REF!') return;

    const timestamp = getValueByPattern(row, ['طابع', 'وقت', 'تاريخ', 'timestamp']) || new Date().toLocaleDateString('ar-EG');
    const reviewerName = getValueByPattern(row, ['اسمك', 'العميل', 'المقيم', 'الاسم', 'name']) || 'عميل تقييم';
    const ratingRaw = getValueByPattern(row, ['تقييم', 'rating', 'نجوم', 'درجة']);
    const comment = getValueByPattern(row, ['رأيك', 'تعليق', 'ملاحظات', 'review', 'comment']);
    const status = getValueByPattern(row, ['status', 'حالة']);

    const ratingVal = parseRatingNumber(ratingRaw);

    reviews.push({
      id: `review-${index}-${Date.now()}`,
      timestamp,
      handymanName: handymanName.trim(),
      reviewerName: reviewerName.trim(),
      rating: ratingVal > 0 ? ratingVal : 5,
      comment: comment.trim(),
      status: status ? status.trim() : 'مقبول'
    });
  });

  setCachedRatings(reviews);
  return reviews;
}

export function getHandymanRatingSummary(
  handyman: Handyman,
  allReviews: HandymanReview[]
): HandymanRatingSummary {
  const normCardName = normalizeName(handyman.name);
  const cardId = handyman.id ? handyman.id.toLowerCase() : '';

  const matched = allReviews.filter(rev => {
    if (!rev.handymanName) return false;
    const normRevName = normalizeName(rev.handymanName);
    
    // Direct or normalized match
    if (normRevName === normCardName) return true;
    if (cardId && rev.handymanName.toLowerCase().includes(cardId)) return true;
    if (normCardName.length > 3 && normRevName.includes(normCardName)) return true;
    if (normRevName.length > 3 && normCardName.includes(normRevName)) return true;

    return false;
  });

  if (matched.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      reviews: []
    };
  }

  const sum = matched.reduce((acc, r) => acc + (r.rating || 5), 0);
  const average = Math.round((sum / matched.length) * 10) / 10;

  return {
    averageRating: Math.min(5, Math.max(1, average)),
    totalReviews: matched.length,
    reviews: matched
  };
}
