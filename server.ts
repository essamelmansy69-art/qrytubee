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

  // API MIDDLEWARE / ROUTES
  // Simple in-memory storage for analytics, flushed to analytics.json asynchronously
  const ANALYTICS_FILE = path.join(process.cwd(), "analytics.json");
  interface ScanSample {
    date: string;
    device: string;
  }
  interface CodeAnalytics {
    total: number;
    target: string;
    platform: string;
    scans: ScanSample[];
  }
  interface RecentScan {
    timestamp: string;
    tid: string;
    target: string;
    platform: string;
    device: string;
  }
  interface AnalyticsStore {
    totalScans: number;
    scansByPlatform: Record<string, number>;
    scansByDevice: Record<string, number>;
    scansByCode: Record<string, CodeAnalytics>;
    recentScans: RecentScan[];
  }

  let analyticsData: AnalyticsStore = {
    totalScans: 0,
    scansByPlatform: {},
    scansByDevice: {},
    scansByCode: {},
    recentScans: []
  };

  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const saved = fs.readFileSync(ANALYTICS_FILE, "utf8");
      if (saved) {
        analyticsData = JSON.parse(saved);
      }
    }
  } catch (e) {
    console.error("Failed to load analytics.json. Starting fresh.", e);
  }

  // Helper to save analytics asynchronously (throttled to avoid I/O bottlenecks)
  let saveTimeout: NodeJS.Timeout | null = null;
  function scheduleSave() {
    if (saveTimeout) return;
    saveTimeout = setTimeout(() => {
      fs.writeFile(ANALYTICS_FILE, JSON.stringify(analyticsData, null, 2), "utf8", (err) => {
        if (err) console.error("Error writing analytics file:", err);
        saveTimeout = null;
      });
    }, 1000); // Wait 1 second before flushing to disk
  }

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 2. Track scan event
  app.all("/api/track-scan", (req, res) => {
    const tid = (req.query.tid || req.body?.tid || "").toString() || "unknown";
    const target = (req.query.r || req.body?.r || "").toString() || "https://youtube.com";
    const platform = (req.query.platform || req.body?.platform || "youtube").toString();
    
    // Parse user agent for device categorisation
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();
    let device = "Desktop";
    if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) {
      device = "iOS";
    } else if (userAgent.includes("android")) {
      device = "Android";
    }

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split("T")[0]; // YYYY-MM-DD

    // Ensure state collections are ready
    if (!analyticsData.scansByPlatform) analyticsData.scansByPlatform = {};
    if (!analyticsData.scansByDevice) analyticsData.scansByDevice = {};
    if (!analyticsData.scansByCode) analyticsData.scansByCode = {};
    if (!analyticsData.recentScans) analyticsData.recentScans = [];

    // Update global aggregates
    analyticsData.totalScans = (analyticsData.totalScans || 0) + 1;
    analyticsData.scansByPlatform[platform] = (analyticsData.scansByPlatform[platform] || 0) + 1;
    analyticsData.scansByDevice[device] = (analyticsData.scansByDevice[device] || 0) + 1;

    // Update code-specific analytics
    if (!analyticsData.scansByCode[tid]) {
      analyticsData.scansByCode[tid] = {
        total: 0,
        target: target,
        platform: platform,
        scans: []
      };
    }
    
    const codeObj = analyticsData.scansByCode[tid];
    codeObj.total++;
    codeObj.target = target;
    codeObj.platform = platform;
    if (!codeObj.scans) codeObj.scans = [];
    
    codeObj.scans.push({
      date: dateStr,
      device: device
    });
    if (codeObj.scans.length > 50) {
      codeObj.scans.shift();
    }

    // Add to recent global scans (keep last 30 recent)
    analyticsData.recentScans.unshift({
      timestamp,
      tid,
      target,
      platform,
      device
    });
    if (analyticsData.recentScans.length > 30) {
      analyticsData.recentScans.pop();
    }

    scheduleSave();

    res.status(200).json({ success: true, trackingId: tid, timestamp });
  });

  // 3. Retrieve analytics summary
  app.get("/api/analytics", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 12;
    
    // Sort all tracked codes by usage
    const topCodes = Object.entries(analyticsData.scansByCode || {})
      .map(([id, info]) => ({
        id,
        total: info.total,
        target: info.target,
        platform: info.platform
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    // Filter specific code if requested
    const specificCodeId = req.query.tid as string;
    let specificCodeData = null;
    if (specificCodeId && analyticsData.scansByCode && analyticsData.scansByCode[specificCodeId]) {
      specificCodeData = analyticsData.scansByCode[specificCodeId];
    }

    res.json({
      totalScans: analyticsData.totalScans || 0,
      scansByPlatform: analyticsData.scansByPlatform || {},
      scansByDevice: analyticsData.scansByDevice || {},
      recentScans: (analyticsData.recentScans || []).slice(0, 12),
      topCodes,
      specificCode: specificCodeData
    });
  });

  // Dynamic Sitemap Route
  app.get("/sitemap.xml", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = `${protocol}://${req.get("host")}`;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- 1. Deep Linker (Arabic) -->
  <url>
    <loc>${host}/</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 1. Deep Linker (English) -->
  <url>
    <loc>${host}/?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 2. About Us (Arabic) -->
  <url>
    <loc>${host}/about</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/about" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/about?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/about" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 2. About Us (English) -->
  <url>
    <loc>${host}/about?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/about" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/about?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/about" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 3. Contact (Arabic) -->
  <url>
    <loc>${host}/contact</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/contact" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/contact?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/contact" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 3. Contact (English) -->
  <url>
    <loc>${host}/contact?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/contact" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/contact?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/contact" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 4. Privacy Policy (Arabic) -->
  <url>
    <loc>${host}/privacy</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/privacy" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 4. Privacy Policy (English) -->
  <url>
    <loc>${host}/privacy?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/privacy" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 5. Articles (Arabic) -->
  <url>
    <loc>${host}/articles</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 5. Articles (English) -->
  <url>
    <loc>${host}/articles?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 6. Terms of Service (Arabic) -->
  <url>
    <loc>${host}/terms</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/terms" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 6. Terms of Service (English) -->
  <url>
    <loc>${host}/terms?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/terms" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  });

  // Serve favicon.ico safely to avoid 404s
  app.get("/favicon.ico", (req, res) => {
    const distPath = path.join(process.cwd(), "dist");
    const favPath = path.join(distPath, "favicon.png");
    const publicPath = path.join(process.cwd(), "public", "favicon.png");
    
    if (fs.existsSync(favPath)) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.sendFile(favPath);
    } else if (fs.existsSync(publicPath)) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.sendFile(publicPath);
    } else {
      res.redirect("/favicon.png");
    }
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
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = `${protocol}://${req.get("host")}`;
      
      fs.readFile(indexHtmlPath, "utf8", (err, content) => {
        if (err) {
          res.status(502).send("App bundle loading error");
          return;
        }
        
        // Detect current language for crawler on the server side
        const queryLang = req.query.lang;
        let isEn = queryLang === "en";
        if (!queryLang) {
          const acceptLang = (req.headers["accept-language"] || "").toString();
          isEn = !acceptLang.match(/ar([;,-]|$)/i);
        }

        const pathname = req.path;
        const normalizedPath = pathname === "/" ? "" : pathname;
        const baseSuffix = normalizedPath || "/";
        
        // Define absolute SECURE production URLs specifically for SEO crawlers (pointing strictly to https://qrytube.com)
        const canonicalUrl = `https://qrytube.com${baseSuffix}`;
        const arUrl = `https://qrytube.com${baseSuffix}?lang=ar`;
        const enUrl = `https://qrytube.com${baseSuffix}?lang=en`;
        const xDefaultUrl = `https://qrytube.com${baseSuffix}`;
        const currentUrl = `https://qrytube.com${pathname || "/"}${isEn ? "?lang=en" : "?lang=ar"}`;

        // Replace domains and hostnames for developer preview and asset loading first
        let dynamicContent = content;
        dynamicContent = dynamicContent.replaceAll("https://qrytube.com", host);
        dynamicContent = dynamicContent.replaceAll("https://qrytubee.essamelmansy69.workers.dev", host);

        // Safely replace canonical, alternate hreflang and OpenGraph tags dynamically with absolute secure production domain https://qrytube.com
        dynamicContent = dynamicContent.replace(
          /<link rel="canonical" href="[^"]*"\s*\/?>/,
          `<link rel="canonical" href="${canonicalUrl}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<link rel="alternate" hreflang="ar" href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="ar" href="${arUrl}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="en" href="${enUrl}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<meta property="og:url" content="[^"]*"\s*\/?>/,
          `<meta property="og:url" content="${currentUrl}" />`
        );

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.status(200).send(dynamicContent);
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Qrytube Server] running on http://localhost:${PORT}`);
  });
}

startServer();
