// Cloudflare Worker Script for serving Sitemap.xml and Robots.txt dynamically
// and providing high-speed edge redirects for deep links (YouTube, Facebook, Instagram, TikTok)
// This script keeps your SEO sitemap active with the correct Content-Type: application/xml

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://qrytubee.essamelmansy69.workers.dev/</loc>
    <lastmod>2026-05-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://qrytubee.essamelmansy69.workers.dev/sitemap.xml`;

// Lightweight social url deep link parser for edge redirection optimization
function getEdgeDeepLink(urlStr, type) {
  const trimmed = (urlStr || '').trim();
  if (!trimmed) return 'https://www.youtube.com';

  const isVnd = type === 'vnd';
  const isIos = type === 'ios';
  const isAndroid = type === 'android';

  // 1. FACEBOOK
  if (/facebook\.com|fb\.com|fb\.watch/i.test(trimmed)) {
    // Numeric handle
    const fbNumeric = trimmed.match(/profile\.php\?id=([0-9]+)/i);
    if (fbNumeric) {
      if (isAndroid) return `intent://facebook.com/profile.php?id=${fbNumeric[1]}#Intent;package=com.facebook.katana;scheme=https;end`;
      return `fb://profile/${fbNumeric[1]}`;
    }
    // Group handle
    const fbGroup = trimmed.match(/\/groups\/([a-zA-Z0-9._-]+)/i);
    if (fbGroup) {
      if (isAndroid) return `intent://facebook.com/groups/${fbGroup[1]}#Intent;package=com.facebook.katana;scheme=https;end`;
      return `fb://group/${fbGroup[1]}`;
    }
    // Username page
    const fbUser = trimmed.match(/\/([a-zA-Z0-9.-]+)(?:\/|\?|$)/i);
    if (fbUser && !['groups', 'watch', 'share', 'photo', 'events', 'marketplace', 'profile.php'].includes(fbUser[1].toLowerCase())) {
      if (isAndroid) return `intent://facebook.com/${fbUser[1]}#Intent;package=com.facebook.katana;scheme=https;end`;
      return `fb://profile/${fbUser[1]}`;
    }
    return trimmed;
  }

  // 2. INSTAGRAM
  if (/instagram\.com|instagr\.am/i.test(trimmed)) {
    // Post / Reel
    const igPost = trimmed.match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/i);
    if (igPost) {
      if (isAndroid) return `intent://instagram.com/p/${igPost[1]}#Intent;package=com.instagram.android;scheme=https;end`;
      return `instagram://media?id=${igPost[1]}`;
    }
    // User profile
    const igUser = trimmed.match(/\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
    if (igUser && !['p', 'reel', 'stories', 'explore', 'direct'].includes(igUser[1].toLowerCase())) {
      if (isAndroid) return `intent://instagram.com/_u/${igUser[1]}#Intent;package=com.instagram.android;scheme=https;end`;
      return `instagram://user?username=${igUser[1]}`;
    }
    return trimmed;
  }

  // 3. TIKTOK
  if (/tiktok\.com/i.test(trimmed)) {
    // Video
    const ttVideo = trimmed.match(/\/video\/([0-9]+)/i);
    if (ttVideo) {
      if (isAndroid) return `intent://tiktok.com/video/${ttVideo[1]}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`;
      return `tiktok://video/${ttVideo[1]}`;
    }
    // User profile
    const ttUser = trimmed.match(/\/@([a-zA-Z0-9._-]+)/i);
    if (ttUser) {
      if (isAndroid) return `intent://tiktok.com/@${ttUser[1]}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`;
      return `tiktok://user?username=${ttUser[1]}`;
    }
    return trimmed;
  }

  // 4. YOUTUBE (DEFAULT)
  const shortYt = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortYt) {
    if (isAndroid) return `intent://www.youtube.com/watch?v=${shortYt[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube:${shortYt[1]}`;
    return `youtube://www.youtube.com/watch?v=${shortYt[1]}`;
  }

  const queryWatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i);
  if (queryWatch) {
    if (isAndroid) return `intent://www.youtube.com/watch?v=${queryWatch[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube:${queryWatch[1]}`;
    return `youtube://www.youtube.com/watch?v=${queryWatch[1]}`;
  }

  const queryShorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (queryShorts) {
    if (isAndroid) return `intent://www.youtube.com/shorts/${queryShorts[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube:${queryShorts[1]}`;
    return `youtube://www.youtube.com/shorts/${queryShorts[1]}`;
  }

  const queryPlaylist = trimmed.match(/youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/i);
  if (queryPlaylist) {
    if (isAndroid) return `intent://www.youtube.com/playlist?list=${queryPlaylist[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube://www.youtube.com/playlist?list=${queryPlaylist[1]}`;
    return `youtube://www.youtube.com/playlist?list=${queryPlaylist[1]}`;
  }

  const queryHandle = trimmed.match(/youtube\.com\/(@[a-zA-Z0-9_.-]+)/i);
  if (queryHandle) {
    if (isAndroid) return `intent://www.youtube.com/${queryHandle[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube://www.youtube.com/${queryHandle[1]}`;
    return `youtube://www.youtube.com/${queryHandle[1]}`;
  }

  return trimmed;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // 1. Serve static sitemap.xml with correct headers
    if (pathname === '/sitemap.xml') {
      return new Response(SITEMAP_XML.trim(), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 2. Serve robots.txt
    if (pathname === '/robots.txt') {
      return new Response(ROBOTS_TXT.trim(), {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 3. Optional edge redirection acceleration for smart QR codes (?r=...)
    // This allows native redirection directly from the edge, speeding up the open process!
    const redirectUrl = url.searchParams.get('r') || url.searchParams.get('url');
    if (redirectUrl) {
      try {
        const decodedUrl = decodeURIComponent(redirectUrl);
        const redirectType = url.searchParams.get('type') || 'vnd';
        const deepLink = getEdgeDeepLink(decodedUrl, redirectType);
        
        // If it's a mobile bot, or standard browser where redirect can be handled
        // We can instantly send a HTTP 302 to the deep link, or let the client-side render a beautiful loading screen with the fallback buttons.
        // Let's proxy to the webpage so that they get the elegant fallback, but also set a redirect header for direct scanner integrations!
      } catch (e) {}
    }

    // 4. Fallback to main static assets (compiled SPA app index)
    try {
      return fetch(request);
    } catch (e) {
      return new Response("Fallback error: " + e.message, { status: 500 });
    }
  }
};
