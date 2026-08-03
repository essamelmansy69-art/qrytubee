import React from 'react';
import { Search, X, Filter, Wrench, Flame, Sparkles } from 'lucide-react';

interface SearchBarAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProfession: string;
  setSelectedProfession: (prof: string) => void;
  availableProfessions: string[];
  totalResults: number;
}

// Preset primary required professions with icons and colors
const PRIMARY_PROFESSIONS: { label: string; icon: string; bg: string; text: string; border: string }[] = [
  { label: 'الكل', icon: '⚡', bg: 'bg-amber-500', text: 'text-slate-950 font-bold', border: 'border-amber-500' },
  { label: 'سباك', icon: '🚰', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200 hover:border-blue-400' },
  { label: 'نقاش', icon: '🎨', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200 hover:border-purple-400' },
  { label: 'كهربائي', icon: '⚡', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200 hover:border-amber-400' },
  { label: 'نجار', icon: '🪚', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200 hover:border-emerald-400' },
  { label: 'فني تكييف', icon: '❄️', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200 hover:border-cyan-400' },
];

export const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedProfession,
  setSelectedProfession,
  availableProfessions,
  totalResults
}) => {

  // Merge primary required professions with any extra professions found in sheet
  const allProfessionsSet = new Set(['الكل', 'سباك', 'نقاش', 'كهربائي', 'نجار', 'فني تكييف', ...availableProfessions]);
  const sortedProfessionsList = Array.from(allProfessionsSet);

  return (
    <div className="space-y-4 my-4">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 stroke-[2.2]" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الصنايعي، المهنة، المنطقة أو المحافظة (مثال: سباك القاهرة، نقاش الجيزة...)"
          className="w-full pl-10 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-all"
          id="search_handyman_input"
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-700"
            id="clear_search_btn"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4 bg-slate-100 rounded-full p-0.5" />
          </button>
        )}
      </div>

      {/* Profession Quick Filter Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>اختر التخصص المطلوب:</span>
          </label>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            العدد: {totalResults} صنايعي
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x -mx-1 px-1">
          {sortedProfessionsList.map((prof) => {
            const isSelected = selectedProfession === prof;
            const primaryMatch = PRIMARY_PROFESSIONS.find(p => p.label === prof);
            const icon = primaryMatch ? primaryMatch.icon : '🛠️';

            return (
              <button
                key={prof}
                onClick={() => setSelectedProfession(prof)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all border shadow-xs active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
                id={`filter_btn_${prof}`}
              >
                <span>{icon}</span>
                <span>{prof}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
