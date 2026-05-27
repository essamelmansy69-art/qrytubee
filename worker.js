// Cloudflare Worker Script for serving Sitemap.xml and Robots.txt dynamically
// This script ensures your sitemap is served with the correct Content-Type: application/xml
// and resolves any Google Search Console fetching errors (such as routing SPA fallback index.html instead).

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // 1. Explicitly serve static sitemap.xml with correct headers
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

    // 2. Explicitly serve robots.txt
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

    // 3. Fallback to your primary Worker site handler / static assets serving
    // If you are using Cloudflare Workers with Static Assets, it typically looks like:
    try {
      // If you are using KV assets, getAssetFromKV can be called here:
      // return await getAssetFromKV(event);
      
      // Below is a standard fallback proxy if your worker points to your host.
      // Replace with your asset fetcher or fetch(request) according to your deployment.
      return fetch(request);
    } catch (e) {
      return new Response("Fallback error: " + e.message, { status: 500 });
    }
  }
};
