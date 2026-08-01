import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, CheckCircle2, Copy, Check, Share2, Wrench, User } from 'lucide-react';
import { Handyman } from '../types';
import { formatWhatsAppLink } from '../utils/handymanService';

interface HandymanCardProps {
  handyman: Handyman;
}

export const HandymanCard: React.FC<HandymanCardProps> = ({ handyman }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    if (handyman.phone) {
      navigator.clipboard.writeText(handyman.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProfessionBadgeColor = (prof: string) => {
    if (prof.includes('سباك')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (prof.includes('نقاش')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (prof.includes('كهربائي')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (prof.includes('نجار')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (prof.includes('تكييف')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const waLink = formatWhatsAppLink(handyman.whatsapp || handyman.phone);
  const telLink = handyman.phone ? `tel:${handyman.phone}` : '#';

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
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
                    // Fallback to initial avatar if image fails loading
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
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                {handyman.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-extrabold border ${getProfessionBadgeColor(handyman.profession)}`}>
                  <Wrench className="w-3 h-3" />
                  {handyman.profession}
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  نشط ومعتمد ✓
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyPhone}
            title="نسخ رقم الهاتف"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            id={`copy_btn_${handyman.id}`}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Coverage Areas */}
        <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 font-medium leading-relaxed">
            <span className="text-slate-400 font-normal">المناطق المخدومة: </span>
            <strong className="text-slate-800">{handyman.areas || 'المطرية والمناطق المجاورة'}</strong>
          </div>
        </div>
      </div>

      {/* Call Actions (2 Large Mobile-Friendly Touch Targets) */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        {/* Direct Call Tel Button */}
        <a
          href={telLink}
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
