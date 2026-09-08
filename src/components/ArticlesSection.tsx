import React, { useState } from 'react';
import { ARTICLES, Article } from '../data/articles';
import { BookOpen, User, Clock, Calendar, ArrowLeft, ArrowRight, Gamepad2, Play } from 'lucide-react';

interface ArticlesSectionProps {
  locale: 'ar' | 'en';
  isDarkMode: boolean;
  games: any[];
  onPlayGame: (game: any) => void;
}

export default function ArticlesSection({ locale, isDarkMode, games, onPlayGame }: ArticlesSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Helper to parse content with titles, bullets and bold tags
  const renderRichContent = (text: string) => {
    return text.split('\n').map((paragraph, idx) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return <div key={idx} className="h-4" />;

      // Sub-headings starting with ###
      if (trimmed.startsWith('###')) {
        return (
          <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-emerald-500">
            {trimmed.replace('###', '').trim()}
          </h3>
        );
      }

      // Main headings starting with ##
      if (trimmed.startsWith('##')) {
        return (
          <h2 key={idx} className="text-2xl font-extrabold mt-8 mb-4 text-emerald-400">
            {trimmed.replace('##', '').trim()}
          </h2>
        );
      }

      // Bullet points starting with * or -
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const content = trimmed.substring(1).trim();
        return (
          <ul key={idx} className="list-disc list-inside ml-4 mr-4 my-2 text-slate-300">
            <li className="leading-relaxed">
              {parseBoldText(content)}
            </li>
          </ul>
        );
      }

      // Numbered list
      if (/^\d+\./.test(trimmed)) {
        return (
          <div key={idx} className="pl-4 pr-4 my-2 text-slate-300 leading-relaxed font-semibold">
            {parseBoldText(trimmed)}
          </div>
        );
      }

      return (
        <p key={idx} className="leading-relaxed text-lg mb-4 text-slate-300">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Helper to convert markdown-style **bold** text to strong tags
  const parseBoldText = (text: string) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="text-white font-extrabold text-emerald-300">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Find related game objects in our game database
  const getRelatedGames = (article: Article) => {
    return games.filter(g => article.relatedGameIds.includes(g.id));
  };

  const activeArticle = selectedArticle;

  if (activeArticle) {
    const relatedGames = getRelatedGames(activeArticle);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedArticle(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`group mb-8 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {locale === 'ar' ? (
            <>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              <span>العودة لجميع المقالات</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Articles</span>
            </>
          )}
        </button>

        {/* Featured Header & Image */}
        <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="relative h-64 sm:h-[400px] w-full">
            <img
              src={activeArticle.imageUrl}
              alt={activeArticle.title[locale]}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Category Badge on Image */}
            <span className="absolute bottom-6 left-6 right-6 inline-flex max-w-fit items-center rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              {activeArticle.category[locale]}
            </span>
          </div>

          <div className="p-6 sm:p-10">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-400 mb-6 border-b border-slate-900 pb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{activeArticle.author[locale]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{activeArticle.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>
                  {activeArticle.readTime} {locale === 'ar' ? 'دقائق قراءة' : 'min read'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-8 leading-tight">
              {activeArticle.title[locale]}
            </h1>

            {/* Content Body */}
            <div className="prose prose-invert max-w-none text-slate-300">
              {renderRichContent(activeArticle.content[locale])}
            </div>
          </div>
        </article>

        {/* Related Games Widget */}
        {relatedGames.length > 0 && (
          <div className="mt-12 bg-slate-950/80 rounded-3xl border border-slate-800 p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-3 mb-6">
              <Gamepad2 className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span>
                {locale === 'ar' ? 'ألعاب ذات صلة مقترحة للعب الآن' : 'Suggested Related Games to Play'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedGames.map(game => (
                <div
                  key={game.id}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900 border border-slate-800/80 transition-all hover:border-emerald-500/40 hover:bg-slate-900/60"
                >
                  <img
                    src={game.thumbnailUrl}
                    alt={game.title[locale]}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {game.title[locale]}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {game.category}
                    </span>
                  </div>
                  <button
                    onClick={() => onPlayGame(game)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all transform hover:scale-110 active:scale-95 shrink-0 shadow-lg shadow-emerald-500/10"
                    title={locale === 'ar' ? 'العب الآن' : 'Play Now'}
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          {locale === 'ar' ? 'دليل ومقالات الألعاب' : 'Gaming Strategy & Lore Hub'}
        </h2>
        <p className="text-slate-400 text-base sm:text-lg">
          {locale === 'ar'
            ? 'اقرأ أحدث تحليلات الألعاب، نظريات القصة، واستراتيجيات الفوز الحصرية لألعاب الأركيد الكلاسيكية لتصبح بطلاً!'
            : 'Explore expert analyses, deep lore theories, and exclusive win-strategies for your favorite retro classic games.'}
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ARTICLES.map(article => {
          return (
            <article
              key={article.id}
              onClick={() => {
                setSelectedArticle(article);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-850 bg-slate-950/60 cursor-pointer transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/10 hover:translate-y-[-4px]"
            >
              {/* Card Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title[locale]}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Category Badge */}
                <span className="absolute bottom-4 left-4 right-4 inline-flex max-w-fit items-center rounded-md bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                  {article.category[locale]}
                </span>
              </div>

              {/* Card Meta & Title */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500/70" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
                    <span>{article.readTime} min</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                  {article.title[locale]}
                </h3>

                <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {article.excerpt[locale]}
                </p>

                {/* Read Button */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <span>{locale === 'ar' ? 'اقرأ المقال الكامل' : 'Read Full Article'}</span>
                  {locale === 'ar' ? (
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
