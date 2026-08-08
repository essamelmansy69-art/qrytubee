import React from 'react';
import { Wrench, Heart, PlusCircle, ExternalLink, ShieldCheck, FileText, Mail, Map, BookOpen } from 'lucide-react';
import { GOOGLE_FORM_URL } from '../utils/handymanService';
import { LegalTab } from './LegalPages';

interface FooterProps {
  onOpenLegal?: (tab: LegalTab) => void;
  onOpenArticles?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenArticles }) => {
  const handleLegalClick = (e: React.MouseEvent, tab: LegalTab) => {
    if (onOpenLegal) {
      e.preventDefault();
      onOpenLegal(tab);
    }
  };

  const handleArticlesClick = (e: React.MouseEvent) => {
    if (onOpenArticles) {
      e.preventDefault();
      onOpenArticles();
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 mt-12 text-center text-sm">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-white block leading-tight font-serif">دليل صنايعية مصر</span>
              <span className="text-xs text-slate-400 font-medium flex flex-wrap items-center gap-1">
                برعاية{' '}
                <a
                  href="https://dkora.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-400/50 hover:decoration-amber-300 transition-all inline-flex items-center gap-0.5"
                  id="footer_sponsor_link"
                >
                  <span>موقع ديكورا (dkora.online)</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </a>
                <span>— دليل التشطيبات والديكور الأول في مصر</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenArticles && (
              <a
                href="/articles"
                onClick={handleArticlesClick}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                id="footer_articles_btn"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>مقالات ودلائل الصيانة</span>
              </a>
            )}

            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-xl transition-all"
              id="footer_register_link"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل صنايعي جديد</span>
            </a>
          </div>
        </div>

        {/* Legal Pages Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300 border-b border-slate-800/80 pb-5">
          {onOpenArticles && (
            <a
              href="/articles"
              onClick={handleArticlesClick}
              className="hover:text-amber-400 transition-all flex items-center gap-1 py-1 text-amber-300 font-bold"
              id="footer_seo_articles_link"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>مقالات التشطيب والديكور (SEO)</span>
            </a>
          )}

          <a
            href="/privacy"
            onClick={(e) => handleLegalClick(e, 'privacy')}
            className="hover:text-amber-400 transition-all flex items-center gap-1 py-1"
            id="footer_privacy_link"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>سياسة الخصوصية</span>
          </a>

          <a
            href="/terms"
            onClick={(e) => handleLegalClick(e, 'terms')}
            className="hover:text-amber-400 transition-all flex items-center gap-1 py-1"
            id="footer_terms_link"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>الشروط والأحكام</span>
          </a>

          <a
            href="/contact"
            onClick={(e) => handleLegalClick(e, 'contact')}
            className="hover:text-amber-400 transition-all flex items-center gap-1 py-1"
            id="footer_contact_link"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>عن الدليل واتصل بنا</span>
          </a>
        </div>

        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          جميع البيانات الواردة في الدليل يتم جلبها مباشرة وتحديثها فورياً من استمارة التسجيل الرسمية، ويتم اعتماد الصنايعية والفنيين النشطين لحماية جودة الخدمة.
        </p>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
          <span>صُنِع بـ</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>لخدمة أهالي وصنايعية جمهورية مصر العربية © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

