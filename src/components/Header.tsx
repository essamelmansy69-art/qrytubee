import React, { useState } from 'react';
import { Wrench, ShieldCheck, PlusCircle, RefreshCw, Globe, ExternalLink, FileSpreadsheet, Check, X } from 'lucide-react';
import { GOOGLE_FORM_URL, getActiveSheetId, setCustomSheetId } from '../utils/handymanService';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  approvedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, approvedCount }) => {
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetInput, setSheetInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenModal = () => {
    setSheetInput(getActiveSheetId());
    setSaveSuccess(false);
    setIsSheetModalOpen(true);
  };

  const handleSaveSheet = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSheetId(sheetInput);
    setSaveSuccess(true);
    setTimeout(() => {
      setIsSheetModalOpen(false);
      setSaveSuccess(false);
      onRefresh();
    }, 800);
  };

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
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif leading-tight">
                  دليل صنايعية مصر
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  برعاية موقع ديكورا — تواصل مباشر وفوري مع أفضل الفنيين والصنايعية الثقات مجاناً وبدون عمولات
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs sm:text-sm transition-all active:scale-95"
              title="ربط شيت جوجل فرعي أو خارجي"
              id="header_link_sheet_btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>رابط الشيت</span>
            </button>

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

        {/* Announcement Bar with Stylish Link to dkora.online */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-full px-3.5 py-1.5 text-xs text-amber-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              برعاية{' '}
              <a
                href="https://dkora.online"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-white underline underline-offset-4 decoration-amber-400/60 hover:decoration-white transition-all bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30 ml-1"
                id="header_sponsor_link"
              >
                <span>موقع ديكورا (dkora.online)</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
              — دليل التشطيبات والديكور الأول في مصر
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 text-[11px] mr-auto sm:mr-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>صنايعية معتمدين {approvedCount > 0 ? `(${approvedCount})` : ''}</span>
          </div>
        </div>
      </div>

      {/* Modal to enter/paste custom Google Sheet URL or ID */}
      {isSheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right text-white">
            <button
              onClick={() => setIsSheetModalOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              id="close_sheet_modal_btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">ربط شيت جوجل (دليل صنايعية مصر)</h3>
                <p className="text-xs text-slate-400">أدخل رابط Google Sheet أو معرّف الشيت (Sheet ID)</p>
              </div>
            </div>

            <form onSubmit={handleSaveSheet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رابط Google Sheet أو ID الشيت
                </label>
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="مثال: https://docs.google.com/spreadsheets/d/1if4NKgBB7eCr1nKe0gtMNMWWKadg-drm6R7areIclSY/edit"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors dir-ltr text-left"
                  dir="ltr"
                  required
                  id="sheet_url_input"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  تأكد أن الشيت مضبوط على الوضع العام (Anyone with the link can view) حتى نتمكن من قراءة البيانات تلقائياً.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تم حفظ معرّف الشيت وتحديث البيانات بنجاح!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomSheetId('');
                    setSheetInput(getActiveSheetId());
                    setSaveSuccess(true);
                    setTimeout(() => {
                      setIsSheetModalOpen(false);
                      setSaveSuccess(false);
                      onRefresh();
                    }, 800);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  id="reset_sheet_btn"
                >
                  إعادة تعيين للشيت الافتراضي
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  id="save_sheet_btn"
                >
                  حفظ وتحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

