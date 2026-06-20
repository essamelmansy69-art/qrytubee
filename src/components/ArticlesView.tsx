import { useState, useEffect } from 'react';
import { articlesData, Article } from '../data/seoContent';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, Calendar, Clock, BookOpen, Share2 } from 'lucide-react';

interface ArticlesViewProps {
  lang: 'ar' | 'en';
  selectedArticleId: string | null;
  onSelectArticle: (id: string | null) => void;
}

function ImageWithFallback({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-red-950 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="z-10 space-y-2 flex flex-col items-center">
          <BookOpen className="text-red-500/85 animate-pulse" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 font-mono">Qrytube SEO Academy</p>
          <span className="text-[10px] sm:text-xs text-slate-300 font-arabic line-clamp-1 max-w-[280px] opacity-70">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
    />
  );
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
          "url": `${window.location.origin}/favicon.webp`
        }
      }
    };

    if (selectedArticle.image) {
      const imageUrl = selectedArticle.image.startsWith('http')
        ? selectedArticle.image
        : `${window.location.origin}${selectedArticle.image}`;
      schemaMarkup.image = [imageUrl];
    }

    schemaMarkup["@context"] = "https://schema.org";

    let script = document.getElementById('seo-article-schema') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-article-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(schemaMarkup);

    return () => {
      const existing = document.getElementById('seo-article-schema');
      if (existing) existing.remove();
    };
  }, [selectedArticle, lang]);

  // Simple Markdown content renderer for articles to avoid external parser bugs
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-4" />;

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold font-arabic text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-lg font-bold font-arabic text-slate-850 dark:text-slate-200 mt-6 mb-3">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }

      if (trimmed.startsWith('- ')) {
        // Parse bold references in lists
        const listText = trimmed.replace('- ', '');
        return (
          <p key={idx} className="mr-5 ml-5 text-slate-650 dark:text-slate-300 font-arabic text-sm sm:text-base leading-relaxed mb-2.5 flex items-start gap-2">
            <span className="text-red-550 dark:text-red-500 shrink-0 select-none">•</span>
            <span>{parseBoldText(listText)}</span>
          </p>
        );
      }

      if (trimmed.startsWith('```')) {
        if (trimmed === '```' || trimmed === '```json') return null; // hide wrapper block
        return (
          <pre key={idx} className="bg-slate-950 text-slate-200 text-xs sm:text-sm font-mono p-4 rounded-xl overflow-x-auto my-4 border border-slate-800/80" dir="ltr">
            <code>{trimmed}</code>
          </pre>
        );
      }

      // Default paragraph, check for inline code block first
      if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
        return (
          <pre key={idx} className="bg-slate-950 text-slate-200 text-xs sm:text-sm font-mono p-4 rounded-xl overflow-x-auto my-4 border border-slate-800/80" dir="ltr">
            <code>{trimmed.replace(/`/g, '')}</code>
          </pre>
        );
      }

      return (
        <p key={idx} className="text-sm sm:text-base text-slate-650 dark:text-slate-300 font-arabic leading-relaxed mb-4">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-950 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/20 px-1 rounded">{part}</strong>;
      }
      return part;
    });
  };

  if (selectedArticle) {
    return (
      <div className={`w-full max-w-5xl mx-auto ${lang === 'ar' ? 'text-right' : 'text-left'} animate-fadeIn`} id="active_article_reader">
        
        {/* Navigation bar to return */}
        <button
          onClick={() => onSelectArticle(null)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-450 hover:text-red-650 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-6 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
          type="button"
          id="back_to_blog_btn"
        >
          {lang === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{t.backToArticles}</span>
        </button>

        {/* Content Card with simple, spacious layout */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-100 dark:border-slate-850 shadow-xs">
          
          {/* Header Metadata */}
          <div className="space-y-4 mb-6">
            <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg font-arabic">
              {selectedArticle.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-arabic text-slate-900 dark:text-white leading-tight">
              {selectedArticle.title}
            </h1>

            <div className={`flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-arabic`}>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{selectedArticle.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{selectedArticle.readTime}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/65 dark:border-slate-800/80 px-2.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                <BookOpen size={14} />
                <span>SEO Optimized</span>
              </span>
            </div>
          </div>

          {/* Dynamic Share URL Bar */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
              <Share2 size={16} className="text-slate-500 dark:text-slate-455 shrink-0" />
              <span className="text-xs font-bold font-arabic shrink-0 text-slate-850 dark:text-slate-200">
                {lang === 'ar' ? 'رابط المقال المخصص للسيو:' : 'SEO Targeted Link:'}
              </span>
              <span className="text-xs font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded truncate text-slate-650 dark:text-slate-400 select-all border border-slate-100 dark:border-slate-800" dir="ltr">
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
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold font-arabic transition-all duration-150 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-100 dark:shadow-none shadow-md scale-98'
                  : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white shadow-xs'
              }`}
            >
              {copied 
                ? (lang === 'ar' ? '✓ تم نسخ الرابط' : '✓ Link Copied') 
                : (lang === 'ar' ? 'نسخ رابط المقال' : 'Copy Article Link')}
            </button>
          </div>

          {/* Decorative banner */}
          <div className="h-1 bg-gradient-to-r from-red-650 via-rose-500 to-indigo-600 mb-8 rounded-full" />

          {/* Dynamic Image Banner */}
          {selectedArticle.image && (
            <div className="mb-8 rounded-2xl overflow-hidden aspect-video border border-slate-100 dark:border-slate-800 shadow-xs max-h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative">
              <ImageWithFallback
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Dynamic content rendering */}
          <div className="space-y-1 mb-10 prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
            {renderMarkdown(selectedArticle.content)}
          </div>

          {/* Share Section or useful CTA */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-right sm:text-right w-full">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white font-arabic">
                {lang === 'ar' ? 'هل تود تجربة أداة الروابط العميقة الآن؟' : 'Ready to create your own deep-link QR?'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-arabic">
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
              className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all text-xs shadow-xs hover:scale-102 cursor-pointer"
            >
              {lang === 'ar' ? 'ابدأ توليد الكود الآن' : 'Start Designing QRs'}
            </button>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-10 w-full max-w-none" id="articles_list_workspace">
      
      {/* Tab intro text */}
      <div className={`text-center max-w-3xl mx-auto space-y-4 mb-10`}>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-arabic text-slate-900 dark:text-white tracking-tight">
          {t.seoArticlesHeading}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-arabic leading-relaxed max-w-2xl mx-auto">
          {t.seoArticlesDesc}
        </p>
      </div>

      {/* Grid space - Beautiful, fluid Grid filling the full container width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="articles_cards_grid">
        {articles.map((article) => {
          const isAudit = article.id === 'website-seo-audit';
          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.id)}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden relative ${
                isAudit 
                  ? 'border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md bg-emerald-50/10 dark:bg-emerald-950/10' 
                  : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm hover:shadow-lg dark:hover:shadow-slate-950/40'
              }`}
            >
              <div className="space-y-4">
                {/* Optional Card Image cover */}
                {article.image && (
                  <div className="mb-4 rounded-2xl overflow-hidden aspect-video border border-slate-100/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative">
                    <ImageWithFallback
                      src={article.image}
                      alt={article.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                {/* Meta details */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                    isAudit 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' 
                      : 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400'
                  }`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{article.date}</span>
                </div>

                <h3 className={`font-bold font-arabic text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-red-650 dark:group-hover:text-red-500 transition-colors leading-snug ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {article.title}
                </h3>

                <p className={`text-xs sm:text-sm text-slate-650 dark:text-slate-400 font-arabic leading-relaxed line-clamp-3 ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {article.excerpt}
                </p>
              </div>

              {/* Action footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-5 text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-red-650 dark:group-hover:text-red-500 font-arabic transition-colors">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 font-mono font-normal">
                  <Clock size={12} />
                  <span>{article.readTime}</span>
                </span>
                <span className="flex items-center gap-1 font-extrabold group-hover:underline text-red-600 dark:text-red-400">
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
