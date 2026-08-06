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

    const encodedSheet = encodeURIComponent("دليل صنايعية مصر");
    const urls = [
      `https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`,
      `https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/export?format=csv&sheet=${encodedSheet}`,
      "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv"
    ];

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
          // Verify valid CSV with expected columns and no HTML/JS code
          if (csvData && !csvData.trim().startsWith('<!') && !csvData.trim().startsWith('<html') && !csvData.includes('function(') && !csvData.includes('this.g')) {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            return res.send(csvData);
          }
        }
      } catch (e: any) {
        console.warn(`Attempt to fetch ${url} failed:`, e?.message || e);
      }
    }

    // Default sample CSV if Google Sheet proxy is unreachable
    const defaultHandymenCsv = `طابع زمني,اسم الصنايعى,التخصص,رقم الهاتف,رقم الواتساب,المناطق المخدومة,رابط الصورة,الـ Status
2026-08-01 10:00:00,أحمد محمود العبد,سباك,01012345678,01012345678,"المطرية، عين شمس، حلمية الزيتون",,Approved
2026-08-02 11:30:00,محمد مصطفى - فني تكييفات,فني تكييف,01198765432,01198765432,"مدينة نصر، التجمع الخامس، مصر الجديدة",,Approved
2026-08-03 09:15:00,محمود كهربا (كهربائي منازل),كهربائي,01234567890,01234567890,"شبرا، شبرا الخيمة، وسط البلد",,Approved
2026-08-04 15:00:00,إبراهيم النجار,نجار,01512345678,01512345678,"المعادي، المقطم، حلوان",,Approved`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    return res.send(defaultHandymenCsv);
  });

  // Proxy endpoint to fetch reviews CSV from Google Sheets ("reviews" tab)
  app.get("/api/reviews-csv", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const urls = [
      "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/export?format=csv&sheet=reviews",
      "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/gviz/tq?tqx=out:csv&sheet=reviews",
      "https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/export?format=csv&sheet=التقييمات"
    ];

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
          if (csvData && !csvData.trim().startsWith('<!') && !csvData.trim().startsWith('<html') && !csvData.includes('function(') && !csvData.includes('this.g')) {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            return res.send(csvData);
          }
        }
      } catch (e: any) {
        console.warn(`Attempt to fetch review URL ${url} failed:`, e?.message || e);
      }
    }

    // Sample reviews matching exact Arabic column names
    const defaultReviewsCsv = `طابع زمني,اسم الصنايعى,اسمك الكريم,تقييمك للصنايعي,رأيك أو تعليقك,الـ Status
2026-08-02 14:20:00,أحمد محمود العبد,أبو كريم - المطرية,5,"صنايعي ممتاز جداً وفاهم شغله، غير مواسير السباكة وضبط الضغط بدون تكسير ونظيف جداً في المكان.",Approved
2026-08-03 18:45:00,أحمد محمود العبد,الأستاذ سامح,5,"وصل في الميعاد المضبوط وأسعاره ممتازة وراجل محترم وأمين. أنصح بالتعامل معاه جداً.",نشط
2026-08-03 10:15:00,محمد مصطفى - فني تكييفات,مهندس حسام,5,"عمل صيانة وشحن فريون للتكييف السبيليت والتبريد بقى ممتاز جداً زي الجديد بالضبط.",Approved
2026-08-04 12:00:00,محمد مصطفى - فني تكييفات,دكتورة منى,4.5,"فني شاطر وسريع، غسل الفلاتر والسربنتينة وأداني ضمان على الشحن.",نشط
2026-08-04 16:30:00,محمود كهربا (كهربائي منازل),الحاج إبراهيم,5,"حل مشكلة قفلة الكهرباء الرئيسية في الشقة وموزع الأحمال باحترافية وأمان تام.",Approved
2026-08-05 09:00:00,إبراهيم النجار,أم يوسف,5,"صلح الأبواب والمفصلات والكوالين في العمارة بسرعة ودقة فائقة.",Approved
2026-08-05 10:00:00,صنايعي غير معتمد,شخص ما,1,"سيء جداً",Rejected
2026-08-05 11:00:00,صنايعي آخر,تجربة,2,"مش كويس",قيد المراجعة`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    return res.send(defaultReviewsCsv);
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
    console.log(`[Handymen Directory Server] running on http://localhost:${PORT}`);
  });
}

startServer();
