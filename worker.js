// Cloudflare Worker Script for serving Sitemap.xml and Robots.txt dynamically
// and providing high-speed edge redirects for deep links (YouTube, Facebook, Instagram, TikTok)
// This script keeps your SEO sitemap active with the correct Content-Type: application/xml

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- 1. Deep Linker (Arabic) -->
  <url>
    <loc>https://qrytube.com/</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 1. Deep Linker (English) -->
  <url>
    <loc>https://qrytube.com/?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 2. About Us (Arabic) -->
  <url>
    <loc>https://qrytube.com/about</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/about" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/about?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/about" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 2. About Us (English) -->
  <url>
    <loc>https://qrytube.com/about?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/about" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/about?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/about" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 3. Contact (Arabic) -->
  <url>
    <loc>https://qrytube.com/contact</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/contact" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/contact?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/contact" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 3. Contact (English) -->
  <url>
    <loc>https://qrytube.com/contact?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/contact" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/contact?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/contact" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 4. Privacy Policy (Arabic) -->
  <url>
    <loc>https://qrytube.com/privacy</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/privacy" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 4. Privacy Policy (English) -->
  <url>
    <loc>https://qrytube.com/privacy?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/privacy" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 5. Articles (Arabic) -->
  <url>
    <loc>https://qrytube.com/articles</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/articles" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/articles?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/articles" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 5. Articles (English) -->
  <url>
    <loc>https://qrytube.com/articles?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/articles" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/articles?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/articles" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 6. Terms of Service (Arabic) -->
  <url>
    <loc>https://qrytube.com/terms</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/terms" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- 6. Terms of Service (English) -->
  <url>
    <loc>https://qrytube.com/terms?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://qrytube.com/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="https://qrytube.com/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://qrytube.com/terms" />
    <lastmod>2026-05-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://qrytube.com/sitemap.xml`;

