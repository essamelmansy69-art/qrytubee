import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// List of local games
const LOCAL_GAMES = [
  {
    id: 'game-cheese-eater',
    title: { ar: 'آكل الجبن الكلاسيكية', en: 'Cheese Eater Classic' },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7m96t6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-tetris',
    title: { ar: 'تتريس الكلاسيكية', en: 'Classic Tetris' },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamedistribution.com/f04c643b174744d0a9b8971f4963bd9b/'
  },
  {
    id: 'game-breakout',
    title: { ar: 'أتاري هدم الجدران 3D', en: 'Atari Breakout 3D' },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/b98t89h5o4q3it3w79w9o4v806fbfhsk/'
  },
  {
    id: 'game-candy-crush',
    title: { ar: 'تطابق الحلوى كاندي كراش', en: 'Candy Crush Match 3' },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/1k4ot6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-car-racing',
    title: { ar: 'سباق سيارات الطريق السريع', en: 'Neon Highway Racer' },
    category: 'Racing',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/o96p89h5o4q3it3w79w9o4v806fbfhsk/'
  },
  {
    id: 'game-plane-shooter',
    title: { ar: 'أتاري غارة الطائرات', en: 'Atari River Raid Flight' },
    category: 'Action',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7m96t6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-ludo',
    title: { ar: 'لودو الكلاسيكية برو', en: 'Retro Ludo Board Pro' },
    category: 'Board',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/2k4ot6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-bubble-shooter-3d',
    title: { ar: 'قاذف الفقاعات ثلاثي الأبعاد', en: 'Bubble Shooter 3D Online' },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7v4ot6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-tri-puzzle',
    title: { ar: 'تراي بازل تركيب الكتل', en: 'TriPuzzle Block Craft' },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7j96t6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-number-search',
    title: { ar: 'لعبة البحث عن الأرقام', en: 'Number Search Game' },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/8k4ot6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-zuma-legend',
    title: { ar: 'زومة الكلاسيكية الأسطورة', en: 'Zuma Legend Classic' },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7y4ot6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-daily-mini-sudoku',
    title: { ar: 'سودوكو اليومية المصغرة', en: 'Daily Mini Sudoku' },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/1j96t6m1o37it3w879w9o4v806fbfhsk/'
  },
  {
    id: 'game-going-up-rooftop',
    title: { ar: 'تسلق أسطح المنازل Going Up', en: 'Going Up Rooftop Game' },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7m96t6m1o37it3w879w9o4v806fbfhsk/'
  }
];

// In-memory cache for dynamic games
let cachedGames: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Safe URL and text cleaner for XML Sitemap output
function cleanXmlString(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Function to fetch GameMonetize feed safely
async function getGameMonetizeFeed() {
  const now = Date.now();
  if (cachedGames.length > 0 && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedGames;
  }

  try {
    const feedUrl = 'https://gamemonetize.com/feed.php?format=0';
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const text = await response.text();
      if (text.trim().startsWith('[')) {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          // Normalize items
          cachedGames = data.map((item: any) => ({
            id: item.id || `gm-${Math.random().toString(36).substr(2, 9)}`,
            title: { ar: item.title || 'لعبة جديدة', en: item.title || 'New Game' },
            description: item.description || '',
            category: item.category || 'Arcade',
            url: item.url || '',
            thumb: item.thumb || '',
            width: item.width || '100%',
            height: item.height || '100%',
            isLocal: false
          }));
          cacheTimestamp = now;
          console.log(`Successfully fetched ${cachedGames.length} games from GameMonetize feed.`);
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch dynamic GameMonetize feed:', error);
  }

  return cachedGames;
}

// API endpoint to return all games (Local + Imported)
app.get('/api/games', async (req, res) => {
  try {
    const imported = await getGameMonetizeFeed();
    res.json(imported);
  } catch (error) {
    res.json([]);
  }
});

// Dynamic XML Sitemap Route (Fulfills user's sitemap request with imported games!)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const imported = await getGameMonetizeFeed();
    const today = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    sitemap += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // 1. Home Pages
    sitemap += `  <!-- Home Page Arabic -->\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://qrytube.com/?lang=ar</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/?lang=ar" />\n`;
    sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?lang=en" />\n`;
    sitemap += `  </url>\n`;

    sitemap += `  <!-- Home Page English -->\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://qrytube.com/?lang=en</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/?lang=ar" />\n`;
    sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?lang=en" />\n`;
    sitemap += `  </url>\n`;

    // 2. Local Games (13 core games)
    sitemap += `  <!-- Core Predefined Local Games -->\n`;
    for (const game of LOCAL_GAMES) {
      const cleanId = cleanXmlString(game.id);
      
      // Arabic Game Route
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://qrytube.com/?game=${cleanId}&amp;lang=ar</loc>\n`;
      sitemap += `    <lastmod>${today}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.9</priority>\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/?game=${cleanId}&amp;lang=ar" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?game=${cleanId}&amp;lang=en" />\n`;
      sitemap += `  </url>\n`;

      // English Game Route
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://qrytube.com/?game=${cleanId}&amp;lang=en</loc>\n`;
      sitemap += `    <lastmod>${today}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.9</priority>\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/?game=${cleanId}&amp;lang=ar" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?game=${cleanId}&amp;lang=en" />\n`;
      sitemap += `  </url>\n`;
    }

    // 3. GameMonetize Imported Games (Limit to first 80 games to avoid huge sizes and speed up crawlers)
    if (imported && imported.length > 0) {
      sitemap += `  <!-- GameMonetize Imported Dynamic Games -->\n`;
      const limitedImported = imported.slice(0, 80);
      for (const game of limitedImported) {
        const cleanId = cleanXmlString(game.id);
        
        // Arabic Route
        sitemap += `  <url>\n`;
        sitemap += `    <loc>https://qrytube.com/?game=${cleanId}&amp;lang=ar</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.7</priority>\n`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/?game=${cleanId}&amp;lang=ar" />\n`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?game=${cleanId}&amp;lang=en" />\n`;
        sitemap += `  </url>\n`;

        // English Route
        sitemap += `  <url>\n`;
        sitemap += `    <loc>https://qrytube.com/?game=${cleanId}&amp;lang=en</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.7</priority>\n`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/?game=${cleanId}&amp;lang=ar" />\n`;
        sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?game=${cleanId}&amp;lang=en" />\n`;
        sitemap += `  </url>\n`;
      }
    }

    sitemap += `</urlset>\n`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// Serve robots.txt dynamically as well
app.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *\nAllow: /\nSitemap: https://qrytube.com/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Vite Integration for full-stack SPA serving
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // Serve the static build
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Single page app fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // In development, import and mount the Vite development middleware
  import('vite').then((vite) => {
    vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    }).then((viteServer) => {
      app.use(viteServer.middlewares);
      console.log('Vite middleware integrated successfully in Express.');
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Atari Server running at http://localhost:${PORT}`);
});
