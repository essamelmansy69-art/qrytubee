/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { youtubeUrlInfo, PlatformType } from './types';

/**
 * Parses any supported social media URL (YouTube, Facebook, Instagram, TikTok)
 * and extracts platform-specific types and IDs.
 * Backward-compatible wrapper exported as parseYoutubeUrl.
 */
export function parseYoutubeUrl(url: string): youtubeUrlInfo {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: false, platform: 'other', type: 'unknown', id: '', cleanUrl: '' };
  }

  // 1. FACEBOOK DETACTION
  if (/facebook\.com|fb\.com|fb\.watch/i.test(trimmed)) {
    // A. Numeric group / profile ID
    const fbProfileIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/profile\.php\?id=([0-9]+)/i;
    let match = trimmed.match(fbProfileIdRegex);
    if (match) {
      return {
        isValid: true,
        platform: 'facebook',
        type: 'profile',
        id: match[1],
        cleanUrl: `https://www.facebook.com/profile.php?id=${match[1]}`,
      };
    }

    // B. Group link
    const fbGroupRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/groups\/([a-zA-Z0-9._-]+)/i;
    match = trimmed.match(fbGroupRegex);
    if (match) {
      return {
        isValid: true,
        platform: 'facebook',
        type: 'playlist', // map groups to playlist-style collections
        id: match[1],
        cleanUrl: `https://www.facebook.com/groups/${match[1]}`,
      };
    }

    // C. Username / Page profile
    // Exclude special system terms
    const fbUsernameRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.-]+)(?:\/|\?|$)/i;
    match = trimmed.match(fbUsernameRegex);
    if (match && !['groups', 'watch', 'share', 'photo', 'events', 'marketplace', 'profile.php'].includes(match[1].toLowerCase())) {
      return {
        isValid: true,
        platform: 'facebook',
        type: 'profile',
        id: match[1],
        cleanUrl: `https://www.facebook.com/${match[1]}`,
      };
    }

    // Default Facebook fallback
    return {
      isValid: true,
      platform: 'facebook',
      type: 'unknown',
      id: trimmed,
      cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  }

  // 2. INSTAGRAM DETACTION
  if (/instagram\.com|instagr\.am/i.test(trimmed)) {
    // A. Posts / Reels
    const igPostRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/i;
    let match = trimmed.match(igPostRegex);
    if (match) {
      return {
        isValid: true,
        platform: 'instagram',
        type: 'post',
        id: match[1],
        cleanUrl: `https://www.instagram.com/p/${match[1]}/`,
      };
    }

    // B. Profile usernames
    const igProfileRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i;
    match = trimmed.match(igProfileRegex);
    if (match && !['p', 'reel', 'stories', 'explore', 'direct', 'developer'].includes(match[1].toLowerCase())) {
      return {
        isValid: true,
        platform: 'instagram',
        type: 'profile',
        id: match[1],
        cleanUrl: `https://www.instagram.com/${match[1]}/`,
      };
    }

    return {
      isValid: true,
      platform: 'instagram',
      type: 'unknown',
      id: trimmed,
      cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  }

  // 3. TIKTOK DETACTION
  if (/tiktok\.com/i.test(trimmed)) {
    // A. Video link
    const ttVideoRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+\/video\/([0-9]+)/i;
    let match = trimmed.match(ttVideoRegex);
    if (match) {
      return {
        isValid: true,
        platform: 'tiktok',
        type: 'video',
        id: match[1],
        cleanUrl: trimmed,
      };
    }

    // B. Profile link
    const ttProfileRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._-]+)/i;
    match = trimmed.match(ttProfileRegex);
    if (match) {
      return {
        isValid: true,
        platform: 'tiktok',
        type: 'profile',
        id: match[1],
        cleanUrl: `https://www.tiktok.com/@${match[1]}`,
      };
    }

    return {
      isValid: true,
      platform: 'tiktok',
      type: 'unknown',
      id: trimmed,
      cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  }

  // 4. YOUTUBE DETACTION (DEFAULT)
  // A. Regular short/share URL: https://youtu.be/VIDEO_ID
  const shortShareRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|&|$)/i;
  let match = trimmed.match(shortShareRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'video',
      id: match[1],
      cleanUrl: `https://www.youtube.com/watch?v=${match[1]}`,
    };
  }

  // B. Regular video URL: https://www.youtube.com/watch?v=VIDEO_ID
  const standardVideoRegex = /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i;
  match = trimmed.match(standardVideoRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'video',
      id: match[1],
      cleanUrl: `https://www.youtube.com/watch?v=${match[1]}`,
    };
  }

  // C. YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsRegex = /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i;
  match = trimmed.match(shortsRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'shorts',
      id: match[1],
      cleanUrl: `https://www.youtube.com/shorts/${match[1]}`,
    };
  }

  // D. Playlists: https://www.youtube.com/playlist?list=PLAYLIST_ID
  const playlistRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/i;
  match = trimmed.match(playlistRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'playlist',
      id: match[1],
      cleanUrl: `https://www.youtube.com/playlist?list=${match[1]}`,
    };
  }

  // E. Handles: https://www.youtube.com/@channelname
  const handleRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(@[a-zA-Z0-9_.-]+)/i;
  match = trimmed.match(handleRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'channel',
      id: match[1],
      cleanUrl: `https://www.youtube.com/${match[1]}`,
    };
  }

  // F. Generic Channel ID: https://www.youtube.com/channel/CHANNEL_ID
  const channelIdRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i;
  match = trimmed.match(channelIdRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'channel',
      id: match[1],
      cleanUrl: `https://www.youtube.com/channel/${match[1]}`,
    };
  }

  // G. Legacy Custom Channel/User
  const legacyChannelRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([a-zA-Z0-9_-]+)/i;
  match = trimmed.match(legacyChannelRegex);
  if (match) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'channel',
      id: match[1],
      cleanUrl: `https://www.youtube.com/c/${match[1]}`,
    };
  }

  // Generous fallbacks for anything else containing platform references
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return {
      isValid: true,
      platform: 'youtube',
      type: 'unknown',
      id: trimmed,
      cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  }

  // Default unsupported URL is treated as standard fallback
  return {
    isValid: false,
    platform: 'other',
    type: 'unknown',
    id: trimmed,
    cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
  };
}

