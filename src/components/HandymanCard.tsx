import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Phone, MessageCircle, MapPin, CheckCircle2, Copy, Check, Share2, 
  Wrench, Facebook, X, Star, MessageSquare, ChevronDown, ChevronUp, Plus, Send 
} from 'lucide-react';
import { Handyman, Review } from '../types';
import { formatWhatsAppLink } from '../utils/handymanService';
import { calculateHandymanRating, saveLocalReview } from '../utils/reviewsService';

interface HandymanCardProps {
  handyman: Handyman;
  allReviews?: Review[];
  onReviewSubmitted?: () => void;
}

export const HandymanCard: React.FC<HandymanCardProps> = ({ 
  handyman, 
  allReviews = [], 
  onReviewSubmitted 
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Reviews state
  const [showReviewsDrawer, setShowReviewsDrawer] = useState(false);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Calculate rating & approved reviews for this handyman
  const { approvedReviews, averageRating, totalReviewsCount } = useMemo(() => {
    return calculateHandymanRating(handyman.name, allReviews);
  }, [handyman.name, allReviews]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const handleCopyPhone = () => {
    if (handyman.phone) {
      navigator.clipboard.writeText(handyman.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `صنايعي معتمد: ${handyman.name} (${handyman.profession})\nالتقييم: ⭐ ${averageRating} (${totalReviewsCount} تقييم)\nالمناطق المخدومة: ${handyman.areas || 'القاهرة والمناطق المجاورة'}\nرقم الهاتف: ${handyman.phone || handyman.whatsapp}\nعبر دليل صنايعية مصر: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${handyman.name} - ${handyman.profession}`,
          text: shareText,
          url: window.location.href,
        });
        setShowShareMenu(false);
        return;
      } catch (err) {
        // Fall back to dropdown menu
      }
    }
    setShowShareMenu(!showShareMenu);
  };

  const shareToWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const copyShareText = () => {
    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => {
      setShareCopied(false);
      setShowShareMenu(false);
    }, 1800);
  };

  const getProfessionBadgeColor = (prof: string) => {
    if (prof.includes('سباك')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (prof.includes('نقاش')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (prof.includes('كهربائي')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (prof.includes('نجار')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (prof.includes('تكييف')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    saveLocalReview(
      handyman.name,
      reviewerName.trim() || 'عميل ديكورا',
      ratingValue,
      commentText.trim()
    );

    // Exact Egyptian Arabic success message as requested
    setSubmitSuccessMsg("تم حفظ تقييمك محلياً وسيظهر للجميع فور اعتماده من الإدارة");

    setReviewerName('');
    setCommentText('');
    setRatingValue(5);

    if (onReviewSubmitted) {
      onReviewSubmitted();
    }

    setTimeout(() => {
      setSubmitSuccessMsg(null);
      setShowAddReviewForm(false);
    }, 4500);
  };

  const waLink = formatWhatsAppLink(handyman.whatsapp || handyman.phone);
  const telLink = handyman.phone ? `tel:${handyman.phone}` : '#';

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
      id={`handyman_card_${handyman.id}`}
    >
      <div className="p-4 sm:p-5">
        {/* Top Badge & Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar / Profile Image */}
            <div className="relative">
              {handyman.imageUrl ? (
                <img
                  src={handyman.imageUrl}
                  alt={handyman.name}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs border border-amber-400/30';
                      fallback.innerText = handyman.name.charAt(0) || 'ص';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs border border-amber-400/30">
                  {handyman.name.charAt(0) || 'ص'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="صنايعي نشط ومعتمد">
                <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                {handyman.name}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-extrabold border ${getProfessionBadgeColor(handyman.profession)}`}>
                  <Wrench className="w-3 h-3" />
                  {handyman.profession}
                </span>

                {/* Rating Badge ⭐ */}
                <div 
                  onClick={() => setShowReviewsDrawer(!showReviewsDrawer)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-900 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                  title="التقييم العام"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span>{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
                  <span className="text-amber-700/80 font-normal text-[11px]">
                    ({totalReviewsCount > 0 ? `${totalReviewsCount} تقييم` : 'جديد'})
                  </span>
                </div>

                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  معتمد ✓
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Copy & Share) */}
          <div className="flex items-center gap-1 relative" ref={shareMenuRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              title="مشاركة بيانات الصنايعي"
              aria-label={`مشاركة بيانات الصنايعي ${handyman.name}`}
              className="p-2 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
              id={`share_btn_${handyman.id}`}
            >
              <Share2 className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={handleCopyPhone}
              title="نسخ رقم الهاتف"
              aria-label={`نسخ رقم هاتف ${handyman.name}`}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
              id={`copy_btn_${handyman.id}`}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Social Share Dropdown */}
            {showShareMenu && (
              <div className="absolute top-10 left-0 z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-xs font-bold text-slate-800">مشاركة الصنايعي</span>
                  <button 
                    onClick={() => setShowShareMenu(false)}
                    aria-label="إغلاق قائمة المشاركة"
                    className="text-slate-500 hover:text-slate-700 p-0.5 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={shareToWhatsApp}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors text-right"
                    id={`share_wa_${handyman.id}`}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>مشاركة عبر واتساب</span>
                  </button>

                  <button
                    onClick={shareToFacebook}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors text-right"
                    id={`share_fb_${handyman.id}`}
                  >
                    <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>مشاركة عبر فيسبوك</span>
                  </button>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors text-right"
                      id={`share_native_${handyman.id}`}
                    >
                      <Share2 className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>مشاركة التطبيق الأصلي</span>
                    </button>
                  )}

                  <button
                    onClick={copyShareText}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors text-right"
                    id={`share_copy_text_${handyman.id}`}
                  >
                    {shareCopied ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span>{shareCopied ? 'تم نسخ البيانات!' : 'نسخ نص البيانات'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 font-medium leading-relaxed">
            <span className="text-slate-700 font-bold">المناطق المخدومة: </span>
            <strong className="text-slate-900">{handyman.areas || 'المطرية والمناطق المجاورة'}</strong>
          </div>
        </div>

        {/* Expandable Reviews & Add Review Action Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowReviewsDrawer(!showReviewsDrawer)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-200 transition-all active:scale-95"
            id={`toggle_reviews_btn_${handyman.id}`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>عرض التقييمات والآراء</span>
            {totalReviewsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {totalReviewsCount}
              </span>
            )}
            {showReviewsDrawer ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          <button
            onClick={() => {
              setShowAddReviewForm(!showAddReviewForm);
              if (!showReviewsDrawer) setShowReviewsDrawer(true);
            }}
            className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-all active:scale-95"
            id={`add_review_btn_${handyman.id}`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>أضف تقييمك</span>
          </button>
        </div>

        {/* Expandable Drawer for Reviews & Add Review Form */}
        {showReviewsDrawer && (
          <div className="mt-3 bg-slate-50 rounded-2xl p-3 border border-slate-200/80 animate-in fade-in duration-200 space-y-3">
            {/* Success Toast in Egyptian Arabic */}
            {submitSuccessMsg && (
              <div className="bg-emerald-500 text-white text-xs font-bold p-3 rounded-xl shadow-xs border border-emerald-600 flex items-center gap-2 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                <span>{submitSuccessMsg}</span>
              </div>
            )}

            {/* Add Review Form */}
            {showAddReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    كتابة تقييم جديد لـ {handyman.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddReviewForm(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    اسمك الكريم:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد مصطفى"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    id={`reviewer_name_input_${handyman.id}`}
                  />
                </div>

                {/* Star Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    التقييم بالنجوم:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || ratingValue)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-700 mr-2">
                      ({ratingValue} من 5)
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    تعليقك ورأيك في الخدمة:
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="اكتب تجربتك مع الصنايعي ومدى التزامه وجودة شغل شغل وإتقانه..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    id={`comment_input_${handyman.id}`}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95"
                  id={`submit_review_btn_${handyman.id}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال التقييم</span>
                </button>
              </form>
            )}

            {/* List of Approved Reviews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  الآراء والتقييمات المسجلة ({approvedReviews.length}):
                </span>
                {totalReviewsCount > 0 && (
                  <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                    متوسط التقييم: ⭐ {averageRating}
                  </span>
                )}
              </div>

              {approvedReviews.length === 0 ? (
                <div className="text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    لا توجد تقييمات مسجلة لهذا الصنايعي حتى الآن.
                  </p>
                  <button
                    onClick={() => setShowAddReviewForm(true)}
                    className="mt-2 text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    كن أول من يقيم الخدمة
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {approvedReviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs text-right"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {rev.customerName || 'عميل'}
                          </span>
                          {rev.isLocal && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                              تقييمك
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating 
                                    ? 'text-amber-500 fill-amber-500' 
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.timestamp && (
                            <span className="text-[10px] text-slate-400 mr-1">
                              {rev.timestamp}
                            </span>
                          )}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-2 rounded-lg border border-slate-100/60">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Call Actions (2 Large Mobile-Friendly Touch Targets) */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        {/* Direct Call Tel Button */}
        <a
          href={telLink}
          aria-label={`اتصال مباشر بـ ${handyman.name}`}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all active:scale-95 text-center"
          id={`call_direct_btn_${handyman.id}`}
        >
          <Phone className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          <span>اتصال مباشر</span>
        </a>

        {/* WhatsApp Direct Button */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`محادثة واتساب مع ${handyman.name}`}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all active:scale-95 text-center"
          id={`whatsapp_btn_${handyman.id}`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-100 stroke-[2.5]" />
          <span>واتساب</span>
        </a>
      </div>
    </div>
  );
};
