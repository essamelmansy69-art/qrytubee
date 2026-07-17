import React from 'react';
import { Utensils } from 'lucide-react';

interface RestaurantQRViewProps {
  onSelectPreset: () => void;
}

export const RestaurantQRView: React.FC<RestaurantQRViewProps> = ({ onSelectPreset }) => {

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm animate-fade-in flex flex-col gap-8" id="restaurant_qr_view">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-72 rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-emerald-600 to-teal-800 flex items-center p-6 md:p-12 text-white">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Utensils className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col gap-3 relative max-w-xl">
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-black px-3 py-1 rounded-full w-max">
            تكنولوجيا الضيافة المتقدمة 2026
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            منيو مطعم كيو ار كود مجاني 100%
          </h1>
          <p className="text-sm md:text-base text-emerald-100 font-sans">
            وفر تكاليف الطباعة الباهظة وزد قيمة الطلبات بنسبة 25% مع باركود المنيو التفاعلي فائق الدقة.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
            🍔
          </div>
          <h3 className="font-bold text-slate-800 text-base">تحديث فوري للوجبات</h3>
          <p className="text-xs text-slate-500 leading-relaxed">غير الأسعار وأضف الأطباق اليومية دون الحاجة لإعادة طباعة الأكواد على الطاولات.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
            ⚡
          </div>
          <h3 className="font-bold text-slate-800 text-base">مسح فائق السرعة</h3>
          <p className="text-xs text-slate-500 leading-relaxed">أكواد عالية التباين والوضوح تُمسح بكاميرات الهواتف فوراً حتى تحت الإضاءة الخافتة.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
            🌱
          </div>
          <h3 className="font-bold text-slate-800 text-base">صديق للبيئة وصحي</h3>
          <p className="text-xs text-slate-500 leading-relaxed">قلل استخدام الورق وامنح زبائنك تجربة طلب آمنة بالكامل وخالية من التلامس.</p>
        </div>
      </div>

      {/* Action panel */}
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl shrink-0">
            🪄
          </div>
          <div className="flex flex-col">
            <h4 className="font-extrabold text-emerald-950 text-base">ابدأ بتصميمه فوراً</h4>
            <p className="text-xs text-emerald-800">انقر على الزر لتفعيل قالب منيو المطعم الجاهز وتعديله بما يناسب علامتك التجارية.</p>
          </div>
        </div>
        <button
          onClick={onSelectPreset}
          className="w-full sm:w-auto h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer shrink-0"
        >
          تفعيل القالب وتجهيز المنيو ✨
        </button>
      </div>
    </div>
  );
};
