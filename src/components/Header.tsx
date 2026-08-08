import React from 'react';
import { Wrench, ShieldCheck, PlusCircle, RefreshCw } from 'lucide-react';
import { GOOGLE_FORM_URL } from '../utils/handymanService';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  approvedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, approvedCount }) => {
  return (
    <header className="bg-slate-900 text-white relative overflow-hidden border-b border-amber-500/20 shadow-lg">
      {/* Decorative background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6 relative z-10">
        {/* Main Header Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-bold shrink-0">
                <Wrench className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif leading-tight">
                    دليل صنايعية مصر
                  </h1>
                  {approvedCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{approvedCount} صنايعي معتمد</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  تواصل مباشر وفوري مع أفضل الفنيين والصنايعية الثقات مجاناً وبدون عمولات
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 text-center"
              id="header_register_btn"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>سجل كصنايعي مجاناً</span>
            </a>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="تحديث البيانات من جوجل شيت"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
              id="header_refresh_btn"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

