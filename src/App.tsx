import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Search, 
  Globe, 
  Maximize2, 
  Share2, 
  Flame, 
  Sparkles, 
  ArrowLeft, 
  Grid, 
  Tv, 
  Layers, 
  ShieldAlert,
  Star,
  ChevronRight,
  Monitor
} from 'lucide-react';

// Static / Fallback Database of 13 Core Games
const LOCAL_GAMES = [
  {
    id: 'game-going-up-rooftop',
    title: { 
      ar: 'تسلق أسطح المنازل Going Up Rooftop', 
      en: 'Going Up Rooftop Arcade' 
    },
    description: {
      ar: 'لعبة Going Up Rooftop اون لاين الكلاسيكية مجاناً وبدون تحميل! تسلق أسطح المنازل والمباني العالية، تجنب العقبات الخطيرة، وحقق أعلى النقاط في هذه اللعبة الحماسية الشيقة (going up rooftop game online).',
      en: 'Play the exciting going up rooftop game online for free with no download! Climb rooftop heights, dodge challenging obstacles, and reach the top in this thrilling classic retro arcade game.'
    },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7m96t6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/f04c643b174744d0a9b8971f4963bd9b-512x512.jpeg',
    rating: 4.9,
    plays: '142K'
  },
  {
    id: 'game-cheese-eater',
    title: { 
      ar: 'آكل الجبن الكلاسيكية', 
      en: 'Cheese Eater Classic' 
    },
    description: {
      ar: 'العب لعبة آكل الجبن الكلاسيكية! تحكم بالفأر الصغير، تجنب الفخاخ والقطط، واجمع كل قطع الجبن اللذيذة المنتشرة في المتاهة.',
      en: 'Help the little mouse collect all delicious cheese slices in this retro arcade maze while dodging clever cat patrols!'
    },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7m96t6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/5df6fa9f664a4d95b58eeef081829e37-512x512.jpeg',
    rating: 4.7,
    plays: '85K'
  },
  {
    id: 'game-tetris',
    title: { 
      ar: 'تتريس الأتاري الأصلية', 
      en: 'Classic Tetris Retro' 
    },
    description: {
      ar: 'لعبة ترتيب المكعبات الشهيرة تتريس بنمط ريترو قديم. طابق الصفوف، سرّع التنزيل وحقق السكور الأسطوري!',
      en: 'Arrange falling block shapes to clear lines in the most recognizable and addicting retro arcade puzzle ever created.'
    },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamedistribution.com/f04c643b174744d0a9b8971f4963bd9b/',
    thumb: 'https://img.gamedistribution.com/f04c643b174744d0a9b8971f4963bd9b-512x512.jpeg',
    rating: 4.9,
    plays: '310K'
  },
  {
    id: 'game-breakout',
    title: { 
      ar: 'أتاري هدم الجدران 3D', 
      en: 'Atari Breakout 3D' 
    },
    description: {
      ar: 'دمر قوالب الطوب الملونة باستخدام المضرب والكرة المرتدة. نسخة ثلاثية أبعاد محسنة تحمل سحر ألعاب الأتاري القديمة.',
      en: 'Bounce the ball off your paddle to smash rows of colored bricks in this legendary high-definition 3D breakout clone.'
    },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/b98t89h5o4q3it3w79w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/b98t89h5o4q3it3w79w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.8,
    plays: '115K'
  },
  {
    id: 'game-candy-crush',
    title: { 
      ar: 'تطابق الحلوى كاندي كراش', 
      en: 'Candy Crush Match 3' 
    },
    description: {
      ar: 'طابق ثلاث قطع حلوى متطابقة أو أكثر لمسح اللوح وصنع قنابل الحلوى المخططة اللذيذة في هذه اللعبة الساحرة.',
      en: 'Swipe and match identical candies to activate tasty combos, colored bombs, and clear levels in sweet style.'
    },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/1k4ot6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/1k4ot6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.6,
    plays: '240K'
  },
  {
    id: 'game-car-racing',
    title: { 
      ar: 'سباق سيارات الطريق السريع', 
      en: 'Neon Highway Racer' 
    },
    description: {
      ar: 'انطلق بأقصى سرعة بين السيارات على طريق نيون مضيء. تجنب الاصطدام، واجمع القطع الذهبية لشراء سيارات خارقة جديدة.',
      en: 'Speed through traffic on a neon-drenched futuristic highway. Dodge cars, collect cash, and unlock hypercars.'
    },
    category: 'Racing',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/o96p89h5o4q3it3w79w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/o96p89h5o4q3it3w79w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.8,
    plays: '190K'
  },
  {
    id: 'game-plane-shooter',
    title: { 
      ar: 'أتاري غارة الطائرات', 
      en: 'Atari River Raid Flight' 
    },
    description: {
      ar: 'حلق بطائرتك الحربية الكلاسيكية فوق ممر الأنهار والوديان، دمر طائرات وسفن العدو وراقب مستوى الوقود بحذر!',
      en: 'Pilot your classic jet over enemy river canyons, shoot battleships, destroy enemy planes, and refuel on the fly.'
    },
    category: 'Action',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7m96t6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/7m96t6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.7,
    plays: '98K'
  },
  {
    id: 'game-ludo',
    title: { 
      ar: 'لودو الكلاسيكية برو', 
      en: 'Retro Ludo Board Pro' 
    },
    description: {
      ar: 'لعبة اللوح الشعبية لودو في ثوب ريترو رائع. العب ضد الكمبيوتر أو تحدى أصدقائك وكن ملك اللودو الأول.',
      en: 'Roll the dice and race your tokens home in this beautifully clean implementation of the classic Ludo board game.'
    },
    category: 'Board',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/2k4ot6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/2k4ot6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.5,
    plays: '160K'
  },
  {
    id: 'game-bubble-shooter-3d',
    title: { 
      ar: 'قاذف الفقاعات ثلاثي الأبعاد', 
      en: 'Bubble Shooter 3D Online' 
    },
    description: {
      ar: 'صوب فقاعتك الملونة نحو الفقاعات المتطابقة لفرقعتها وإخلاء الشاشة بأقل عدد ممكن من الضربات في بيئة ثلاثية أبعاد.',
      en: 'Aim and pop colorful bubbles in a vibrant 3D space. Clear the entire grid and climb the highscore leaderboard!'
    },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7v4ot6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/7v4ot6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.6,
    plays: '135K'
  },
  {
    id: 'game-tri-puzzle',
    title: { 
      ar: 'تراي بازل تركيب الكتل', 
      en: 'TriPuzzle Block Craft' 
    },
    description: {
      ar: 'لعبة ترتيب الكتل الهندسية المثلثة في مساحات مخصصة. اختبر ذكائك الهندسي وقدرتك على التخطيط في هذه الأحجية الشيقة.',
      en: 'Fit hexagonal and triangular puzzle block arrangements into tight slots. Train your spatial intelligence offline!'
    },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7j96t6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/7j96t6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.7,
    plays: '74K'
  },
  {
    id: 'game-number-search',
    title: { 
      ar: 'لعبة البحث عن الأرقام', 
      en: 'Number Search Game' 
    },
    description: {
      ar: 'اعثر على سلاسل الأرقام المخبأة وسط جدول معقد. لعبة ذكاء تركيز ممتازة تبقيك متيقظاً طوال الوقت.',
      en: 'Find long hidden string numbers in a massive grid layout. A sophisticated and calming cognitive booster puzzle.'
    },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/8k4ot6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/8k4ot6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.4,
    plays: '92K'
  },
  {
    id: 'game-zuma-legend',
    title: { 
      ar: 'زومة الكلاسيكية الأسطورة', 
      en: 'Zuma Legend Classic' 
    },
    description: {
      ar: 'أطلق الكرات الملونة من فم الضفدع الحجري لتشكيل مجموعات متطابقة ومنع الكرات من الوصول إلى نهاية الممر المظلم.',
      en: 'Shoot colored marbles from your stone frog shooter to make match 3 lines before they roll down the spiral dungeon!'
    },
    category: 'Arcade',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/7y4ot6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/7y4ot6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.8,
    plays: '275K'
  },
  {
    id: 'game-daily-mini-sudoku',
    title: { 
      ar: 'سودوكو اليومية المصغرة', 
      en: 'Daily Mini Sudoku' 
    },
    description: {
      ar: 'العب ألغاز السوادكو المصغرة يومياً بذكاء وتركيز. مناسبة لتمرين العقل واكتساب مهارات حل المشكلات الحسابية بسرعة.',
      en: 'Solve quick daily Sudoku mathematical grids. A clean, premium layout suitable for standard cognitive practice.'
    },
    category: 'Puzzle',
    isLocal: true,
    url: 'https://html5.gamemonetize.co/1j96t6m1o37it3w879w9o4v806fbfhsk/',
    thumb: 'https://img.gamedistribution.com/1j96t6m1o37it3w879w9o4v806fbfhsk-512x512.jpeg',
    rating: 4.6,
    plays: '67K'
  }
];

