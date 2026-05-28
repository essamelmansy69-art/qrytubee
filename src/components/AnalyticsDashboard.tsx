import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Search, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  ExternalLink, 
  Trash2, 
  QrCode, 
  Check, 
  Copy, 
  Activity, 
  PlusCircle, 
  Youtube, 
  Facebook, 
  Instagram, 
  Music
} from 'lucide-react';
import { translations } from '../translations';

interface QRListItem {
  id: string;
  url: string;
  platform: string;
  type: string;
  label?: string;
  createdAt: string;
}

interface QRStatsItem extends QRListItem {
  scans: number;
}

interface AnalyticsDashboardProps {
  lang: 'ar' | 'en';
  onNavigateToGenerator: () => void;
}

export default function AnalyticsDashboard({ lang, onNavigateToGenerator }: AnalyticsDashboardProps) {
  const t = translations[lang];
  const [localList, setLocalList] = useState<QRListItem[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // Load generated QRs from localStorage
  const loadLocalList = () => {
    try {
      const stored = localStorage.getItem('qrytube_generated_codes');
      if (stored) {
        setLocalList(JSON.parse(stored));
      } else {
        setLocalList([]);
      }
    } catch (e) {
      console.error("Failed to parse codes from localStorage", e);
    }
  };

  useEffect(() => {
    loadLocalList();
  }, []);

  // Fetch updated scan stats from Express server tracking database
  const fetchStats = async (items: QRListItem[]) => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const ids = items.map(item => item.id).join(',');
      const res = await fetch(`/api/qr-stats?ids=${ids}`);
      if (res.ok) {
        const data = await res.json() as QRStatsItem[];
        const statsMap: Record<string, number> = {};
        data.forEach(stat => {
          statsMap[stat.id] = stat.scans;
        });
        setStats(statsMap);
      }
    } catch (err) {
      console.error("Failed to fetch qr-stats api:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localList.length > 0) {
      fetchStats(localList);
    }
  }, [localList]);

  const handleRefresh = () => {
    fetchStats(localList);
  };

  const handleCopyToClipboard = (item: QRListItem) => {
    const fullUrl = `${window.location.origin}/?r=${encodeURIComponent(item.url)}&type=${item.type}&tid=${item.id}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا الرابط من تاريخك المحلي؟ لن يتم تتبع تحليلاته بعد الآن.' : 'Are you sure you want to delete this link? Its metrics will no longer show in your list.')) {
      try {
        const updated = localList.filter(item => item.id !== id);
        localStorage.setItem('qrytube_generated_codes', JSON.stringify(updated));
        setLocalList(updated);
      } catch (err) {
        console.error("Failed to delete item", err);
      }
    }
  };

  const getPlatformIcon = (platform: string, size = 18) => {
    switch(platform) {
      case 'facebook':
        return <Facebook size={size} className="text-[#1877F2]" />;
      case 'instagram':
        return <Instagram size={size} className="text-[#E1306C]" />;
      case 'tiktok':
        return <Music size={size} className="text-slate-800" />;
      case 'youtube':
      default:
        return <Youtube size={size} className="text-red-600" />;
    }
  };

  // Processing Stats Calculations
  const totalCodes = localList.length;
  const totalScans = Object.values(stats).reduce((acc: number, current: number) => acc + current, 0);
  
  // Find highest tracked item
  let mostPopularItem: QRListItem | null = null;
  let maxScans = -1;
  localList.forEach(item => {
    const s = stats[item.id] || 0;
    if (s > maxScans) {
      maxScans = s;
      mostPopularItem = item;
    }
  });

  // Filter lists based on search parameter and platform filters
  const filteredList = localList.filter(item => {
    const matchesSearch = 
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPlatform === 'all' || item.platform === filterPlatform;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`space-y-8 animate-fadeIn max-w-6xl mx-auto`} id="analytics_dashboard_container">
      
      {/* 1. Header & Summary Cards Row */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5`}>
        <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-2xl sm:text-3xl font-black font-arabic text-slate-950 flex items-center gap-2.5 justify-start">
            <Activity className="text-red-600 animate-pulse" size={28} />
            <span>{t.analyticsTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-arabic leading-relaxed">
            {t.analyticsSub}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all cursor-pointer font-arabic text-xs font-semibold disabled:opacity-50"
            type="button"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{t.refreshStats}</span>
          </button>

          <button
            onClick={onNavigateToGenerator}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer font-arabic text-xs font-bold"
            type="button"
          >
            <PlusCircle size={14} />
            <span>{lang === 'ar' ? 'توليد كود جديد' : 'Generate New Link'}</span>
          </button>
        </div>
      </div>

      {/* Stats Widgets Bento Grid */}
      {totalCodes > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="stats_bento_grid">
          
          {/* Card 1: Total Links */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className={`space-y-1.5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-arabic block tracking-wider">
                {lang === 'ar' ? 'إجمالي الروابط الذكية' : 'TOTAL SMART LINKS'}
              </span>
              <span className="text-3xl font-black font-mono text-slate-900">{totalCodes}</span>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <QrCode size={24} />
            </div>
          </div>

          {/* Card 2: Total Scans */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className={`space-y-1.5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-arabic block tracking-wider">
                {lang === 'ar' ? 'إجمالي قراءات المسح الكلي' : 'TOTAL REAL SCAN ACTIONS'}
              </span>
              <span className="text-3xl font-black font-mono text-indigo-700">{totalScans}</span>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={24} className="animate-bounce" />
            </div>
          </div>

          {/* Card 3: Top/Most Popular Link */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
            <div className={`space-y-1 ${lang === 'ar' ? 'text-right' : 'text-left'} max-w-[70%]`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-arabic block tracking-wider">
                {lang === 'ar' ? 'الرابط الأكثر تفاعلاً' : 'TOP PERFORMING QR'}
              </span>
              <span className="text-sm font-bold font-arabic text-emerald-700 block truncate">
                {mostPopularItem ? ((mostPopularItem as any).label || (mostPopularItem as any).url) : '-'}
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 block mt-1">
                {maxScans > 0 ? `${maxScans} scans` : '0 scans'}
              </span>
            </div>
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              {mostPopularItem ? getPlatformIcon((mostPopularItem as any).platform, 24) : <Activity size={24} />}
            </div>
          </div>

        </div>
      )}

      {/* 2. Main Search filter controls and Table / Grid Layout */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-5" id="dashboard_explorer_card">
        
        {totalCodes > 0 && (
          <div className={`flex flex-col sm:flex-row items-center gap-3 justify-between ${lang === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
            {/* Search Input filter bar */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-arabic text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-700"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            </div>

            {/* Platform selection filters */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-0.5" id="platform_filter_container">
              {['all', 'youtube', 'facebook', 'instagram', 'tiktok'].map(plat => (
                <button
                  key={plat}
                  onClick={() => setFilterPlatform(plat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
                    filterPlatform === plat 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                  type="button"
                >
                  {plat === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : plat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List Content */}
        {filteredList.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4 max-w-lg mx-auto flex flex-col items-center">
            <div className="p-5 bg-slate-50 text-slate-400 rounded-full mb-2">
              <QrCode size={40} className="stroke-1" />
            </div>
            <h3 className="text-lg font-bold font-arabic text-slate-900">
              {searchTerm || filterPlatform !== 'all' ? (lang === 'ar' ? 'لا توجد نتائج تطابق بحثك!' : 'No matching results found!') : t.noDataTitle}
            </h3>
            <p className="text-xs text-slate-500 font-arabic leading-relaxed">
              {searchTerm || filterPlatform !== 'all' ? (lang === 'ar' ? 'يرجى مراجعة التهجئة أو تغيير فلترة المنصة والبحث مرة أخرى.' : 'Try updating your search query or choosing another platform category.') : t.noDataDesc}
            </p>
            {!(searchTerm || filterPlatform !== 'all') && (
              <button
                onClick={onNavigateToGenerator}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-arabic text-xs transition-all shadow-md mt-2"
                type="button"
              >
                {lang === 'ar' ? 'اصنع كود QR ذكي الآن ✨' : 'Build Smart QR now ✨'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse" id="analytics_table">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className={`p-4 font-arabic text-xs font-bold text-slate-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'الرابط والمعرّف' : 'Smart Link & Destination'}
                  </th>
                  <th className={`p-4 font-arabic text-xs font-bold text-slate-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t.scannedPlatform}
                  </th>
                  <th className={`p-4 font-arabic text-xs font-bold text-slate-500 text-center`}>
                    {t.scansCount}
                  </th>
                  <th className={`p-4 font-arabic text-xs font-bold text-slate-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t.scanDate}
                  </th>
                  <th className="p-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const scansCount = stats[item.id] !== undefined ? stats[item.id] : (loading ? '..' : 0);
                  const shareUrl = `${window.location.origin}/?r=${encodeURIComponent(item.url)}&type=${item.type}&tid=${item.id}`;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                      
                      {/* Link URL and Title Label */}
                      <td className="p-4 max-w-xs md:max-w-sm">
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="font-bold text-slate-800 font-arabic text-sm">
                              {item.label || t.anonymousLabel}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 block truncate" dir="ltr">
                            {item.url}
                          </span>
                        </div>
                      </td>

                      {/* Targeted Platform badge */}
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-lg text-xs font-semibold text-slate-700 capitalize`}>
                          {getPlatformIcon(item.platform, 13)}
                          <span>{item.platform}</span>
                        </div>
                      </td>

                      {/* Number of Tracked scans */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center font-mono font-black text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                          {scansCount}
                        </span>
                      </td>

                      {/* Creation Date time */}
                      <td className="p-4">
                        <div className={`flex items-center gap-1.5 text-slate-500 font-arabic text-xs ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Calendar size={12} className="text-slate-400" />
                          <span>{new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Quick action buttons row (copy link, view QR, delete history item) */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Copy Link URL */}
                          <button
                            onClick={() => handleCopyToClipboard(item)}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'ar' ? 'نسخ رابط التوجيه الذكي' : 'Copy Smart Link'}
                            type="button"
                          >
                            {copiedId === item.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                          
                          {/* Visit/Test Redirect Link */}
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
                            title={lang === 'ar' ? 'اختبار المسح والتوجيه' : 'Test Scans Redirect'}
                          >
                            <ExternalLink size={14} />
                          </a>

                          {/* Delete local entry */}
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'ar' ? 'حذف من لوحة الإحصاءات' : 'Remove Link'}
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
