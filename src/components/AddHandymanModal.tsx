import React, { useState } from 'react';
import { X, Wrench, User, Phone, MessageCircle, MapPin, Image, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { Handyman } from '../types';

interface AddHandymanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHandyman: (newHandyman: Partial<Handyman>) => void;
  availableProfessions: string[];
}

const COMMON_PROFESSIONS = [
  'سباك',
  'نقاشين',
  'كهربائي',
  'نجار',
  'فنى تكييف',
  'مبلط سراميك',
  'مبيض محارة',
  'حداد',
  'ألوميتال',
  'صيانة أجهزة منزلية'
];

export const AddHandymanModal: React.FC<AddHandymanModalProps> = ({
  isOpen,
  onClose,
  onAddHandyman,
  availableProfessions
}) => {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [areas, setAreas] = useState('القاهرة والجيزة');
  const [imageUrl, setImageUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Combine default professions with available ones from data
  const professionOptions = Array.from(new Set([...COMMON_PROFESSIONS, ...availableProfessions]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('يرجى كتابة الاسم بالكامل');
      return;
    }

    const selectedProf = profession === 'آخر' ? customProfession.trim() : profession.trim();
    if (!selectedProf) {
      setErrorMsg('يرجى تحديد التخصص أو الحرفة');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('يرجى كتابة رقم الهاتف للتواصل');
      return;
    }

    const finalWhatsapp = sameAsPhone ? phone.trim() : (whatsapp.trim() || phone.trim());

    const newHandyman: Partial<Handyman> = {
      name: name.trim(),
      profession: selectedProf,
      phone: phone.trim(),
      whatsapp: finalWhatsapp,
      areas: areas.trim() || 'جميع المحافظات والمناطق',
      imageUrl: imageUrl.trim() || undefined,
      averageRating: 5.0,
      totalReviews: 0,
      approvedComments: []
    };

    onAddHandyman(newHandyman);
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setName('');
    setProfession('');
    setCustomProfession('');
    setPhone('');
    setWhatsapp('');
    setSameAsPhone(true);
    setAreas('القاهرة والجيزة');
    setImageUrl('');
    setSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-amber-500/20 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white">تسجيل صنايعي جديد</h2>
              <p className="text-xs text-slate-300">أدخل بياناتك للانضمام إلى دليل صنايعية مصر المعتمد</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">تم تسجيل بياناتك بنجاح!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  شكراً لك يا <strong>{name}</strong>. تم إضافة بياناتك إلى الدليل وسيظهر اسمك وتخصصك فوراً لعملاء دليل صنايعية مصر.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
                >
                  العودة إلى الدليل
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  الاسم بالكامل <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد محمود العبد"
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  التخصص / الحرفة <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {professionOptions.map((prof) => (
                    <button
                      type="button"
                      key={prof}
                      onClick={() => setProfession(prof)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        profession === prof
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {prof}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setProfession('آخر')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                      profession === 'آخر'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    + تخصص آخر
                  </button>
                </div>

                {profession === 'آخر' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      placeholder="اكتب التخصص الخاص بك هنا..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                )}
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    رقم الهاتف <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    رقم الواتساب
                  </label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="tel"
                      disabled={sameAsPhone}
                      value={sameAsPhone ? phone : whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="01012345678"
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 dir-ltr text-right disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="sameAsPhone"
                  checked={sameAsPhone}
                  onChange={(e) => setSameAsPhone(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 accent-amber-500"
                />
                <label htmlFor="sameAsPhone" className="text-xs font-bold text-slate-700 cursor-pointer">
                  رقم الواتس هو نفس رقم الهاتف
                </label>
              </div>

              {/* Coverage Areas */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  المناطق التي تغطيها
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={areas}
                    onChange={(e) => setAreas(e.target.value)}
                    placeholder="مثال: القاهرة والجيزة، المطرية، عين شمس..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* Work Image Link */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  رابط صورة شخصية أو صور من أفكار وأعمالك (اختياري)
                </label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>تقديم طلب التسجيل مجاناً</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal icon component
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
