export interface QRConfig {
  url: string;
  dotsColor: string;
  bgColor: string;
  logoUrl?: string;
  logoScale: number; // 0.1 to 0.3
  frameText?: string;
  frameColor: string;
  frameType: 'none' | 'basic' | 'modern';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  qrStyle: 'square' | 'dots' | 'rounded';
}

export interface CampaignStats {
  scansToday: number;
  linksCreated: number;
  activeCampaigns: number;
}
