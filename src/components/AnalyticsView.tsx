/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lightweight, high-performance Analytics dashboard component.
 * Uses pure Tailwind CSS for ultra-fast rendering (0 connection paint lag).
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart4, 
  Smartphone, 
  Clock, 
  Search, 
  QrCode, 
  TrendingUp, 
  Globe, 
  Youtube, 
  RefreshCw,
  Award,
  Link2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AnalyticsViewProps {
  lang: 'ar' | 'en';
}

interface TopCode {
  id: string;
  total: number;
  target: string;
  platform: string;
}

interface RecentScan {
  timestamp: string;
  tid: string;
  target: string;
  platform: string;
  device: string;
}

interface AnalyticsData {
  totalScans: number;
  scansByPlatform: Record<string, number>;
  scansByDevice: Record<string, number>;
  recentScans: RecentScan[];
  topCodes: TopCode[];
}

export default function AnalyticsView({ lang }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const ArabicText = {
    title: "نظام تحليلات Qrytube الفوري",
    subtitle: "متابعة أداء ومسح رموز الـ QR والروابط العميقة لحظة بلحظة وبدقة متناهية",
    totalScans: "إجمالي عمليات المسح",
    scansDesc: "تفاعلات حية على الروابط الذكية",
    platforms: "توزيع المنصات المصدرية",
    devices: "أنواع أجهزة الماسحين",
    recentScans: "سجل التوجيه الفوري المباشر (خالٍ من التأخير)",
    topCodes: "الرموز الأكثر نشاطاً وتفاعلاً",
    searchPlaceholder: "أدخل رقم كود الـ QR الخاص بك لتتبع إحصائياته...",
    searchBtn: "بحث وتتبع بـ ID",
    refreshBtn: "تحديث الإحصائيات",
    noData: "لم يتم تسجيل عمليات مسح بعد. سيظهر النشاط هنا فور استخدام الرابط الأول!",
    loading: "جاري استرجاع بيانات الأداء السحابية...",
    platformLabel: "المنصّة",
    deviceLabel: "الجهاز",
    targetLabel: "رابط الهبوط والتوجيه",
    timeLabel: "توقيت المسح",
    codeId: "رقم تتبع الكود",
    totalScanned: "مرات المسح",
    noCodeFound: "عذراً، لم نعثر على أي عمليات مسح لهذا الرمز أو المعرّف. تأكد من صحة رقم التتبع.",
    specificCodeTitle: "تفاصيل تتبع الكود الرقمي المعين",
    totalScansSpecific: "إجمالي مسح هذا الكود",
    edgeSuccess: "سيرفرات حافة الشبكة (Edge) تخدم عملية التوجيه بأقل من 100 ملي ثانية لضمان أقصى سرعة.",
    platformStats: "احصائيات المنصات",
    activeCampaigns: "أبرز الحملات النشطة",
    searchHint: "مثال لـ ID الكود: qr_xxxxxxx"
  };

  const EnglishText = {
    title: "Immediate Qrytube Analytics Engine",
    subtitle: "Monitor dynamic QR scan metrics and redirection events instantly in real-time.",
    totalScans: "Total Scans Detected",
    scansDesc: "Live interactions with smart deep links",
    platforms: "Platform Distribution",
    devices: "Scanner Device Breakdown",
    recentScans: "Zero-Latency Routing Stream (Live Feed)",
    topCodes: "Top Active QR Campaigns",
    searchPlaceholder: "Enter your custom QR Code ID to view specific stats...",
    searchBtn: "Track QR by ID",
    refreshBtn: "Refresh Metrics",
    noData: "No scans detected yet. Scan events will appear instantly here!",
    loading: "Retrieving cloud performance metrics...",
    platformLabel: "Platform",
    deviceLabel: "Device",
    targetLabel: "Destination URL",
    timeLabel: "Scanned At",
    codeId: "QR Tracking ID",
    totalScanned: "Scans Count",
    noCodeFound: "No tracking records found for this specific ID. Check formatting.",
    specificCodeTitle: "Specific Code Analytics View",
    totalScansSpecific: "This Code's Scan Count",
    edgeSuccess: "Edge Cache Nodes are resolving redirections under 100ms for speed supremacy.",
    platformStats: "Platform Stats",
    activeCampaigns: "Active Campaigns Table",
    searchHint: "Example ID format: qr_xxxxxxx"
  };

  const t = lang === 'ar' ? ArabicText : EnglishText;

  const fetchGlobalAnalytics = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const decoded = await response.json();
        setData(decoded);
        setErrorStatus(null);
      } else {
        setErrorStatus('Failed to load server analytical data');
      }
    } catch (e) {
      console.error(e);
      setErrorStatus('Connection to analytics API refused');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const querySpecificCode = async () => {
    if (!searchId.trim()) return;
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/analytics?tid=${encodeURIComponent(searchId.trim())}`);
      if (response.ok) {
        const decoded = await response.json();
        if (decoded && decoded.specificCode) {
          setSearchResult(decoded.specificCode);
        } else {
          setSearchResult({ error: true });
        }
      } else {
        setSearchResult({ error: true });
      }
    } catch (e) {
      console.error(e);
      setSearchResult({ error: true });
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAnalytics();
  }, []);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Safe division helper
  const getPercentage = (count: number, total: number) => {
    if (total <= 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="analytics_dashboard">
      
      {/* SECTION HEADER BLOCK */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden" id="analytics_intro_panel">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg font-arabic border border-red-500/20">
              <Sparkles size={12} className="animate-pulse" />
              {lang === 'ar' ? 'سيرفرات الحافة الطرفية 🚀' : 'Edge-Powered Analytics 🚀'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-arabic tracking-tight text-white leading-tight">
              {t.title}
            </h2>
            <p className="text-xs sm:text-sm font-arabic text-slate-300 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          
          <button
            onClick={() => fetchGlobalAnalytics(true)}
            disabled={loading || refreshing}
            className="self-start sm:self-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white hover:text-red-300 transition-all font-arabic text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 cursor-pointer shadow-md select-none"
            id="refresh_btn"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{t.refreshBtn}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-slate-400 font-arabic animate-pulse flex flex-col items-center justify-center gap-4">
          <RefreshCw size={36} className="animate-spin text-red-500" />
          <p className="text-sm font-medium">{t.loading}</p>
        </div>
      ) : errorStatus ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 font-arabic text-center">
          <p className="font-bold text-md mb-2">Error Connecting Server Status File</p>
          <p className="text-xs text-red-500">{errorStatus}</p>
        </div>
      ) : (
        <>
          {/* THREE GRID CORE METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="core_metrics_grid">
            
            {/* Total Scans Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-arabic">{t.totalScans}</span>
                <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none">
                  {data?.totalScans || 0}
                </h3>
                <p className="text-xs text-slate-400 font-arabic mt-2">
                  {t.scansDesc}
                </p>
              </div>
            </div>

            {/* Platform distribution micro-chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-arabic">{t.platforms}</span>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                  <Globe size={18} />
                </div>
              </div>
              
              <div className="space-y-3 font-arabic">
                {Object.keys(data?.scansByPlatform || {}).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">{t.noData}</p>
                ) : (
                  Object.entries(data?.scansByPlatform || {}).map(([platform, count]) => {
                    const pct = getPercentage(count as number, data?.totalScans || 0);
                    return (
                      <div key={platform} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="capitalize text-[11px] font-mono flex items-center gap-1">
                            {platform === 'youtube' ? <Youtube size={11} className="text-red-500" /> : <Link2 size={11} />}
                            {platform}
                          </span>
                          <span className="font-mono text-[11px]">{count as number} scans ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Device breakdown card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-arabic">{t.devices}</span>
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                  <Smartphone size={18} />
                </div>
              </div>

              <div className="space-y-3 font-arabic">
                {Object.keys(data?.scansByDevice || {}).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">{t.noData}</p>
                ) : (
                  Object.entries(data?.scansByDevice || {}).map(([device, count]) => {
                    const pct = getPercentage(count as number, data?.totalScans || 0);
                    return (
                      <div key={device} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="text-[11px]">{device}</span>
                          <span className="font-mono text-[11px]">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-yellow-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* DYNAMIC SEARCH BY COMPAIGN / TRAK ID */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50" id="query_campaign_panel">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-1 font-arabic mb-2">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
                  <QrCode size={16} className="text-slate-500" />
                  {lang === 'ar' ? 'تتبع إحصائيات رمز QR مخصص محدد' : 'Track an Individual QR Code Asset'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'ar' ? 'أدخل معرّف الكود (مثل qr_xxxxx) المحفوظ لديك لفحص تفاعلاته المحددة' : 'Input your QR Code identifier to fetch exclusive metrics.'}
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full h-11 pl-9 pr-4 bg-white border border-slate-200 focus:border-red-500 rounded-xl text-xs font-semibold text-slate-800 font-arabic outline-none shadow-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={querySpecificCode}
                  disabled={searchLoading || !searchId.trim()}
                  className="h-11 px-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-arabic text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                >
                  {searchLoading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                  <span>{t.searchBtn}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-center">
                {t.searchHint}
              </p>

              {/* SEARCH RESULT DISPLAYER */}
              {searchResult && (
                <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200 shadow-sm font-arabic transition-all">
                  {searchResult.error ? (
                    <p className="text-xs text-red-500 text-center font-semibold">{t.noCodeFound}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          {t.specificCodeTitle}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-mono rounded">
                          ID: {searchId}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                        <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                          <span className="text-[10px] text-slate-400 block">{t.totalScansSpecific}</span>
                          <span className="text-lg font-bold text-slate-800 font-mono mt-1 block">
                            {searchResult.total}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                          <span className="text-[10px] text-slate-400 block">{t.platformLabel}</span>
                          <span className="text-xs font-bold text-slate-800 capitalize font-mono mt-1.5 block">
                            {searchResult.platform}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                          <span className="text-[10px] text-slate-400 block">HTTP Node Latency</span>
                          <span className="text-xs font-bold text-emerald-600 font-mono mt-1.5 block">
                            &lt; 90ms (Edge)
                          </span>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 block max-w-full overflow-hidden">
                        <span className="text-[10px] text-slate-400">{t.targetLabel}</span>
                        <a 
                          href={searchResult.target} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:underline block truncate w-full"
                        >
                          {searchResult.target}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="scans_and_leaderboard">
            
            {/* Top codes leaderboard (8 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs" id="leaderboard_panel">
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                <h4 className="text-sm font-extrabold text-slate-800 font-arabic flex items-center gap-2">
                  <Award size={16} className="text-red-500" />
                  {t.topCodes}
                </h4>
                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold font-arabic rounded-lg">
                  {lang === 'ar' ? 'الأكثر تفاعلاً' : 'Trending'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-arabic text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-[10px] font-bold uppercase">
                      <th className="pb-3 text-right">{t.codeId}</th>
                      <th className="pb-3 text-center">{t.platformLabel}</th>
                      <th className="pb-3 text-right max-w-[200px]">{t.targetLabel}</th>
                      <th className="pb-3 text-center">{t.totalScanned}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!data?.topCodes || data.topCodes.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      data.topCodes.map((code) => (
                        <tr key={code.id} className="border-b border-slate-50 hover:bg-slate-50/55 transition-colors">
                          <td className="py-3 text-right font-mono text-[10px] text-slate-500 font-semibold">{code.id}</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold font-mono">
                              {code.platform}
                            </span>
                          </td>
                          <td className="py-3 text-right max-w-[200px] truncate font-mono text-[11px] text-blue-600">
                            <a href={code.target} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {code.target}
                            </a>
                          </td>
                          <td className="py-3 text-center font-bold text-slate-800 font-mono">
                            {code.total}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live stream feeds (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs" id="live_logs_panel">
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                <h4 className="text-sm font-extrabold text-slate-800 font-arabic flex items-center gap-2">
                  <Clock size={16} className="text-blue-500 animate-pulse" />
                  {t.recentScans}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-bold font-arabic text-emerald-600">LIVE</span>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="scans_scroller">
                {(!data?.recentScans || data.recentScans.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center font-arabic">{t.noData}</p>
                ) : (
                  data.recentScans.map((scan, index) => (
                    <div 
                      key={scan.timestamp + index} 
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs hover:border-slate-200 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold font-mono">
                            {scan.device}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatTime(scan.timestamp)}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-slate-600 truncate max-w-full">
                          {scan.target}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md font-bold font-mono text-[9px] uppercase">
                          {scan.platform}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* FOOTER INFO STATEMENT */}
      <div className="bg-emerald-500/5 text-emerald-800 rounded-2xl p-4 border border-emerald-500/10 text-center font-arabic text-xs leading-relaxed" id="security_declaration">
        <p className="font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600" />
          {t.edgeSuccess}
        </p>
      </div>

    </div>
  );
}
