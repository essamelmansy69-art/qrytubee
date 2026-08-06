export interface ReviewComment {
  id: string;
  timestamp: string;      // Column A: طابع زمني
  handymanName: string;   // Column B: اسم الصنايعى
  reviewerName: string;   // Column C: اسمك الكريم
  rating: number;         // Column D: تقييمك للصنايعي
  comment: string;        // Column E: رأيك أو تعليقك
  status: string;         // Column F: الـ Status
}

export interface Handyman {
  id: string;
  timestamp: string;
  name: string;
  profession: string;
  phone: string;
  whatsapp: string;
  areas: string;
  imageUrl?: string;
  status: string;
  isApproved: boolean;
  // Rating and reviews calculated from Source 2 ("reviews" tab)
  averageRating?: number;
  totalReviews?: number;
  approvedComments?: ReviewComment[];
}

export type ProfessionCategory = 
  | 'الكل'
  | 'سباك'
  | 'نقاش'
  | 'كهربائي'
  | 'نجار'
  | 'فني تكييف'
  | 'حداد'
  | 'فني دش'
  | 'ألوميتال'
  | 'فني صيانة أجهزة';

export interface ProfessionFilter {
  id: string;
  label: string;
  iconName: string;
  color: string;
}
