import fs from 'fs';
import path from 'path';

const LOCAL_GAMES = [
  "game-cheese-eater",
  "game-tetris",
  "game-breakout",
  "game-candy-crush",
  "game-car-racing",
  "game-plane-shooter",
  "game-ludo",
  "game-bubble-shooter-3d",
  "game-tri-puzzle",
  "game-number-search",
  "game-zuma-legend",
  "game-daily-mini-sudoku",
  "game-going-up-rooftop",
  "game-taxi-rush"
];

const LANGUAGES = ["ar", "en"];
const BASE_URL = "https://qrytube.com";
const LATEST_DATE = "2026-09-03";

async function generate() {
  console.log("Generating static sitemap.xml...");
  let gameIds = [...LOCAL_GAMES];
  
  try {
    const response = await fetch("https://gamemonetize.com/feed.php?format=0&num=50&page=1");
    if (response.ok) {
      const text = await response.text();
      if (text.trim().startsWith("[")) {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const id = String(item.id || "").trim();
            if (id && !gameIds.includes(id)) {
              gameIds.push(id);
            }
          });
          console.log(`Fetched ${data.length} games from GameMonetize feed.`);
        }
      } else {
        console.warn("GameMonetize returned non-JSON content. Using local fallback database.");
      }
    } else {
      console.warn("Failed to fetch GameMonetize feed. Using local fallback database.");
    }
  } catch (error) {
    console.warn("Error fetching GameMonetize games for sitemap, continuing with local games only:", error);
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // Add home links for each language
  LANGUAGES.forEach((lang) => {
    const urlAr = `${BASE_URL}/?lang=ar`;
    const urlEn = `${BASE_URL}/?lang=en`;
    const currentUrl = `${BASE_URL}/?lang=${lang}`;

    sitemap += `
  <url>
    <loc>${currentUrl}</loc>
    <lastmod>${LATEST_DATE}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${urlAr}" />
    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}" />
  </url>`;
  });

  // Add game links with language query parameters for separate SEO indexing
  gameIds.forEach((gameId) => {
    const fileLastmod = LATEST_DATE;
    LANGUAGES.forEach((lang) => {
      const gameUrlAr = `${BASE_URL}/?game=${gameId}&amp;lang=ar`;
      const gameUrlEn = `${BASE_URL}/?game=${gameId}&amp;lang=en`;
      const currentGameUrl = `${BASE_URL}/?game=${gameId}&amp;lang=${lang}`;

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

  const publicPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(publicPath, sitemap, "utf8");
  console.log(`Successfully generated static sitemap at: ${publicPath} with ${gameIds.length} games.`);
}

generate();
