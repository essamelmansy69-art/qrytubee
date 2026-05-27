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
    if (type === 'vnd' || type === 'ios') {
      if (/^\d+$/.test(info.id)) {
        return `fb://profile/${info.id}`;
      }
      return `fb://facewebmodal/f?href=${encodeURIComponent(info.cleanUrl)}`;
    } else if (type === 'android') {
      if (/^\d+$/.test(info.id)) {
        return `intent://facebook.com/profile.php?id=${info.id}#Intent;package=com.facebook.katana;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      return `intent://facebook.com/${info.id}#Intent;package=com.facebook.katana;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
    }
  }

  if (info.platform === 'instagram') {
    if (type === 'vnd' || type === 'ios') {
      if (info.type === 'profile') {
        return `instagram://user?username=${info.id}`;
      }
      return `instagram://media?id=${info.id}`;
    } else if (type === 'android') {
      if (info.type === 'profile') {
        return `intent://instagram.com/_u/${info.id}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      return `intent://instagram.com/p/${info.id}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
    }
  }

  if (info.platform === 'tiktok') {
    if (type === 'vnd' || type === 'ios') {
      if (info.type === 'profile') {
        return `tiktok://user?username=${info.id}`;
      }
      return `tiktok://video/${info.id}`;
    } else if (type === 'android') {
      if (info.type === 'profile') {
        return `intent://tiktok.com/@${info.id}#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
      }
      return `intent://tiktok.com/video/${info.id}#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;
    }
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
