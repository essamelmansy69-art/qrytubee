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

  // Helper inside parseYoutubeUrl or file scope to check if URL is a valid general website
  const isValidUrlPattern = (urlStr: string): boolean => {
    try {
      const parsed = new URL(
        urlStr.startsWith('http://') || urlStr.startsWith('https://') || urlStr.startsWith('ftp://') 
          ? urlStr 
          : `https://${urlStr}`
      );
      const parts = parsed.hostname.split('.');
      return parts.length >= 2 && parts[parts.length - 1].length >= 2;
    } catch (_) {
      return false;
    }
  };

  if (isValidUrlPattern(trimmed)) {
    return {
      isValid: true,
      platform: 'other',
      type: 'unknown',
      id: trimmed,
      cleanUrl: trimmed.startsWith('http') || trimmed.startsWith('ftp') ? trimmed : `https://${trimmed}`,
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
    return `fb://facewebmodal/f?href=${encodeURIComponent(info.cleanUrl)}`;
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
      return `snssdk1128://user/profile/${username}`;
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

/**
 * Converts a standard URL directly to a native app deep link protocol.
 * Follows the specific platform conversion rules:
 * 1. YouTube -> youtube:// protocol with extracted video/channel ID.
 * 2. Instagram -> instagram://user?username= with extracted username.
 * 3. Facebook -> fb:// compatible format.
 * 4. TikTok -> snssdk1128:// custom app protocol.
 */
export function convertUrlToDeepLink(url: string, deviceOverride?: 'android' | 'ios' | 'standard'): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  // Detect device type
  let deviceType: 'android' | 'ios' | 'standard' = 'standard';
  if (deviceOverride) {
    deviceType = deviceOverride;
  } else if (typeof window !== 'undefined' && window.navigator) {
    const ua = window.navigator.userAgent || '';
    if (/android/i.test(ua)) {
      deviceType = 'android';
    } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      deviceType = 'ios';
    } else if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      deviceType = 'ios';
    }
  }

  // standard non-mobile browsers should navigate to standard web addresses directly
  if (deviceType === 'standard') {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }

  // Let's parse with native URL class first for bulletproof safety
  let hostname = '';
  let pathname = '';
  let searchParams: URLSearchParams | null = null;
  try {
    const tempUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(tempUrl);
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname;
    searchParams = parsed.searchParams;
  } catch (_) {}

  // 1. YOUTUBE ADVANCED PARSING
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be') || hostname.includes('youtube-nocookie.com')) {
    let videoId = '';
    let playlistId = '';
    let channelId = '';

    // Check query params
    if (searchParams) {
      const v = searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        videoId = v;
      }
      const list = searchParams.get('list');
      if (list) {
        playlistId = list;
      }
    }

    // Check pathname patterns if query extraction is blank
    if (!videoId) {
      // Check for youtu.be/VIDEO_ID
      const shortMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
    }

    if (!videoId) {
      // Check for shorts: /shorts/VIDEO_ID
      const shortsMatch = pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/i);
      if (shortsMatch) {
        videoId = shortsMatch[1];
      }
    }

    if (!videoId) {
      // Check embeds
      const embedMatch = pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
      if (embedMatch) {
         videoId = embedMatch[1];
      }
    }

    // Map channels
    const handleMatch = pathname.match(/\/(@[a-zA-Z0-9_.-]+)/i);
    if (handleMatch) {
      channelId = handleMatch[1];
    } else {
      const channelMatch = pathname.match(/\/channel\/([a-zA-Z0-9_-]+)/i);
      if (channelMatch) {
        channelId = channelMatch[1];
      } else {
        const cMatch = pathname.match(/\/(?:c|user)\/([a-zA-Z0-9_-]+)/i);
        if (cMatch) {
          channelId = cMatch[1]; // custom/user alias
        }
      }
    }

    // Direct custom URI scheme works perfectly on iOS, but Android Chrome requires secure Intents with fallback configuration
    if (deviceType === 'android') {
      if (playlistId) {
        return `intent://www.youtube.com/playlist?list=${playlistId}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.youtube.com/playlist?list=' + playlistId)};end`;
      } else if (videoId) {
        return `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)};end`;
      } else if (channelId) {
        if (channelId.startsWith('@')) {
          return `intent://www.youtube.com/${channelId}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.youtube.com/' + channelId)};end`;
        }
        return `intent://www.youtube.com/channel/${channelId}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.youtube.com/channel/' + channelId)};end`;
      }
      return `intent://www.youtube.com#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.youtube.com')};end`;
    } else {
      if (playlistId) {
        return `youtube://www.youtube.com/playlist?list=${playlistId}`;
      } else if (videoId) {
        return `youtube://watch?v=${videoId}`;
      } else if (channelId) {
        if (channelId.startsWith('@')) {
          return `youtube://www.youtube.com/${channelId}`;
        }
        return `youtube://www.youtube.com/channel/${channelId}`;
      }
      return `youtube://`;
    }
  }

  // 2. INSTAGRAM ADVANCED PARSING
  if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) {
    let instagramUsername = '';
    let instagramMediaId = '';

    const igMediaMatch = pathname.match(/\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
    if (igMediaMatch) {
      instagramMediaId = igMediaMatch[1];
    }

    const igUserMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9._-]+)/i);
    if (igUserMatch) {
      const candidate = igUserMatch[1].toLowerCase();
      if (!['p', 'reel', 'stories', 'explore', 'direct', 'developer', 'tv', 'about', 'legal', 'privacy'].includes(candidate)) {
        instagramUsername = igUserMatch[1];
      }
    }

    if (instagramUsername === 'stories') {
      const storiesMatch = trimmed.match(/\/stories\/([a-zA-Z0-9._-]+)/i);
      if (storiesMatch) {
        instagramUsername = storiesMatch[1];
      }
    }

    // Direct custom URI scheme works perfectly on iOS, but Android Chrome requires secure Intents with fallback configuration
    if (deviceType === 'android') {
      if (instagramMediaId) {
        return `intent://instagram.com/p/${instagramMediaId}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.instagram.com/p/' + instagramMediaId)};end`;
      } else if (instagramUsername) {
        return `intent://instagram.com/_u/${instagramUsername}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.instagram.com/' + instagramUsername)};end`;
      }
      return `intent://instagram.com#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.instagram.com')};end`;
    } else {
      if (instagramMediaId) {
        return `instagram://media?id=${instagramMediaId}`;
      } else if (instagramUsername) {
        return `instagram://user?username=${instagramUsername}`;
      }
      return `instagram://`;
    }
  }

  // 3. FACEBOOK ADVANCED PARSING
  if (hostname.includes('facebook.com') || hostname.includes('fb.com') || hostname.includes('fb.watch')) {
    let fbId = '';
    if (searchParams) {
      const idVal = searchParams.get('id');
      if (idVal) fbId = idVal;
    }
    if (!fbId) {
      const parts = pathname.split('/').filter(Boolean);
      const filtered = parts.filter(p => !['groups', 'watch', 'share', 'photo', 'events', 'marketplace', 'profile.php', 'pages'].includes(p.toLowerCase()));
      if (filtered.length > 0) {
        fbId = filtered[0];
      }
    }

    const normalizedFallback = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const isNumericId = fbId ? /^\d+$/.test(fbId) : false;

    // Direct custom URI scheme with 'scheme=fb' works perfectly on Android Chrome to force-launch the app and prevent browser hijacking
    if (deviceType === 'android') {
      if (fbId && isNumericId) {
        if (pathname.includes('/groups/')) {
          return `intent://group/${fbId}#Intent;package=com.facebook.katana;scheme=fb;S.browser_fallback_url=${encodeURIComponent(normalizedFallback)};end`;
        }
        return `intent://profile/${fbId}#Intent;package=com.facebook.katana;scheme=fb;S.browser_fallback_url=${encodeURIComponent(normalizedFallback)};end`;
      }
      return `intent://facewebmodal/f?href=${encodeURIComponent(normalizedFallback)}#Intent;package=com.facebook.katana;scheme=fb;S.browser_fallback_url=${encodeURIComponent(normalizedFallback)};end`;
    } else {
      if (fbId && isNumericId) {
        if (pathname.includes('/groups/')) {
          return `fb://group/${fbId}`;
        }
        return `fb://profile/${fbId}`;
      }
      return `fb://facewebmodal/f?href=${encodeURIComponent(normalizedFallback)}`;
    }
  }

  // 4. TIKTOK ADVANCED PARSING
  if (hostname.includes('tiktok.com')) {
    let videoId = '';
    let username = '';

    const ttVideoMatch = pathname.match(/\/@[a-zA-Z0-9._-]+\/video\/([0-9]+)/i);
    if (ttVideoMatch) {
      videoId = ttVideoMatch[1];
    }
    
    const ttUserMatch = pathname.match(/\/@([a-zA-Z0-9._-]+)/i);
    if (ttUserMatch) {
      username = ttUserMatch[1];
    }

    // Direct custom URI scheme works perfectly on iOS, but Android Chrome requires secure Intents with fallback configuration
    if (deviceType === 'android') {
      const normalizedFallback = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      if (videoId) {
        return `intent://tiktok.com/video/${videoId}#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.tiktok.com/video/' + videoId)};end`;
      } else if (username) {
        return `intent://tiktok.com/@${username}#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${encodeURIComponent('https://www.tiktok.com/@' + username)};end`;
      }
      return `intent://tiktok.com#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${encodeURIComponent(normalizedFallback)};end`;
    } else {
      if (videoId) {
        return `snssdk1128://feed?detail_id=${videoId}`;
      } else if (username) {
        return `snssdk1128://user/profile/${username}`;
      }
      return `snssdk1128://`;
    }
  }

  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
}

