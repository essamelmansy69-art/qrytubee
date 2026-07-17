import fs from "fs";
import path from "path";
import { articlesData } from "./src/data/seoContent";

const HOST = "https://qrytube.com";

function getSitemapXml() {
  const staticPages = [
    { path: "", freq: "daily", priority: "1.0", label: "Home" },
    { path: "/about", freq: "monthly", priority: "0.8", label: "About" },
    { path: "/contact", freq: "monthly", priority: "0.8", label: "Contact" },
    { path: "/privacy", freq: "monthly", priority: "0.5", label: "Privacy" },
    { path: "/terms", freq: "monthly", priority: "0.5", label: "Terms" },
    { path: "/articles", freq: "weekly", priority: "0.9", label: "Articles" },
    { path: "/restaurant", freq: "weekly", priority: "0.8", label: "Restaurant" },
    { path: "/gym", freq: "weekly", priority: "0.9", label: "Gym" },
    { path: "/facebook", freq: "weekly", priority: "0.8", label: "Facebook" },
    { path: "/instagram", freq: "weekly", priority: "0.8", label: "Instagram" },
    { path: "/tiktok", freq: "weekly", priority: "0.8", label: "TikTok" },
    { path: "/telegram", freq: "weekly", priority: "0.8", label: "Telegram" },
    { path: "/website", freq: "weekly", priority: "0.8", label: "Website" },
    { path: "/faq", freq: "weekly", priority: "0.7", label: "FAQ" },
    { path: "/chapters", freq: "weekly", priority: "0.8", label: "Chapters" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 1. Process Static Pages
  for (const page of staticPages) {
    const route = page.path;
    const lastmod = "2026-06-13";

    // Arabic version of static page
    xml += `
  <url>
    <loc>${HOST}${route}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${HOST}${route}" />
    <xhtml:link rel="alternate" hreflang="en" href="${HOST}${route}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${HOST}${route}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;

    // English version of static page
    xml += `
  <url>
    <loc>${HOST}${route}?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${HOST}${route}" />
    <xhtml:link rel="alternate" hreflang="en" href="${HOST}${route}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${HOST}${route}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // 2. Process Blog Articles
  const arArticles = articlesData.ar || [];
  const enArticles = articlesData.en || [];

  const processedIds = new Set<string>();

  // Process Arabic and mutual articles
  for (const arArticle of arArticles) {
    const id = arArticle.id;
    processedIds.add(id);
    const hasEn = enArticles.some((e) => e.id === id);
    const lastMod = arArticle.date || "2026-06-13";

    if (hasEn) {
      xml += `
  <url>
    <loc>${HOST}/articles/${id}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${HOST}/articles/${id}" />
    <xhtml:link rel="alternate" hreflang="en" href="${HOST}/articles/${id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${HOST}/articles/${id}" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${HOST}/articles/${id}?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${HOST}/articles/${id}" />
    <xhtml:link rel="alternate" hreflang="en" href="${HOST}/articles/${id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${HOST}/articles/${id}" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    } else {
      xml += `
  <url>
    <loc>${HOST}/articles/${id}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${HOST}/articles/${id}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${HOST}/articles/${id}" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  // Process leftover English-only articles
  for (const enArticle of enArticles) {
    const id = enArticle.id;
    if (processedIds.has(id)) continue;
    processedIds.add(id);
    const lastMod = enArticle.date || "2026-06-13";

    xml += `
  <url>
    <loc>${HOST}/articles/${id}?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${HOST}/articles/${id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${HOST}/articles/${id}?lang=en" />
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `\n</urlset>`;
  return xml;
}

try {
  const xmlContent = getSitemapXml();
  const publicDir = path.join(process.cwd(), "public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xmlContent.trim(), "utf8");
  console.log("Successfully generated public/sitemap.xml!");
} catch (err) {
  console.error("Failed to generate sitemap.xml:", err);
  process.exit(1);
}
