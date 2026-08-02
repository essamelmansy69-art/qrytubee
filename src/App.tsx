import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { HandymanCard } from './components/HandymanCard';
import { SponsorBanner } from './components/SponsorBanner';
import { Footer } from './components/Footer';
import { LegalPages, LegalTab } from './components/LegalPages';
import { ArticlesModal } from './components/ArticlesModal';
import { Handyman } from './types';
import { fetchHandymenData, getCachedHandymen, GOOGLE_FORM_URL } from './utils/handymanService';
import { AlertTriangle, RefreshCw, PlusCircle, Wrench, ShieldCheck, CheckCircle2, PhoneCall, Loader2, BookOpen } from 'lucide-react';

export default function App() {
  // 1. Instant rendering: load from localStorage cache immediately if available
  const initialCache = getCachedHandymen();
  const [handymen, setHandymen] = useState<Handyman[]>(initialCache || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProfession, setSelectedProfession] = useState<string>('الكل');

  // Legal Modal State & Path Routing
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  // Articles Modal State & Path Routing
  const [articlesModalOpen, setArticlesModalOpen] = useState<boolean>(false);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  // Router & Sub-link Navigation System
  const navigateTo = (path: string, pushState = true) => {
    if (pushState && window.location.pathname + window.location.search !== path) {
      window.history.pushState({}, '', path);
    }
    syncStateFromUrl(path);
  };

  const syncStateFromUrl = (targetPath?: string) => {
    const rawPath = targetPath !== undefined ? targetPath : window.location.pathname;
    const path = rawPath.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const articleParam = searchParams.get('article');
    const professionParam = searchParams.get('profession');

    // 1. Article Detail (/article/slug or /articles/slug or ?article=slug)
    if (path.startsWith('/article/') || (path.startsWith('/articles/') && path.split('/').filter(Boolean).length > 1)) {
      const parts = path.split('/').filter(Boolean);
      const slug = parts[1] || null;
      setSelectedArticleSlug(slug);
      setArticlesModalOpen(true);
      setLegalModalOpen(false);
    } else if (articleParam) {
      setSelectedArticleSlug(articleParam);
      setArticlesModalOpen(true);
      setLegalModalOpen(false);
    }
    // 2. Articles Directory (/articles or /blog)
    else if (path === '/articles' || path === '/articles/' || path === '/blog') {
      setSelectedArticleSlug(null);
      setArticlesModalOpen(true);
      setLegalModalOpen(false);
    }
    // 3. Privacy Policy (/privacy)
    else if (path === '/privacy' || path === '/privacy/') {
      setLegalTab('privacy');
      setLegalModalOpen(true);
      setArticlesModalOpen(false);
    }
    // 4. Terms & Conditions (/terms)
    else if (path === '/terms' || path === '/terms/') {
      setLegalTab('terms');
      setLegalModalOpen(true);
      setArticlesModalOpen(false);
    }
    // 5. Contact / About Us (/contact or /about)
    else if (path === '/contact' || path === '/contact/' || path === '/about') {
      setLegalTab('contact');
      setLegalModalOpen(true);
      setArticlesModalOpen(false);
    }
    // 6. Profession Filter (/profession/name or ?profession=name)
    else if (path.startsWith('/profession/')) {
      const parts = path.split('/').filter(Boolean);
      const prof = decodeURIComponent(parts[1] || 'الكل');
      setSelectedProfession(prof);
      setLegalModalOpen(false);
      setArticlesModalOpen(false);
    } else if (professionParam) {
      setSelectedProfession(professionParam);
      setLegalModalOpen(false);
      setArticlesModalOpen(false);
    }
    // 7. Homepage (/)
    else {
      setLegalModalOpen(false);
      setArticlesModalOpen(false);
      setSelectedArticleSlug(null);
    }
  };

  const openLegal = (tab: LegalTab) => {
    const target = tab === 'contact' ? '/contact' : `/${tab}`;
    navigateTo(target);
  };

  const openArticles = (slug?: string) => {
    const target = slug ? `/article/${slug}` : '/articles';
    navigateTo(target);
  };

  const handleCloseModals = () => {
    const target = selectedProfession !== 'الكل'
      ? `/?profession=${encodeURIComponent(selectedProfession)}`
      : '/';
    navigateTo(target);
  };

  const handleSelectProfession = (prof: string) => {
    setSelectedProfession(prof);
    const target = prof !== 'الكل'
      ? `/?profession=${encodeURIComponent(prof)}`
      : '/';
    navigateTo(target);
  };

  const loadData = async (showFullLoading: boolean = true) => {
    if (showFullLoading && handymen.length === 0) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    const result = await fetchHandymenData();
    setHandymen(result.handymen || []);
    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    syncStateFromUrl();

    const onPopState = () => {
      syncStateFromUrl();
    };

    window.addEventListener('popstate', onPopState);

    // If cache exists, load in background without blocking screen
    const hasCache = !!initialCache && initialCache.length > 0;
    loadData(!hasCache);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  // Collect all unique professions available in the approved handymen list
  const availableProfessions = useMemo(() => {
    const set = new Set<string>();
    handymen.forEach(h => {
      if (h.profession) set.add(h.profession.trim());
    });
    return Array.from(set);
  }, [handymen]);

  // Filter and sort handymen by search query, profession filter, and rating (highest rated first)
  const filteredHandymen = useMemo(() => {
    const list = handymen.filter((h) => {
      // 1. Profession filter
      if (selectedProfession !== 'الكل') {
        if (!h.profession.toLowerCase().includes(selectedProfession.toLowerCase())) {
          return false;
        }
      }

      // 2. Search query (matches Name, Profession, or Areas)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = h.name.toLowerCase().includes(q);
        const matchProf = h.profession.toLowerCase().includes(q);
        const matchArea = h.areas.toLowerCase().includes(q);
        return matchName || matchProf || matchArea;
      }

      return true;
    });

    // Sort by Average Rating (highest first), then Rating Count (highest first)
    return list.sort((a, b) => {
      const ratingA = a.averageRating ?? 4.8;
      const ratingB = b.averageRating ?? 4.8;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      const countA = a.ratingCount ?? 15;
      const countB = b.ratingCount ?? 15;
      return countB - countA;
    });
  }, [handymen, selectedProfession, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20 sm:pb-8">
      {/* Top Header */}
      <Header
        onRefresh={loadData}
        isLoading={isLoading}
        approvedCount={handymen.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        
        {/* Search & Profession Filter Bar */}
        <SearchBarAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedProfession={selectedProfession}
          setSelectedProfession={handleSelectProfession}
          availableProfessions={availableProfessions}
          totalResults={filteredHandymen.length}
        />

        {/* Error Notice (if any) */}
        {error && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">تنبيه اتصال البيانات:</p>
              <p className="text-xs text-amber-800 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-xl hover:bg-amber-700 transition-all shrink-0"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Background refreshing indicator pill if cache is present */}
        {isRefreshing && !isLoading && (
          <div className="mb-4 bg-slate-900 text-amber-300 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold shadow-sm animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>جاري تحديث دليل الصنايعية بالخلفية من جوجل شيت...</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">بيانات مؤقتة نشطة</span>
          </div>
        )}

        {/* Loading Skeleton & Arabic Spinner */}
        {isLoading ? (
          <div className="space-y-4 my-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-amber-800 font-bold text-sm text-center">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
              <span>جاري تحميل دليل الصنايعية المعتمدين من شيت جوجل...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-10 bg-slate-200 rounded-xl" />
                    <div className="h-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredHandymen.length > 0 ? (
          /* Handyman Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {filteredHandymen.map((handyman) => (
              <HandymanCard key={handyman.id} handyman={handyman} />
            ))}
          </div>
        ) : (
          /* Empty Search / No Results View */
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Wrench className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">
                لم نجد صنايعي يطابق بحثك حالياً
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery || selectedProfession !== 'الكل'
                  ? 'جرب البحث بكلمات أخرى أو اختر "الكل" لعرض جميع الصنايعية المعتمدين.'
                  : 'جاري تحديث الدليل باستمرار مع الصنايعية الجدد المعتمدين.'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {(searchQuery || selectedProfession !== 'الكل') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedProfession('الكل');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all"
                >
                  إعادة ضبط البحث
                </button>
              )}
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                سجل كصنايعي مجاناً الآن
              </a>
            </div>
          </div>
        )}

        {/* Sponsor Banner (موقع ديكورا) */}
        <SponsorBanner />

      </main>

      {/* Footer with Legal & Articles triggers */}
      <Footer onOpenLegal={openLegal} onOpenArticles={() => openArticles()} />

      {/* Legal & Compliance Modal */}
      <LegalPages
        isOpen={legalModalOpen}
        onClose={handleCloseModals}
        initialTab={legalTab}
        onTabChange={(tab) => openLegal(tab)}
      />

      {/* SEO Articles Modal */}
      <ArticlesModal
        isOpen={articlesModalOpen}
        onClose={handleCloseModals}
        selectedSlug={selectedArticleSlug}
        onSelectArticle={(slug) => openArticles(slug || undefined)}
        onSelectProfessionFilter={(prof) => {
          handleSelectProfession(prof);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Sticky Mobile Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:from-amber-600 active:to-amber-700 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20"
          id="mobile_sticky_register_btn"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>سجل كصنايعي مجاناً في دليل مصر</span>
        </a>
      </div>
    </div>
  );
}

