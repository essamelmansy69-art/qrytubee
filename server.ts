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

  // GameMonetize feed proxy & parser
  app.get("/api/gamemonetize-feed", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes

    const num = parseInt(req.query.num as string) || 40;
    const page = parseInt(req.query.page as string) || 1;

    // Use format=1 as specified by the user
    const url = `https://gamemonetize.com/feed.php?format=1&num=${num}&page=${page}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json,text/xml,application/xml,*/*"
        }
      });

      if (!response.ok) {
        throw new Error(`GameMonetize returned status ${response.status}`);
      }

      const text = await response.text();
      const cleanText = text.trim();

      const hashCodeHelper = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
      };

      // Check if response is XML
      if (cleanText.startsWith("<?xml") || cleanText.startsWith("<")) {
        const games: any[] = [];
        const itemRegex = /<(item|game)>([\s\S]*?)<\/\1>/g;
        let match;
        while ((match = itemRegex.exec(cleanText)) !== null) {
          const itemContent = match[2];
          const getTagValue = (tagName: string) => {
            const tagRegex = new RegExp(`<${tagName}>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*</${tagName}>`, 'i');
            const tagMatch = tagRegex.exec(itemContent);
            if (tagMatch) {
              return (tagMatch[1] || tagMatch[2] || '').trim();
            }
            return '';
          };

          const title = getTagValue('title');
          games.push({
            id: getTagValue('id') || getTagValue('game_id') || `gm-${hashCodeHelper(title)}`,
            title: title,
            description: getTagValue('description') || getTagValue('desc'),
            instructions: getTagValue('instructions'),
            thumb: getTagValue('thumb') || getTagValue('thumbnail') || getTagValue('image'),
            url: getTagValue('url') || getTagValue('iframe') || getTagValue('code'),
            category: getTagValue('category') || getTagValue('genre') || 'Arcade'
          });
        }
        return res.json({ games });
      } else {
        // It is JSON format
        try {
          const data = JSON.parse(cleanText);
          let gamesArray: any[] = [];
          if (Array.isArray(data)) {
            gamesArray = data;
          } else if (data && typeof data === "object") {
            gamesArray = data.games || data.items || [];
          }

          const games = gamesArray.map((item: any, idx: number) => {
            const title = item.title || item.name || '';
            const id = item.id || item.game_id || item.slug || `gm-${hashCodeHelper(title || String(idx))}`;
            return {
              id: String(id),
              title: title,
              description: item.description || item.desc || '',
              instructions: item.instructions || item.instruction || '',
              thumb: item.thumb || item.thumbnail || item.image || item.thumb_url || '',
              url: item.url || item.iframe || item.code || '',
              category: item.category || item.genre || 'Arcade'
            };
          });

          return res.json({ games });
        } catch (jsonErr: any) {
          console.error("JSON parsing of GameMonetize feed failed:", jsonErr);
          throw new Error("Failed to parse feed as JSON or XML");
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch/parse GameMonetize feed:", error);
      res.status(502).json({ error: "Failed to retrieve or parse GameMonetize feed", details: error.message });
    }
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

    // Read games dynamically from public/games directory to auto-index new pages on-the-fly
    let gameIds: string[] = ["game-cheese-eater", "game-tetris", "game-breakout", "game-candy-crush"];
    const gameDates: Record<string, string> = {};
    const languages = ["ar", "en"];
    let latestDate = "2026-08-23";

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
              gameDates[id] = "2026-08-23";
            }
          }
        });
      }
    } catch (err) {
      console.error("Error dynamically scanning games for sitemap:", err);
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
      const fileLastmod = gameDates[gameId] || "2026-08-23";
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
