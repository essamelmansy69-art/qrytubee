import Papa from 'papaparse';
import { Review } from '../types';

// Exact Part 1, Part 2, Part 3 as requested
const PART_1 = "https://google.com";
const PART_2 = "/export?format=csv";
const PART_3 = "&sheet=Reviews";

// Combined into ONE URL in JS code
export const REVIEWS_CSV_URL = PART_1 + PART_2 + PART_3;

export const LOCAL_REVIEWS_STORAGE_KEY = 'egypt_handyman_reviews_local_v1';

// Format Arabic date
export function getArabicFormattedDate(): string {
  try {
    const d = new Date();
    return d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return 'الآن';
  }
}

// Get reviews stored in localStorage
export function getLocalReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_REVIEWS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to parse local reviews from localStorage:", e);
    return [];
  }
}

// Save a new review locally
export function saveLocalReview(
  handymanName: string,
  customerName: string,
  rating: number,
  comment: string
): Review {
  const newReview: Review = {
    id: `rev-local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: getArabicFormattedDate(),
    handymanName: handymanName.trim(),
    customerName: customerName.trim() || 'عميل ديكورا',
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment: comment.trim(),
    status: 'Approved', // Mark as approved locally so it displays for the user immediately
    isLocal: true
  };

  const currentLocal = getLocalReviews();
  const updated = [newReview, ...currentLocal];

  try {
    localStorage.setItem(LOCAL_REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    // Trigger window custom event so all components update instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('local-review-added', { detail: newReview }));
    }
  } catch (e) {
    console.warn("Failed to save local review:", e);
  }

  return newReview;
}

// Fetch remote reviews from the combined CSV URL
export async function fetchRemoteReviews(): Promise<Review[]> {
  const remoteReviews: Review[] = [];

  try {
    // Attempt fetch from combined REVIEWS_CSV_URL
    const response = await fetch(REVIEWS_CSV_URL, { 
      cache: 'no-store',
      headers: {
        "Accept": "text/csv,text/plain,*/*"
      }
    });

    if (response.ok) {
      const csvText = await response.text();
      if (csvText && !csvText.trim().startsWith('<!DOCTYPE') && !csvText.trim().startsWith('<html')) {
        const parsed = Papa.parse<string[]>(csvText.trim(), {
          header: false,
          skipEmptyLines: true
        });

        if (parsed.data && parsed.data.length > 0) {
          parsed.data.forEach((row, index) => {
            // Columns: [Timestamp, Handyman_Name, Customer_Name, Rating, Comment, Status]
            if (!row || row.length < 3) return;

            // Skip header if row 0 has header titles
            if (index === 0 && (row[1]?.includes('Handyman') || row[1]?.includes('اسم'))) {
              return;
            }

            const timestamp = row[0]?.trim() || '';
            const handymanName = row[1]?.trim() || '';
            const customerName = row[2]?.trim() || 'عميل';
            const ratingNum = parseFloat(row[3]) || 5;
            const comment = row[4]?.trim() || '';
            const status = row[5]?.trim() || 'Approved';

            if (handymanName) {
              remoteReviews.push({
                id: `rev-remote-${index}-${Date.now()}`,
                timestamp,
                handymanName,
                customerName,
                rating: Math.min(5, Math.max(1, ratingNum)),
                comment,
                status
              });
            }
          });
        }
      }
    }
  } catch (e) {
    console.warn("Remote reviews fetch notice (using local storage & fallback if offline/cors):", e);
  }

  return remoteReviews;
}

// Check if review status is approved
export function isReviewApproved(status: string): boolean {
  if (!status || status.trim() === '') return true;
  const s = status.trim().toLowerCase();
  return s === 'approved' || s === 'نشط' || s === 'معتمد' || s === 'موافق' || s === 'active';
}

// Get all combined reviews (Remote + Local)
export async function fetchAllReviews(): Promise<Review[]> {
  const remote = await fetchRemoteReviews();
  const local = getLocalReviews();

  // Deduplicate if needed
  return [...local, ...remote];
}

// Helper to filter reviews for a specific handyman and calculate statistics
export function calculateHandymanRating(handymanName: string, reviewsList: Review[]): {
  approvedReviews: Review[];
  averageRating: number;
  totalReviewsCount: number;
} {
  if (!handymanName) {
    return { approvedReviews: [], averageRating: 0, totalReviewsCount: 0 };
  }

  const normalizedTargetName = handymanName.trim().toLowerCase();

  const approvedReviews = reviewsList.filter((r) => {
    if (!r || !r.handymanName) return false;
    const matchesName = r.handymanName.trim().toLowerCase() === normalizedTargetName;
    const approved = isReviewApproved(r.status);
    return matchesName && approved;
  });

  if (approvedReviews.length === 0) {
    return {
      approvedReviews: [],
      averageRating: 5.0, // Default display rating for new handymen
      totalReviewsCount: 0
    };
  }

  const sum = approvedReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const avg = Math.round((sum / approvedReviews.length) * 10) / 10;

  return {
    approvedReviews,
    averageRating: avg,
    totalReviewsCount: approvedReviews.length
  };
}
