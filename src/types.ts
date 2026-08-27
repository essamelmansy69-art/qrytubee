export interface Game {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  thumbnail: string;
  iframeUrl: string;
  category: string;
  controlsAr: string;
  controlsEn: string;
  rating: number;
  views: number;
  playsCount: number;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
}
