import React from 'react';
import { Dumbbell } from 'lucide-react';

interface GymQRViewProps {
  onSelectPreset: () => void;
}

export const GymQRView: React.FC<GymQRViewProps> = ({ onSelectPreset }) => {

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm animate-fade-in flex flex-col gap-8" id="gym_qr_view">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-72 rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-amber-600 to-amber-900 flex items-center p-6 md:p-12 text-white">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Dumbbell className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col gap-3 relative max-w-xl">
          <span className="bg-amber-500/30 text-amber-200 text-xs font-black px-3 py-1 rounded-full w-max">
            تحديث وتطوير صالات اللياقة البدنية 2026
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            نظام أكواد الجيم الرياضي الذكي (Gym QR)
          </h1>
          <p className="text-sm md:text-base text-amber-100 font-sans">
            ضاعف تفاعل المتدربين، ووزع جداول التمارين ومقاطع شرح الآلات بسهولة عبر مسح باركود واحد سريع وملصق على الآلة.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
            🏋️
          </div>
          <h3 className="font-bold text-slate-800 text-base">دليل استخدام الآلات</h3>
          <p className="text-xs text-slate-500 leading-relaxed">ضع كود QR على كل جهاز يعرض للمتدرب طريقة استخدامه الصحيحة لتفادي أي إصابات.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
            📊
          </div>
          <h3 className="font-bold text-slate-800 text-base">جداول التمارين والوجبات</h3>
          <p className="text-xs text-slate-500 leading-relaxed">توزيع خطط التدريب والأنظمة الغذائية لمتدربيك بلمسة هاتف واحدة وسلسة.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
            🔥
          </div>
          <h3 className="font-bold text-slate-800 text-base">تنشيط الاشتراكات والتجديد</h3>
          <p className="text-xs text-slate-500 leading-relaxed">تسهيل عملية دفع العضوية أو تسجيل المتدربين الجدد عبر البوابة الإلكترونية للجيم.</p>
        </div>
      </div>

      {/* Action panel */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl shrink-0">
            💪
          </div>
          <div className="flex flex-col">
            <h4 className="font-extrabold text-amber-950 text-base">اصنع باركود صالتك الآن</h4>
            <p className="text-xs text-amber-800">اضغط على الزر لتفعيل قالب صالة الجيم الفاخر وابدأ في تشكيل الأكواد الذكية.</p>
          </div>
        </div>
        <button
          onClick={onSelectPreset}
          className="w-full sm:w-auto h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer shrink-0"
        >
          تفعيل القالب وتنسيق الأكواد ✨
        </button>
      </div>
    </div>
  );
};
