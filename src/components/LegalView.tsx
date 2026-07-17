import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { ShieldCheck, Scale, Mail, Info, CheckCircle } from 'lucide-react';

interface LegalViewProps {
  lang: Language;
  initialTab: 'terms' | 'privacy' | 'about' | 'contact';
}

export const LegalView: React.FC<LegalViewProps> = ({ lang, initialTab }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'about' | 'contact'>(initialTab);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm animate-fade-in" id="legal_view_container">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-5 mb-8">
        <button
          onClick={() => { setActiveTab('terms'); setFormSubmitted(false); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'terms' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          {t.footerTerms}
        </button>
        <button
          onClick={() => { setActiveTab('privacy'); setFormSubmitted(false); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'privacy' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          {t.footerPrivacy}
        </button>
        <button
          onClick={() => { setActiveTab('about'); setFormSubmitted(false); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'about' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Info className="w-4 h-4" />
          {t.footerAbout}
        </button>
        <button
          onClick={() => { setActiveTab('contact'); setFormSubmitted(false); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'contact' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          {t.footerContact}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans" id="legal_tab_content">
        
        {/* 1. TERMS AND CONDITIONS */}
        {activeTab === 'terms' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h1 className="text-2xl font-black text-slate-900">{t.legalTermsTitle}</h1>
            <p className="text-slate-500 text-sm">تاريخ التحديث: 16 يوليو 2026</p>
            <p>أهلاً بك في منصة <strong>Qrytube</strong>. باستخدامك لموقعنا الإلكتروني وأدواتنا لتوليد رموز الاستجابة السريعة (QR Code) والروابط العميقة (Deep Links)، فإنك توافق بالكامل على الشروط والأحكام التالية:</p>
            
            <h3 className="text-lg font-bold text-slate-800 mt-4">1. الاستخدام المقبول للخدمة</h3>
            <p>يُمنح المستخدم حقاً غير حصري ومجاني لاستخدام أدوات المنصة لتوليد الرموز لأغراض شخصية أو تجارية مشروعة. يُحظر تماماً توليد أكواد QR تشير إلى محتوى ضار، احتيالي، أو غير قانوني.</p>

            <h3 className="text-lg font-bold text-slate-800 mt-4">2. حقوق الملكية الفكرية</h3>
            <p>جميع حقوق التصميم والشعارات البرمجية الخاصة بالمنصة هي ملك حصري لـ Qrytube. الرموز المولدة من قبل المستخدم والشعارات التي يقوم برفعها تظل ملكاً خالصاً له.</p>

            <h3 className="text-lg font-bold text-slate-800 mt-4">3. إخلاء المسؤولية</h3>
            <p>تُقدم الخدمات "كما هي" دون أي ضمانات تشغيلية صريحة أو ضمنية. نحن لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة تنجم عن استخدام الرموز أو الروابط العميقة.</p>
          </div>
        )}

        {/* 2. PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h1 className="text-2xl font-black text-slate-900">{t.legalPrivacyTitle}</h1>
            <p className="text-slate-500 text-sm">تاريخ التحديث: 16 يوليو 2026</p>
            <p>نحن في <strong>Qrytube</strong> نولي خصوصيتك وحماية بياناتك أهمية قصوى. يوضح هذا المستند كيف نتعامل مع معلوماتك:</p>

            <h3 className="text-lg font-bold text-slate-800 mt-4">1. معالجة البيانات محلياً بالكامل</h3>
            <p>نحن فخورون بأن منصتنا تعتمد بشكل أساسي على المعالجة المحلية داخل متصفح المستخدم (Client-Side). جميع تعديلات الألوان، وإدراج الشعارات وتصميم الـ QR كود تتم مباشرة على جهازك ولا نقوم برفعها أو تخزينها على خوادمنا نهائياً.</p>

            <h3 className="text-lg font-bold text-slate-800 mt-4">2. ملفات تعريف الارتباط (Cookies)</h3>
            <p>نستخدم ملفات تعريف الارتباط الأساسية فقط لتحسين تجربة تصفحك وتذكر تفضيلات اللغة المختارة (العربية أو الإنجليزية).</p>

            <h3 className="text-lg font-bold text-slate-800 mt-4">3. حماية الروابط الذكية</h3>
            <p>الروابط العميقة المولدة عبر المنصة لا تجمع أي بيانات حساسة عن المستخدمين أو الماسحين، ونحن ملتزمون بتوفير بيئة تصفح خالية تماماً من الإعلانات المزعجة أو التتبع الخبيث.</p>
          </div>
        )}

        {/* 3. ABOUT US */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h1 className="text-2xl font-black text-slate-900">{t.legalAboutTitle}</h1>
            <p><strong>منصة Qrytube</strong> هي الأداة العربية الرائدة والحل التكنولوجي المتكامل لتوليد الروابط العميقة (Deep Links) وأكواد الـ QR كود الذكية مجاناً بنسبة 100% وبدون قيود.</p>
            <p>تأسست المنصة بهدف أساسي وهو حل مشكلة "فخ المتصفحات الداخلية" لمنصات التواصل الاجتماعي (مثل فيسبوك وإنستغرام وتويتر)، والتي تمنع منشئي المحتوى وأصحاب الأعمال من تحويل الزوار إلى مشتركين حقيقيين ومتابعين مخلصين.</p>
            <p>من خلال توجيه الماسحين مباشرة لفتح التطبيقات الرسمية المثبتة على هواتفهم، نضمن لك مضاعفة التفاعل، والاشتراكات، ونمو الحسابات بطرق طبيعية فائقة الكفاءة والسرعة لعام 2026 وما بعده.</p>
          </div>
        )}

        {/* 4. CONTACT US */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h1 className="text-2xl font-black text-slate-900">{t.legalContactTitle}</h1>
            <p>لديك استفسار، اقتراح، أو ترغب في التعاون معنا؟ يسعدنا دائماً تواصلك معنا عبر تعبئة النموذج التالي وسيقوم فريق الدعم بالرد عليك خلال 24 ساعة:</p>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-extrabold">تم إرسال رسالتك بنجاح!</h4>
                  <p className="text-xs">نشكرك على تواصلك مع Qrytube، سنتواصل معك في أقرب وقت ممكن.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 mt-2 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">الاسم الكريم</label>
                    <input required type="text" className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">البريد الإلكتروني</label>
                    <input required type="email" className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">عنوان الرسالة</label>
                  <input required type="text" className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">نص الرسالة</label>
                  <textarea required rows={5} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  إرسال الرسالة المباشرة ✉️
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
