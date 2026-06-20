import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import compression from "compression";
import { articlesData } from "./src/data/seoContent";
import { isSupabaseConfigured, dbUpsertCode, dbInsertScan } from "./src/lib/supabase";


const PORT = 3000;

async function startServer() {
  console.log("=== Supabase Connection Status ===");
  console.log("process.env.SUPABASE_URL is set:", !!process.env.SUPABASE_URL);
  console.log("process.env.SUPABASE_SERVICE_ROLE_KEY is set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("process.env.SUPABASE_KEY is set:", !!process.env.SUPABASE_KEY);
  console.log("isSupabaseConfigured:", isSupabaseConfigured());
  console.log("=================================");

  const app = express();
  app.use(compression());
  app.use(express.json());

  // API MIDDLEWARE / ROUTES
  // Simple in-memory storage for analytics, flushed to analytics.json asynchronously
  const ANALYTICS_FILE = path.join(process.cwd(), "analytics.json");
  
  const COUNTRY_MAP = {
    "EG": { ar: "مصر", en: "Egypt", flag: "🇪🇬" },
    "SA": { ar: "المملكة العربية السعودية", en: "Saudi Arabia", flag: "🇸🇦" },
    "AE": { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates", flag: "🇦🇪" },
    "DZ": { ar: "الجزائر", en: "Algeria", flag: "🇩🇿" },
    "MA": { ar: "المغرب", en: "Morocco", flag: "🇲🇦" },
    "IQ": { ar: "العراق", en: "Iraq", flag: "🇮🇶" },
    "SD": { ar: "السودان", en: "Sudan", flag: "🇸🇩" },
    "YE": { ar: "اليمن", en: "Yemen", flag: "🇾🇪" },
    "SY": { ar: "سوريا", en: "Syria", flag: "🇸🇾" },
    "JO": { ar: "الأردن", en: "Jordan", flag: "🇯🇴" },
    "TN": { ar: "تونس", en: "Tunisia", flag: "🇹🇳" },
    "LY": { ar: "ليبيا", en: "Libya", flag: "🇱🇾" },
    "PS": { ar: "فلسطين", en: "Palestine", flag: "🇵🇸" },
    "LB": { ar: "لبنان", en: "Lebanon", flag: "🇱🇧" },
    "OM": { ar: "عمان", en: "Oman", flag: "🇴🇲" },
    "KW": { ar: "الكويت", en: "Kuwait", flag: "🇰🇼" },
    "QA": { ar: "قطر", en: "Qatar", flag: "🇶🇦" },
    "BH": { ar: "البحرين", en: "Bahrain", flag: "🇧🇭" },
    "US": { ar: "الولايات المتحدة", en: "United States", flag: "🇺🇸" },
    "GB": { ar: "المملكة المتحدة", en: "United Kingdom", flag: "🇬🇧" },
    "DE": { ar: "ألمانيا", en: "Germany", flag: "🇩🇪" },
    "FR": { ar: "فرنسا", en: "France", flag: "🇫🇷" },
    "TR": { ar: "تركيا", en: "Turkey", flag: "🇹🇷" },
    "CA": { ar: "كندا", en: "Canada", flag: "🇨🇦" },
    "AU": { ar: "أستراليا", en: "Australia", flag: "🇦🇺" },
    "IN": { ar: "الهند", en: "India", flag: "🇮🇳" },
    "UNKNOWN": { ar: "غير معروف", en: "Unknown", flag: "🌐" }
  };

  interface ScanSample {
    date: string;
    device: string;
    os?: string;
    country?: string;
    timestamp?: string;
  }
  interface CodeAnalytics {
    total: number;
    target: string;
    platform: string;
    countries?: Record<string, number>;
    devices?: Record<string, number>;
    osList?: Record<string, number>;
    scans: ScanSample[];
  }
  interface RecentScan {
    timestamp: string;
    tid: string;
    target: string;
    platform: string;
    device: string;
    os?: string;
    country?: string;
  }
  interface AnalyticsStore {
    totalScans: number;
    scansByPlatform: Record<string, number>;
    scansByDevice: Record<string, number>;
    scansByOS?: Record<string, number>;
    scansByCountry?: Record<string, number>;
    scansByCode: Record<string, CodeAnalytics>;
    recentScans: RecentScan[];
  }

  function parseUserAgent(ua: string): { device: string; os: string } {
    const lowercaseUa = (ua || "").toLowerCase();
    
    // 1. Detect Operating System (OS)
    let os = "Other";
    if (lowercaseUa.includes("windows")) {
      os = "Windows";
    } else if (lowercaseUa.includes("android")) {
      os = "Android";
    } else if (lowercaseUa.includes("iphone") || lowercaseUa.includes("ipad") || lowercaseUa.includes("ipod")) {
      os = "iOS";
    } else if (lowercaseUa.includes("macintosh") || lowercaseUa.includes("mac os x")) {
      os = "macOS";
    } else if (lowercaseUa.includes("linux")) {
      os = "Linux";
    }
    
    // 2. Detect Device Type Compat
    let device = "Desktop";
    if (lowercaseUa.includes("iphone") || lowercaseUa.includes("ipad") || lowercaseUa.includes("ipod")) {
      device = "iOS";
    } else if (lowercaseUa.includes("android")) {
      device = "Android";
    }
    
    return { device, os };
  }

  function getCountryCode(req: any): string {
    // Enable simulation overrides for testing
    const overrideCountry = req.query?.country || req.body?.country;
    if (overrideCountry) {
      const code = overrideCountry.toString().toUpperCase().trim();
      if (COUNTRY_MAP.hasOwnProperty(code)) return code;
    }

    // Check standard GCP / Cloud Run and Cloudflare geo headers
    const rawCountry = req.headers["x-appengine-country"] || 
                       req.headers["cf-ipcountry"] || 
                       req.headers["x-country-code"] || 
                       req.headers["x-visitor-country"];
                       
    if (rawCountry) {
      const code = rawCountry.toString().toUpperCase().trim();
      return COUNTRY_MAP.hasOwnProperty(code) ? code : "UNKNOWN";
    }
    
    // Fallback to parsing Accept-Language header (e.g. ar-EG, en-SA)
    const acceptLang = req.headers["accept-language"] || "";
    const match = acceptLang.match(/([a-z]{2})-([a-z]{2})/i);
    if (match && match[2]) {
      const parsedCode = match[2].toUpperCase();
      if (COUNTRY_MAP.hasOwnProperty(parsedCode)) {
        return parsedCode;
      }
    }
    
    // Generic system fallback by primary language prefix
    const primaryLang = acceptLang.split(",")[0].split("-")[0].toLowerCase().trim();
    if (primaryLang === "ar") {
      return "EG"; // Largest Arabic userbase fallback
    } else if (primaryLang === "en") {
      return "US";
    }
    
    return "UNKNOWN";
  }

  let analyticsData: AnalyticsStore = {
    totalScans: 0,
    scansByPlatform: {},
    scansByDevice: {},
    scansByOS: {},
    scansByCountry: {},
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
    
    // Parse user agent for device and OS categorisation
    const userAgent = (req.query.ua || req.body?.ua || req.headers["user-agent"] || "").toString().toLowerCase();
    const { device, os } = parseUserAgent(userAgent);
    const country = getCountryCode(req);

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split("T")[0]; // YYYY-MM-DD

    // Ensure state collections are ready
    if (!analyticsData.scansByPlatform) analyticsData.scansByPlatform = {};
    if (!analyticsData.scansByDevice) analyticsData.scansByDevice = {};
    if (!analyticsData.scansByOS) analyticsData.scansByOS = {};
    if (!analyticsData.scansByCountry) analyticsData.scansByCountry = {};
    if (!analyticsData.scansByCode) analyticsData.scansByCode = {};
    if (!analyticsData.recentScans) analyticsData.recentScans = [];

    // Update global aggregates
    analyticsData.totalScans = (analyticsData.totalScans || 0) + 1;
    analyticsData.scansByPlatform[platform] = (analyticsData.scansByPlatform[platform] || 0) + 1;
    analyticsData.scansByDevice[device] = (analyticsData.scansByDevice[device] || 0) + 1;
    analyticsData.scansByOS[os] = (analyticsData.scansByOS[os] || 0) + 1;
    analyticsData.scansByCountry[country] = (analyticsData.scansByCountry[country] || 0) + 1;

    // Update code-specific analytics
    if (!analyticsData.scansByCode[tid]) {
      analyticsData.scansByCode[tid] = {
        total: 0,
        target: target,
        platform: platform,
        countries: {},
        devices: {},
        osList: {},
        scans: []
      };
    }
    
    const codeObj = analyticsData.scansByCode[tid];
    codeObj.total++;
    codeObj.target = target;
    codeObj.platform = platform;
    if (!codeObj.scans) codeObj.scans = [];
    if (!codeObj.countries) codeObj.countries = {};
    if (!codeObj.devices) codeObj.devices = {};
    if (!codeObj.osList) codeObj.osList = {};
    
    codeObj.countries[country] = (codeObj.countries[country] || 0) + 1;
    codeObj.devices[device] = (codeObj.devices[device] || 0) + 1;
    codeObj.osList[os] = (codeObj.osList[os] || 0) + 1;
    
    codeObj.scans.push({
      date: dateStr,
      device: device,
      os: os,
      country: country,
      timestamp: timestamp
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
      device,
      os,
      country
    });
    if (analyticsData.recentScans.length > 30) {
      analyticsData.recentScans.pop();
    }

    scheduleSave();

    // Background sync to Supabase if configured
    if (isSupabaseConfigured()) {
      dbUpsertCode(tid, target, platform, true).catch(err => {
        console.error("Supabase fail dbUpsertCode:", err);
      });
      dbInsertScan({
        code_id: tid,
        timestamp,
        device,
        os,
        country,
        platform,
        target
      }).catch(err => {
        console.error("Supabase fail dbInsertScan:", err);
      });
    }

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
        platform: info.platform,
        countries: info.countries || {},
        devices: info.devices || {},
        osList: info.osList || {}
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    // Filter specific code if requested
    const specificCodeId = req.query.tid as string;
    let specificCodeData = null;
    if (specificCodeId && analyticsData.scansByCode && analyticsData.scansByCode[specificCodeId]) {
      const info = analyticsData.scansByCode[specificCodeId];
      specificCodeData = {
        ...info,
        countries: info.countries || {},
        devices: info.devices || {},
        osList: info.osList || {},
        scans: (info.scans || []).map(sc => ({
          ...sc,
          os: sc.os || "Other",
          country: sc.country || "UNKNOWN"
        }))
      };
    }

    res.json({
      supabaseConnected: isSupabaseConfigured(),
      totalScans: analyticsData.totalScans || 0,
      scansByPlatform: analyticsData.scansByPlatform || {},
      scansByDevice: analyticsData.scansByDevice || {},
      scansByOS: analyticsData.scansByOS || {},
      scansByCountry: analyticsData.scansByCountry || {},
      recentScans: (analyticsData.recentScans || []).slice(0, 12).map(scan => ({
        ...scan,
        os: scan.os || "Other",
        country: scan.country || "UNKNOWN"
      })),
      topCodes,
      specificCode: specificCodeData,
      countryMap: COUNTRY_MAP
    });
  });

  // Dynamic Sitemap Route
  app.get("/sitemap.xml", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = `${protocol}://${req.get("host")}`;
    
    // Collect all article IDs dynamically from articlesData
    const arArticleList = articlesData.ar || [];
    const enArticleList = articlesData.en || [];
    
    // To keep track of processed IDs
    const processedIds = new Set<string>();
    let articleUrls = "";

    // Process Arabic articles first
    for (const article of arArticleList) {
      const id = article.id;
      processedIds.add(id);
      const hasEn = enArticleList.some(e => e.id === id);
      const lastMod = article.date || "2026-06-13";

      if (hasEn) {
        articleUrls += `
  <url>
    <loc>${host}/articles/${id}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles/${id}" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles/${id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles/${id}" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${host}/articles/${id}?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles/${id}" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles/${id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles/${id}" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      } else {
        articleUrls += `
  <url>
    <loc>${host}/articles/${id}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles/${id}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles/${id}" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    // Process any English-only articles
    for (const article of enArticleList) {
      const id = article.id;
      if (processedIds.has(id)) continue;
      processedIds.add(id);
      const lastMod = article.date || "2026-06-13";

      articleUrls += `
  <url>
    <loc>${host}/articles/${id}?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles/${id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles/${id}?lang=en" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- 1. Deep Linker (Arabic) -->
  <url>
    <loc>${host}/</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 1. Deep Linker (English) -->
  <url>
    <loc>${host}/?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 2. About Us (Arabic) -->
  <url>
    <loc>${host}/about</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/about" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/about?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/about" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 2. About Us (English) -->
  <url>
    <loc>${host}/about?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/about" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/about?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/about" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 3. Contact (Arabic) -->
  <url>
    <loc>${host}/contact</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/contact" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/contact?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/contact" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 3. Contact (English) -->
  <url>
    <loc>${host}/contact?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/contact" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/contact?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/contact" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 4. Privacy Policy (Arabic) -->
  <url>
    <loc>${host}/privacy</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/privacy" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 4. Privacy Policy (English) -->
  <url>
    <loc>${host}/privacy?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/privacy" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 5. Articles (Arabic) -->
  <url>
    <loc>${host}/articles</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 5. Articles (English) -->
  <url>
    <loc>${host}/articles?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/articles" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/articles?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/articles" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 6. Terms of Service (Arabic) -->
  <url>
    <loc>${host}/terms</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/terms" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 6. Terms of Service (English) -->
  <url>
    <loc>${host}/terms?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/terms" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 7. Restaurant Tool (Arabic) -->
  <url>
    <loc>${host}/restaurant</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/restaurant" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/restaurant?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/restaurant" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 7. Restaurant Tool (English) -->
  <url>
    <loc>${host}/restaurant?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/restaurant" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/restaurant?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/restaurant" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 8. Gym & Fitness Tool (Arabic) -->
  <url>
    <loc>${host}/gym</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/gym" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/gym?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/gym" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 8. Gym & Fitness Tool (English) -->
  <url>
    <loc>${host}/gym?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${host}/gym" />
    <xhtml:link rel="alternate" hreflang="en" href="${host}/gym?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/gym" />
    <lastmod>2026-06-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>${articleUrls}
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

        // Calculate page-specific Title and Description
        const cleanPath = req.path.toLowerCase().replace(/^\/|\/$/g, "");
        let title = "";
        let desc = "";

        if (cleanPath === "" || cleanPath === "generator") {
          title = isEn 
            ? "Viral QR Code Generator | Open Social Links Directly in Apps"
            : "Qrytube | أداة إنشاء رموز QR ذكية لقنوات اليوتيوب";
          desc = isEn
            ? "Create smart deep-link QR codes for social media influencers. Force links to open directly inside YouTube, Facebook, Instagram, and TikTok apps."
            : "اصنع رموز QR ذكية (Deep Links) لـقناتك على اليوتيوب مجاناً. تتيح للمتابعين فتح قناتك أو فيديوهاتك داخل تطبيق اليوتيوب مباشرة لزيادة المشاهدات والاشتراكات.";
        } else if (cleanPath === "faq") {
          title = isEn
            ? "Frequently Asked Questions | Qrytube"
            : "الأسئلة الشائعة | Qrytube";
          desc = isEn
            ? "Find answers about dynamic deep links, custom brand styling, high-resolution QR scanning, and secure browser-to-app routing on Qrytube."
            : "أجوبة شاملة على جميع استفساراتك حول الروابط العميقة (Deep Links)، كيفية توليد رموز الـ QR كود الذكية، وتخصيص الألوان وإدراج الشعار بدون تعطل المسح.";
        } else if (cleanPath === "articles") {
          title = isEn
            ? "Articles & SEO Guides | Qrytube"
            : "المقالات وأدلة السيو | Qrytube";
          desc = isEn
            ? "Explore expert search engine optimization guides, video ranking algorithms, and smart link growth strategies for social media marketers."
            : "مقالات وأدلة سيو متخصصة وحصرية لمساعدتك في تصدر نتائج البحث، وزيادة المشاهدات والاشتراكات الحقيقية على يوتيوب ومنصات التواصل الاجتماعي لعام 2026.";
        } else if (cleanPath.startsWith("articles/")) {
          const articleId = cleanPath.replace("articles/", "");
          const langKey = isEn ? "en" : "ar";
          const article = articlesData[langKey]?.find(a => a.id.toLowerCase() === articleId.toLowerCase());
          if (article) {
            title = `${article.title} | Qrytube`;
            desc = article.excerpt;
          } else {
            title = isEn ? "Article Not Found | Qrytube" : "المقال غير موجود | Qrytube";
            desc = isEn ? "The requested article was not found or has been moved." : "المقال المطلوب غير موجود أو تم نقله.";
          }
        } else if (cleanPath === "terms") {
          title = isEn ? "Terms of Service | Qrytube" : "شروط الخدمة | Qrytube";
          desc = isEn
            ? "Terms and conditions of use for Qrytube QR generator tool and professional smart deep links services."
            : "شروط الخدمة والسياسات المنظمة لاستخدام أداة كاشف الروابط وتوليد رموز الـ QR كيو آر الرسمية من Qrytube.";
        } else if (cleanPath === "privacy") {
          title = isEn ? "Privacy Policy | Qrytube" : "سياسة الخصوصية | Qrytube";
          desc = isEn
            ? "Privacy policy and client data protection pledge for Qrytube QR code generator visitors. Zero tracking cookies, fully secure local creation."
            : "سياسة الخصوصية والأمان لزائري موقع Qrytube. نحن ملتزمون بالكامل بحماية بياناتك وخصوصيتك حيث تتم كافة عمليات توليد الرموز محلياً في متصفحك.";
        } else if (cleanPath === "about") {
          title = isEn ? "About Us | Qrytube" : "من نحن | Qrytube";
          desc = isEn
            ? "Learn about Qrytube’s mission to help creators, influencers, and brands boost engagement and drive mobile app traffic seamlessly."
            : "تعرف على قصة Qrytube ورؤيتنا في مساعدة صناع المحتوى والمؤثرين العرب على النمو وزيادة الاشتراكات بنسب تصل إلى 200% باستخدام الروابط العميقة والـ QR الذكي.";
        } else if (cleanPath === "contact") {
          title = isEn ? "Contact Us | Qrytube" : "اتصل بنا | Qrytube";
          desc = isEn
            ? "Get in touch with the Qrytube professional team for support, feature feedback, partnership proposals, or customized enterprise integration solutions."
            : "تواصل مع فريق الدعم الفني لموقع Qrytube للإبلاغ عن أي مشاكل أو المساعدة في تصميم وطباعة أكواد الـ QR كود والشعارات المخصصة لقنواتك.";
        } else if (cleanPath === "restaurant") {
          title = isEn
            ? "Free Restaurant QR Code Generator | Smart Table Menu Code | Qrytube"
            : "أداة توليد كود QR للمطاعم والمقاهي مجاناً | منيو باركود ذكي | Qrytube";
          desc = isEn
            ? "Generate customizable, free QR codes for aggregate restaurant menus, food catalogs, and table stands. Include custom logos, frames, and download vector SVG/PDF flyers."
            : "أنشئ كود QR ذكي ومجاني لمنيو مطعمك أو مقهاك. يدعم روابط المنيو الإلكتروني ومواقع الخرائط، قابل للتخصيص بالكامل مع إضافة شعار وألوان مميزة للطباعة.";
        } else if (cleanPath === "gym") {
          title = isEn
            ? "Free Gym QR Code Generator | Smart Fitness Club Code | Qrytube"
            : "أداة توليد كود QR للصالات الرياضية والجيم مجاناً | رمز كاشف ذكي | Qrytube";
          desc = isEn
            ? "Generate customizable, free QR codes for fitness centers, gym reception check-ins, and machinery tutorials. Include custom dumbbell symbols, custom frame templates, and download vector flyers/A4 PDF."
            : "أنشئ كود QR ذكي ومجاني لصالتك الرياضية وناديك الصحي. يدعم روابط الاشتراكات، الحسابات، جداول التمارين، قابل للتخصيص بالكامل مع إضافة رموز الأثقال والشعارات للطباعة.";
        } else {
          // default/fallback
          title = isEn 
            ? "Viral QR Code Generator | Open Social Links Directly in Apps"
            : "Qrytube | أداة إنشاء رموز QR ذكية لقنوات اليوتيوب";
          desc = isEn
            ? "Create smart deep-link QR codes for social media influencers. Force links to open directly inside YouTube, Facebook, Instagram, and TikTok apps."
            : "اصنع رموز QR ذكية (Deep Links) لـقناتك على اليوتيوب مجاناً. تتيح للمتابعين فتح قناتك أو فيديوهاتك داخل تطبيق اليوتيوب مباشرة لزيادة المشاهدات والاشتراكات.";
        }

        // Replace domains and hostnames for developer preview and asset loading first
        let dynamicContent = content;
        dynamicContent = dynamicContent.replaceAll("https://qrytube.com", host);
        dynamicContent = dynamicContent.replaceAll("https://qrytubee.essamelmansy69.workers.dev", host);

        // Inject dynamic page Title and Description elements
        dynamicContent = dynamicContent.replace(
          /<title>[^<]*<\/title>/i,
          `<title>${title}</title>`
        );
        dynamicContent = dynamicContent.replace(
          /<meta name="description" content="[^"]*"\s*\/?>/i,
          `<meta name="description" content="${desc}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<meta property="og:title" content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${title}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<meta property="og:description" content="[^"]*"\s*\/?>/i,
          `<meta property="og:description" content="${desc}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:title" content="${title}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:description" content="${desc}" />`
        );
        dynamicContent = dynamicContent.replace(
          /<html[^>]*>/i,
          `<html lang="${isEn ? "en" : "ar"}" dir="${isEn ? "ltr" : "rtl"}">`
        );

        // 1. Dynamic Preloads Generation to optimize Critical Request Chains
        const jsRegex = /<script\s+[^>]*src="([^"]+\.js)"[^>]*>/gi;
        const cssRegex = /<link\s+[^>]*href="([^"]+\.css)"[^>]*>/gi;
        let preloads = "";
        let match;
        
        while ((match = jsRegex.exec(content)) !== null) {
          const url = match[1];
          // Use modulepreload for ES6 modules to prevent double-fetching
          preloads += `\n    <link rel="modulepreload" href="${url}" crossorigin />`;
        }
        while ((match = cssRegex.exec(content)) !== null) {
          const url = match[1];
          preloads += `\n    <link rel="preload" href="${url}" as="style" />`;
        }
        if (preloads) {
          dynamicContent = dynamicContent.replace("</head>", `${preloads}\n  </head>`);
        }

        // 2. Resolve Render-blocking CSS using preload + onload stylesheet fallback
        dynamicContent = dynamicContent.replace(
          /<link\s+([^>]*href="([^"]+\.css)"[^>]*rel="stylesheet"[^>]*|[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*)\/?>/gi,
          (m, p1, p2, p3) => {
            const cssUrl = p2 || p3;
            return `<link rel="stylesheet" href="${cssUrl}" media="all" />`;
          }
        );

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
