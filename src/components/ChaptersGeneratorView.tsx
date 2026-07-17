import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { formatYouTubeChapters } from '../utils';
import { PlayCircle, Copy, CheckCircle } from 'lucide-react';

interface ChaptersGeneratorViewProps {
  lang: Language;
}

export const ChaptersGeneratorView: React.FC<ChaptersGeneratorViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const formatted = formatYouTubeChapters(inputText || t.chaptersPlaceholder);
    setResultText(formatted);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6 animate-fade-in" id="chapters_generator_view">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
          <PlayCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">{t.youtubeTool}</h2>
          <p className="text-xs text-slate-500 font-sans">تنسيق الفهرس الزمني ومقاطع الفيديو مجاناً لزيادة الاحترافية ومحركات البحث.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Input */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-slate-700">{t.chaptersLabel}</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chaptersPlaceholder}
            className="w-full h-64 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 font-mono text-sm leading-relaxed focus:bg-white focus:border-red-500 transition-all outline-none"
            dir="ltr"
          />
          <button
            onClick={handleGenerate}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            {t.generateChapters}
          </button>
        </div>

        {/* Right Output */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-slate-700">{t.chaptersResult}</label>
          <div className="relative flex-1">
            <textarea
              readOnly
              value={resultText || (lang === 'ar' ? 'انقر على "تنظيم وتنسيق الفصول" لتظهر النتائج هنا...' : 'Click "Format Chapters" to view output here...')}
              className="w-full h-64 p-4 rounded-xl bg-slate-900 text-green-400 font-mono text-sm leading-relaxed border border-slate-800 outline-none"
              dir="ltr"
            />
            {resultText && (
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t.copyButton}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
