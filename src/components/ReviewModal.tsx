import React, { useState } from 'react';
import { Star, X, Send, User, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Handyman, Review } from '../types';
import { saveUserReview } from '../utils/handymanService';

interface ReviewModalProps {
  handyman: Handyman;
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded: (newReview: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  handyman,
  isOpen,
  onClose,
  onReviewAdded
}) => {
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const reviewsList = handyman.reviews || [];
  const avgRating = handyman.averageRating || (reviewsList.length > 0 ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1) : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      alert('يرجى كتابة اسمك الكريِم');
      return;
    }
    if (!comment.trim()) {
      alert('يرجى إضافة تعليقك أو رأيك');
      return;
    }

    setIsSubmitting(true);

    // Save review
    const newRev = saveUserReview({
      handymanName: handyman.name,
      reviewerName: reviewerName.trim(),
      rating,
      comment: comment.trim(),
      isApproved: true
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      onReviewAdded(newRev);

      setTimeout(() => {
        setSubmitSuccess(false);
        setComment('');
        setReviewerName('');
      }, 2000);
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id={`review_modal_${handyman.id}`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0">
              {handyman.name.charAt(0) || 'ص'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-snug">
                تقييمات {handyman.name}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {handyman.profession} • {handyman.areas || 'المطرية والقاهرة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="إغلاق النافذة"
            id="close_review_modal_btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Summary Header */}
        <div className="bg-amber-50/80 border-b border-amber-100/80 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    avgRating && Number(avgRating) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-black text-slate-900">
              {avgRating ? `${avgRating} من 5` : 'لا توجد تقييمات سابقة'}
            </span>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
            {reviewsList.length} {reviewsList.length === 1 ? 'تقييم' : 'تقييمات'}
          </span>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-right dir-rtl">
          {/* Section 1: Previous Reviews */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>آراء وتقييمات العملاء</span>
            </h4>

            {reviewsList.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                <Star className="w-8 h-8 text-amber-300 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-700">لا توجد تقييمات مسجلة بعد</p>
                <p className="text-xs text-slate-500 mt-1">شاركت مع الصنايعي؟ كن أول من يضيف تقييمه وتجربته!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {rev.reviewerName.charAt(0) || 'ع'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{rev.reviewerName}</span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-xs text-slate-700 font-medium leading-relaxed pr-9">
                        "{rev.comment}"
                      </p>
                    )}

                    {rev.timestamp && (
                      <p className="text-[10px] text-slate-400 pr-9">
                        {rev.timestamp}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Add New Review Form */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>أضف تقييمك وتجربتك</span>
            </h4>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center flex items-center justify-center gap-2 font-bold text-xs animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تم إرسال تقييمك بنجاح وسظهر في القائمة فوراً!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Interactive Star Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اختر التقييم بالنجوم:
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                        title={`${s} من 5`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            (hoverRating || rating) >= s
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="mr-2 text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسمك الكريِم:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسمك"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-slate-50 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رأيك أو تعليقك على الخدمة:
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="اكتب تجربتك مع الصنايعي من حيث الالتزام، جودة الشغل، والأسعار..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-slate-50 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id={`submit_review_btn_${handyman.id}`}
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? 'جاري حفظ التقييم...' : 'إرسال التقييم'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
