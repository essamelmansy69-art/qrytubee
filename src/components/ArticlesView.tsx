import { useState } from 'react';
import { articlesData, Article } from '../data/seoContent';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, Calendar, Clock, BookOpen, Share2 } from 'lucide-react';

interface ArticlesViewProps {
  lang: 'ar' | 'en';
}

export default function ArticlesView({ lang }: ArticlesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const t = translations[lang];
  const articles = articlesData[lang];

  const selectedArticle = articles.find(a => a.id === selectedId);

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
          <li key={idx} className="mr-5 ml-5 list-disc text-slate-600 font-arabic text-sm leading-relaxed mb-2">
            {parseBoldText(listText)}
          </li>
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
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-red-600 transition-colors mb-6 cursor-pointer"
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

          <div className={`flex flex-wrap items-center gap-4 text-xs text-slate-500 font-arabic ${lang === 'ar' ? 'justify-start' : 'justify-start'}`}>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              <span>{selectedArticle.date}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span>{selectedArticle.readTime}</span>
            </span>
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-500">
              <BookOpen size={13} />
              <span>SEO Optimized</span>
            </span>
          </div>
        </div>

        {/* Decorative banner */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 mb-8 rounded-full" />

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
            <p className="text-xs text-slate-500 font-arabic">
              {lang === 'ar' ? 'صمّم كود كيو آر ذكي يدير المتابعين لتطبيق اليوتيوب الرسمي بضغطة واحدة.' : 'Build responsive deep linked QRs in seconds locally and print with absolute zero pixel loss.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedId(null);
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
        <p className="text-xs sm:text-sm text-slate-500 font-arabic leading-relaxed">
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
              onClick={() => setSelectedId(article.id)}
              className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between group overflow-hidden relative ${
                isAudit 
                  ? 'border-emerald-200 hover:border-emerald-300 shadow-xs hover:shadow bg-emerald-50/10' 
                  : 'border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Meta details */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                    isAudit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600'
                  }`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{article.date}</span>
                </div>

                <h3 className={`font-bold font-arabic text-base group-hover:text-red-600 transition-colors leading-snug ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {article.title}
                </h3>

                <p className={`text-xs text-slate-500 font-arabic leading-relaxed ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                }`}>
                  {article.excerpt}
                </p>
              </div>

              {/* Action footer */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-5 text-[11px] font-bold text-slate-600 group-hover:text-red-600 font-arabic transition-colors">
                <span className="flex items-center gap-1 text-slate-500 font-mono font-normal">
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
