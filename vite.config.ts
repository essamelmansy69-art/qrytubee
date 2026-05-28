import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { Buffer } from 'buffer';

// Helper to resolve the avatar from a YouTube channel/video URL
async function resolveAvatarUrl(targetUrl: string): Promise<string | null> {
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    if (!response.ok) return null;
    const html = await response.text();

    const isVideo = targetUrl.includes('/watch') || targetUrl.includes('/shorts') || targetUrl.includes('youtu.be');

    // 1. Try og:image if not a video URL (on videos, og:image is the video thumbnail, not channel avatar)
    if (!isVideo) {
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
      if (ogImageMatch && ogImageMatch[1]) {
        return ogImageMatch[1];
      }
    }

    // 2. Look for YT3 avatar URLs (where YouTube/Google user profile avatars are hosted)
    const yt3Matches = html.match(/https:\/\/yt3\.(?:ggpht|googleusercontent)\.com\/[a-zA-Z0-9_.-]+(?:=s\d+[^'"\s]*|)/g);
    if (yt3Matches && yt3Matches.length > 0) {
      const goodAvatar = yt3Matches.find(url => url.includes('=s') || url.includes('/channels4_profile'));
      return goodAvatar || yt3Matches[0];
    }

    // 3. Fallback for video links to recursively get channel ID and page
    if (isVideo) {
      const channelMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
      if (channelMatch && channelMatch[1]) {
        return resolveAvatarUrl(`https://www.youtube.com/channel/${channelMatch[1]}`);
      }
      const handleMatch = html.match(/href="\/(@[a-zA-Z0-9_.-]+)"/);
      if (handleMatch && handleMatch[1]) {
        return resolveAvatarUrl(`https://www.youtube.com/${handleMatch[1]}`);
      }
    }
  } catch (e) {
    console.error("resolveAvatarUrl error:", e);
  }
  return null;
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'youtube-avatar-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url) {
              try {
                const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                if (urlObj.pathname === '/api/youtube-avatar') {
                  const channelUrl = urlObj.searchParams.get('url');
                  if (!channelUrl) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing channel URL' }));
                    return;
                  }

                  const avatarProxyUrl = await resolveAvatarUrl(channelUrl);
                  if (!avatarProxyUrl) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Could not resolve channel avatar' }));
                    return;
                  }

                  const imgResponse = await fetch(avatarProxyUrl);
                  if (!imgResponse.ok) {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to fetch the avatar image' }));
                    return;
                  }

                  const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
                  const arrayBuffer = await imgResponse.arrayBuffer();
                  const base64 = Buffer.from(arrayBuffer).toString('base64');
                  const dataUrl = `data:${contentType};base64,${base64}`;

                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                  });
                  res.end(JSON.stringify({ avatar: dataUrl }));
                  return;
                }
              } catch (err: any) {
                // If it fails to parse the URL, we can safely just ignore and proceed
                next();
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: false,
      cssCodeSplit: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