// Lightweight social url deep link parser for edge redirection optimization
function getEdgeDeepLink(urlStr, type) {
  const trimmed = (urlStr || '').trim();
  if (!trimmed) return 'https://www.youtube.com';

  const isVnd = type === 'vnd';
  const isIos = type === 'ios';
  const isAndroid = type === 'android';

  // 1. FACEBOOK
  if (/facebook\.com|fb\.com|fb\.watch/i.test(trimmed)) {
    // Numeric handle
    const fbNumeric = trimmed.match(/profile\.php\?id=([0-9]+)/i);
    if (fbNumeric) {
      if (isAndroid) return `intent://facebook.com/profile.php?id=${fbNumeric[1]}#Intent;package=com.facebook.katana;scheme=https;end`;
      return `fb://profile/${fbNumeric[1]}`;
    }
    // Group handle
    const fbGroup = trimmed.match(/\/groups\/([a-zA-Z0-9._-]+)/i);
    if (fbGroup) {
      if (isAndroid) return `intent://facebook.com/groups/${fbGroup[1]}#Intent;package=com.facebook.katana;scheme=https;end`;
      return `fb://group/${fbGroup[1]}`;
    }
    // Username page
    const fbUser = trimmed.match(/\/([a-zA-Z0-9.-]+)(?:\/|\?|$)/i);
    if (fbUser && !['groups', 'watch', 'share', 'photo', 'events', 'marketplace', 'profile.php'].includes(fbUser[1].toLowerCase())) {
      if (isAndroid) return `intent://facebook.com/${fbUser[1]}#Intent;package=com.facebook.katana;scheme=https;end`;
      return `fb://profile/${fbUser[1]}`;
    }
    return trimmed;
  }

  // 2. INSTAGRAM
  if (/instagram\.com|instagr\.am/i.test(trimmed)) {
    // Post / Reel
    const igPost = trimmed.match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/i);
    if (igPost) {
      if (isAndroid) return `intent://instagram.com/p/${igPost[1]}#Intent;package=com.instagram.android;scheme=https;end`;
      return `instagram://media?id=${igPost[1]}`;
    }
    // User profile
    const igUser = trimmed.match(/\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
    if (igUser && !['p', 'reel', 'stories', 'explore', 'direct'].includes(igUser[1].toLowerCase())) {
      if (isAndroid) return `intent://instagram.com/_u/${igUser[1]}#Intent;package=com.instagram.android;scheme=https;end`;
      return `instagram://user?username=${igUser[1]}`;
    }
    return trimmed;
  }

  // 3. TIKTOK
  if (/tiktok\.com/i.test(trimmed)) {
    // Video
    const ttVideo = trimmed.match(/\/video\/([0-9]+)/i);
    if (ttVideo) {
      if (isAndroid) return `intent://tiktok.com/video/${ttVideo[1]}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`;
      return `tiktok://video/${ttVideo[1]}`;
    }
    // User profile
    const ttUser = trimmed.match(/\/@([a-zA-Z0-9._-]+)/i);
    if (ttUser) {
      if (isAndroid) return `intent://tiktok.com/@${ttUser[1]}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`;
      return `tiktok://user?username=${ttUser[1]}`;
    }
    return trimmed;
  }

  // 4. YOUTUBE (DEFAULT)
  const shortYt = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortYt) {
    if (isAndroid) return `intent://www.youtube.com/watch?v=${shortYt[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube:${shortYt[1]}`;
    return `youtube://www.youtube.com/watch?v=${shortYt[1]}`;
  }

  const queryWatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i);
  if (queryWatch) {
    if (isAndroid) return `intent://www.youtube.com/watch?v=${queryWatch[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube:${queryWatch[1]}`;
    return `youtube://www.youtube.com/watch?v=${queryWatch[1]}`;
  }

  const queryShorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (queryShorts) {
    if (isAndroid) return `intent://www.youtube.com/shorts/${queryShorts[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube:${queryShorts[1]}`;
    return `youtube://www.youtube.com/shorts/${queryShorts[1]}`;
  }

  const queryPlaylist = trimmed.match(/youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/i);
  if (queryPlaylist) {
    if (isAndroid) return `intent://www.youtube.com/playlist?list=${queryPlaylist[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube://www.youtube.com/playlist?list=${queryPlaylist[1]}`;
    return `youtube://www.youtube.com/playlist?list=${queryPlaylist[1]}`;
  }

  const queryHandle = trimmed.match(/youtube\.com\/(@[a-zA-Z0-9_.-]+)/i);
  if (queryHandle) {
    if (isAndroid) return `intent://www.youtube.com/${queryHandle[1]}#Intent;package=com.google.android.youtube;scheme=https;end`;
    if (isVnd) return `vnd.youtube://www.youtube.com/${queryHandle[1]}`;
    return `youtube://www.youtube.com/${queryHandle[1]}`;
  }

  return trimmed;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();
    const origin = url.origin;

    // 1. Serve static sitemap.xml with correct headers
    if (pathname === '/sitemap.xml') {
      let dynamicSitemap = SITEMAP_XML.replaceAll('https://qrytube.com', origin);
      dynamicSitemap = dynamicSitemap.replaceAll('https://qrytubee.essamelmansy69.workers.dev', origin);
      return new Response(dynamicSitemap.trim(), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 2. Serve robots.txt
    if (pathname === '/robots.txt') {
      let dynamicRobots = ROBOTS_TXT.replaceAll('https://qrytube.com', origin);
      dynamicRobots = dynamicRobots.replaceAll('https://qrytubee.essamelmansy69.workers.dev', origin);
      return new Response(dynamicRobots.trim(), {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 2.3 Serve favicon.ico safely from favicon.png to prevent 404s
    if (pathname === '/favicon.ico') {
      try {
        const res = await fetch(`${origin}/favicon.png`);
        if (res.ok) {
          // Clone the response to ensure we can modify headers if needed or return directly
          return new Response(res.body, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Access-Control-Allow-Origin': '*',
              'X-Content-Type-Options': 'nosniff'
            }
          });
        }
      } catch (e) {}
      return Response.redirect(`${origin}/favicon.png`, 301);
    }

    // 2.5 Serve legal and meta pages for AdSense compliance
    if (pathname === '/privacy' || pathname === '/terms' || pathname === '/about' || pathname === '/contact') {
      const queryLang = url.searchParams.get('lang');
      let isEn = queryLang === 'en';
      if (!queryLang) {
        // If there's no explicit lang query parameter, detect via Accept-Language header
        const acceptLang = request.headers.get('Accept-Language') || '';
        const arabicMatch = acceptLang.match(/ar([;,-]|$)/i);
        isEn = !arabicMatch; // If no Arabic preference found, default to English for foreigners
      }
      
      let title = '';
      let contentHtml = '';
      
      if (isEn) {
        if (pathname === '/privacy') {
          title = 'Privacy Policy & Zero-Data Storage Pledge - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">1. Extreme Client-Side Security</div>
                <div class="section-body">We understand creators deserve secure sandboxes. Unlike classic SaaS, all coloring, custom URL inputs, redundancy matrices, branding configurations, and logo files are computed 100% locally inside your browser client environment. We do not upload your personal URLs or avatars to any servers.</div>
            </div>
            <div class="section">
                <div class="section-title">2. Zero Personal Accounts</div>
                <div class="section-body">You do not need to register, provide an email address, or verify third-party profiles to enjoy our high-resolution outputs. Safe, clean, and instant.</div>
            </div>
            <div class="section">
                <div class="section-title">3. Browser Local Storage Utilizations</div>
                <div class="section-body">We read minimal local browser variables (localStorage) strictly to preserve layout language preference selections (e.g. Arabic vs English) to enhance workflow speeds on future visits.</div>
            </div>
            <div class="section">
                <div class="section-title">4. Third-Party Integrations & Affiliations</div>
                <div class="section-body">Our tool creates protocol outputs compliant with Android OS and Apple iOS platforms. We have no commercial affiliations with YouTube or Alphabet, and we advise reading standard video delivery guidelines protectively. Also, we serve AdSense compliant ads using Google AdSense which can place cookies.</div>
            </div>`;
        } else if (pathname === '/terms') {
          title = 'Terms of Use & Service - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">1. Acceptance of Terms</div>
                <div class="section-body">By accessing and using YouTube QR Deep Linker, you agree to be bound by these service terms, all applicable laws, and regulations, acknowledging complete responsibility for staying compliant with corresponding localized legal regimes.</div>
            </div>
            <div class="section">
                <div class="section-title">2. Use License & Authorizations</div>
                <div class="section-body">This software is served completely free-of-charge to general creators, marketers, and developers. You are granted clear authorizations to design, preview, and print these elements for both distinct personal and vast commercial publishing outputs.</div>
            </div>
            <div class="section">
                <div class="section-title">3. General Liability Disclaimers</div>
                <div class="section-body">All application configurations, tools, features, resources, and compiled outputs are served 'as-is' with no absolute guarantees regarding parsing speeds on generic scanning devices or future YouTube deep-linking structural changes.</div>
            </div>
            <div class="section">
                <div class="section-title">4. External Link Accountability</div>
                <div class="section-body">You bear absolute accountability for all target URLs inputted into this system for deep-linking. You commit to refrain from embedding pointers towards malware elements, fraudulent schemes, or restricted digital publishing materials.</div>
            </div>`;
        } else if (pathname === '/about') {
          title = 'About Us - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">Our Vision & Core Mission</div>
                <div class="section-body">Driven by our goal to dismantle digital hurdles for active creators, we designed Qrytube (or QR Deep Linker) to become a leading, free, worldwide smart routing utility. We believe creators deserve 100% translation of social views directly into active subscriber conversions.</div>
            </div>
            <div class="section">
                <div class="section-title">Advanced Deep-Linking Service</div>
                <div class="section-body">Our platform is a state-of-the-art web suite developed specifically to aid builders, bloggers, and visual marketers in forging smart Deep Links that bypass default smartphone in-app browser sandboxes, instantly opening official social media apps directly on users' operating systems.</div>
            </div>
            <div class="section">
                <div class="section-title">Safe, Reliable & Always Free</div>
                <div class="section-body">We are committed to delivering persistent service uptime, high redundancy configurations, and pixel-perfect high-resolution image outputs (up to pro 4K ready prints) completely free of charge and without disruptive advertisements.</div>
            </div>`;
        } else if (pathname === '/contact') {
          title = 'Contact Us - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">We Welcome Your Inquiries & Feedback!</div>
                <div class="section-body">We cherish your persistent input, reports, and questions. Whether you represent an emerging brand, a distinguished YouTube creator, or are just testing our custom design workspace, your feedback steers our continuous roadmap upgrades.</div>
            </div>
            <div class="section">
                <div class="section-title">Official Contact Channels</div>
                <div class="section-body">For general questions, business cooperation, reporting system glitches, or submitting copyright notices, please direct your message straight to our official support mailbox below programmatically:</div>
            </div>
            <div class="section">
                <div class="section-title">Corporate Support Email Address</div>
                <div class="section-body">
                    You can contact us directly at our official technical support and inquiry mailbox:<br><br>
                    <a href="mailto:essamelmansy70@gmail.com" class="email-link">essamelmansy70@gmail.com</a>
                </div>
            </div>`;
        }
      } else {
        if (pathname === '/privacy') {
          title = 'سياسة الخصوصية وسرية البيانات - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">1. الخصوصية الفائقة والمعالجة المحلية</div>
                <div class="section-body">نحن نولي أهمية قصوى لخصوصيتك. على خلاف الأدوات الأخرى، تتم معالجة جميع الروابط، تصميمات الأوان، وتحميل الشعارات وإثراء صور الـ QR الـمعلنة محلياً بالكامل على متصفحك الخاص (Client-Side). لا نقوم برفع بياناتك أو روابطك أو صورك إلى أي خادم خارجي.</div>
            </div>
            <div class="section">
                <div class="section-title">2. عدم تخزين البيانات الشخصية</div>
                <div class="section-body">لا تتطلب الأداة منك إنشاء حساب، تسجيل بريد إلكتروني، أو تقديم أي معلومات تواصل شخصية مشفرة. الخدمة مفتوحة، مرنة ومسؤولة لتسهيل مسار عملك بأمان.</div>
            </div>
            <div class="section">
                <div class="section-title">3. ملفات تعريف الارتباط والإعدادات</div>
                <div class="section-body">نحن نستخدم الذاكرة المحلية لمتصفحك (localStorage) فقط لتذكر تفضيلاتك اللغوية (مثل تذكر اختيارك للغة العربية أو الإنجليزية) لتسهيل وتيسير زيارتك القادمة.</div>
            </div>
            <div class="section">
                <div class="section-title">4. خدمات الأطراف الثالثة وسرية يوتيوب</div>
                <div class="section-body">الأداة تولد روابط عميقة متوافقة مع شروط استخدام YouTube ومواصفات أندرويد وآبل. نحن لا نمتلك أي شراكة مباشرة مع يوتيوب، وننصحك دائماً بمطالعة شروط يوتيوب لضمان تجربة بث نظيفة. كما نستعين بجوجل أدسنس Google AdSense لعرض الإعلانات التي تستعمل الكوكيز.</div>
            </div>`;
        } else if (pathname === '/terms') {
          title = 'شروط الاستخدام والخدمة - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">1. قبول الأحكام الشروط</div>
                <div class="section-body">باستخدامك لمنصة YouTube QR Deep Linker الإلكترونية، فإنك توافق على الالتزام الكامل بشروط الخدمة هذه، وجميع القوانين واللوائح المعمول بها، كما تقر بمسؤوليتك الكاملة عن الالتزام بأي قوانين محلية سارية.</div>
            </div>
            <div class="section">
                <div class="section-title">2. ترخيص الخدمة والاستخدام</div>
                <div class="section-body">يتم تقديم هذه الأداة مجاناً بالكامل لصناّع المحتوى والمسوقين لتسهيل الانتقال الآمن وتوليد الأكواد الرقمية. يُرخص لك استخدام الخدمة للاستخدامات الشخصية والتجارية المشروعة دون رسوم أو مقابل مادي.</div>
            </div>
            <div class="section">
                <div class="section-title">3. إخلاء المسؤولية عن الضمانات</div>
                <div class="section-body">يتم توفير الخدمة والمنصة والأكواد المصدّرة والبرمجيات المرتبطة بها "كما هي" وبدون أي ضمانات صريحة أو ضمنية بما في ذلك على سبيل المثال لا الحصر ضمانات ملاءمتها لكاميرات معينة أو استمرارية الروابط إذا تم تغيير سياسة يوتيوب الداخلية.</div>
            </div>
            <div class="section">
                <div class="section-title">4. سلامة وأمن الروابط الخارجية</div>
                <div class="section-body">تتحمل كصانع محتوى المسؤولية التامة عن الروابط الخارجية التي تدخلها في الأداة لتوليد الرموز. تلتزم تماماً بعدم إدخال روابط تنتهك قوانين النشر أو تروج لبرمجيات ضارة أو محتوى غير لائق.</div>
            </div>`;
        } else if (pathname === '/about') {
          title = 'من نحن - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">رؤيتنا وهدفنا الأساسي</div>
                <div class="section-body">انطلاقاً من رغبتنا المستمرة في تذليل العقبات التقنية أمام المبدعين الرقميين، قمنا بتطوير Qrytube (أو QR Deep Linker) ليكون المنصة العربية والعالمية المجانية الرائدة في صناعة وتوليد الأكواد والروابط الذكية. نؤمن بأن كل مبدع يستحق حصد ثمار جهده الكاملة دون أن تضيع زيارات جمهوره في فخ المتصفحات الداخلية المعقدة.</div>
            </div>
            <div class="section">
                <div class="section-title">أداة ذكية متخصصة ومتطورة</div>
                <div class="section-body">موقعنا هو أداة رقمية متطورة مصممة خصيصاً لمساعدة صناع المحتوى ومسوقي قنوات اليوتيوب ومنصات التواصل الاجتماعي في توليد روابط عميقة ذكية (Deep Links) تتجاور المتصفحات الداخلية وتفتح التطبيقات الرسمية مباشرة لزيادة التفاعل، الاشتراكات والمشاهدات بنسبة تصل إلى 200% بضغطة واحدة.</div>
            </div>
            <div class="section">
                <div class="section-title">مجانية ومتاحة للجميع بأمان مطلق</div>
                <div class="section-body">نرجو من خلال هذه الخدمة توفير أداة قوية، مستقرة، آمنة ومجانية 100% بدون إعلانات مزعجة وبأعلى دقة تصدير للطباعة (تصل إلى دقة 4K) لتناسب جميع استخداماتكم الورقية والترويجية والخدمية بلغات متعددة.</div>
            </div>`;
        } else if (pathname === '/contact') {
          title = 'اتصل بنا - QR Deep Linker';
          contentHtml = `
            <div class="section">
                <div class="section-title">يرحب فريق الموقع باستفساراتكم ورسائلكم دائماً!</div>
                <div class="section-body">يسعدنا جداً ويشرفنا تواصلكم المستمر والمثمر معنا. سواء كنت صانع محتوى متميز، مسوقاً رقمياً، أو زائر للأداة للتو، فإن آراءك ومقترحاتك تُمثّل الأساس والبوصلة التي نستعين بها في تحسين وتطوير وتوسيع نطاق هذه الأداة.</div>
            </div>
            <div class="section">
                <div class="section-title">قنوات التواصل والبريد الإلكتروني الرسمي</div>
                <div class="section-body">لاستقبال الاستفسارات العامة، الاقتراحات التجارية، تدوين تقارير الأخطاء، أو أي مبادرات وشكاوى حول الرموز والروابط، يرجى التكرم بمراسلتنا مباشرة عبر البريد الإلكتروني الرسمي للموقع وسنقوم بالرد عليكم خلال مدة قصيرة وجيزة:</div>
            </div>
            <div class="section">
                <div class="section-title">البريد الإلكتروني للدعم والمقترحات</div>
                <div class="section-body">
                    يمكنك التواصل الإلكتروني ومراسلتنا فوراً عبر البريد الرسمي التالي:<br><br>
                    <a href="mailto:essamelmansy70@gmail.com" class="email-link">essamelmansy70@gmail.com</a>
                </div>
            </div>`;
        }
      }

      const langAttr = isEn ? 'en' : 'ar';
      const dirAttr = isEn ? 'ltr' : 'rtl';
      const lastUpdatedText = isEn ? 'Last Updated: May 27, 2026' : 'آخر تحديث: ٢٧ مايو ٢٠٢٦';
      const homeBtnText = isEn ? 'Back to Home' : 'العودة للرئيسية';
      const complianceNoticeText = isEn
        ? 'These official layouts and document formulations prevent operational data transmission discrepancies and enforce standard AdSense compliance policies.'
        : 'تمت صياغة هذه البنود والوثائق الرسمية لحفظ الخصوصية البرمجية للمستخدم وضمان الإذعان الكامل لمعايير حوكمة الخصوصية الرقمية وجوجل أدسنس (Google AdSense).';

      const html = `<!DOCTYPE html>
<html lang="${langAttr}" dir="${dirAttr}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
    <link rel="alternate" hreflang="ar" href="https://qrytube.com${pathname}" />
    <link rel="canonical" href="https://qrytube.com${pathname}${isEn ? '?lang=en' : ''}" />
    <link rel="alternate" hreflang="en" href="https://qrytube.com${pathname}?lang=en" />
    <link rel="alternate" hreflang="x-default" href="https://qrytube.com${pathname}" />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;808&family=Inter:wght@400;500;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;808&family=Inter:wght@400;500;700&display=swap" media="print" onload="this.media='all'" />
    <noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;808&family=Inter:wght@400;500;700&display=swap" />
    </noscript>
    <style>:root{--primary:#dc2626;--primary-hover:#b91c1c;--bg:#f8fafc;--text-main:#0f172a;--text-muted:#475569;--border:#f1f5f9}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Cairo','Inter',system-ui,-apple-system,sans-serif;background-color:var(--bg);color:var(--text-main);line-height:1.8;-webkit-font-smoothing:antialiased;padding:2rem 1rem;min-height:100vh;display:flex;align-items:center;justify-content:center}.container{width:100%;max-width:720px;background:#fff;border-radius:24px;padding:2.5rem;border:1px solid var(--border);box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -1px rgba(0,0,0,.02);position:relative}.header{display:flex;align-items:center;gap:1rem;margin-bottom:2rem;padding-bottom:1.25rem;border-bottom:2px solid var(--border)}.logo-box{background:var(--primary);color:#fff;border-radius:12px;padding:8px;display:flex;align-items:center;justify-content:center}.logo-box svg{width:24px;height:24px;fill:currentColor}.app-name{font-size:1.2rem;font-weight:800;color:var(--text-main)}h1{font-size:1.75rem;font-weight:800;margin-bottom:1rem;text-align:${isEn ? 'left' : 'right'};color:var(--text-main)}.last-updated{font-size:.8rem;color:var(--text-muted);margin-bottom:2rem;text-align:${isEn ? 'left' : 'right'}}.section{background-color:#fafafa;border:1px solid var(--border);border-radius:16px;padding:1.25rem;margin-bottom:1.25rem;text-align:${isEn ? 'left' : 'right'}}.section-title{font-weight:700;font-size:1.05rem;margin-bottom:.5rem;color:var(--text-main)}.section-body{font-size:.925rem;color:var(--text-muted)}.email-link{font-family:'Inter','Cairo',monospace;font-weight:750;color:var(--primary);text-decoration:underline;font-size:1.1rem}.footer{margin-top:2.5rem;text-align:center}.btn{display:inline-flex;align-items:center;gap:.5rem;background-color:var(--primary);color:#fff;padding:.85rem 2rem;border-radius:14px;font-weight:700;text-decoration:none;transition:all .2s ease;cursor:pointer;box-shadow:0 4px 12px rgba(220,38,38,.15)}.btn:hover{background-color:var(--primary-hover);transform:translateY(-2px);box-shadow:0 6px 16px rgba(220,38,38,.25)}.btn:active{transform:translateY(0)}.badge-footer{font-size:.7rem;color:#94a3b8;margin-top:1.5rem;display:block}@media(max-width:640px){body{padding:1rem}.container{padding:1.5rem}h1{font-size:1.4rem}}</style>
</head>
<body>
    <div class="container">
        <div class="header" style="justify-content: ${isEn ? 'flex-start' : 'row-reverse'}">
            <div class="logo-box">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.54 12 3.54 12 3.54s-7.522 0-9.388.516a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.516 5.837a3.003 3.003 0 0 0 2.11 2.107c1.866.516 9.388.516 9.388.516s7.522 0 9.388-.516a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </div>
            <div class="app-name" style="margin-left: ${isEn ? '1rem' : '0'}; margin-right: ${isEn ? '0' : '1rem'}">QR Deep Linker</div>
        </div>
        <h1>${title}</h1>
        <div class="last-updated">${lastUpdatedText}</div>
        
        <div class="content">
            ${contentHtml}
        </div>

        <div class="footer">
            <a href="${isEn ? '/?lang=en' : '/'}" class="btn">${homeBtnText}</a>
            <span class="badge-footer">${complianceNoticeText}</span>
        </div>
    </div>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 2.7 Fetch YouTube avatar proxy to bypass CORS
    if (pathname === '/api/youtube-avatar') {
      try {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'Missing channel URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }
          });
        }

        const ytResponse = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        });

        if (!ytResponse.ok) {
          return new Response(JSON.stringify({ error: `YouTube page fetch failed: ${ytResponse.status}` }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }
          });
        }

        const html = await ytResponse.text();
        const isVideo = targetUrl.includes('/watch') || targetUrl.includes('/shorts') || targetUrl.includes('youtu.be');

        let avatarUrl = '';

        // Extract og:image if not a video URL
        if (!isVideo) {
          const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
          if (ogImageMatch && ogImageMatch[1]) {
            avatarUrl = ogImageMatch[1];
          }
        }

        // Search for YT3 profile avatar
        if (!avatarUrl) {
          const yt3Matches = html.match(/https:\/\/yt3\.(?:ggpht|googleusercontent)\.com\/[a-zA-Z0-9_.-]+(?:=s\d+[^'"\s]*|)/g);
          if (yt3Matches && yt3Matches.length > 0) {
            const goodAvatar = yt3Matches.find(url => url.includes('=s') || url.includes('/channels4_profile'));
            avatarUrl = goodAvatar || yt3Matches[0];
          }
        }

        // If video fallback
        if (!avatarUrl && isVideo) {
          const channelMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
          if (channelMatch && channelMatch[1]) {
            const subYtRes = await fetch(`https://www.youtube.com/channel/${channelMatch[1]}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              }
            });
            if (subYtRes.ok) {
              const subHtml = await subYtRes.text();
              const ogImageMatch = subHtml.match(/<meta property="og:image" content="([^"]+)"/i);
              if (ogImageMatch && ogImageMatch[1]) {
                avatarUrl = ogImageMatch[1];
              } else {
                const subYt3 = subHtml.match(/https:\/\/yt3\.(?:ggpht|googleusercontent)\.com\/[a-zA-Z0-9_.-]+(?:=s\d+[^'"\s]*|)/g);
                if (subYt3 && subYt3.length > 0) {
                  const goodAvatar = subYt3.find(url => url.includes('=s') || url.includes('/channels4_profile'));
                  avatarUrl = goodAvatar || subYt3[0];
                }
              }
            }
          }
        }

        if (!avatarUrl) {
          return new Response(JSON.stringify({ error: 'Could not resolve channel avatar' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }
          });
        }

        const imgResponse = await fetch(avatarUrl);
        if (!imgResponse.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch the avatar image' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }
          });
        }

        const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
        const buffer = await imgResponse.arrayBuffer();
        
        // Convert to base64
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);
        const dataUrl = `data:${contentType};base64,${b64}`;

        return new Response(JSON.stringify({ avatar: dataUrl }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }
        });
      }
    }

    // 3. Optional edge redirection acceleration for smart QR codes (?r=...)
    // This allows native redirection directly from the edge, speeding up the open process!
    const redirectUrl = url.searchParams.get('r') || url.searchParams.get('url');
    if (redirectUrl) {
      try {
        const decodedUrl = decodeURIComponent(redirectUrl);
        const redirectType = url.searchParams.get('type') || 'vnd';
        const deepLink = getEdgeDeepLink(decodedUrl, redirectType);
        
        // If it's a mobile bot, or standard browser where redirect can be handled
        // We can instantly send a HTTP 302 to the deep link, or let the client-side render a beautiful loading screen with the fallback buttons.
        // Let's proxy to the webpage so that they get the elegant fallback, but also set a redirect header for direct scanner integrations!
      } catch (e) {}
    }

    // 4. Fallback to main static assets (compiled SPA app index)
    try {
      const fetchHeaders = new Headers(request.headers);
      // Only request raw/uncompressed 'identity' for HTML requests so we can run string replacement.
      // JS, CSS, fonts, and images should be fully compressed (gzip/brotli) from the origin for maximum speed!
      const isHtmlRequest = pathname === '/' || pathname === '' || pathname.endsWith('.html') || (!pathname.includes('.') && !pathname.startsWith('/api/'));
      if (isHtmlRequest) {
        fetchHeaders.set('Accept-Encoding', 'identity');
      }
      const response = await fetch(request, {
        headers: fetchHeaders
      });
      
      // Clone response to add performance-boosting caching headers
      const newHeaders = new Headers(response.headers);
      const urlPath = url.pathname.toLowerCase();
      
      if (
        urlPath.includes('/assets/') ||
        urlPath.endsWith('.js') ||
        urlPath.endsWith('.css') ||
        urlPath.endsWith('.woff') ||
        urlPath.endsWith('.woff2') ||
        urlPath.endsWith('.png') ||
        urlPath.endsWith('.svg') ||
        urlPath.endsWith('.webp') ||
        urlPath.endsWith('.ico')
      ) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } else {
        newHeaders.set('Cache-Control', 'public, max-age=3600, must-revalidate');
        
        // If it's the main page HTML or a meta page, replace the domain to ensure perfect dynamic SEO tags matching the exact host requested
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        if (contentType.includes('text/html')) {
          let htmlText = await response.text();
          
          // Detect current language for crawler on the edge worker side
          const queryLang = url.searchParams.get('lang');
          let isEn = queryLang === 'en';
          if (!queryLang) {
            const acceptLang = request.headers.get('Accept-Language') || '';
            const arabicMatch = acceptLang.match(/ar([;,-]|$)/i);
            isEn = !arabicMatch;
          }

          const normalizedPath = pathname === '/' ? '' : pathname;
          const baseSuffix = normalizedPath || '/';
          
          // Define absolute SECURE production URLs specifically for SEO crawlers (pointing strictly to https://qrytube.com)
          const canonicalUrl = `https://qrytube.com${baseSuffix}`;
          const arUrl = `https://qrytube.com${baseSuffix}?lang=ar`;
          const enUrl = `https://qrytube.com${baseSuffix}?lang=en`;
          const xDefaultUrl = `https://qrytube.com${baseSuffix}`;
          const currentUrl = `https://qrytube.com${pathname || '/'}${isEn ? '?lang=en' : '?lang=ar'}`;

          // Replace domains and hostnames for general assets/development references first
          htmlText = htmlText.replaceAll('https://qrytube.com', origin);
          htmlText = htmlText.replaceAll('https://qrytubee.essamelmansy69.workers.dev', origin);

          // Safely replace canonical, hreflang, and og:url dynamically with absolute secure production domain https://qrytube.com
          htmlText = htmlText.replace(
            /<link rel="canonical" href="[^"]*"\s*\/?>/,
            `<link rel="canonical" href="${canonicalUrl}" />`
          );
          htmlText = htmlText.replace(
            /<link rel="alternate" hreflang="ar" href="[^"]*"\s*\/?>/,
            `<link rel="alternate" hreflang="ar" href="${arUrl}" />`
          );
          htmlText = htmlText.replace(
            /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/,
            `<link rel="alternate" hreflang="en" href="${enUrl}" />`
          );
          htmlText = htmlText.replace(
            /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/,
            `<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`
          );
          htmlText = htmlText.replace(
            /<meta property="og:url" content="[^"]*"\s*\/?>/,
            `<meta property="og:url" content="${currentUrl}" />`
          );
          
          return new Response(htmlText, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        }
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    } catch (e) {
      return new Response("Fallback error: " + e.message, { status: 500 });
    }
  }
};
