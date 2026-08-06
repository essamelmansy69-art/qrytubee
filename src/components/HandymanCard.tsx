import React, { useState, useRef, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, CheckCircle2, Copy, Check, Share2, Wrench, Facebook, X, Star, ChevronDown, ChevronUp, MessageSquarePlus, User, Clock } from 'lucide-react';
import { Handyman } from '../types';
import { formatWhatsAppLink, GOOGLE_FORM_URL } from '../utils/handymanService';

interface HandymanCardProps {
  handyman: Handyman;
}

export const HandymanCard: React.FC<HandymanCardProps> = ({ handyman }) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

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

  const shareText = `صنايعي معتمد: ${handyman.name} (${handyman.profession})\nالتقييم: ${handyman.averageRating ? `${handyman.averageRating} من 5 ⭐` : 'جديد'}\nالمناطق المخدومة: ${handyman.areas || 'القاهرة والمناطق المجاورة'}\nرقم الهاتف: ${handyman.phone || handyman.whatsapp}\nعبر دليل صنايعية مصر: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

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
        // Fall back
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

  // Helper to render star rating graphics
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-amber-300 text-amber-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-slate-300" />
        );
      }
    }
    return stars;
  };

  const waLink = formatWhatsAppLink(handyman.whatsapp || handyman.phone);
  const telLink = handyman.phone ? `tel:${handyman.phone}` : '#';

  const hasReviews = handyman.totalReviews && handyman.totalReviews > 0;
  const commentsList = handyman.approvedComments || [];

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
      id={`handyman_card_${handyman.id}`}
    >
      <div className="p-4 sm:p-5">
        {/* Top Header & Avatar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            {/* Avatar / Profile Image */}
            <div className="relative shrink-0">
              {handyman.imageUrl ? (
                <img
                  src={handyman.imageUrl}
                  alt={handyman.name}
                  loading="lazy"
                  decoding="async"
                  className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-xs border border-amber-400/30';
                      fallback.innerText = handyman.name.charAt(0) || 'ص';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-xs border border-amber-400/30">
                  {handyman.name.charAt(0) || 'ص'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="صنايعي نشط ومعتمد">
                <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                {handyman.name}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-extrabold border ${getProfessionBadgeColor(handyman.profession)}`}>
                  <Wrench className="w-3 h-3" />
                  {handyman.profession}
                </span>

                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  نشط ومعتمد ✓
                </span>
              </div>

              {/* Calculated Average Rating Badge from Source 2 ("reviews" tab) */}
              <div className="pt-1 flex items-center gap-2">
                {hasReviews ? (
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1">
                    <div className="flex items-center gap-0.5">
                      {renderStars(handyman.averageRating || 5)}
                    </div>
                    <span className="text-xs font-black text-amber-900 dir-ltr">
                      {handyman.averageRating?.toFixed(1)}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 border-r border-amber-200 pr-1.5 mr-0.5">
                      ({handyman.totalReviews} {handyman.totalReviews === 1 ? 'تقييم' : 'تقييمات'})
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    <Star className="w-3 h-3 text-slate-400" />
                    صنايعي جديد - لم يتلقَ تقييمات بعد
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (Share & Copy) */}
          <div className="flex items-center gap-1 relative shrink-0" ref={shareMenuRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              title="مشاركة بيانات الصنايعي"
              aria-label={`مشاركة بيانات الصنايعي ${handyman.name}`}
              className="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
              id={`share_btn_${handyman.id}`}
            >
              <Share2 className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={handleCopyPhone}
              title="نسخ رقم الهاتف"
              aria-label={`نسخ رقم هاتف ${handyman.name}`}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
              id={`copy_btn_${handyman.id}`}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Social Share Menu Dropdown */}
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
                      <span>تطبيق المشاركة الأصلي</span>
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
            <strong className="text-slate-900">{handyman.areas || 'جميع المحافظات والمناطق'}</strong>
          </div>
        </div>

        {/* Approved Comments & Reviews Section (Column F = Approved/نشط) */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors"
              id={`toggle_comments_btn_${handyman.id}`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>تقييمات وتعليقات العملاء المعتمدة</span>
              {commentsList.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                  {commentsList.length}
                </span>
              )}
              {showComments ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-all"
              id={`add_review_btn_${handyman.id}`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600" />
              <span>أضف تقييمك</span>
            </a>
          </div>

          {/* Expandable Comments List */}
          {showComments && (
            <div className="mt-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              {commentsList.length > 0 ? (
                commentsList.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                          {rev.reviewerName.charAt(0) || 'ع'}
                        </div>
                        <span>{rev.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {renderStars(rev.rating)}
                      </div>
                    </div>

                    {rev.comment ? (
                      <p className="text-slate-700 font-medium leading-relaxed bg-white/80 p-2 rounded-lg border border-amber-100/80">
                        "{rev.comment}"
                      </p>
                    ) : (
                      <p className="text-slate-500 italic text-[11px]">
                        قام العميل بتقييم الخدمة بـ {rev.rating} نجوم.
                      </p>
                    )}

                    {rev.timestamp && (
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{rev.timestamp}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 text-center text-xs text-slate-500 border border-slate-100 space-y-2">
                  <p className="font-medium">لا توجد تعليقات معتمدة حتي الآن لهذا الصنايعي.</p>
                  <a
                    href={GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-bold text-amber-700 hover:underline"
                  >
                    كن أول من يجرب ويدون تقييمه عبر النموذج الرسمي 👈
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
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
