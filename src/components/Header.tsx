import React from 'react';
import { Wrench, PhoneCall, ShieldCheck, PlusCircle, RefreshCw, Store } from 'lucide-react';
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
        {/* Top Announcement Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1.5 text-xs text-amber-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Store className="w-4 h-4 text-amber-400 shrink-0" />
            <span>برعاية محل <strong>حدايد وبويات مصر</strong> — خامات ومعدات أصلية بسعر الجملة</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 text-[11px] mr-auto sm:mr-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>صنايعية معتمدين {approvedCount > 0 ? `(${approvedCount})` : ''}</span>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-bold shrink-0">
                <Wrench className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif leading-tight">
                  دليل صنايعية مصر
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  تواصل مباشر وفوري مع أفضل السباكين، الكهربائية، والنقاشين في مصر
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 text-center"
              id="header_register_btn"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>سجل كصنايعي مجاناً</span>
            </a>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="تحديث البيانات من جوجل شيت"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
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