/**
 * Detects visitor spec details like browser name and device type from userAgent string.
 */
export function detectVisitorSpecs(): { browser: string; device_type: string } {
  try {
    const ua = navigator.userAgent;
    let browser = "Other";
    let device_type = "Desktop";

    // Browser detection
    if (/FBAN|FBAV/i.test(ua)) {
      browser = "Facebook App";
    } else if (/Instagram/i.test(ua)) {
      browser = "Instagram App";
    } else if (/GSA/i.test(ua)) {
      browser = "Google App";
    } else if (/Chrome/i.test(ua) && /CriOS/i.test(ua)) {
      browser = "Chrome iOS";
    } else if (/Chrome/i.test(ua)) {
      browser = "Chrome";
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browser = "Safari";
    } else if (/Firefox/i.test(ua) || /FxiOS/i.test(ua)) {
      browser = "Firefox";
    } else if (/Edg/i.test(ua) || /Edge/i.test(ua)) {
      browser = "Edge";
    } else if (/SamsungBrowser/i.test(ua)) {
      browser = "Samsung Internet";
    } else if (/Opera/i.test(ua) || /OPR/i.test(ua)) {
      browser = "Opera";
    }

    // Device detection
    if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      device_type = "Mobile";
    } else if (/Tablet|iPad|PlayBook|Silk/i.test(ua)) {
      device_type = "Tablet";
    }

    return { browser, device_type };
  } catch (_) {
    return { browser: "Other", device_type: "Desktop" };
  }
}

