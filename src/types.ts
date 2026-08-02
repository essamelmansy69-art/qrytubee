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
  averageRating?: number;
  ratingCount?: number;
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
