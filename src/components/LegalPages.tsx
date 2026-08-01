import React, { useState, useEffect } from 'react';
import { Shield, FileText, Mail, X, ExternalLink, CheckCircle2, Globe, Heart, Building2, UserCheck, Lock } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'contact' | 'sitemap';

interface LegalPagesProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
  onTabChange?: (tab: LegalTab) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ isOpen, onClose, initialTab = 'privacy', onTabChange }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'اقتراح', message: '' });

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTabSelect = (tab: LegalTab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSubmitted(true);
      setTimeout(() => {
        setContactForm({ name: '', email: '', subject: 'اقتراح', message: '' });
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif leading-tight">
                المركز القانوني ومعلومات الدليل
              </h2>
              <p className="text-xs text-slate-300">
                برعاية موقع ديكورا — Dkora Online (dkora.online)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="إغلاق"
            id="close_legal_modal_btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => handleTabSelect('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'privacy'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            id="tab_privacy_btn"
          >
            <Lock className="w-4 h-4" />
            <span>سياسة الخصوصية</span>
          </button>

          <button
            onClick={() => handleTabSelect('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'terms'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            id="tab_terms_btn"
          >
            <FileText className="w-4 h-4" />
            <span>الشروط والأحكام</span>
          </button>

          <button
            onClick={() => handleTabSelect('contact')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'contact'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            id="tab_contact_btn"
          >
            <Mail className="w-4 h-4" />
            <span>عن الدليل واتصل بنا</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-700 leading-relaxed text-sm">

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  تحديث ٢٠٢٦ المعياري
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif mt-2">
                  سياسة الخصوصية وحماية البيانات
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  تاريخ آخر تحديث: ٣١ يوليو ٢٠٢٦
                </p>
              </div>

              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  أهلاً بكم في <strong>دليل صنايعية مصر</strong>، المبادرة الرقمية الخدمية التي تعمل برعاية موقع 
                  <a href="https://dkora.online" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-bold mx-1 hover:underline">
                    ديكورا (dkora.online)
                  </a>. نولي أهمية قصوى لحماية خصوصية زوارنا ومستخدمينا وصنايعية مصر الكرام، وتوضح هذه الوثيقة نوعية المعلومات التي نجمعها وكيفية معالجتها واستخدامها لحماية حقوق الجميع.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                    <span>١. المعلومات التي نجمعها وكيفية جمعها</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    نجمع البيانات المعروضة في الدليل فقط عند قيام الفني أو الصنايعي بتعبئة نموذج التسجيل التطوعي المجاني، وتشمل: الاسم التجاري أو الشخصي، التخصص أو المهنة، أرقام التواصل والواتساب المباشرة، والمنطقة أو المحافظة. كما نجمع بيانات تصفح غير شخصية (مثل نوع المتصفح ومعدل التفاعل) لتحسين الأداء.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                    <span>٢. ملفات تعريف الارتباط (Cookies) والتقنيات المماثلة</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يستخدم الموقع ملفات الكوكيز (Cookies) والتخزين المحلي المحفوظ (localStorage) لتخزين تفضيلات المستخدم وتسريع تحميل بيانات الدليل محلياً دون الحاجة إلى الانتظار. كما تستخدم خدمات التحليل المعتمدة لدينا مثل (Google Analytics) ملفات الكوكيز لتجميع إحصاءات عامة ومجهولة حول كيفية تصفح الزوار للموقع.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                    <span>٣. شركاء الإعلانات والموردون الخارجيون</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    قد يتعاون موقعنا مع شبكات ومزودي إعلانات وموردين خارجيين لعرض إعلانات مخصصة للمستخدمين بناءً على زياراتهم السابقة لهذا الموقع أو لمواقع أخرى على شبكة الإنترنت. تستخدم هذه الشركات تقنيات مثل ملفات تعريف الارتباط والإشارات المائية لقياس مدى فاعلية الإعلانات ومحتواها. يحق للمستخدم التحكم في تفضيلات الإعلانات أو تعطيل الكوكيز من إعدادات متصفحه في أي وقت.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                    <span>٤. حماية البيانات وأمان المعلومات</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    نحن لا نبيع، ولا نؤجر، ولا نشارك أي بيانات شخصية تخص مستخدمي الدليل مع أي جهات خارجية لأغراض التسويق المباشر. جميع أرقام التواصل المعروضة هي الأرقام التي وافق الفنيون على إتاحتها علناً للعملاء بغرض التواصل المباشر لطلب خدمات الصيانة والديكور.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                    <span>٥. حقوق المستخدم وحذف البيانات</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يحق لأي صنايعي أو فني مسجل في الدليل طلب تعديل أو تحديث أو حذف بياناته بشكل نهائي ومجاني في أي وقت عبر مراسلتنا من خلال صفحة "اتصل بنا".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS TAB */}
          {activeTab === 'terms' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  شروط الاستخدام الرسمية
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif mt-2">
                  الشروط والأحكام واشتراطات الاستخدام
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يسري على كافة مستخدمي وزوار دليل صنايعية مصر
                </p>
              </div>

              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  مرحباً بكم في <strong>دليل صنايعية مصر</strong>. بالوصول إلى هذا الموقع أو استخدامه، فإنك توافق على الالتزام بالشروط والأحكام التالية:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">١. طبيعة الخدمة وإخلاء المسؤولية القانونية</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    دليل صنايعية مصر هو دليل خدمي رقمي مجاني ووسيط يهدف لتسهيل الوصول المباشر بين طالب الخدمة (العميل) ومقدمها (الصنايعي/الفني) بدون أي عمولات أو رسوم وساطة. 
                    <strong> إن موقع ديكورا (dkora.online) وإدارة الدليل لا يعتبران طرفاً في أية عقود أو اتفاقات مالية أو تنفيذية تتم بين العميل والفني.</strong> تقع مسؤولية الاتفاق على المعاينة، الأسعار، جودة المواد، ومواعيد التسليم مباشرة على عاتق طرفي التعامل.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">٢. ضوابط تسجيل الصنايعية والفنيين</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يتعهد الفني أو الصنايعي بتقديم معلومات صحيحة ودقيقة تخص مهنته وأرقام تواصله ومناطق عمله. وتحتفظ إدارة الدليل بحق مراجعة أي طلب وتسجيل، وتجميد أو إزالة أي ملف شخصي يثبت تقديم بيانات غير صحيحة أو صدور شكاوى موثقة ضد صاحبه.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">٣. حقوق الملكية الفكرية</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    جميع محتويات هذا الموقع من تصميمات، شعارات، برمجيات، وتنسيقات هي ملك لـ 
                    <strong>موقع ديكورا (dkora.online)</strong> ومحمية بموجب قوانين الملكية الفكرية. يُحظر نسخ أو إعادة نشر قاعدة البيانات لأغراض تجارية دون الحصول على إذن كتابي مسبق.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">٤. تعديل الشروط</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    تحتفظ إدارة الدليل بحق تعديل أو تحديث هذه الشروط والأحكام في أي وقت. وتعتبر التغييرات نافذة فور نشرها على هذه الصفحة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT & CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  رؤية الخدمة والتواصل
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif mt-2">
                  عن دليل صنايعية مصر والتواصل معنا
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* About Box */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                    <span>من نحن ورؤيتنا</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>دليل صنايعية مصر</strong> هو منصة رقمية خدمية أُطلقت برعاية رسمية ومباشرة من 
                    <a href="https://dkora.online" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline font-bold mx-1">
                      موقع ديكورا (dkora.online)
                    </a>، بهدف تمكين المواطنين في جميع المحافظات من الوصول الفوري لأشطر وأجود الفنيين والصنايعية المعتمدين (سباكة، كهرباء، نقاشة، نجارة، تكييف، ألوميتال) مجاناً وبلا وسناء أو عمولات.
                  </p>
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>فنيون معتمدون ومراجعة مباشرة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>تغطية وشراكة لجميع محافظات مصر</span>
                    </div>
                  </div>
                </div>

                {/* Contact Form Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  {contactSubmitted ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">تم استلام رسالتك بنجاح!</h4>
                      <p className="text-xs text-slate-600">
                        شكراً لتواصلك معنا. سيقوم فريق دعم دليل صنايعية مصر وموقع ديكورا بالمراجعة والرد في أقرب وقت.
                      </p>
                      <button
                        onClick={() => setContactSubmitted(false)}
                        className="text-xs font-bold text-amber-600 underline pt-2"
                      >
                        إرسال رسالة أخرى
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                      <h4 className="font-bold text-slate-900 text-base mb-1">راسل فريق الدعم والديكور</h4>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">الاسم الكريم</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="اكتب اسمك هنا..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="example@domain.com"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">سبب التواصل</label>
                        <select
                          value={contactForm.subject}
                          onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="اقتراح">اقتراح أو ملاحظة</option>
                          <option value="تحديث بيانات">تحديث أو تعديل بيانات صنايعي</option>
                          <option value="شكوى">تقديم بلاغ أو شكوى</option>
                          <option value="رعاية وإعلان">استفسار عن الرعاية والرعاية الإعلانية</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">الرسالة أو الاستفسار</label>
                        <textarea
                          rows={3}
                          required
                          value={contactForm.message}
                          onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="اكتب تفاصيل رسالتك..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                      >
                        إرسال الرسالة
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}


        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1">
            <span>حقوق الطبع والنشر © 2026</span>
            <span className="font-bold text-slate-700">دليل صنايعية مصر</span>
            <span>برعاية</span>
            <a href="https://dkora.online" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-600 hover:underline inline-flex items-center gap-0.5">
              <span>موقع ديكورا</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
