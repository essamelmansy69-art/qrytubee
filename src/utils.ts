/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { youtubeUrlInfo } from './types';

/**
 * Parses a YouTube URL and extracts action-specific IDs.
 */
export function parseYoutubeUrl(url: string): youtubeUrlInfo {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: false, type: 'unknown', id: '', cleanUrl: '' };
  }

  // 1. Regular short/share URL: https://youtu.be/VIDEO_ID
  const shortShareRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|&|$)/i;
  let match = trimmed.match(shortShareRegex);
  if (match) {
    return {
      isValid: true,
      type: 'video',
      id: match[1],
      cleanUrl: `https://www.youtube.com/watch?v=${match[1]}`,
    };
  }

  // 2. Regular video URL: https://www.youtube.com/watch?v=VIDEO_ID
  // Also catches: https://m.youtube.com/watch?v=VIDEO_ID
  const standardVideoRegex = /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i;
  match = trimmed.match(standardVideoRegex);
  if (match) {
    return {
      isValid: true,
      type: 'video',
      id: match[1],
      cleanUrl: `https://www.youtube.com/watch?v=${match[1]}`,
    };
  }

  // 3. YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsRegex = /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i;
  match = trimmed.match(shortsRegex);
  if (match) {
    return {
      isValid: true,
      type: 'shorts',
      id: match[1],
      cleanUrl: `https://www.youtube.com/shorts/${match[1]}`,
    };
  }

  // 4. Playlists: https://www.youtube.com/playlist?list=PLAYLIST_ID
  const playlistRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/i;
  match = trimmed.match(playlistRegex);
  if (match) {
    return {
      isValid: true,
      type: 'playlist',
      id: match[1],
      cleanUrl: `https://www.youtube.com/playlist?list=${match[1]}`,
    };
  }

  // 5. Handles (e.g. @channelname): https://www.youtube.com/@channelname
  const handleRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(@[a-zA-Z0-9_.-]+)/i;
  match = trimmed.match(handleRegex);
  if (match) {
    return {
      isValid: true,
      type: 'channel',
      id: match[1], // Include the '@' symbol
      cleanUrl: `https://www.youtube.com/${match[1]}`,
    };
  }

  // 6. Generic Channel ID: https://www.youtube.com/channel/CHANNEL_ID
  const channelIdRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i;
  match = trimmed.match(channelIdRegex);
  if (match) {
    return {
      isValid: true,
      type: 'channel',
      id: match[1],
      cleanUrl: `https://www.youtube.com/channel/${match[1]}`,
    };
  }

  // 7. Legacy Custom Channel / User:
  // https://www.youtube.com/c/CUSTOM_NAME or https://www.youtube.com/user/USER_NAME
  const legacyChannelRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([a-zA-Z0-9_-]+)/i;
  match = trimmed.match(legacyChannelRegex);
  if (match) {
    return {
      isValid: true,
      type: 'channel',
      id: match[1],
      cleanUrl: `https://www.youtube.com/c/${match[1]}`,
    };
  }

  // If it doesn't match any standard pattern but contains youtube, try to guess or return legacy
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return {
      isValid: true,
      type: 'unknown',
      id: trimmed,
      cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  }

  return { isValid: false, type: 'unknown', id: '', cleanUrl: '' };
}

/**
 * Converts a regular YouTube URL or info into a high-reliability deep link.
 */
export function buildDeepLink(url: string, type: 'vnd' | 'ios' | 'android' | 'standard'): string {
  const info = parseYoutubeUrl(url);
  if (!info.isValid) {
    return url; // fallback to user's literal input
  }

  if (type === 'standard') {
    return info.cleanUrl;
  }

  // Generate deep links based on types
  switch (info.type) {
    case 'video':
      if (type === 'vnd') {
        // vnd.youtube:VIDEO_ID is the Android-native scheme, works well in deep-links
        // vnd.youtube://watch?v=ID is also good. Using vnd.youtube:ID is standard.
        return `vnd.youtube:${info.id}`;
      } else if (type === 'ios') {
        return `youtube://www.youtube.com/watch?v=${info.id}`;
      } else if (type === 'android') {
        return `intent://www.youtube.com/watch?v=${info.id}#Intent;package=com.google.android.youtube;scheme=https;end`;
      }
      break;

    case 'shorts':
      if (type === 'vnd') {
        // YouTube app opens shorts through standard watch on older devices or direct shorts path
        return `vnd.youtube:${info.id}`;
      } else if (type === 'ios') {
        return `youtube://www.youtube.com/shorts/${info.id}`;
      } else if (type === 'android') {
        return `intent://www.youtube.com/shorts/${info.id}#Intent;package=com.google.android.youtube;scheme=https;end`;
      }
      break;

    case 'playlist':
      if (type === 'vnd') {
        return `vnd.youtube://www.youtube.com/playlist?list=${info.id}`;
      } else if (type === 'ios') {
        return `youtube://www.youtube.com/playlist?list=${info.id}`;
      } else if (type === 'android') {
        return `intent://www.youtube.com/playlist?list=${info.id}#Intent;package=com.google.android.youtube;scheme=https;end`;
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
          return `intent://www.youtube.com/${info.id}#Intent;package=com.google.android.youtube;scheme=https;end`;
        }
        return `intent://www.youtube.com/channel/${info.id}#Intent;package=com.google.android.youtube;scheme=https;end`;
      }
      break;

    default:
      // Unknown youtube url type, default fallback replacement
      if (type === 'vnd') {
        return info.cleanUrl.replace(/^https?:\/\//i, 'vnd.youtube://');
      } else if (type === 'ios') {
        return info.cleanUrl.replace(/^https?:\/\//i, 'youtube://');
      } else if (type === 'android') {
        const payload = info.cleanUrl.replace(/^https?:\/\//i, '');
        return `intent://${payload}#Intent;package=com.google.android.youtube;scheme=https;end`;
      }
  }

  return info.cleanUrl;
}