/**
 * Converts a regular url into a native mobile app deep link.
 * Supports multiple social media platforms beautifully.
 */
// Helpers for extracting accurate platform identifiers and URLs
export function getFacebookRelativePath(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\//, '') + parsed.search;
    return path || '';
  } catch (_) {
    return url.replace(/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.watch)\//i, '');
  }
}

export function extractFacebookId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const idParam = parsed.searchParams.get('id');
    if (idParam) return idParam;
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const filteredParts = pathParts.filter(p => !['groups', 'watch', 'share', 'photo', 'events', 'marketplace', 'profile.php', 'pages'].includes(p.toLowerCase()));
    if (filteredParts.length > 0) {
      return filteredParts[0];
    }
  } catch (_) {
    const match = url.match(/[?&]id=([0-9]+)/i);
    if (match) return match[1];
    const matchUrl = url.replace(/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.watch)\//i, '').split(/[?#]/)[0];
    const parts = matchUrl.split('/').filter(Boolean).filter(p => !['groups', 'watch', 'share', 'photo', 'events', 'marketplace', 'profile.php', 'pages'].includes(p.toLowerCase()));
    if (parts.length > 0) return parts[0];
  }
  return null;
}

export function extractInstagramUsername(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const filtered = pathParts.filter(p => !['p', 'reel', 'stories', 'explore', 'direct', 'developer'].includes(p.toLowerCase()));
    if (filtered.length > 0) {
      return filtered[0];
    }
  } catch (_) {
    const clean = url.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').split(/[?#]/)[0];
    const parts = clean.split('/').filter(Boolean).filter(p => !['p', 'reel', 'stories', 'explore', 'direct', 'developer'].includes(p.toLowerCase()));
    if (parts.length > 0) return parts[0];
  }
  return null;
}