export default function App() {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [games, setGames] = useState<any[]>(LOCAL_GAMES);
  const [selectedGame, setSelectedGame] = useState<any>(LOCAL_GAMES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse initial state from URL queries (?game=ID&lang=en)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameQuery = params.get('game');
    const langQuery = params.get('lang');

    if (langQuery === 'en' || langQuery === 'ar') {
      setLocale(langQuery);
    }

    if (gameQuery) {
      // Find matching game locally
      const found = LOCAL_GAMES.find(g => g.id === gameQuery);
      if (found) {
        setSelectedGame(found);
        setIsPlaying(true);
      }
    }
  }, []);

  // Fetch games from proxy /api/games (GameMonetize imported games)
  useEffect(() => {
    let active = true;
    async function loadGames() {
      try {
        setIsLoadingGames(true);
        const res = await fetch('/api/games');
        if (res.ok) {
          const text = await res.text();
          if (text.trim().startsWith('[')) {
            const data = JSON.parse(text);
            if (active && Array.isArray(data)) {
              // Map GameMonetize data to fit app structure
              const normalized = data.map((item: any) => ({
                id: item.id || `gm-${item.title.replace(/\s+/g, '-').toLowerCase()}`,
                title: { 
                  ar: item.title, 
                  en: item.title 
                },
                description: {
                  ar: item.description || `العب لعبة ${item.title} المجانية الرائعة على أتاري مباشرة وبدون تنزيل!`,
                  en: item.description || `Play the awesome ${item.title} free game directly on Atari now without any download!`
                },
                category: item.category || 'Arcade',
                isLocal: false,
                url: item.url,
                thumb: item.thumb || 'https://img.gamedistribution.com/f04c643b174744d0a9b8971f4963bd9b-512x512.jpeg',
                rating: Number((4 + Math.random() * 0.9).toFixed(1)),
                plays: `${Math.floor(10 + Math.random() * 300)}K`
              }));

              setGames(prev => {
                // Keep local games first, append new imported ones without duplicating
                const localIds = LOCAL_GAMES.map(g => g.id);
                const uniqueImported = normalized.filter((g: any) => !localIds.includes(g.id));
                return [...LOCAL_GAMES, ...uniqueImported];
              });
            }
          }
        }
      } catch (err) {
        console.warn('Fallback to local database only:', err);
      } finally {
        if (active) setIsLoadingGames(false);
      }
    }

    loadGames();
    return () => { active = false; };
  }, []);

  // Dynamic SEO Metadata updater
  useEffect(() => {
    if (!selectedGame) return;

    let titleStr = '';
    let descStr = '';

    if (
      selectedGame.id === 'game-going-up-rooftop' || 
      (selectedGame.title && typeof selectedGame.title.en === 'string' && selectedGame.title.en.toLowerCase().includes('going up rooftop')) ||
      (selectedGame.title && typeof selectedGame.title.ar === 'string' && selectedGame.title.ar.toLowerCase().includes('going up rooftop'))
    ) {
      titleStr = locale === 'ar'
        ? 'لعبة Going Up Rooftop اون لاين - العب أركيد كلاسيك مجاناً'
        : 'Going Up Rooftop Game Online - Play Free Classic Arcade | Atari';
      descStr = locale === 'ar'
        ? 'العب لعبة Going Up Rooftop اون لاين الكلاسيكية مجاناً وبدون تحميل! تسلق أسطح المنازل والمباني العالية، تجنب العقبات الخطيرة، وحقق أعلى النقاط في هذه اللعبة الحماسية الشيقة (going up rooftop game online).'
        : 'Play the exciting going up rooftop game online for free with no download! Climb rooftop heights, dodge challenging obstacles, and reach the top in this thrilling classic retro arcade game.';
    } else {
      const gTitle = typeof selectedGame.title === 'string' 
        ? selectedGame.title 
        : (selectedGame.title[locale] || selectedGame.title['en'] || '');
      
      const gDesc = typeof selectedGame.description === 'string'
        ? selectedGame.description
        : (selectedGame.description[locale] || selectedGame.description['en'] || '');

      titleStr = locale === 'ar'
        ? `${gTitle} - العب الآن على منصة أتاري الكلاسيكية`
        : `${gTitle} - Play Now | Atari Retro Games Portal`;
      descStr = gDesc.substring(0, 155);
    }

    // Update index.html DOM meta headers
    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descStr);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', titleStr);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', descStr);

    // Sync state with address bar queries smoothly without reload
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('game', selectedGame.id);
    currentUrl.searchParams.set('lang', locale);
    window.history.pushState({}, '', currentUrl.toString());

  }, [selectedGame, locale]);

  // Handle Share link copying
  const handleShare = () => {
    const link = `https://qrytube.com/?game=${selectedGame.id}&lang=${locale}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Switch Language handler
  const toggleLanguage = () => {
    const nextLang = locale === 'ar' ? 'en' : 'ar';
    setLocale(nextLang);
    // Update HTML dir attribute for alignment rhythm
    document.documentElement.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', nextLang);
  };

  // Filter games based on search & category
  const filteredGames = games.filter(g => {
    const gTitle = typeof g.title === 'string' ? g.title : (g.title[locale] || g.title['en'] || '');
    const matchesSearch = gTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || g.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Arcade', 'Puzzle', 'Racing', 'Action', 'Board'];

  const t = {
    heroTitle: locale === 'ar' ? 'أتاري' : 'ATARI',
    heroSubtitle: locale === 'ar' ? 'منصة الألعاب الكلاسيكية وعصر الأركيد الذهبي' : 'The Legendary Classic Arcade & Retro Game Hub',
    searchPlaceholder: locale === 'ar' ? 'ابحث عن لعبتك المفضلة...' : 'Search for your favorite game...',
    allGames: locale === 'ar' ? 'جميع الألعاب المتاحة' : 'All Available Games',
    playingNow: locale === 'ar' ? 'أنت تلعب الآن' : 'Playing Now',
    noGames: locale === 'ar' ? 'لم يتم العثور على ألعاب تطابق بحثك.' : 'No games found matching your search.',
    playBtn: locale === 'ar' ? 'العب الآن مجاناً' : 'Play Now Free',
    backBtn: locale === 'ar' ? 'الرجوع للقائمة' : 'Back to Games List',
    fullScreen: locale === 'ar' ? 'شاشة كاملة' : 'Full Screen',
    shareLink: locale === 'ar' ? 'مشاركة رابط اللعبة' : 'Share Game Link',
    copiedText: locale === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!',
    loading: locale === 'ar' ? 'جاري تحميل عالم الألعاب...' : 'Loading game world...',
    localGameTag: locale === 'ar' ? 'موصى به' : 'Featured',
    importedGameTag: locale === 'ar' ? 'أركيد أونلاين' : 'Online Arcade',
    playsText: locale === 'ar' ? 'زيارة' : 'Plays',
    metaTitle: locale === 'ar' ? 'وصف اللعبة وسيو' : 'Game Description & SEO',
    categoryLabel: locale === 'ar' ? 'التصنيف' : 'Category',
    developerLabel: locale === 'ar' ? 'الناشر' : 'Publisher',
    rateLabel: locale === 'ar' ? 'التقييم' : 'Rating',
    footerText: locale === 'ar' ? 'حقوق النشر © 2026 أتاري أركيد. جميع الألعاب مجانية وبدون تحميل.' : 'Copyright © 2026 Atari Arcade. All games are free to play with no download.'
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col antialiased">
      
      {/* 1. Header with Atari Minimalist Branding */}
      <header className="border-b border-[#e6e2d5] bg-white sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e31c23] flex items-center justify-center rounded-sm text-white font-black tracking-widest text-lg shadow-sm">
              Λ
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1c1a17] flex items-center gap-1.5 font-serif">
                {t.heroTitle}
                <span className="text-xs bg-[#f0ede4] text-[#706c5f] font-sans px-2 py-0.5 rounded-full font-normal">Retro</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button 
              id="btn-lang-toggle"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#706c5f] hover:text-[#1c1a17] hover:bg-[#f0ede4] transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Top Hero Section */}
      <section className="bg-gradient-to-b from-[#f2efe4] to-[#faf9f6] border-b border-[#e6e2d5] py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-[#e2decb] text-xs font-semibold text-[#e31c23]">
            <Flame className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'ألعاب مجانية أون لاين بدون تحميل' : 'Free Online Games - No Download Needed'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1c1a17] tracking-tight font-serif">
            {t.heroSubtitle}
          </h2>
          <p className="text-sm sm:text-base text-[#706c5f] max-w-xl mx-auto">
            {locale === 'ar' 
              ? 'تصفح والعب أكثر من 100+ لعبة كلاسيكية مستوردة ومحلية، من ألعاب الأركيد القديمة، سيارات، بازل وأكشن بجودة فائقة السرعة.' 
              : 'Browse and play over 100+ classic locally hand-tailored and dynamically imported arcade, racing, puzzle, and action games in pristine high-definition.'}
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-4 relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#949081]">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-games-input"
              type="text"
              className="w-full text-sm py-3 ps-10 pe-4 bg-white border border-[#cfcabba] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e31c23]/20 focus:border-[#e31c23] transition-all text-[#1c1a17] placeholder-[#949081] shadow-inner"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 3. Main Frame layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left/Middle Content: Player or Featured & Grid */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active IFrame Player Screen */}
          {selectedGame && (
            <div id="game-player-section" className="bg-white border border-[#e6e2d5] rounded-lg overflow-hidden shadow-sm flex flex-col">
              
              {/* Game Viewport Header */}
              <div className="bg-[#fcfbf9] border-b border-[#e6e2d5] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-[#e31c23]" />
                  <div>
                    <h3 className="font-bold text-base text-[#1c1a17]">
                      {typeof selectedGame.title === 'string' 
                        ? selectedGame.title 
                        : (selectedGame.title[locale] || selectedGame.title['en'])}
                    </h3>
                    <p className="text-xs text-[#706c5f] flex items-center gap-1">
                      <span className="bg-[#f0ede4] px-1.5 py-0.5 rounded text-[10px] font-bold text-[#5c5950] uppercase">
                        {selectedGame.category}
                      </span>
                      <span>•</span>
                      <span>{selectedGame.plays} {t.playsText}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-share-game"
                    onClick={handleShare}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-[#f0ede4] text-[#5c5950] rounded-md hover:bg-[#e6e2d5] transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? t.copiedText : t.shareLink}</span>
                  </button>

                  <button
                    id="btn-fullscreen"
                    onClick={() => setIsFullScreen(true)}
                    className="p-1.5 text-[#5c5950] hover:text-[#1c1a17] hover:bg-[#f0ede4] rounded transition-all cursor-pointer"
                    title={t.fullScreen}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Game Player Area */}
              <div className="bg-black relative aspect-video w-full overflow-hidden flex items-center justify-center">
                {isPlaying ? (
                  <iframe
                    id="game-iframe"
                    src={selectedGame.url}
                    className="w-full h-full border-0 absolute inset-0 bg-black"
                    allowFullScreen
                    scrolling="no"
                    allow="autoplay; gamepad"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#161513]">
                    {/* Retro Backdrop Cover */}
                    <div 
                      className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-md"
                      style={{ backgroundImage: `url(${selectedGame.thumb})` }}
                    />
                    
                    <div className="relative z-10 space-y-5 max-w-md">
                      <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                        <img 
                          src={selectedGame.thumb} 
                          alt={typeof selectedGame.title === 'string' ? selectedGame.title : selectedGame.title[locale]} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <span className="text-[10px] bg-[#e31c23] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {selectedGame.category}
                        </span>
                        <h4 className="text-2xl font-serif font-bold text-white mt-2">
                          {typeof selectedGame.title === 'string' 
                            ? selectedGame.title 
                            : (selectedGame.title[locale] || selectedGame.title['en'])}
                        </h4>
                      </div>
                      <button
                        id="btn-play-game"
                        onClick={() => setIsPlaying(true)}
                        className="inline-flex items-center gap-2 bg-[#e31c23] text-white px-8 py-3 rounded-md font-bold hover:bg-[#b81419] transform hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer text-sm"
                      >
                        <Gamepad2 className="w-4 h-4" />
                        <span>{t.playBtn}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Info, Description, and Deep SEO metadata context */}
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0ede4] pb-4">
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-[#706c5f]">
                    <p className="flex items-center gap-1 bg-[#faf9f6] border border-[#e6e2d5] px-2.5 py-1 rounded">
                      <span className="font-semibold text-[#1c1a17]">{t.categoryLabel}:</span>
                      <span className="text-[#e31c23] font-bold">{selectedGame.category}</span>
                    </p>
                    <p className="flex items-center gap-1 bg-[#faf9f6] border border-[#e6e2d5] px-2.5 py-1 rounded">
                      <span className="font-semibold text-[#1c1a17]">{t.developerLabel}:</span>
                      <span className="text-[#5c5950] font-medium">{selectedGame.isLocal ? 'Atari Core' : 'GameMonetize Partner'}</span>
                    </p>
                    <p className="flex items-center gap-1 bg-[#faf9f6] border border-[#e6e2d5] px-2.5 py-1 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-[#1c1a17]">{selectedGame.rating || '4.8'} / 5</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#1c1a17] text-lg font-serif">
                    {locale === 'ar' ? 'حول اللعبة وتفاصيل اللعب' : 'About the Game & Instructions'}
                  </h4>
                  <p className="text-[#5c5950] text-sm leading-relaxed whitespace-pre-line">
                    {typeof selectedGame.description === 'string'
                      ? selectedGame.description
                      : (selectedGame.description[locale] || selectedGame.description['en'])}
                  </p>
                </div>

                {/* Core Search Keywords & SEO Footer */}
                <div className="mt-6 pt-4 border-t border-[#f0ede4] bg-[#faf9f6] p-4 rounded border border-[#e6e2d5] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1a17]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.metaTitle}</span>
                  </div>
                  <p className="text-xs text-[#706c5f] leading-relaxed">
                    {locale === 'ar' 
                      ? `أنت تشاهد صفحة السيو لألعاب الأركيد الكلاسيكية. الكلمات الدلالية المستهدفة في محركات البحث: going up rooftop game online, العاب اتاري قديمة مجانا, ألعاب فلاش كلاسيك بدون تنزيل.`
                      : `Targeted SEO Keywords for current item: going up rooftop game online, retro arcade portal, free browser action games, play classical atari offline games.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Games Grid Title & Categories */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-[#1c1a17] font-serif flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#e31c23]" />
                <span>{t.allGames} ({filteredGames.length})</span>
              </h3>

              {/* Categorization tabs */}
              <div className="flex flex-wrap gap-1.5 bg-[#f0ede4]/60 p-1 rounded-md border border-[#e6e2d5]">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-2.5 py-1.5 font-bold rounded transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-[#e31c23] text-white' 
                        : 'text-[#706c5f] hover:text-[#1c1a17] hover:bg-[#e6e2d5]'
                    }`}
                  >
                    {locale === 'ar' && cat === 'All' ? 'الكل' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Grid Games */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game);
                      setIsPlaying(false);
                      // Scroll to player smoothly
                      document.getElementById('game-player-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`bg-white border rounded-lg overflow-hidden cursor-pointer group hover:shadow-md transition-all ${
                      selectedGame?.id === game.id 
                        ? 'border-[#e31c23] ring-1 ring-[#e31c23]' 
                        : 'border-[#e6e2d5]'
                    }`}
                  >
                    {/* Card Thumbnail */}
                    <div className="aspect-square bg-[#f0ede4] relative overflow-hidden">
                      <img
                        src={game.thumb}
                        alt={typeof game.title === 'string' ? game.title : game.title[locale]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white font-bold bg-[#e31c23] px-1.5 py-0.5 rounded">
                          {t.playBtn}
                        </span>
                      </div>

                      {/* Local or dynamic flag */}
                      <span className={`absolute top-2 start-2 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                        game.isLocal 
                          ? 'bg-[#e31c23] text-white' 
                          : 'bg-[#1c1a17] text-white'
                      }`}>
                        {game.isLocal ? t.localGameTag : t.importedGameTag}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#e31c23]">
                        {game.category}
                      </p>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1c1a17] truncate">
                        {typeof game.title === 'string' ? game.title : (game.title[locale] || game.title['en'])}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-[#706c5f]">
                        <span className="flex items-center gap-0.5 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {game.rating || '4.7'}
                        </span>
                        <span>{game.plays} {t.playsText}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e6e2d5] rounded-lg p-12 text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-[#949081] mx-auto" />
                <p className="text-[#5c5950] font-semibold">{t.noGames}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Featured Game & SEO Portal info */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Featured Going Up Rooftop banner for premium exposure */}
          <div className="bg-gradient-to-br from-[#1c1a17] to-[#2c2722] text-white p-6 rounded-lg relative overflow-hidden shadow-md">
            {/* Subtle retro overlay pattern */}
            <div className="absolute right-0 bottom-0 opacity-10 font-bold font-serif text-[120px] select-none pointer-events-none transform translate-y-12">
              UP
            </div>

            <div className="relative z-10 space-y-4">
              <span className="inline-flex text-[9px] bg-[#e31c23] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                {locale === 'ar' ? 'اللعبة الأكثر طلباً' : 'MOST REQUESTED'}
              </span>

              <div className="space-y-1">
                <h4 className="text-xl font-bold font-serif leading-tight">
                  Going Up Rooftop Game Online
                </h4>
                <p className="text-xs text-white/70">
                  {locale === 'ar' ? 'تصنيف: أركيد كلاسيكي قديم' : 'Category: Retro Classic Arcade'}
                </p>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                {locale === 'ar' 
                  ? 'تسلق أسطح الأبراج القديمة والقفز بدقة بين المنصات الشاهقة قبل نفاد الوقت. أركيد كلاسيكي متوافق مع جميع الهواتف الذكية أون لاين.'
                  : 'Sling, hop, and climb across high rise building rooftops in this epic classic pixel-perfect reaction game. Responsive on all desktop & mobile platforms.'}
              </p>

              <button
                id="btn-quick-play-rooftop"
                onClick={() => {
                  const rooftop = LOCAL_GAMES.find(g => g.id === 'game-going-up-rooftop');
                  if (rooftop) {
                    setSelectedGame(rooftop);
                    setIsPlaying(true);
                    document.getElementById('game-player-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full text-center bg-white text-[#1c1a17] text-xs font-bold py-2.5 px-4 rounded hover:bg-[#f0ede4] active:scale-95 transition-all cursor-pointer"
              >
                {t.playBtn}
              </button>
            </div>
          </div>

          {/* Interactive Stats Panel */}
          <div className="bg-white border border-[#e6e2d5] p-5 rounded-lg space-y-4">
            <h4 className="font-bold text-sm text-[#1c1a17] border-b border-[#f0ede4] pb-3 flex items-center gap-1.5 font-serif uppercase tracking-wider">
              <Monitor className="w-4 h-4 text-[#e31c23]" />
              <span>{locale === 'ar' ? 'إحصائيات الأتاري' : 'ATARI PORTAL DATA'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#faf9f6] p-3 rounded border border-[#e6e2d5] text-center">
                <p className="text-[10px] text-[#706c5f] font-bold uppercase">{locale === 'ar' ? 'مجموع الألعاب' : 'TOTAL GAMES'}</p>
                <p className="text-xl font-black text-[#e31c23] mt-1">100+</p>
              </div>
              <div className="bg-[#faf9f6] p-3 rounded border border-[#e6e2d5] text-center">
                <p className="text-[10px] text-[#706c5f] font-bold uppercase">{locale === 'ar' ? 'اللاعبين اليوم' : 'DAILY PLAYERS'}</p>
                <p className="text-xl font-black text-[#1c1a17] mt-1">2,480</p>
              </div>
            </div>
          </div>

          {/* Platform Description Information */}
          <div className="bg-white border border-[#e6e2d5] p-5 rounded-lg space-y-3">
            <h4 className="font-bold text-sm text-[#1c1a17] flex items-center gap-1.5 font-serif uppercase tracking-wider">
              <Tv className="w-4 h-4 text-[#e31c23]" />
              <span>{locale === 'ar' ? 'تاريخ ألعاب الأتاري' : 'ABOUT RETRO ATARI'}</span>
            </h4>
            <p className="text-xs text-[#5c5950] leading-relaxed">
              {locale === 'ar' 
                ? 'تأسست أتاري عام 1972 وكانت الرائدة في مجالات ألعاب الصالات المنزلية والأركيد كألعاب بونغ، آسترويدز وغارة النهر. اليوم نعيد تقديم هذه الكلاسيكيات بنقاوة وسرعة فائقة للعب الفوري بدون أي تحميل مباشرة على متصفحك.'
                : 'Atari founded the home console era in 1972, creating icons like Pong, Asteroids, and River Raid. We bring back that legacy directly to your modern web browser with seamless controls, fully customized for responsive HTML5 standards.'}
            </p>
          </div>
        </aside>
      </main>

      {/* 4. Full Screen Play Modal */}
      {isFullScreen && selectedGame && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
          <div className="bg-[#1c1a17] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#e31c23]" />
              <span className="font-bold text-xs sm:text-sm">
                {typeof selectedGame.title === 'string' ? selectedGame.title : selectedGame.title[locale]}
              </span>
            </div>
            <button
              id="btn-close-fullscreen"
              onClick={() => setIsFullScreen(false)}
              className="text-white hover:text-[#e31c23] font-bold text-xs bg-white/10 px-3 py-1.5 rounded transition-all cursor-pointer"
            >
              {locale === 'ar' ? 'إغلاق الشاشة الكاملة' : 'Close Full Screen'}
            </button>
          </div>
          <div className="flex-1 bg-black relative">
            <iframe
              id="fullscreen-game-iframe"
              src={selectedGame.url}
              className="w-full h-full border-0"
              allowFullScreen
              scrolling="no"
              allow="autoplay; gamepad"
            />
          </div>
        </div>
      )}

      {/* 5. Elegant Footer */}
      <footer className="bg-white border-t border-[#e6e2d5] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-8 h-8 bg-[#e31c23] text-white flex items-center justify-center font-bold text-sm tracking-widest mx-auto">
            Λ
          </div>
          <p className="text-xs text-[#706c5f]">
            {t.footerText}
          </p>
          <div className="flex justify-center gap-4 text-xs font-semibold text-[#5c5950]">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[#e31c23] underline">Sitemap</a>
            <span>•</span>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[#e31c23] underline">Robots</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
