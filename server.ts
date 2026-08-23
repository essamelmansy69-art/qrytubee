import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import compression from "compression";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(compression());
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy endpoint to safely fetch handymen CSV from Google Sheets without CORS issues
  app.get("/api/handymen-csv", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const rawSheetId = (req.query.sheetId as string) || "";
    let cleanSheetId = "1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY";
    if (rawSheetId.trim()) {
      const match = rawSheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanSheetId = match[1];
      } else if (/^[a-zA-Z0-9-_]{20,}$/.test(rawSheetId.trim())) {
        cleanSheetId = rawSheetId.trim();
      }
    }

    const requestedGid = (req.query.gid as string) || "";
    const gidsToTry = requestedGid ? [requestedGid, "913622856", "0"] : ["913622856", "0", "793398405"];

    const urls: string[] = [];
    for (const gid of gidsToTry) {
      urls.push(`https://docs.google.com/spreadsheets/d/${cleanSheetId}/export?format=csv&gid=${gid}`);
      urls.push(`https://docs.google.com/spreadsheets/d/${cleanSheetId}/gviz/tq?tqx=out:csv&gid=${gid}`);
    }
    urls.push(`https://docs.google.com/spreadsheets/d/${cleanSheetId}/export?format=csv`);
    urls.push(`https://docs.google.com/spreadsheets/d/${cleanSheetId}/gviz/tq?tqx=out:csv`);

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          redirect: 'follow',
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/csv,text/plain,*/*"
          }
        });
        if (response.ok) {
          const csvData = await response.text();
          if (csvData && !csvData.trim().startsWith('<!DOCTYPE') && !csvData.trim().startsWith('<html')) {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            return res.send(csvData);
          }
        }
      } catch (e: any) {
        console.warn(`Attempt to fetch ${url} failed:`, e?.message || e);
      }
    }

    res.status(502).json({ error: "Could not retrieve CSV from Google Sheets" });
  });

  // Dynamic robots.txt for Google SEO Indexing
  app.get("/robots.txt", (req, res) => {
    const host = req.get("host") || "ai.studio/build";
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const content = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(content);
  });

  // Dynamic XML Sitemap for Google SEO Indexing
  app.get("/sitemap.xml", (req, res) => {
    const host = req.get("host") || "ai.studio/build";
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Dynamic game IDs
    const gameIds = ["game-cheese-eater", "game-tetris"];
    const languages = ["ar", "en"];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Add home links for each language
    languages.forEach((lang) => {
      const urlAr = `${baseUrl}/?lang=ar`;
      const urlEn = `${baseUrl}/?lang=en`;
      const currentUrl = `${baseUrl}/?lang=${lang}`;

      sitemap += `
  <url>
    <loc>${currentUrl}</loc>
    <lastmod>2026-08-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${urlAr}" />
    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}" />
  </url>`;
    });

    // Add game links with language query parameters for separate SEO indexing
    gameIds.forEach((gameId) => {
      languages.forEach((lang) => {
        const gameUrlAr = `${baseUrl}/?game=${gameId}&amp;lang=ar`;
        const gameUrlEn = `${baseUrl}/?game=${gameId}&amp;lang=en`;
        const currentGameUrl = `${baseUrl}/?game=${gameId}&amp;lang=${lang}`;

        sitemap += `
  <url>
    <loc>${currentGameUrl}</loc>
    <lastmod>2026-08-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${gameUrlAr}" />
    <xhtml:link rel="alternate" hreflang="en" href="${gameUrlEn}" />
  </url>`;
      });
    });

    sitemap += `
</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(sitemap);
  });

  // FRONTEND HANDLING / STATIC SERVING
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "30d",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    const indexHtmlPath = path.join(distPath, "index.html");
    app.get("*", (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Atari Classic Gaming Platform] running on http://localhost:${PORT}`);
  });
}

startServer();
