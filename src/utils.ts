/**
 * Qrytube Utility Helpers
 */

export function getDeepLink(url: string): { webUrl: string; deepUrl: string; platform: string } {
  const cleanUrl = url.trim();
  let platform = 'generic';
  let deepUrl = cleanUrl;

  // YouTube Check
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    platform = 'youtube';
    // Deep links for YouTube mobile apps
    if (cleanUrl.includes('watch?v=')) {
      const videoId = cleanUrl.split('watch?v=')[1]?.split('&')[0];
      if (videoId) {
        deepUrl = `youtube://www.youtube.com/watch?v=${videoId}`;
      }
    } else if (cleanUrl.includes('youtu.be/')) {
      const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        deepUrl = `youtube://www.youtube.com/watch?v=${videoId}`;
      }
    } else if (cleanUrl.includes('/channel/') || cleanUrl.includes('/c/') || cleanUrl.includes('/@')) {
      // Channel link
      const channelMatch = cleanUrl.match(/(@[A-Za-z0-9_.-]+)/);
      if (channelMatch) {
        deepUrl = `youtube://www.youtube.com/user/${channelMatch[1]}`;
      } else {
        deepUrl = `youtube://www.youtube.com`;
      }
    }
  }
  // TikTok Check
  else if (cleanUrl.includes('tiktok.com')) {
    platform = 'tiktok';
    const usernameMatch = cleanUrl.match(/@([A-Za-z0-9_.-]+)/);
    if (usernameMatch) {
      deepUrl = `snssdk1128://user/profile/${usernameMatch[1]}`;
    } else {
      deepUrl = `snssdk1128://feed`;
    }
  }
  // Instagram Check
  else if (cleanUrl.includes('instagram.com')) {
    platform = 'instagram';
    const usernameMatch = cleanUrl.match(/instagram\.com\/([A-Za-z0-9_.-]+)/);
    if (usernameMatch && usernameMatch[1] !== 'p' && usernameMatch[1] !== 'reel') {
      deepUrl = `instagram://user?username=${usernameMatch[1]}`;
    } else if (cleanUrl.includes('/p/') || cleanUrl.includes('/reel/')) {
      const postMatch = cleanUrl.match(/\/(p|reel)\/([A-Za-z0-9_.-]+)/);
      if (postMatch) {
        deepUrl = `instagram://media?id=${postMatch[2]}`;
      }
    } else {
      deepUrl = `instagram://app`;
    }
  }
  // WhatsApp Check
  else if (cleanUrl.includes('wa.me') || cleanUrl.includes('api.whatsapp.com')) {
    platform = 'whatsapp';
    deepUrl = cleanUrl;
  }

  return {
    webUrl: cleanUrl,
    deepUrl,
    platform
  };
}

export function formatYouTubeChapters(rawText: string): string {
  const lines = rawText.split('\n');
  const formattedLines = lines.map(line => {
    // Regex to match timestamps like 0:00, 12:34, 1:23:45, or [00:00]
    const timestampRegex = /(\d{1,2}:)?\d{1,2}:\d{2}/;
    const match = line.match(timestampRegex);
    if (match) {
      const timestamp = match[0];
      const desc = line.replace(timestamp, '').replace(/[\[\]\-\:]/g, ' ').trim();
      return `${timestamp} ${desc}`;
    }
    return line;
  });
  return formattedLines.filter(line => line.trim().length > 0).join('\n');
}
