/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import QRGenerator from './components/QRGenerator';
import { 
  Youtube, 
  Sparkles, 
  Smartphone, 
  Tv, 
  Flame, 
  TrendingUp, 
  HelpCircle, 
  Github, 
  CheckCircle2, 
  Share2, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'faq' | 'tips'>('generator');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-red-100 selection:text-red-700" id="main_app_wrapper">
      
      {/* 1. STUNNING HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" id="app_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 glow-youtube">
              <Youtube size={22} />
            </span>
            <div className="flex flex-col text-right">
              <h1 className="text-md sm:text-lg font-extrabold font-arabic text-gray-900 tracking-tight leading-none">
                QR Deep Linker
              </h1>
              <span className="text-[10px] font-medium font-arabic text-gray-400 mt-0.5">
                مولد كيو آر يوتيوب الذكي
              </span>
            </div>
          </div>

          {/* Quick navigation links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/75 p-1 rounded-xl font-arabic text-sm" id="main_navigation">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'generator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              المنصة والأداة
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'tips' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              نصائح التفاعل والمشاهدات
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'faq' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              الأسئلة الشائعة
            </button>
          </nav>

          {/* Right badge / Action badge */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 py-1 px-3 bg-red-50 text-red-600 text-xs font-semibold rounded-full font-arabic">
              <Flame size={12} />
              مجاني بالكامل بدون إعلانات
            </span>
            <span className="text-xs bg-slate-900 text-white font-semibold py-1.5 px-3 rounded-xl shadow-xs font-arabic">
              إصدار بيتا الذكي v1.2
            </span>
          </div>

        </div>
      </header>

      {/* 2. HERO CONTENT SECTION */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-12 border-b border-slate-100 text-center relative overflow-hidden" id="hero_section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-20 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center flex flex-col items-center">
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-700 text-xs font-bold rounded-lg font-arabic mb-4">
            <Sparkles size={13} className="text-yellow-600" />
            أفضل أداة مجانية لرفع اشتراكات وتفاعل قناتك لعام 2026
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-arabic text-slate-900 leading-tight tracking-tight lg:leading-normal">
            حول روابط اليوتيوب إلى رموز <span className="text-red-600 block sm:inline-block">QR بالروابط العميقة</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-500 font-arabic max-w-2xl leading-relaxed">
            اجبر هواتف المستخدمين على فتح <strong className="text-slate-800">تطبيق YouTube الرسمي مباشرة</strong> بدلاً من المتصفحات الميتة للإنستغرام والفيسبوك. ضع شعارك المخصص وتحكّم بالألوان مجاناً!
          </p>

          {/* Core Values badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-gray-500 font-arabic font-medium" id="value_badges">
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-3xs">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>لوجو مخصص بالمنتصف</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-3xs">
              <Smartphone size={14} className="text-red-500" />
              <span>ديب لينك (Deep Link) مباشر</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-3xs">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>جودة طباعة فائقة 4K</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAIN WORKSPACE / INTERACTIVE PLATFORM */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="main_workspace">
        
        {/* Dynamic Navigation Tabs Content render */}
        {activeTab === 'generator' && (
          <div className="transition-opacity duration-300">
            <QRGenerator />
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs max-w-4xl mx-auto text-right space-y-8" id="tips_tab_content">
            <div className="flex items-center gap-3 justify-end pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-bold font-arabic text-slate-900">
                كيف تستغل كود الـ QR لزيادة عدد المشتركين الحقيقيين؟
              </h2>
              <span className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-2xl">
                <TrendingUp size={22} />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                <h3 className="font-bold text-gray-800 font-arabic text-base">📌 طباعة الكود على المنتجات والكراتين</h3>
                <p className="text-xs text-gray-600 font-arabic leading-relaxed">
                  إذا كنت تملك متجراً إلكترونياً أو مطعماً، قم بطباعة رمز كود الـ QR للرابط العميق لقناتك على الكرتون الخارجي أو الفاتورة. مع كتابة جملة محفزة مثل: "امسح لمشاهدة طريقة الاستخدام المثالية والاشتراك في عائلتنا بضغطة واحدة!".
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                <h3 className="font-bold text-gray-800 font-arabic text-base">📌 على بطاقات العمل وبروشور المعارض</h3>
                <p className="text-xs text-gray-600 font-arabic leading-relaxed">
                  عند تصميم بطاقة الأعمال الخاصة بك (Business Card)، ضع رمز الـ QR بالمنتصف للروابط العميقة لكي يتمكن العميل من فتح قناتك أو الفيديو التعريفي لك مباشرة على تلفونه دون عناء كتابة الرابط أو البحث باسم القناة.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                <h3 className="font-bold text-gray-800 font-arabic text-base">📌 صور وفيديوهات إنستغرام وتيك توك</h3>
                <p className="text-xs text-gray-600 font-arabic leading-relaxed">
                  إنستغرام وتيك توك لا يسمحان بالوصول للروابط بسهولة، يمكنك وضع صورة لكود الـ QR في نهاية الفيديوهات الخاصة بك، حاداً المشاهدين على إجراء لقطة شاشة (Screenshot) ومن ثم مسحها مباشرة للانتقال لجزء آخر من المقاطع على يوتيوب.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                <h3 className="font-bold text-gray-800 font-arabic text-base">📌 قنوات البث المباشر (Streaming)</h3>
                <p className="text-xs text-gray-600 font-arabic leading-relaxed">
                  إذا كنت تبث مباشرة على Twitch أو Facebook Gaming، ضع كود الـ QR المخصص في زاوية الشاشة طوال البث. بمجرد أن يمسحه الزوار، سيفتح تطبيق يوتيوب لديهم مباشرة، ويشتركون بقناتك على الفور دون قطع مشاهدة البث الحالي بشكل مزعج.
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setActiveTab('generator')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all cursor-pointer shadow-md"
                type="button"
              >
                العودة لتوليد كود الـ QR الآن
              </button>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs max-w-4xl mx-auto text-right space-y-6" id="faq_tab_content">
            <div className="flex items-center gap-3 justify-end pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-bold font-arabic text-slate-900">الأسئلة المتكررة والشائعة</h2>
              <span className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
                <HelpCircle size={22} />
              </span>
            </div>

            <div className="space-y-4" id="faq_accordion">
              <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <h3 className="font-bold text-slate-800 font-arabic text-sm">س: لماذا يختلف الرابط داخل كود الـ QR عن الرابط العادي؟</h3>
                <p className="text-xs text-slate-500 font-arabic leading-relaxed">
                  ج: نقوم بتحويل الرابط من الصيغة الافتراضية للويب (https) إلى بروتوكول تطبيق اليوتيوب (مثل vnd.youtube لـ Android و iOS أو youtube://). الهاتف يقرأ هذا البروتوكول فيعرف مباشرة أن المستلم هو تطبيق اليوتيوب الأساسي وليس متصفح إنترنت عادي، فيفتح التطبيق الرسمي فوراً.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <h3 className="font-bold text-slate-800 font-arabic text-sm">س: هل يمكنني تعديل لون الـ QR أو وضع شعاري دون أن يتعطل المسح؟</h3>
                <p className="text-xs text-slate-500 font-arabic leading-relaxed">
                  ج: نعم وبكل ثقة! أداتنا تقوم بصنع الكود مع تفعيل ميزة "تصحيح الخطأ بمستوى عالي جدًا H". تعني هذه الميزة أن كود الـ QR يحمل نقاطاً إضافية احتياطية تعويضية تمكن الكاميرا من قراءة الرابط بالكامل وبسرعة قصوى حتى وإن كان هناك شعار أو لوجو يغلق 30% من مساحة منتصف الكود.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <h3 className="font-bold text-slate-800 font-arabic text-sm">س: هل أحصل على الصورة بأعلى جودة للطباعة الورقية الكبيرة والمطابع؟</h3>
                <p className="text-xs text-slate-500 font-arabic leading-relaxed">
                  ج: بالتأكيد! تتيح لك الأداة تحميل الصورة بدقات فائقة تبدأ من 512 بكسل وتصل إلى 4096 × 4096 بكسل (أكثر من جودة 4K)، مما يتيح لك طباعة الكود على لافتات كبيرة جداً في الشوارع أو صالات العرض دون حدوث أي تغبيش أو بكسلة في الصورة.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <h3 className="font-bold text-slate-800 font-arabic text-sm">س: هل الخدمة مجانية وهل الروابط آمنة؟</h3>
                <p className="text-xs text-slate-500 font-arabic leading-relaxed">
                  ج: نعم، الخدمة مجانية 100% للأبد ودون عرض أي نوع من الإعلانات المزعجة لصناع المحتوى. الروابط آمنة تماماً لأن التشفير والتحويل وتضمين الصورة يتم بالكامل محلياً داخل متصفحك وبشكل سريع!
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setActiveTab('generator')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic transition-all cursor-pointer shadow-md"
                type="button"
              >
                العودة لتوليد كود الـ QR الآن
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 4. PROFESSIONAL BEAUTIFUL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-right mt-16" id="app_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Column 1: Branding block */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <span className="p-2.5 bg-red-600/90 text-white rounded-2xl flex items-center justify-center">
                  <Youtube size={18} />
                </span>
                <span className="text-lg font-bold font-arabic text-white">QR Deep Linker for Creators</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-arabic">
                أداة متقدمة تم بناؤها لصناع المحتوى ومسوقي قنوات يوتيوب لتجاوز عوائق المتصفحات الداخلية في تطبيقات التواصل الاجتماعي وتحقيق نسبة تحويل تفاعل قياسية.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-4 space-y-3 font-arabic">
              <span className="text-xs font-bold text-white uppercase block">روابط سريعة</span>
              <div className="flex flex-col gap-2 text-xs">
                <button onClick={() => setActiveTab('generator')} className="hover:text-white text-right cursor-pointer">منصة التوليد</button>
                <button onClick={() => setActiveTab('tips')} className="hover:text-white text-right cursor-pointer">نصائح لزيادة المشاهدات والاستجابة</button>
                <button onClick={() => setActiveTab('faq')} className="hover:text-white text-right cursor-pointer">الأسئلة والأجوبة التفصيلية</button>
              </div>
            </div>

            {/* Column 3: Quality declarations */}
            <div className="md:col-span-3 space-y-3 font-arabic">
              <span className="text-xs font-bold text-white uppercase block">ضمان الموثوقية والأمان</span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                هذه الأداة تتم معالجة بياناتها بالكامل محلياً على جهاز المستخدم لضمان الخصوصية وسرية الروابط التي يتم إدخالها.
              </p>
            </div>

          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-arabic gap-4">
            <span dir="ltr">© 2026 YouTube QR Deep Linker. All rights reserved.</span>
            <span>بُنيت الأداة بكل حب لتطوير وتعميم المحتوى العربي الذكي 🚀</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
