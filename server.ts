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

  // Global cache for GameMonetize games to be shared by both /api/games and /sitemap.xml
  let cachedGameMonetizeGames: any[] = [];
  let cacheTime = 0;
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  async function fetchFeed(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith("[")) {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            return data;
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching feed from ${url}:`, e);
    }
    return [];
  }

  async function getGameMonetizeGames() {
    const now = Date.now();
    if (cachedGameMonetizeGames.length > 0 && (now - cacheTime < CACHE_DURATION)) {
      return cachedGameMonetizeGames;
    }

    try {
      const feed1Url = "https://gamemonetize.com/feed.php?format=0&num=50&page=1";
      const feed2Url = "https://gamemonetize.com/feed.php?format=0&num=20&page=1";
      
      const [data1, data2] = await Promise.all([
        fetchFeed(feed1Url),
        fetchFeed(feed2Url)
      ]);

      const combined = [...data1, ...data2];
      const seen = new Set();
      const uniqueGames: any[] = [];

      for (const item of combined) {
        const id = String(item.id || "").trim();
        if (id && !seen.has(id)) {
          seen.add(id);
          uniqueGames.push({
            id,
            title: String(item.title || "Untitled Game").trim(),
            category: String(item.category || "Arcade").trim(),
            thumbnailUrl: String(item.thumb || "").trim(),
            embedUrl: String(item.url || "").trim(),
            description: String(item.description || "").trim(),
            controls: String(item.instructions || "Mouse and Keyboard controls").trim()
          });
        }
      }

      if (uniqueGames.length > 0) {
        cachedGameMonetizeGames = uniqueGames;
        cacheTime = now;
      }
    } catch (error) {
      console.error("Error fetching/parsing GameMonetize feeds:", error);
    }
    return cachedGameMonetizeGames;
  }

  // Get GameMonetize Games Feed (Proxy)
  app.get("/api/games", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    try {
      const gamesList = await getGameMonetizeGames();
      res.json(gamesList);
    } catch (error: any) {
      console.error("Error in /api/games endpoint:", error);
      res.status(500).json({ error: "Failed to fetch games from provider", details: error.message });
    }
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
  app.get("/sitemap.xml", async (req, res) => {
    const host = req.get("host") || "ai.studio/build";
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Read games dynamically from public/games directory to auto-index new pages on-the-fly
    let gameIds: string[] = ["game-cheese-eater", "game-tetris", "game-breakout", "game-candy-crush"];
    const gameDates: Record<string, string> = {};
    const languages = ["ar", "en"];
    let latestDate = "2026-09-03";

    try {
      const gamesDir = path.join(process.cwd(), "public", "games");
      if (fs.existsSync(gamesDir)) {
        const files = fs.readdirSync(gamesDir);
        files.forEach(file => {
          if (file.endsWith(".html")) {
            const id = `game-${file.replace(".html", "")}`;
            if (!gameIds.includes(id)) {
              gameIds.push(id);
            }
            // Get last modified date of the game file dynamically
            try {
              const stats = fs.statSync(path.join(gamesDir, file));
              const mtimeStr = stats.mtime.toISOString().split("T")[0];
              gameDates[id] = mtimeStr;
              if (mtimeStr > latestDate) {
                latestDate = mtimeStr;
              }
            } catch (e) {
              gameDates[id] = "2026-09-03";
            }
          }
        });
      }
    } catch (err) {
      console.error("Error dynamically scanning games for sitemap:", err);
    }

    // Dynamic addition of imported GameMonetize games!
    try {
      const gmGames = await getGameMonetizeGames();
      gmGames.forEach((g: any) => {
        if (!gameIds.includes(g.id)) {
          gameIds.push(g.id);
          gameDates[g.id] = "2026-09-03"; // latest modified date for GameMonetize imports
        }
      });
    } catch (e) {
      console.error("Error adding GameMonetize games to sitemap:", e);
    }

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
    <lastmod>${latestDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${urlAr}" />
    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}" />
  </url>`;
    });

    // Add game links with language query parameters for separate SEO indexing
    gameIds.forEach((gameId) => {
      const fileLastmod = gameDates[gameId] || "2026-09-03";
      languages.forEach((lang) => {
        const gameUrlAr = `${baseUrl}/?game=${gameId}&amp;lang=ar`;
        const gameUrlEn = `${baseUrl}/?game=${gameId}&amp;lang=en`;
        const currentGameUrl = `${baseUrl}/?game=${gameId}&amp;lang=${lang}`;

        sitemap += `
  <url>
    <loc>${currentGameUrl}</loc>
    <lastmod>${fileLastmod}</lastmod>
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
