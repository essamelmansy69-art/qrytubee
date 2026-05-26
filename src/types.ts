/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QRStyle = 'dots' | 'squares' | 'rounded';

export interface QRConfig {
  text: string;
  originalUrl: string;
  deepLinkType: 'vnd' | 'ios' | 'android' | 'standard';
  foregroundColor: string;
  backgroundColor: string;
  eyeColor: string;
  logoUrl: string | null;
  logoScale: number; // 0.1 to 0.3
  logoMargin: boolean;
  qrStyle: QRStyle;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface youtubeUrlInfo {
  isValid: boolean;
  type: 'video' | 'channel' | 'shorts' | 'playlist' | 'unknown';
  id: string;
  cleanUrl: string;
}
