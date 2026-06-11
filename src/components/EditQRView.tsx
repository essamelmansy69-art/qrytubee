/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Key, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  ExternalLink,
  RefreshCw,
  Sparkles,
  Link2
} from 'lucide-react';
import { initPromise, supabase, updateDynamicQR } from '../lib/supabaseClient';

interface EditQRViewProps {
  lang: 'ar' | 'en';
  onReturn: () => void;
}

export default function EditQRView({ lang, onReturn }: EditQRViewProps) {
  const [slug, setSlug] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(null);
  
  const [newUrl, setNewUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Simple URL Validation Helper
  const isValidUrl = (urlStr: string): boolean => {
    try {
      const url = urlStr.trim();
      return url.length > 5 && (url.startsWith('http://') || url.startsWith('https://'));
    } catch (_) {
      return false;
    }
  };

  const handleVerifySlug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setVerificationError(lang === 'ar' ? 'يرجى إدخال رمز الـ Slug أولاً!' : 'Please enter the Slug first!');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setExistingUrl(null);
    setUpdateSuccess(false);

    try {
      await initPromise;
      const { data, error } = await supabase
        .from('dynamic_qr')
        .select('original_url')
        .eq('slug', slug.trim())
        .maybeSingle();

      if (error) {
        setVerificationError(error.message);
      } else if (!data) {
        setVerificationError(
          lang === 'ar' 
            ? 'الرمز التعريفي (Slug) الذي أدخلته غير موجود. يرجى مراجعة الحروف والمحاولة مجدداً.' 
            : 'The Slug you entered was not found. Please review and try again.'
        );
      } else {
        setExistingUrl(data.original_url);
        setNewUrl(data.original_url); // Pre-fill with current destination URL
      }
    } catch (err: any) {
      setVerificationError(err.message || 'An unexpected error occurred during lookup');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(newUrl)) {
      setUpdateError(
        lang === 'ar' 
          ? 'يرجى إدخال رابط صالح يبدأ بـ http:// أو https://' 
          : 'Please enter a valid link starting with http:// or https://'
      );
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await updateDynamicQR(slug, newUrl);
      if (result.success) {
        setUpdateSuccess(true);
        setExistingUrl(newUrl.trim());
      } else {
        setUpdateError(result.error || 'Failed to update dynamic redirection node');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'An unexpected error occurred while saving changes');
    } finally {
      setIsUpdating(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-xs max-w-2xl mx-auto ${isRtl ? 'text-right' : 'text-left'} space-y-6`} id="edit_qr_view_panel">
      {/* Header section */}
      <div className={`flex items-center gap-3 ${isRtl ? 'justify-end' : 'justify-start'} pb-4 border-b border-slate-100 dark:border-slate-800`}>
        <div className="shrink-0 order-2">
          <h2 className="text-xl sm:text-2xl font-black font-arabic text-slate-900 dark:text-white">
            {isRtl ? 'التعديل الذاتي للروابط الديناميكية' : 'Dynamic QR Self-Edit Menu'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic mt-1">
            {isRtl ? 'قم بتغيير وجهة كود الـ QR الخاص بك في أي وقت بكل سهولة مجاناً!' : 'Modify the destination of your QR code anytime for free!'}
          </p>
        </div>
        <span className="p-2.5 bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 rounded-2xl order-1">
          <Edit3 size={22} />
        </span>
      </div>

      {/* Step 1: Slug Lookup Form */}
      <form onSubmit={handleVerifySlug} className="space-y-4" id="slug_lookup_form">
        <div className="space-y-1.5">
          <label htmlFor="slug_input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-arabic">
            {isRtl ? 'أدخل الـ Slug الخاص بك:' : 'Enter your QR Slug:'}
          </label>
          <div className="relative rounded-2xl shadow-2xs">
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-400`}>
              <Key size={16} />
            </div>
            <input
              type="text"
              id="slug_input"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setVerificationError(null);
                setExistingUrl(null);
                setUpdateSuccess(false);
              }}
              placeholder={isRtl ? 'مثال: a1b2c3' : 'e.g. a1b2c3'}
              className={`block w-full py-3.5 ${isRtl ? 'pl-4 pr-11' : 'pl-11 pr-4'} bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-805 rounded-2xl text-sm font-semibold font-mono tracking-wider focus:ring-2 focus:ring-red-500/20 focus:border-red-650 dark:text-white transition-all`}
              disabled={isVerifying || isUpdating}
              required
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-arabic">
            {isRtl 
              ? 'الـ Slug هو الجزء الأخير في رابط الـ QR الخاص بك (مثلاً في qrytube.com/r/a1b2c3 الـ Slug هو a1b2c3).' 
              : 'The slug is the final alphanumeric part of your QR URL (e.g., in qrytube.com/r/a1b2c3, the slug is a1b2c3).'}
          </p>
        </div>

        {/* Action Button for verification */}
        {!existingUrl && (
          <button
            type="submit"
            disabled={isVerifying || !slug.trim()}
            className={`w-full py-3 px-4 rounded-xl font-bold font-arabic text-sm transition-all flex items-center justify-center gap-2 ${
              isVerifying || !slug.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                : 'bg-slate-900 hover:bg-slate-850 text-white cursor-pointer shadow-xs active:scale-99'
            }`}
            id="verify_slug_btn"
          >
            {isVerifying ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>{isRtl ? 'جاري التحقق من الـ Slug...' : 'Verifying slug...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="text-yellow-400" />
                <span>{isRtl ? 'التحقق والمتابعة للرابط الجديد 🔓' : 'Verify & Disclose Update Field 🔓'}</span>
              </>
            )}
          </button>
        )}

        {verificationError && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-150 dark:border-red-900/40 flex items-start gap-2 animate-fadeIn" id="verification_error">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="font-arabic leading-relaxed">{verificationError}</span>
          </div>
        )}
      </form>

      {/* Step 2: New Link (Disclosed only after verification) */}
      {existingUrl && (
        <div className="pt-4 border-t border-dashed border-slate-150 dark:border-slate-800 space-y-4 animate-fadeIn" id="slug_revealed_section">
          {/* Active confirmation box */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-800 dark:text-emerald-400 font-arabic text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>{isRtl ? 'تم التحقق بنجاح!' : 'Verification successful!'}</span>
            </div>
            <p className="text-[11px] leading-relaxed break-all opacity-90 max-h-16 overflow-y-auto">
              {isRtl ? 'الرابط الحالي الموجه إليه:' : 'Current Redirect Target:'}{' '}
              <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1 font-semibold font-sans">
                {existingUrl} <ExternalLink size={10} className="shrink-0" />
              </a>
            </p>
          </div>

          <form onSubmit={handleUpdateUrl} className="space-y-4" id="url_update_form">
            <div className="space-y-1.5">
              <label htmlFor="new_url_input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-arabic">
                {isRtl ? 'أدخل الرابط الجديد الموجه إليه:' : 'Enter your new destination link:'}
              </label>
              <div className="relative rounded-2xl shadow-2xs">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-400`}>
                  <Link2 size={16} />
                </div>
                <input
                  type="url"
                  id="new_url_input"
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value);
                    setUpdateError(null);
                    setUpdateSuccess(false);
                  }}
                  placeholder={isRtl ? 'https://example.com/my-new-destination-page' : 'https://example.com/my-new-destination-page'}
                  className={`block w-full py-3.5 ${isRtl ? 'pl-4 pr-11' : 'pl-11 pr-4'} bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-805 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-650 dark:text-white transition-all`}
                  disabled={isUpdating}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-arabic">
                {isRtl 
                  ? 'يجب أن يبدأ الرابط بـ http:// أو https:// ليتمكن نظام التوجيه الذكي من كشفه.' 
                  : 'Must start with http:// or https:// so that our smart deep link router handles it flawlessly.'}
              </p>
            </div>

            {/* Perform Update button */}
            <button
              type="submit"
              disabled={isUpdating || !isValidUrl(newUrl) || newUrl.trim() === existingUrl.trim()}
              className={`w-full py-3.5 px-4 rounded-xl font-bold font-arabic text-sm transition-all flex items-center justify-center gap-2 ${
                isUpdating || !isValidUrl(newUrl) || newUrl.trim() === existingUrl.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                  : 'bg-red-650 hover:bg-red-700 text-white cursor-pointer shadow-md active:scale-99'
              }`}
              id="submit_update_btn"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{isRtl ? 'جاري تعديل الرابط بـ Supabase...' : 'Updating link in Supabase...'}</span>
                </>
              ) : (
                <>
                  <span>{isRtl ? '💾 حفظ وتعديل الرابط الآن' : '💾 Commit Changes & Update Now'}</span>
                </>
              )}
            </button>

            {/* Success message popup */}
            {updateSuccess && (
              <div className="p-4 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/25 rounded-2xl space-y-2 animate-fadeIn" id="update_success_banner">
                <div className="flex items-center gap-2 font-black font-arabic text-sm">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span>{isRtl ? 'تم تحديث الرابط بنجاح! 🎉' : 'Link Updated Successfully! 🎉'}</span>
                </div>
                <p className="text-[11px] font-arabic leading-relaxed opacity-90 font-medium">
                  {isRtl 
                    ? 'تم تعديل رابط التوجيه ديناميكياً ببرود نود ممتاز! الباركود الحالي سيوجه الزوار فوراً وبصورة تلقائية للرابط الجديد دون الحاجة لإعادة طباعته أو تغييره.' 
                    : 'The routing node is updated securely! All current prints and scans will automatically steer to the brand new URI immediately without replacing the generated barcode.'}
                </p>
              </div>
            )}

            {updateError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-150 dark:border-red-900/40 flex items-start gap-2 animate-fadeIn" id="update_error">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span className="font-arabic leading-relaxed">{updateError}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Return to home button */}
      <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onReturn}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 hover:text-slate-900 rounded-xl font-bold font-arabic text-xs transition-all cursor-pointer shadow-2xs inline-flex items-center gap-2 active:scale-98"
          type="button"
          id="edit_return_btn"
        >
          <ArrowLeft size={14} className={isRtl ? 'rotate-180' : ''} />
          <span>{isRtl ? 'الرجوع لصفحة التوليد الرئيسية' : 'Return to Home Builder'}</span>
        </button>
      </div>
    </div>
  );
}
