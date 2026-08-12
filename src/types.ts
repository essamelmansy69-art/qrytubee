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

export interface HandymanReview {
  id: string;
  timestamp: string;
  handymanName: string;
  reviewerName: string;
  rating: number; // 1 to 5
  comment: string;
  status?: string;
}

export interface HandymanRatingSummary {
  averageRating: number;
  totalReviews: number;
  reviews: HandymanReview[];
}

