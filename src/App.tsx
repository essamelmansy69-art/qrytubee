import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { HandymanCard } from './components/HandymanCard';
import { SponsorBanner } from './components/SponsorBanner';
import { Footer } from './components/Footer';
import { Handyman } from './types';
import { fetchHandymenData, GOOGLE_FORM_URL } from './utils/handymanService';
import { AlertTriangle, RefreshCw, PlusCircle, Wrench, ShieldCheck, CheckCircle2, PhoneCall } from 'lucide-react';

export default function App() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProfession, setSelectedProfession] = useState<string>('الكل');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchHandymenData();
    setHandymen(result.handymen);
    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Collect all unique professions available in the approved handymen list
  const availableProfessions = useMemo(() => {
    const set = new Set<string>();
    handymen.forEach(h => {
      if (h.profession) set.add(h.profession.trim());
    });
    return Array.from(set);
  }, [handymen]);

  // Filter handymen by search query and profession filter
  const filteredHandymen = useMemo(() => {
    return handymen.filter((h) => {
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
          setSelectedProfession={setSelectedProfession}
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
              onClick={loadData}
              className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-xl hover:bg-amber-700 transition-all shrink-0"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
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

        {/* Sponsor Banner (محل حدايد وبويات المطرية) */}
        <SponsorBanner />

      </main>

      {/* Footer */}
      <Footer />

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
