import React, { useState } from 'react';
import { seoContent, SEOArticle } from '../data/seoContent';
import { Language, translations } from '../translations';
import { Clock, Calendar, ArrowLeft, Search, BookOpen } from 'lucide-react';

interface ArticlesViewProps {
  lang: Language;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({ lang }) => {
  const t = translations[lang];
  const articles = seoContent[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<SEOArticle | null>(null);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm animate-fade-in" id="article_reader">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors border border-slate-200 px-4 py-2 rounded-xl text-sm"
          id="back_to_articles_btn"
        >
          <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          {t.backToHome} (جميع المقالات)
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full">{selectedArticle.category}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {selectedArticle.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedArticle.readTime}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            {selectedArticle.title}
          </h1>

          <p className="text-base text-slate-500 leading-relaxed italic border-r-4 border-red-500 pr-4 my-2">
            {selectedArticle.excerpt}
          </p>

          {/* High resolution article banner */}
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-md my-4">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fail-safe placeholder if image not found
                e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          {/* Render Markdown content */}
          <article className="prose prose-slate max-w-none leading-loose text-slate-700 mt-6 font-sans space-y-6">
            {selectedArticle.content.split('\n\n').map((paragraph, idx) => {
              const text = paragraph.trim();
              if (text.startsWith('###')) {
                return (
                  <h3 key={idx} className="text-xl md:text-2xl font-extrabold text-slate-900 pt-4 pb-2 border-b border-slate-100">
                    {text.replace('###', '').trim()}
                  </h3>
                );
              }
              if (text.startsWith('#####')) {
                return (
                  <h5 key={idx} className="text-base md:text-lg font-extrabold text-red-600 pt-2">
                    {text.replace('#####', '').trim()}
                  </h5>
                );
              }
              if (text.startsWith('* **') || text.startsWith('- **')) {
                // List parsing
                return (
                  <ul key={idx} className="list-disc pr-6 space-y-2">
                    {text.split('\n').map((li, liIdx) => (
                      <li key={liIdx} className="text-slate-700">
                        {li.replace(/^[\*\-\s]+/, '').trim()}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-slate-600 leading-relaxed text-base md:text-lg">
                  {text}
                </p>
              );
            })}
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in" id="articles_list_container">
      {/* Header Search panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black text-red-400 tracking-wider uppercase">سيو ومعايير ٢٠٢٦</span>
          <h1 className="text-xl md:text-2xl font-black">أدلة واستراتيجيات السيو والتسويق الحديثة</h1>
          <p className="text-slate-300 text-sm">كيف ترفع مستوى التفاعل، المبيعات، ومعدلات تحويل أكواد QR والروابط الذكية.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مقال معين..."
            className="w-full h-12 pl-4 pr-11 rounded-xl bg-slate-800 text-white border border-slate-700 placeholder-slate-400 font-sans focus:outline-none focus:border-red-500 text-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
        </div>
      </div>

      {/* Articles Bento Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
          {t.noArticlesFound}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="articles_bento_grid">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
            >
              {/* Image header */}
              <div className="w-full h-48 overflow-hidden bg-slate-100 relative">
                <img
                  src={article.image}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  {article.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-800 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 hover:text-red-700 transition-colors border-t border-slate-50 pt-3">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t.readMore}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