export function extractTiktokUsername(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    for (const part of pathParts) {
      if (part.startsWith('@')) {
        return part.substring(1);
      }
    }
    const filtered = pathParts.filter(p => !['video', 'trending', 'explore', 'music'].includes(p.toLowerCase()));
    if (filtered.length > 0) {
      return filtered[0];
    }
  } catch (_) {
    const clean = url.replace(/^(https?:\/\/)?(www\.)?tiktok\.com\//i, '').split(/[?#]/)[0];
    const parts = clean.split('/').filter(Boolean);
    for (const part of parts) {
      if (part.startsWith('@')) {
        return part.substring(1);
      }
    }
    const filtered = parts.filter(p => !['video', 'trending', 'explore', 'music'].includes(p.toLowerCase()));
    if (filtered.length > 0) {
      return filtered[0];
    }
  }
  return null;
}

/**
 * Converts a regular url into a native mobile app deep link.
 * Supports multiple social media platforms beautifully.
 */
export function buildDeepLink(url: string, type: 'vnd' | 'ios' | 'android' | 'standard'): string {
  const info = parseYoutubeUrl(url);
  if (!info.isValid) {
    return url; // fallback to user input
  }

  if (type === 'standard') {
    return info.cleanUrl;
  }

  const fallbackUrl = encodeURIComponent(info.cleanUrl);

  // ROUTING BY PLATFORM
  if (info.platform === 'facebook') {
    if (type === 'android') {
      const relPath = getFacebookRelativePath(url);
      return `intent://facebook.com/${relPath}#Intent;package=com.facebook.katana;scheme=https;end`;
    }
    // iOS or other custom schemes
    const id = extractFacebookId(url);
    if (id) {
      if (url.toLowerCase().includes('page')) {
        return `fb://page/${id}`;
      }
      return `fb://profile/${id}`;
    }
    return info.cleanUrl;
  }

  if (info.platform === 'instagram') {
    const username = extractInstagramUsername(url);
    if (username) {
      return `instagram://user?username=${username}`;
    }
    return info.cleanUrl;
  }

  if (info.platform === 'tiktok') {
    const username = extractTiktokUsername(url);
    if (username) {
      if (type === 'ios' || type === 'vnd') {
        return `snssdk1128://user/profile/${username}`;
      }
      return `tiktok://user?username=${username}`;
    }
    return info.cleanUrl;
  }

  // YOUTUBE PLATFORM (DEFAULT)
  switch (info.type) {
    case 'video':
      if (type === 'vnd') {
        return `vnd.youtube:${info.id}`;
      } else if (type === 'ios') {
        return `youtube://www.youtube.com/watch?v=${info.id}`;
      } else if (type === 'android') {
        return `intent://www.youtube.com/watch?v=${info.id}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      break;

    case 'shorts':
      if (type === 'vnd') {
        return `vnd.youtube:${info.id}`;
      } else if (type === 'ios') {
        return `youtube://www.youtube.com/shorts/${info.id}`;
      } else if (type === 'android') {
        return `intent://www.youtube.com/shorts/${info.id}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      break;

    case 'playlist':
      if (type === 'vnd') {
        return `vnd.youtube://www.youtube.com/playlist?list=${info.id}`;
      } else if (type === 'ios') {
        return `youtube://www.youtube.com/playlist?list=${info.id}`;
      } else if (type === 'android') {
        return `intent://www.youtube.com/playlist?list=${info.id}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      break;

    case 'channel':
      const isHandle = info.id.startsWith('@');
      if (type === 'vnd') {
        if (isHandle) {
          return `vnd.youtube://www.youtube.com/${info.id}`;
        }
        return `vnd.youtube://www.youtube.com/channel/${info.id}`;
      } else if (type === 'ios') {
        if (isHandle) {
          return `youtube://www.youtube.com/${info.id}`;
        }
        return `youtube://www.youtube.com/channel/${info.id}`;
      } else if (type === 'android') {
        if (isHandle) {
          return `intent://www.youtube.com/${info.id}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
        }
        return `intent://www.youtube.com/channel/${info.id}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      break;

    default:
      if (type === 'vnd') {
        return info.cleanUrl.replace(/^https?:\/\//i, 'vnd.youtube://');
      } else if (type === 'ios') {
        return info.cleanUrl.replace(/^https?:\/\//i, 'youtube://');
      } else if (type === 'android') {
        const payload = info.cleanUrl.replace(/^https?:\/\//i, '');
        return `intent://${payload}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
  }

  return info.cleanUrl;
}
