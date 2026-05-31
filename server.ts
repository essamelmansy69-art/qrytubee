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
  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
        let dynamicContent = content.replaceAll("https://qrytube.com", host);
        dynamicContent = dynamicContent.replaceAll("https://qrytubee.essamelmansy69.workers.dev", host);
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
