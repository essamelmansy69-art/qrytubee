import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(compression());
  app.use(express.json());

  // API Endpoints
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/analytics', (_req, res) => {
    res.json({
      success: true,
      data: {
        scansToday: 1420,
        linksCreated: 4328,
        activeCampaigns: 284,
      }
    });
  });

  // Sitemap and static assets
  app.get('/sitemap.xml', (_req, res) => {
    const sitemapPath = path.resolve(__dirname, isProd ? 'dist/sitemap.xml' : 'public/sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.setHeader('Content-Type', 'application/xml');
      return res.sendFile(sitemapPath);
    }
    // Fallback sitemap
    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://qrytube.com/</loc><priority>1.0</priority></url>
</urlset>`);
  });

  if (!isProd) {
    // Integrate Vite development server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

    app.get('*', (_req, res) => {
      const htmlPath = path.resolve(__dirname, 'dist/index.html');
      if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Qrytube Server] Running in ${isProd ? 'Production' : 'Development'} at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