/**
 * Fetches the visitor's approximate country name from free geolocation APIs.
 */
export async function fetchVisitorCountry(): Promise<string> {
  // First, attempt to retrieve country from our local server environment headers - near zero latency, CORS safe
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("/api/visitor-country", { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country && data.country !== "Unknown") {
        return data.country;
      }
    }
  } catch (_) {}

  // Fallback to trusted third party sources with strict, fast timeouts
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error("Primary API failed");
    const data = await res.json();
    return data.country_name || data.country || "Unknown";
  } catch (err) {
    try {
      const controller2 = new AbortController();
      const id2 = setTimeout(() => controller2.abort(), 1200);
      const res2 = await fetch("https://freeipapi.com/api/json", { signal: controller2.signal });
      clearTimeout(id2);
      if (!res2.ok) throw new Error("Secondary API failed");
      const data2 = await res2.json();
      return data2.countryName || "Unknown";
    } catch (_) {
      try {
        const controller3 = new AbortController();
        const id3 = setTimeout(() => controller3.abort(), 1200);
        const res3 = await fetch("https://ip-api.com/json/", { signal: controller3.signal });
        clearTimeout(id3);
        const data3 = await res3.json();
        return data3.country || "Unknown";
      } catch (__) {
        return "Unknown";
      }
    }
  }
}
