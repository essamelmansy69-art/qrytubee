import React, { useState } from 'react';
import { Language } from '../translations';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQViewProps {
  lang: Language;
}

interface FAQItem {
  q: string;
  a: string;
}

export const FAQView: React.FC<FAQViewProps> = ({ lang }) => {

  const faqData: Record<Language, FAQItem[]> = {
    ar: [
      {
        q: "ما هي ميزة الروابط العميقة الذكية (Deep Links) في موقع Qrytube؟",
        a: "الروابط العميقة الذكية تتيح للزوار والماسحين تخطي فخ المتصفح الداخلي المدمج لتطبيقات مثل فيسبوك وتليجرام، وتوجيههم لفتح تطبيق يوتيوب أو تيك توك أو إنستغرام الرسمي مباشرة. هذا يحل عقبة تسجيل الدخول ويزيد المشاهدات والاشتراكات بنسبة مذهلة."
      },
      {
        q: "هل خدمة تصميم وتوليد الباركود مجانية بالكامل؟",
        a: "نعم، مجانية 100% وإلى الأبد! لا نضع أي إعلانات مزعجة على الأكواد المولدة، ولا نفرض أي رسوم شهرية أو اشتراكات خفية، مما يعطي كودك مظهراً احترافياً أمام متابعيك."
      },
      {
        q: "إذا قمت بتحديث رابط المنيو أو الفيديو، فهل أحتاج لإعادة طباعة الأكواد؟",
        a: "إذا كان الكود يشير إلى رابط ديناميكي ثابت (مثل موقع مطعمك أو رابط مستند Google Drive مستبدل)، فلن تحتاج لإعادة الطباعة أبداً! بمجرد تغيير المحتوى في المصدر، سيظهر التحديث تلقائياً لكل من يمسح الكود المطبوع على الطاولة."
      },
      {
        q: "هل تعمل الأكواد الذكية بكفاءة تحت الإضاءة الخافتة للمطاعم؟",
        a: "بالتأكيد. تولد منصة Qrytube مصفوفات رموز فائقة التباين والوضوح وخيارات تصدير بملفات ناقلة فائقة الجودة. هذا التصميم الهندسي المتقدم يضمن مسح الكود بسهولة فائقة حتى في الإضاءة الرومانسية للمطاعم المقفلة."
      }
    ],
    en: [
      {
        q: "What is the primary benefit of Qrytube's Smart Deep Links?",
        a: "Deep Links enable users to bypass the crippled in-app browser within social platforms (like Facebook or Telegram) and load the destination directly inside official mobile apps (like YouTube or TikTok). This eliminates login barriers and maximizes subscriber conversion rates."
      },
      {
        q: "Is Qrytube's QR code generator completely free?",
        a: "Yes, 100% free forever! We do not overlay any intrusive advertisements on your generated codes, and we require no monthly payments or registrations."
      },
      {
        q: "Do I need to re-print table QR codes if I edit my restaurant menu?",
        a: "No! As long as the QR code directs to a consistent destination URL (like your official website menu page or a shared Google Drive link), you can simply update the file online. The printed code remains completely functional."
      },
      {
        q: "Will Qrytube QR codes scan under low light environments?",
        a: "Absolutely. Qrytube generates high-contrast matrix outputs that scan seamlessly even under dim cozy dining table lighting."
      }
    ]
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6" id="faq_accordion_wrapper">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">الأسئلة الشائعة حول الكود الذكي</h2>
          <p className="text-xs text-slate-500 font-sans">كل ما تحتاج لمعرفته حول الميزات، التحميل، والتخصيص.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {faqData[lang].map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`border border-slate-100 rounded-xl overflow-hidden transition-all duration-300 ${
                isOpen ? 'bg-slate-50/50 border-slate-200' : 'bg-white'
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full py-4 px-5 flex items-center justify-between text-right gap-4 font-bold text-slate-800 hover:text-red-600 transition-colors cursor-pointer"
              >
                <span className="text-sm md:text-base leading-snug">{item.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-red-500' : 'text-slate-400'
                }`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-40 border-t border-slate-150' : 'max-h-0'
                }`}
              >
                <p className="p-5 text-sm md:text-base text-slate-600 leading-relaxed font-sans bg-white">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
