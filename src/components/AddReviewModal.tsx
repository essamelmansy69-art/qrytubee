import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquarePlus, User, MessageSquare, CheckCircle2, Send, AlertCircle, Wrench, FileSpreadsheet, ExternalLink, Sparkles } from 'lucide-react';
import { Handyman } from '../types';
import { GOOGLE_SHEET_EDIT_URL } from '../utils/handymanService';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  handymen: Handyman[];
  initialHandymanId?: string;
  onAddReview: (handymanId: string, reviewerName: string, rating: number, comment: string) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  handymen,
  initialHandymanId,
  onAddReview
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'google_form'>('app');
  const [googleFormUrl, setGoogleFormUrl] = useState<string>(GOOGLE_SHEET_EDIT_URL);

  const [selectedId, setSelectedId] = useState<string>(initialHandymanId || '');
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialHandymanId) {
      setSelectedId(initialHandymanId);
    } else if (handymen.length > 0 && !selectedId) {
      setSelectedId(handymen[0].id);
    }
  }, [initialHandymanId, handymen]);

  if (!isOpen) return null;

  const targetHandyman = handymen.find(h => h.id === selectedId) || (handymen.length > 0 ? handymen[0] : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedId && !targetHandyman) {
      setErrorMsg('يرجى اختيار الصنايعي المراد تقييمه');
      return;
    }

    if (!reviewerName.trim()) {
      setErrorMsg('يرجى كتابة اسمك أو كنيتك الكريم');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('يرجى إضافة تعليق أو رأيك حول خدمة الصنايعي');
      return;
    }

    const finalHandymanId = targetHandyman ? targetHandyman.id : selectedId;

    onAddReview(finalHandymanId, reviewerName.trim(), rating, comment.trim());
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setReviewerName('');
    setRating(5);
    setHoverRating(0);
    setComment('');
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
              <MessageSquarePlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white">إضافة تقييم ورأي</h2>
              <p className="text-xs text-slate-300">شارك تجربتك مع الصنايعي لمساعدة باقي العملاء</p>
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

        {/* Tab Selection */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('app')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'app'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>إضافة تقييم مباشر للموقع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google_form')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'google_form'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>نموذج Google Form الرسمي</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'google_form' ? (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>إرسال التقييم عبر نموذج Google Form الرسمي</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  عند التقييم باستخدام نموذج Google Form الرسمي، يتم توثيق تقييمك ورأيك مباشرة في جدول Google Sheets المعتمد الخاص بالموقع لضمان عدم الضياع.
                </p>
                <div className="pt-2">
                  <a
                    href={googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>فتح نموذج Google Form للتقييم</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  رابط Google Form الخاص بك:
                </label>
                <input
                  type="url"
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 dir-ltr text-left"
                />
              </div>
            </div>
          ) : submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">تم إضافة تقييمك بنجاح!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  شكراً لك يا <strong>{reviewerName}</strong>. تم نشر تقييمك للصنايعي <strong>{targetHandyman?.name}</strong> وتحديث معدل التقييمات فوراً في دليل مصر.
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

              {/* Handyman Selector / Card info */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  الصنايعي المراد تقييمه <span className="text-rose-500">*</span>
                </label>

                {initialHandymanId && targetHandyman ? (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0">
                      {targetHandyman.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{targetHandyman.name}</h4>
                      <p className="text-xs text-amber-900 font-medium flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-amber-600" />
                        <span>{targetHandyman.profession}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {handymen.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} - {h.profession} ({h.areas || 'جميع المناطق'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  اسمك أو كنيتك <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="مثال: أبو كريم - المطرية"
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  تقييمك للخدمة (من 1 إلى 5 نجوم) <span className="text-rose-500">*</span>
                </label>
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2 dir-ltr">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform active:scale-125 focus:outline-none"
                        aria-label={`تقييم ${star} نجوم`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'text-slate-300 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-amber-900">
                    {rating === 5 && 'ممتاز جداً ⭐⭐⭐⭐⭐'}
                    {rating === 4 && 'جيد جداً ⭐⭐⭐⭐'}
                    {rating === 3 && 'جيد ⭐⭐⭐'}
                    {rating === 2 && 'مقبول ⭐⭐'}
                    {rating === 1 && 'ضعيف ⭐'}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  رأيك أو تعليقك عن جودة ودقة شغل الصنايعي <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="اكتب تجربتك بالتفصيل (مثل: التزام بالمواعيد، نظافة المكان، جودة التشطيب...)"
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
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
                  <span>إرسال التقييم فوراً</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
