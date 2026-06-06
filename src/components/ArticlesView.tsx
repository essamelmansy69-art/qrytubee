import { useState, useEffect } from 'react';
import { articlesData, Article } from '../data/seoContent';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, Calendar, Clock, BookOpen, Share2 } from 'lucide-react';

interface ArticlesViewProps {
  lang: 'ar' | 'en';
  selectedArticleId: string | null;
  onSelectArticle: (id: string | null) => void;
}

export default function ArticlesView({ lang, selectedArticleId, onSelectArticle }: ArticlesViewProps) {
  const [copied, setCopied] = useState(false);
  const t = translations[lang];
  const articles = articlesData[lang];

  const selectedArticle = articles.find(a => a.id.toLowerCase() === selectedArticleId?.toLowerCase());

  // Dynamic SEO 2026 Schema JSON-LD injection
  useEffect(() => {
    if (!selectedArticle) {
      const existing = document.getElementById('seo-article-schema');
      if (existing) existing.remove();
      return;
    }

    const articleUrl = `${window.location.origin}/articles/${selectedArticle.id}`;
    const schemaMarkup: any = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "headline": selectedArticle.title,
      "description": selectedArticle.excerpt,
      "datePublished": selectedArticle.date,
      "dateModified": selectedArticle.date,
      "author": {
        "@type": "Organization",
        "name": "Qrytube",
        "url": window.location.origin
      },
      "publisher": {
        "@type": "Organization",
        "name": "Qrytube",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      }
    };

    if (selectedArticle.image) {
      schemaMarkup.image = [selectedArticle.image];
    }

    // Enhance structured schema markup specifically for our target 2026 Instagram Followers SEO article
    if (selectedArticle.id === 'instagram-followers-qr') {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "كيف يمكنني عمل كود QR لحساب انستقرام يفتح بالتطبيق مباشرة؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "يمكنك القيام بذلك عبر استخدام منصة Qrytube المجانية عن طريق لصق رابط حسابك التقليدي، ليتكفل الموقع بتحويل الرابط مباشرة إلى رابط ذكي عميق (Deep Link) وتوليد كود كيو أر متناسق وجاهز للتصميم والطباعة يفتح تطبيق انستجرام الرسمي فوراً."
            }
          },
          {
            "@type": "Question",
            "name": "لماذا لا تنجح أكواد الـ QR العادية في زيادة المتابعين على انستجرام؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "لأنها تفتح الحساب في متصفحات الطرف الثالث الداخلية للشبكات الاجتماعية، والتي تطلب من المستخدمين كتابة بريدهم وكلمات المرور الخاصة بهم للتفاعل ومتابعة الحساب، مما يتسبب في مغادرة 90% من الزوار بدون إجراء أي متابعة."
            }
          },
          {
            "@type": "Question",
            "name": "هل تدعم منصة Qrytube تحميل كود الـ QR بصيغ جاهزة للطباعة؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، تتيح لك المنصة تحميل الكود بصيغ ناقلية متطورة مثل SVG وجودة عالية وضوح PNG لضمان الحفاظ على الجمالية والوضوح دون أي فقدان بكسلي أثناء طباعته على اللافتات والمنتجات."
            }
          }
        ]
      };

      const schemaArray = [schemaMarkup, faqSchema];
      let script = document.getElementById('seo-article-schema') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-article-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schemaArray);
    } else if (selectedArticle.id === 'seo-2026-deep-link-trends') {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "كيف تؤثر الروابط العميقة على سيو موقعك وقناتك لعام 2026؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "تعمل الروابط العميقة على نقل الزوار فوراً وبسلاسة تامة إلى داخل التطبيقات الرسمية المثبتة على هواتفهم، مما يخفض معدل ارتداد الزوار من الصفحة ويزيد من وقت التفاعل ومعدل الاشتراكات بنسب قياسية مما يمنح خوارزميات جوجل دليلاً ومؤشراً إيجابياً للغاية على جودة وأهمية قناتك أو موقعك."
            }
          },
          {
            "@type": "Question",
            "name": "ما دور منصة Qrytube في تحسين أمان وجودة حملات QR الذكية؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "توفر منصة Qrytube حلاً محلياً فريداً من نوعه لتحويل الروابط التقليدية لروابط ذكية وتوليد كود QR لليوتيوب يضمن الانتقال الفوري بالهواتف بجانب حماية تامة من تتبع البيانات، ومع نقاء مخرجات SVG التي لا تفقد دقتها بالطباعة."
            }
          }
        ]
      };

      const schemaArray = [schemaMarkup, faqSchema];
      let script = document.getElementById('seo-article-schema') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-article-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schemaArray);
    } else {
      let script = document.getElementById('seo-article-schema') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-article-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schemaMarkup);
    }

    return () => {
      const existing = document.getElementById('seo-article-schema');
      if (existing) existing.remove();
    };
  }, [selectedArticle]);

  // Simple Markdown content renderer for articles to avoid external parser bugs
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold font-arabic text-slate-900 mt-8 mb-4 border-b pb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-lg font-bold font-arabic text-slate-800 mt-6 mb-3">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }

      if (trimmed.startsWith('- ')) {
        // Parse bold references in lists
        const listText = trimmed.replace('- ', '');
        return (
          <p key={idx} className="mr-5 ml-5 text-slate-600 font-arabic text-sm leading-relaxed mb-2 flex items-start gap-1.5">
            <span className="text-red-500 shrink-0">•</span>
            <span>{parseBoldText(listText)}</span>
          </p>
        );
      }

      if (trimmed.startsWith('```')) {
        if (trimmed === '```' || trimmed === '```json') return null; // hide wrapper block
        return (
          <pre key={idx} className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl overflow-x-auto my-4 border border-slate-800" dir="ltr">
            <code>{trimmed}</code>
          </pre>
        );
      }

      // Default paragraph, check for inline code block first
      if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
        return (
          <pre key={idx} className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl overflow-x-auto my-4 border border-slate-800" dir="ltr">
            <code>{trimmed.replace(/`/g, '')}</code>
          </pre>
        );
      }

      return (
        <p key={idx} className="text-sm sm:text-base text-slate-600 font-arabic leading-relaxed mb-4">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-950 bg-yellow-500/10 px-1 rounded">{part}</strong>;
      }
      return part;
    });
  };

  if (selectedArticle) {
    return (
      <div className={`bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm max-w-4xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} animate-fadeIn`} id="active_article_reader">
        
        {/* Navigation bar to return */}
        <button
          onClick={() => onSelectArticle(null)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 transition-colors mb-6 cursor-pointer"
          type="button"
          id="back_to_blog_btn"
        >
          {lang === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{t.backToArticles}</span>
        </button>

        {/* Header Metadata */}
        <div className="space-y-4 mb-8">
          <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg font-arabic">
            {selectedArticle.category}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-arabic text-slate-900 leading-tight">
            {selectedArticle.title}
          </h1>

          <div className={`flex flex-wrap items-center gap-4 text-xs text-slate-600 font-arabic ${lang === 'ar' ? 'justify-start' : 'justify-start'}`}>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              <span>{selectedArticle.date}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span>{selectedArticle.readTime}</span>
            </span>
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-600">
              <BookOpen size={13} />
              <span>SEO Optimized</span>
            </span>
          </div>
        </div>

        {/* Dynamic Share URL Bar */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
            <Share2 size={16} className="text-slate-500 shrink-0" />
            <span className="text-xs font-bold font-arabic shrink-0 text-slate-850">
              {lang === 'ar' ? 'رابط المقال المخصص للسيو:' : 'SEO Targeted Link:'}
            </span>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded truncate text-slate-600 select-all" dir="ltr">
              {`${window.location.origin}/articles/${selectedArticle.id}`}
            </span>
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}/articles/${selectedArticle.id}`;
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            type="button"
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold font-arabic transition-all duration-150 cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-100 shadow-md scale-98'
                : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
            }`}
          >
            {copied 
              ? (lang === 'ar' ? '✓ تم نسخ الرابط' : '✓ Link Copied') 
              : (lang === 'ar' ? 'نسخ رابط المقال' : 'Copy Article Link')}
          </button>
        </div>

        {/* Decorative banner */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 mb-8 rounded-full" />

        {/* Dynamic Image Banner */}
        {selectedArticle.image && (
          <div className="mb-8 rounded-3xl overflow-hidden aspect-video border border-slate-100 shadow-xs max-h-[360px] flex items-center justify-center bg-slate-50 relative">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Dynamic content rendering */}
        <div className="space-y-1 mb-10 prose prose-slate max-w-none">
          {renderMarkdown(selectedArticle.content)}
        </div>

        {/* Share Section or useful CTA */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-right sm:text-right w-full">
            <h4 className="font-bold text-sm text-slate-800 font-arabic">
              {lang === 'ar' ? 'هل تود تجربة أداة الروابط العميقة الآن؟' : 'Ready to create your own deep-link QR?'}
            </h4>
            <p className="text-xs text-slate-600 font-arabic">
              {lang === 'ar' ? 'صمّم كود كيو آر ذكي يدير المتابعين لتطبيق اليوتيوب الرسمي بضغطة واحدة.' : 'Build responsive deep linked QRs in seconds locally and print with absolute zero pixel loss.'}
            </p>
          </div>
          <button
            onClick={() => {
              onSelectArticle(null);
              // scroll to generator
              const workspace = document.getElementById('main_workspace');
              if (workspace) workspace.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-colors text-xs shadow-xs cursor-pointer"
          >
            {lang === 'ar' ? 'ابدأ توليد الكود الآن' : 'Start Designing QRs'}
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto" id="articles_list_workspace">
      
      {/* Tab intro text */}
      <div className={`text-center max-w-2xl mx-auto space-y-3 ${lang === 'ar' ? 'text-center' : 'text-center'}`}>
        <h2 className="text-2xl sm:text-3xl font-black font-arabic text-slate-900">
          {t.seoArticlesHeading}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-arabic leading-relaxed">
          {t.seoArticlesDesc}
        </p>
      </div>

      {/* Grid space */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="articles_cards_grid">
        {articles.map((article) => {
          const isAudit = article.id === 'website-seo-audit';
          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.id)}
              className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between group overflow-hidden relative ${
                isAudit 
                  ? 'border-emerald-200 hover:border-emerald-300 shadow-xs hover:shadow bg-emerald-50/10' 
                  : 'border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Optional Card Image cover */}
                {article.image && (
                  <div className="mb-4 rounded-2xl overflow-hidden aspect-video border border-slate-100 bg-slate-50 relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-350"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                {/* Meta details */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                    isAudit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600'
                  }`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">{article.date}</span>
                </div>

                <h3 className={`font-bold font-arabic text-base group-hover:text-red-600 transition-colors leading-snug ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {article.title}
                </h3>

                <p className={`text-xs text-slate-600 font-arabic leading-relaxed ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {article.excerpt}
                </p>
              </div>

              {/* Action footer */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-5 text-[11px] font-bold text-slate-600 group-hover:text-red-600 font-arabic transition-colors">
                <span className="flex items-center gap-1 text-slate-600 font-mono font-normal">
                  <Clock size={11} />
                  <span>{article.readTime}</span>
                </span>
                <span className="flex items-center gap-1 font-extrabold hover:underline">
                  {t.readMore}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
