import React, { useState, useEffect } from 'react';
import { BookOpen, X, Clock, Calendar, ArrowRight, Share2, Search, CheckCircle2, ChevronDown, Wrench, Sparkles, ExternalLink, Tag } from 'lucide-react';
import { SEO_ARTICLES, Article } from '../data/articles';

interface ArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlug?: string | null;
  onSelectArticle?: (slug: string | null) => void;
  onSelectProfessionFilter?: (profession: string) => void;
}

export const ArticlesModal: React.FC<ArticlesModalProps> = ({
  isOpen,
  onClose,
  selectedSlug,
  onSelectArticle,
  onSelectProfessionFilter,
}) => {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedSlug) {
      const found = SEO_ARTICLES.find(a => a.slug === selectedSlug || a.id === selectedSlug);
      if (found) {
        setActiveArticle(found);
      }
    } else {
      setActiveArticle(null);
    }
  }, [selectedSlug, isOpen]);

  if (!isOpen) return null;

  const categories = ['الكل', ...Array.from(new Set(SEO_ARTICLES.map(a => a.category)))];

  const filteredArticles = SEO_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'الكل' || article.category === selectedCategory;
    const matchesSearch =
      article.title.includes(searchQuery) ||
      article.description.includes(searchQuery) ||
      article.tags.some(t => t.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const handleSelectArticle = (article: Article | null) => {
    setActiveArticle(article);
    if (onSelectArticle) {
      onSelectArticle(article ? article.slug : null);
    }
  };

  const handleShare = (article: Article) => {
    const url = `https://dkora.online/article/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleProfessionClick = (profession?: string) => {
    if (profession && onSelectProfessionFilter) {
      onSelectProfessionFilter(profession);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif leading-tight">
                مقالات ودلائل صيانة وتأسيس المنازل
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                إرشادات ونصائح حصرية برعاية موقع ديكورا (dkora.online)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="إغلاق"
            id="close_articles_modal_btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View: Detail vs Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          {activeArticle ? (
            /* SINGLE ARTICLE DETAIL VIEW */
            <div className="max-w-3xl mx-auto space-y-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              
              {/* Breadcrumb & Navigation */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <button
                  onClick={() => handleSelectArticle(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
                  id="back_to_articles_list_btn"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لقائمة المقالات</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                    {activeArticle.category}
                  </span>
                </div>
              </div>

              {/* Title & Meta Info */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-snug">
                  {activeArticle.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-b border-slate-100 pb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {activeArticle.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    وقت القراءة: {activeArticle.readTime}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    ✍️ {activeArticle.author}
                  </span>
                </div>
              </div>

              {/* Cover Banner */}
              <div className="relative rounded-2xl overflow-hidden shadow-md max-h-80 border border-slate-200">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Intro Text */}
              <div className="text-base text-slate-800 font-medium leading-relaxed bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                {activeArticle.content.intro}
              </div>

              {/* Action Bar for Handyman Search */}
              {activeArticle.professionFilter && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">
                      هل تبحث عن فني {activeArticle.professionFilter} ثقة ومعتمد في محافظتك؟
                    </span>
                  </div>
                  <button
                    onClick={() => handleProfessionClick(activeArticle.professionFilter)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    عرض دليل السباكين والفنيين الآن
                  </button>
                </div>
              )}

              {/* Article Content Sections */}
              <div className="space-y-6 pt-2">
                {activeArticle.content.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 font-serif border-r-4 border-amber-500 pr-3">
                      {sec.heading}
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {sec.text}
                    </p>
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        {sec.bulletPoints.map((bp, bidx) => (
                          <li key={bidx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* FAQs Accordion Section */}
              {activeArticle.content.faqs && activeArticle.content.faqs.length > 0 && (
                <div className="pt-4 space-y-3 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>أسئلة شائعة وإجابات الفنيين</span>
                  </h4>
                  <div className="space-y-2">
                    {activeArticle.content.faqs.map((faq, fidx) => (
                      <div key={fidx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => setOpenFaqIndex(openFaqIndex === fidx ? null : fidx)}
                          className="w-full text-right p-3.5 font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-all"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaqIndex === fidx ? 'rotate-180' : ''}`} />
                        </button>
                        {openFaqIndex === fidx && (
                          <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags & Share Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {activeArticle.tags.map((tag, tidx) => (
                    <span key={tidx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleShare(activeArticle)}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'تم نسخ رابط المقال!' : 'مشاركة المقال'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* ARTICLES LIST / GRID VIEW */
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Search & Category Header */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث في المقالات والنصائح..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredArticles.map(article => (
                  <article
                    key={article.id}
                    onClick={() => handleSelectArticle(article)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          {article.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-bold text-slate-900 font-serif group-hover:text-amber-600 transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {article.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {article.readTime}
                      </span>
                      <span className="font-bold text-amber-600 group-hover:underline inline-flex items-center gap-1">
                        قراءة المقال بالكامل
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 px-6 text-center text-xs text-slate-500 shrink-0">
          جميع المقالات والدلائل مراجعة ومقدمة من مهندسي صيانة ونقاشي{' '}
          <a href="https://dkora.online" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-600 hover:underline">
            موقع ديكورا (dkora.online)
          </a>
        </div>

      </div>
    </div>
  );
};
