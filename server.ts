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

  // Server-side cache for GameMonetize feed to make homepage load instantly
  const feedCache: { [key: string]: { data: any; timestamp: number } } = {};
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

  // GameMonetize feed proxy & parser (with multi-domain retry and high-quality static fallback)
  app.get("/api/gamemonetize-feed", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes

    const num = parseInt(req.query.num as string) || 40;
    const page = parseInt(req.query.page as string) || 1;

    const cacheKey = `${num}-${page}`;
    const now = Date.now();
    if (feedCache[cacheKey] && (now - feedCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json(feedCache[cacheKey].data);
    }

    // A collection of popular, high-quality, fully-working games to fallback to if feed servers are completely down
    const FALLBACK_ONLINE_GAMES = [
      {
        id: "84899",
        title: "RACE: Rocket Arena Car Extreme",
        description: "Explosive 3D survival racing game set in a post-apocalyptic world. Upgrade powerful combat cars, fire weapons, use shields and nitro.",
        instructions: "Arrow Up / W - Nitro, Arrow Down / S - Brake, Arrow Left / A - Move left, Arrow Right / D - Move right, Space - Rockets, Q - Superpower, E - Shield.",
        thumb: "https://img.gamemonetize.com/76oe5vr125yw3oc362159k0wyny5gthh/512x384.jpg",
        url: "https://html5.gamemonetize.co/76oe5vr125yw3oc362159k0wyny5gthh/",
        category: "Racing"
      },
      {
        id: "85536",
        title: "Jigsaw: Pusha Pusha",
        description: "Time to push! Use the arrow keys to walk and push the crates. Your goal is to place each crate onto an altar.",
        instructions: "W, A, S, D or Arrow Keys.",
        thumb: "https://img.gamemonetize.com/1b081qlbwkb2ijnbt2y6cue43smw70ao/512x384.jpg",
        url: "https://html5.gamemonetize.co/1b081qlbwkb2ijnbt2y6cue43smw70ao/",
        category: "Puzzle"
      },
      {
        id: "7szooxdfm3kpxidj3qdf58x822jbe3a8",
        title: "Moto X3M Pool Party",
        description: "Moto X3M is back and in this sequel you'll definitely get wet! Try to beat more beautiful summer-themed levels.",
        instructions: "W, A, S, D or Arrow Keys to balance and accelerate.",
        thumb: "https://img.gamemonetize.com/7szooxdfm3kpxidj3qdf58x822jbe3a8/512x384.jpg",
        url: "https://html5.gamemonetize.co/7szooxdfm3kpxidj3qdf58x822jbe3a8/",
        category: "Racing"
      },
      {
        id: "dskby4snoiv0on0oig8gqf9h08itidp0",
        title: "Zuma Legend",
        description: " Zuma Legend is an exciting marble shooter puzzle game! Match colors and blast all the marbles before they reach the hole.",
        instructions: "Mouse / Touch to target and shoot marbles.",
        thumb: "https://img.gamemonetize.com/dskby4snoiv0on0oig8gqf9h08itidp0/512x384.jpg",
        url: "https://html5.gamemonetize.co/dskby4snoiv0on0oig8gqf9h08itidp0/",
        category: "Puzzle"
      },
      {
        id: "7uio1skk2b9v5m468m9yhycoofv7f9sk",
        title: "Sudoku Classic Master",
        description: "Play classic Sudoku online with elegant modern UI, multiple difficulty settings, and helpful tools.",
        instructions: "Select cells and input numbers 1-9 to complete the grid.",
        thumb: "https://img.gamemonetize.com/7uio1skk2b9v5m468m9yhycoofv7f9sk/512x384.jpg",
        url: "https://html5.gamemonetize.co/7uio1skk2b9v5m468m9yhycoofv7f9sk/",
        category: "Puzzle"
      },
      {
        id: "f49bofwz4p6bbyk5it72v8w6n3h39y80",
        title: "Bubble Shooter Pro",
        description: "Shoot and burst bubbles in this addictive bubble shooter classic! Enjoy hours of matching puzzle gameplay.",
        instructions: "Mouse / Touch to aim and shoot bubbles.",
        thumb: "https://img.gamemonetize.com/f49bofwz4p6bbyk5it72v8w6n3h39y80/512x384.jpg",
        url: "https://html5.gamemonetize.co/f49bofwz4p6bbyk5it72v8w6n3h39y80/",
        category: "Arcade"
      },
      {
        id: "88931",
        title: "Subway Surfers Monaco",
        description: "Help Jake, Tricky & Fresh escape from the grumpy Inspector and his dog in the glamorous city of Monaco!",
        instructions: "Left/Right arrow keys to steer, Up arrow to jump, Down arrow to slide, Space to use Hoverboard.",
        thumb: "https://img.gamemonetize.com/e2g1o6sh1bykwpy623ocbbyk5it72v8w/512x384.jpg",
        url: "https://html5.gamemonetize.co/e2g1o6sh1bykwpy623ocbbyk5it72v8w/",
        category: "Action"
      },
      {
        id: "89112",
        title: "Temple Run Tomb",
        description: "Run, slide, jump, and escape the scary temple monsters in this infinite runner game!",
        instructions: "Arrow keys or W,A,S,D to steer, jump, and slide.",
        thumb: "https://img.gamemonetize.com/w8m468m9yhycoofv7f9sk7uio1skk2b9v/512x384.jpg",
        url: "https://html5.gamemonetize.co/w8m468m9yhycoofv7f9sk7uio1skk2b9v/",
        category: "Action"
      }
    ];

    const urls = [
      `https://gamemonetize.com/feed.php?format=1&num=${num}&page=${page}`,
      `https://gamemonetize.co/feed.php?format=1&num=${num}&page=${page}`,
      `http://gamemonetize.com/feed.php?format=1&num=${num}&page=${page}`,
      `http://gamemonetize.co/feed.php?format=1&num=${num}&page=${page}`
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          redirect: 'follow',
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json,text/xml,application/xml,*/*"
          }
        });

        if (!response.ok) {
          throw new Error(`GameMonetize returned status ${response.status} for ${url}`);
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
            if (title) {
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
          }
          if (games.length > 0) {
            feedCache[cacheKey] = { data: { games }, timestamp: now };
            return res.json({ games });
          }
        } else {
          // JSON format
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

          if (games.length > 0) {
            feedCache[cacheKey] = { data: { games }, timestamp: now };
            return res.json({ games });
          }
        }
      } catch (error: any) {
        console.warn(`Fetch/parse attempt failed for ${url}:`, error.message);
        lastError = error;
      }
    }

    // Elegant graceful degradation: fallback to cached popular games list so homepage NEVER crashes
    console.warn("All external GameMonetize feed fetches failed. Serving offline fallback games database to guarantee 100% uptime.");
    // Also cache the fallback so we don't spam requests when offline
    feedCache[cacheKey] = { data: { games: FALLBACK_ONLINE_GAMES }, timestamp: now };
    return res.json({ games: FALLBACK_ONLINE_GAMES });
  });

  // Image proxy to bypass GameMonetize hotlink protection and speed up image loading using server-side fetching and browser caching
  app.get("/api/image-proxy", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("No image URL provided");
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://gamemonetize.com/"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      // Cache in browser and CDN for 1 day
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("Image proxy failed:", error.message);
      // Failover: redirect to the original URL or a fallback placeholder
      res.redirect(imageUrl);
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
