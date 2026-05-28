import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface QRData {
  id: string;
  url: string;
  platform: string;
  type: string;
  scans: number;
  label?: string;
  createdAt: string;
}

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "scans.json");

// Read existing scans database
let qrDatabase: Record<string, QRData> = {};
try {
  if (fs.existsSync(DB_FILE)) {
    const fileContent = fs.readFileSync(DB_FILE, "utf-8");
    qrDatabase = JSON.parse(fileContent);
  }
} catch (error) {
  console.error("Failed to load scan tracking database:", error);
}

// Persistence helper
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(qrDatabase, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to scan tracking database:", error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API MIDDLEWARE / ROUTES
  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 2. Register Generated QR Code
  app.post("/api/register-qr", (req, res) => {
    const { id, url, platform, type, label } = req.body;
    if (!id || !url) {
      return res.status(400).json({ error: "id and url are required" });
    }

    // Only set if not already present
    if (!qrDatabase[id]) {
      qrDatabase[id] = {
        id,
        url,
        platform: platform || "youtube",
        type: type || "standard",
        scans: 0,
        label: label || "",
        createdAt: new Date().toISOString()
      };
      saveDatabase();
    }
    
    return res.json({ success: true, item: qrDatabase[id] });
  });

  // 3. Track QR Scan (Incremental API)
  app.post("/api/track-scan", (req, res) => {
    const tid = req.query.tid as string;
    const url = req.query.r as string;
    const platform = req.query.platform as string;
    const type = req.query.type as string;

    if (!tid) {
      return res.status(400).json({ error: "tid is required" });
    }

    if (qrDatabase[tid]) {
      qrDatabase[tid].scans += 1;
    } else if (url) {
      // Dynamic fallback creation on demand
      qrDatabase[tid] = {
        id: tid,
        url: decodeURIComponent(url),
        platform: platform || "youtube",
        type: type || "standard",
        scans: 1,
        label: "",
        createdAt: new Date().toISOString()
      };
    } else {
      return res.status(404).json({ error: "QR code not tracked" });
    }

    saveDatabase();
    return res.json({ success: true, scans: qrDatabase[tid].scans });
  });

  // 4. Retrieve Stats for specific lists of IDs
  app.get("/api/qr-stats", (req, res) => {
    const idsParam = req.query.ids as string;
    if (!idsParam) {
      return res.json([]);
    }

    const idsList = idsParam.split(",");
    const results = idsList.map(id => {
      if (qrDatabase[id]) return qrDatabase[id];
      // Virtual entry if scanned but not indexed
      return {
        id,
        url: "",
        platform: "unknown",
        type: "unknown",
        scans: 0,
        label: "",
        createdAt: new Date().toISOString()
      };
    });

    return res.json(results);
  });

  // Dynamic Sitemap Route
  app.get("/sitemap.xml", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = `${protocol}://${req.get("host")}`;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${host}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${host}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${host}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${host}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.status(200).send(sitemap);
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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Qrytube Server] running on http://localhost:${PORT}`);
  });
}

startServer();
