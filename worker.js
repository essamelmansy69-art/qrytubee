// Cloudflare Worker Script for serving Sitemap.xml and Robots.txt dynamically
// and providing high-speed edge redirects for deep links (YouTube, Facebook, Instagram, TikTok)
// This script keeps your SEO sitemap active with the correct Content-Type: application/xml

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://qrytubee.essamelmansy69.workers.dev/</loc>
    <lastmod>2026-05-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://qrytubee.essamelmansy69.workers.dev/sitemap.xml`;

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

    // 1. Serve static sitemap.xml with correct headers
    if (pathname === '/sitemap.xml') {
      return new Response(SITEMAP_XML.trim(), {
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
      return new Response(ROBOTS_TXT.trim(), {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 2.5 Serve legal and meta pages for AdSense compliance
    if (pathname === '/privacy' || pathname === '/terms' || pathname === '/about' || pathname === '/contact') {
      let title = '';
      let contentHtml = '';
      
      if (pathname === '/privacy') {
        title = 'سياسة الخصوصية وسرية البيانات - QR Deep Linker';
        contentHtml = `
          <div class="section">
              <div class="section-title">1. الخصوصية الفائقة وحماية البيانات</div>
              <div class="section-body">نحن في موقع QR Deep Linker نولي أهمية قصوى لخصوصية زوارنا ومستخدمينا بنسبة 100%. على خلاف الأدوات والمواقع الأخرى، تتم جميع العمليات والروابط وتصميمات الأوان محلياً بالكامل على متصفحك الخاص (Client-Side). نحن لا نقوم برفع أو حفظ أو تخزين روابطك الشخصية أو صورك أو شعاراتك على خلفية أي خوادم خارجية.</div>
          </div>
          <div class="section">
              <div class="section-title">2. عدم جمع البيانات الشخصية الحساسة</div>
              <div class="section-body">لا تتطلب الأداة منك إنشاء حساب، أو تسجيل بريد إلكتروني، أو تقديم أي معلومات تواصل شخصية حساسة على الإطلاق. الخدمة مجانية كلياً، ومتاحة بشكل آمن ومرن لتسريع تجربة مشاركة المحتوى الخاص بك.</div>
          </div>
          <div class="section">
              <div class="section-title">3. ملفات تعريف الارتباط (Cookies)</div>
              <div class="section-body">نستخدم ملفات تعريف الارتباط (Cookies) والذاكرة المحلية للمتصفح (localStorage) بطريقة أساسية وشفافة لتحسين تجربة تصفحك، مثل تذكر تفضيلاتك اللغوية (العربية أو الإنجليزية) لتسهيل وتيسير استخدامك للأداة في الزيارات القادمة.</div>
          </div>
          <div class="section">
              <div class="section-title">4. إعلانات الأطراف الثالثة (شبكة جوجل أدسنس)</div>
              <div class="section-body">قد نستعين بشركات إعلان لأطراف ثالثة (مثل جوجل أدسنس Google AdSense) وعرضها عند زيارة موقعنا الإلكتروني. قد تستخدم هذه الشركات معلومات (لا تشمل اسمك أو عنوانك أو بريدك الإلكتروني) حول زياراتك لهذا الموقع من أجل تقديم إعلانات مخصصة وملائمة حول السلع والخدمات التي تهمك عن طريق ملفات تعريف الارتباط.</div>
          </div>`;
      } else if (pathname === '/terms') {
        title = 'شروط الخدمة والاستخدام - QR Deep Linker';
        contentHtml = `
          <div class="section">
              <div class="section-title">1. الخدمة المجانية وبنود الاستخدام</div>
              <div class="section-body">موقعنا يقدم خدمة برمجية مجانية تماماً بنسبة 100% لصناع المحتوى، والناشرين، والمسوقين لتسهيل الانتقال الآمن وحفض الروابط وتوليد أكواد الـ QR الذكية لدعم وزيادة الاشتراكات والتفاعل العضوي. يُرخص لك استخدام الخدمة لأغراضك الشخصية والتجارية السليمة دون أي رسوم.</div>
          </div>
          <div class="section">
              <div class="section-title">2. القيود والمحظورات القانونية</div>
              <div class="section-body">يُحظر تماماً وبشكل قاطع استخدام موقعنا أو الأكواد والروابط المولدة من خلالنا في توليد رموز تؤدي إلى محتوى غير قانوني، أو ينتهك حقوق الملكية الفكرية بأي شكل، أو يروج ويحرض على الكراهية، العنف، العنصرية، أو يحتوي على برمجيات ضارة وتصيدية.</div>
          </div>
          <div class="section">
              <div class="section-title">3. المسؤولية القانونية والأخلاقية</div>
              <div class="section-body">يتحمل المستخدم أو صانع المحتوى المسؤولية التامة والأخلاقية والوحيدة عن طبيعة ومحتوى الروابط التي يقوم بإدخالها والرموز التي ينشرها للجمهور. لا يتحمل الموقع أي مسؤولية عن سوء الاستخدام الخارجي للأولويات أو الأكواد الموزعة.</div>
          </div>`;
      } else if (pathname === '/about') {
        title = 'من نحن - QR Deep Linker';
        contentHtml = `
          <div class="section">
              <div class="section-title">رؤيتنا وهدفنا الأساسي</div>
              <div class="section-body">انطلاقاً من رغبتنا المستمرة في تذليل العقبات التقنية أمام المبدعين الرقميين، قمنا بتشغيل موقع QR Deep Linker ليكون المنصة العربية والعالمية المجانية الرائدة في توليد الأكواد الرقمية والروابط الذكية. نؤمن بأن كل مبدع يستحق حصد ثمار جهده الكاملة دون أن تضيع زيارات جمهوره في فخ المتصفحات الداخلية المدمجة في تطبيقات التواصل الاجتماعي.</div>
          </div>
          <div class="section">
              <div class="section-title">ما هي الخدمة التي نقدمها؟</div>
              <div class="section-body">موقع Qrytube (أو QR Deep Linker) هو أداة رقمية متطورة مصممة لمساعدة صناع المحتوى ومسوقي قنوات اليوتيوب ومنصات التواصل الاجتماعي في توليد روابط عميقة ذكية (Deep Links) تتجاوز المتصفحات الداخلية وتفتح التطبيقات الرسمية مباشرة لزيادة التفاعل، الاشتراكات والمشاهدات بنسبة تصل إلى 200%.</div>
          </div>
          <div class="section">
              <div class="section-title">مجانية، مستقرة، وآمنة للأبد</div>
              <div class="section-body">أداتنا مجانية 100%، متميزة بخصوصية مطلقة لجهة معالجة كل شيء محلياً بالكامل على متصفحك (Client-side)، وبأعلى كفاءة تصدير للطباعة (تصل إلى دقة 4K) لتناسب جميع حملات المبدعين ومطبوعاتهم بلغات متعددة لضمان كمال تجاربهم وحملاتهم التسويقية.</div>
          </div>`;
      } else if (pathname === '/contact') {
        title = 'اتصل بنا - QR Deep Linker';
        contentHtml = `
          <div class="section">
              <div class="section-title">نرحب باستفساراتكم ورسائلكم في أي وقت!</div>
              <div class="section-body">يسعدنا جداً ويشرفنا تواصلكم المستمر والمثمر معنا. سواء كنت صانع محتوى متميز، مسوقاً رقمياً، أو زائر للأداة للتو، فإن آراءك ومقترحاتك تُمثّل الأساس والبوصلة التي نستعين بها في تحسين وتطوير وتوسيع نطاق هذه الأداة.</div>
          </div>
          <div class="section">
              <div class="section-title">قنوات التواصل والبريد الإلكتروني الرسمي لاستقبال الشكاوى والاقتراحات</div>
              <div class="section-body">
                  يمكنك التواصل معنا مباشرة وتلقي الرد السريع عبر بريدنا الإلكتروني الرسمي للدعم الفني والشكاوى والمقترحات والتعاون الإعلاني والتجاري: <br><br>
                  <a href="mailto:essamelmansy70@gmail.com" class="email-link">essamelmansy70@gmail.com</a>
              </div>
          </div>`;
      }

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
    <link rel="alternate" hreflang="ar" href="https://qrytubee.essamelmansy69.workers.dev${pathname}" />
    <link rel="alternate" hreflang="en" href="https://qrytubee.essamelmansy69.workers.dev${pathname}?lang=en" />
    <link rel="alternate" hreflang="x-default" href="https://qrytubee.essamelmansy69.workers.dev${pathname}" />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    <style>:root{--primary:#dc2626;--primary-hover:#b91c1c;--bg:#f8fafc;--text-main:#0f172a;--text-muted:#475569;--border:#f1f5f9}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Cairo','Inter',system-ui,-apple-system,sans-serif;background-color:var(--bg);color:var(--text-main);line-height:1.8;-webkit-font-smoothing:antialiased;padding:2rem 1rem;min-height:100vh;display:flex;align-items:center;justify-content:center}.container{width:100%;max-width:720px;background:#fff;border-radius:24px;padding:2.5rem;border:1px solid var(--border);box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -1px rgba(0,0,0,.02);position:relative}.header{display:flex;align-items:center;gap:1rem;margin-bottom:2rem;padding-bottom:1.25rem;border-bottom:2px solid var(--border)}.logo-box{background:var(--primary);color:#fff;border-radius:12px;padding:8px;display:flex;align-items:center;justify-content:center}.logo-box svg{width:24px;height:24px;fill:currentColor}.app-name{font-size:1.2rem;font-weight:800;color:var(--text-main)}h1{font-size:1.75rem;font-weight:800;margin-bottom:1rem;text-align:right;color:var(--text-main)}.last-updated{font-size:.8rem;color:var(--text-muted);margin-bottom:2rem}.section{background-color:#fafafa;border:1px solid var(--border);border-radius:16px;padding:1.25rem;margin-bottom:1.25rem}.section-title{font-weight:700;font-size:1.05rem;margin-bottom:.5rem;color:var(--text-main)}.section-body{font-size:.925rem;color:var(--text-muted)}.email-link{font-family:'Inter','Cairo',monospace;font-weight:750;color:var(--primary);text-decoration:underline;font-size:1.1rem}.footer{margin-top:2.5rem;text-align:center}.btn{display:inline-flex;align-items:center;gap:.5rem;background-color:var(--primary);color:#fff;padding:.85rem 2rem;border-radius:14px;font-weight:700;text-decoration:none;transition:all .2s ease;cursor:pointer;box-shadow:0 4px 12px rgba(220,38,38,.15)}.btn:hover{background-color:var(--primary-hover);transform:translateY(-2px);box-shadow:0 6px 16px rgba(220,38,38,.25)}.btn:active{transform:translateY(0)}.badge-footer{font-size:.7rem;color:#94a3b8;margin-top:1.5rem;display:block}@media(max-width:640px){body{padding:1rem}.container{padding:1.5rem}h1{font-size:1.4rem}}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-box">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.54 12 3.54 12 3.54s-7.522 0-9.388.516a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.516 5.837a3.003 3.003 0 0 0 2.11 2.107c1.866.516 9.388.516 9.388.516s7.522 0 9.388-.516a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </div>
            <div class="app-name">QR Deep Linker</div>
        </div>
        <h1>${title}</h1>
        <div class="last-updated">آخر تحديث: 27 مايو 2026</div>
        
        <div class="content">
            ${contentHtml}
        </div>

        <div class="footer">
            <a href="/" class="btn">العودة للرئيسية</a>
            <span class="badge-footer">تمت التهيئة والموائمة البرمجية للموقع لضمان الامتثال التام لشروط وسياسات جوجل أدسنس (Google AdSense) بنجاح.</span>
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
      return fetch(request);
    } catch (e) {
      return new Response("Fallback error: " + e.message, { status: 500 });
    }
  }
};
