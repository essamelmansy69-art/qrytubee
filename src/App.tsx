import React, { useState, useEffect, useRef } from 'react';
import { Game } from './types';
import { 
  Gamepad2, 
  Search, 
  Heart, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  X, 
  Moon, 
  Sun, 
  Play, 
  Info, 
  Shuffle, 
  RotateCcw,
  Volume2,
  Cpu,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Share2
} from 'lucide-react';
import cheeseThumbnail from './assets/images/cheese_eater_thumbnail_1787373161126.jpg';
import tetrisThumbnail from './assets/images/tetris_thumbnail_1787444248779.jpg';
import breakoutThumbnail from './assets/images/breakout_thumbnail_1787511090254.jpg';
import candyCrushThumbnail from './assets/images/candy_crush_thumbnail_1787541332465.jpg';
import carRacingThumbnail from './assets/images/car_racing_thumbnail_1787601761728.jpg';
import planeShooterThumbnail from './assets/images/plane_shooter_thumb_1787712159818.jpg';

// Bilingual translations structure for premium localized design
const TRANSLATIONS = {
  ar: {
    title: "أتاري",
    subtitle: "منصة الألعاب الكلاسيكية",
    searchPlaceholder: "ابحث عن لعبة، تصنيف، أو طريقة لعب...",
    randomGame: "لعبة عشوائية",
    all: "الكل",
    action: "حركة وإثارة",
    puzzle: "ذكاء وألغاز",
    racing: "سباقات وسرعة",
    arcade: "أركيد كلاسيك",
    favorites: "ألعاب المفضلة",
    featured: "اللعبة المميزة اليوم",
    playNow: "العب الآن",
    controls: "طريقة التحكم",
    howToPlay: "كيفية اللعب والتحكم",
    moreGames: "ألعاب كلاسيكية مقترحة لك",
    noGames: "لم نعثر على أي ألعاب مطابقة",
    resetFilters: "إعادة ضبط البحث",
    favoritesEmpty: "قائمة ألعابك المفضلة فارغة حالياً. اضغط على رمز القلب لحفظ الألعاب المفضلة هنا والاستمتاع بها لاحقاً.",
    audioActive: "الصوت نشط",
    rated: "تقييم ممتاز",
    about: "نبذة عن اللعبة",
    footerText: "استمتع بأفضل العاب مجانية بدون تحميل! اكتشف تشكيلة ممتازة تشبه العاب بوكي والعاب ماهر، تشمل العاب بنات، العاب سيارات، العاب كمبيوتر، والعاب اطفال مميزة. العب العاب اليوم الآن!",
    rights: "جميع الحقوق محفوظة © ٢٠٢٦ منصة أتاري للألعاب الكلاسيكية.",
    langLabel: "English",
    themeToggle: "تغيير المظهر",
    copied: "تم نسخ الرابط!",
    share: "مشاركة"
  },
  en: {
    title: "Atari",
    subtitle: "Classic Arcade Hub",
    searchPlaceholder: "Search games, genres, or keywords...",
    randomGame: "Shuffle Play",
    all: "All",
    action: "Action",
    puzzle: "Puzzle",
    racing: "Racing",
    arcade: "Classic Arcade",
    favorites: "My Favorites",
    featured: "Featured Game of the Day",
    playNow: "Launch Game",
    controls: "Controls",
    howToPlay: "How to Play & Controls",
    moreGames: "More Retro Games For You",
    noGames: "No matching games found",
    resetFilters: "Clear Search Filters",
    favoritesEmpty: "Your favorite list is empty right now. Tap the heart symbol on any game card to save it here for quick access.",
    audioActive: "Audio Engaged",
    rated: "9.8 Top Rated",
    about: "About the Game",
    footerText: "Enjoy the best free online games with no download required! Discover a premium collection similar to Poki and Maher games, featuring girls games, car games, computer games, and special kids games. Play today's games now!",
    rights: "All rights reserved © 2026 Atari Classic Gaming Platform.",
    langLabel: "العربية",
    themeToggle: "Toggle Appearance",
    copied: "Link copied!",
    share: "Share Game"
  }
};

// Map raw categories to translation keys
type CategoryKey = 'All' | 'Action' | 'Puzzle' | 'Racing' | 'Arcade' | 'Favorites';

const CATEGORY_MAP: Record<CategoryKey, keyof typeof TRANSLATIONS.en> = {
  All: 'all',
  Action: 'action',
  Puzzle: 'puzzle',
  Racing: 'racing',
  Arcade: 'arcade',
  Favorites: 'favorites'
};

// Clean minimalist category accents
const CATEGORY_ACCENT_STYLES: Record<string, string> = {
  'All': 'from-amber-500 to-amber-600 ring-amber-500/30 text-slate-950',
  'Action': 'from-emerald-500 to-teal-600 ring-emerald-500/30 text-slate-950',
  'Puzzle': 'from-sky-500 to-indigo-600 ring-sky-500/30 text-slate-950',
  'Racing': 'from-rose-500 to-orange-600 ring-rose-500/30 text-slate-950',
  'Arcade': 'from-purple-500 to-violet-600 ring-purple-500/30 text-slate-950',
  'Favorites': 'from-red-500 to-pink-600 ring-red-500/30 text-slate-950'
};

// Multi-lingual Game Database with Arabic & English support
const GAME_DATABASE_LOCALIZED = [
  {
    id: 'game-cheese-eater',
    category: 'Arcade' as const,
    thumbnailUrl: cheeseThumbnail,
    embedUrl: '/games/cheese-eater.html',
    title: { ar: 'أكل الجبنة', en: 'Cheese Eater' },
    description: {
      ar: 'العب لعبه أكل الجبنه باكمان الكلاسيكية الممتعة والمثيرة مجاناً وبدون تحميل! تحكّم بآكل الجبنة السريع، وتفادَ الأشباح الشريرة، واجمع كل قطع الجبنة الصفراء اللذيذة للفوز بالمرتبة والمرحلة الآن.',
      en: 'A thrilling classic retro game inspired by Pacman! Control the cheese-eater, dodge the scary ghosts, and eat all delicious cheese pieces to clear levels.'
    },
    controls: {
      ar: 'لوحة المفاتيح: استخدم أسهم الاتجاهات (فوق، تحت، يمين، يسار). على شاشات اللمس: استخدم أزرار التحكم الافتراضية (D-pad) المدمجة أو اسحب بإصبعك على شاشة اللعب.',
      en: 'Keyboard: Use Arrow keys to change direction. Mobile/Touch: Swipe on screen or use the built-in virtual D-pad buttons.'
    }
  },
  {
    id: 'game-tetris',
    category: 'Puzzle' as const,
    thumbnailUrl: tetrisThumbnail,
    embedUrl: '/games/tetris.html',
    title: { ar: 'لعبة تتريس اون لاين', en: 'Tetris Online' },
    description: {
      ar: 'العب لعبة تتريس اون لاين الكلاسيكية مجاناً وبدون تحميل! رتّب المكعبات المتساقطة، فكّك الصفوف الكاملة بمهارة وسرعة على الجوال والكمبيوتر لتحقيق أرقام قياسية جديدة.',
      en: 'Play the classic Tetris online game for free with no download required! Control the falling blocks, align full rows with speed and skill to clear lines and score high.'
    },
    controls: {
      ar: 'لوحة المفاتيح: أسهم الاتجاهات (يمين/يسار) للتحريك، سهم لأعلى للتدوير، سهم لأسفل للتسريع، مسطرة للإسقاط السريع. على الجوال: اسحب يميناً ويساراً للتحريك، انقر للتدوير، اسحب لأسفل للإسقاط الفوري، أو استخدم الأزرار السفلية المريحة.',
      en: 'Keyboard: Arrow keys (Left/Right) to move, Up arrow to rotate, Down arrow to soft drop, Spacebar to hard drop. Touch/Mobile: Swipe left/right to move, tap to rotate, swipe down to hard drop, or use the convenient touch buttons below.'
    }
  },
  {
    id: 'game-breakout',
    category: 'Arcade' as const,
    thumbnailUrl: breakoutThumbnail,
    embedUrl: '/games/breakout.html',
    title: { ar: 'لعبه هدم الجدران اتاري قديم بريك أوت ثلاثية الأبعاد', en: 'Atari Breakout 3D' },
    description: {
      ar: 'العب لعبه هدم الجدران اتاري قديم الكلاسيكية ثلاثية الأبعاد (Atari Breakout) مجاناً وبدون تحميل! دمّر الجدران من الطوب الملون بالمضرب والكرة، واجمع الهدايا كالمغناطيس والمضرب الكبير.',
      en: 'Play the classic Atari Breakout 3D game for free online with no download required! Break the colorful brick walls, collect power-ups like Magnet and Wide paddle, and aim for the high score.'
    },
    controls: {
      ar: 'لوحة المفاتيح: أسهم الاتجاهات أو مفاتيح A / D لتحريك المضرب يميناً ويساراً، ومفتاح المسافة لإطلاق الكرة الممسوكة بالمغناطيس. زر P للإيقاف المؤقت. على الجوال: اسحب المطلب بإصبعك يميناً ويساراً، ثم اسحب بسرعة أو انتظر لإطلاق الكرة الممسوكة.',
      en: 'Keyboard: Left/Right Arrow keys or A/D keys to move the paddle, Spacebar to release magnetic ball. Press P to Pause. Mobile/Touch: Drag/swipe the paddle left and right, then swipe fast or wait to release the magnetic ball.'
    }
  },
  {
    id: 'game-candy-crush',
    category: 'Arcade' as const,
    thumbnailUrl: candyCrushThumbnail,
    embedUrl: '/games/candy-crush.html',
    title: { ar: 'لعبة حلوى كاندي كراش ماتش 3', en: 'Candy Crush Match 3' },
    description: {
      ar: 'العب لعبة حلوى كاندي كراش (Candy Match 3) الممتعة مجاناً أون لاين وبدون تحميل! طابق 3 قطع حلوى متطابقة أو أكثر، اصنع القنابل والحلوى المخططة المميزة وفجّر الجدران اللذيذة لتحقيق أعلى النقاط قبل انتهاء حركاتك.',
      en: 'Play the sweet classic Candy Crush Match 3 game online for free with no download required! Swap and match 3 or more sweet candies, create striped sweets and color bomb powerups to clear the board.'
    },
    controls: {
      ar: 'لوحة المفاتيح والماوس: اسحب قطعة الحلوى أو انقر عليها ثم انقر على القطعة المجاورة لتبديل مكانها. زر P للإيقاف المؤقت. على الجوال: اسحب الحلوى بإصبعك إلى الاتجاه المجاور لمطابقتها.',
      en: 'Mouse/Keyboard: Drag candies with your mouse or click a candy and click an adjacent one to swap them. Press P to Pause. Touch/Mobile: Swipe candies left, right, up, or down to match.'
    }
  },
  {
    id: 'game-car-racing',
    category: 'Racing' as const,
    thumbnailUrl: carRacingThumbnail,
    embedUrl: '/games/car-racing.html',
    title: { ar: 'لعبه سباق السيارات ثلاثية الأبعاد نيون', en: 'Neon Highway Racer 3D' },
    description: {
      ar: 'العب لعبه سباق السيارات ثلاثية الابعاد اون لاين بنمط السنبثوايف الأسطوري والمثالي مجاناً وبدون تحميل! تسابق على طول الطريق السريع النيوني المتلألئ، تفادى سيارات الخصوم والعقبات المتتالية، واجمع كرات الشحن والنيترو للسرعات الخارقة.',
      en: 'Drive and sprint in a professional high-speed 3D Cyberpunk Neon Car Racing game for free online with no download! Navigate the glowing futuristic lanes, dodge traffic, gather gold coins, and activate nitrous shields.'
    },
    controls: {
      ar: 'لوحة المفاتيح: استخدم أسهم الاتجاهات لليمين واليسار (◀ ▶) أو مفاتيح A / D للتوجيه، وسهم لأعلى (▲) أو W لزيادة السرعة والنيترو، وسهم لأسفل (▼) أو S للفرامل. زر P للإيقاف المؤقت. على الجوال: اضغط على الأزرار الظاهرة للتوجيه، والبنزين والفرامل.',
      en: 'Keyboard: Left/Right arrows or A/D keys to steer, Up arrow or W key to accelerate and engage nitro, Down arrow or S key to brake. Press P to Pause. Touch/Mobile: Use the intuitive glowing left/right steer buttons and gas/brake pedals.'
    }
  },
  {
    id: 'game-plane-shooter',
    category: 'Action' as const,
    thumbnailUrl: planeShooterThumbnail,
    embedUrl: '/games/plane-shooter.html',
    title: { ar: 'لعبة غارة الطائرات أتاري كلاسيك', en: 'Atari River Raid Flight' },
    description: {
      ar: 'العب لعبة غارة الطائرات الأتاري الكلاسيكية أون لاين مجاناً وبدون تحميل! اختر مقاتلتك النفاثة المفضلة (F-16 Falcon أو مدمرة الدروع A-10 Thunderbolt أو SR-71 Stealth السريعة)، وتفادَ الحواجز الصخرية الصعبة وعقبات مجرى النهر، وأطلق النار والصواريخ لتدمير حصون الأعداء، واجمع براميل الوقود للبقاء محلقاً لأعلى النقاط!',
      en: 'Play the legendary classic Atari River Raid scrolling airplane shooter game online for free! Choose your favorite fighter jet (F-16 Falcon, heavily armored A-10 Thunderbolt, or rapid-fire SR-71 Stealth), dodge treacherous river cliffs, shoot down hostile gun turrets, and catch fuel canisters to survive!'
    },
    controls: {
      ar: 'لوحة المفاتيح: استخدم أسهم الاتجاهات (◀ ▶ ▲ ▼) أو مفاتيح A / S / D / W للتوجيه والتحكم بالسرعة، ومفتاح المسافة (Spacebar) أو مفتاح F لإطلاق النار والصواريخ. على شاشات الجوال: استخدم لوحة الاتجاهات (D-pad) وأزرار الإطلاق التفاعلية الظاهرة أسفل اللعبة.',
      en: 'Keyboard: Use Arrow keys or A/S/D/W keys to steer and accelerate/decelerate, and Spacebar or F key to fire missiles. Touch/Mobile: Use the on-screen glowing direction D-pad and red FIRE action button.'
    }
  }
];

export default function App() {
  // Locale State: Arabic by default, synced with URL query param for different language links
  const [locale, setLocale] = useState<'ar' | 'en'>(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam === 'en' || langParam === 'ar') {
      return langParam;
    }
    const saved = localStorage.getItem('atari_locale');
    return saved === 'en' ? 'en' : 'ar';
  });

  // Theme State: Dark mode (default & recommended for classic premium look) or light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('atari_theme');
    return saved !== 'light';
  });

  // Favorites list saved to localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('atari_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Search & Category Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('All');

  // Interactive Game Overlay Playroom Modal
  const [selectedGame, setSelectedGame] = useState<typeof GAME_DATABASE_LOCALIZED[0] | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[locale];

  // Apply theme class to HTML node
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('atari_theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('atari_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync state to URL and local storage
  useEffect(() => {
    localStorage.setItem('atari_locale', locale);
    // Sync document direction
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;

    // Update URL query parameter for Google indexing
    const params = new URLSearchParams(window.location.search);
    if (params.get('lang') !== locale) {
      params.set('lang', locale);
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('atari_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load game from URL search parameters on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (gameId) {
      const game = GAME_DATABASE_LOCALIZED.find(g => g.id === gameId);
      if (game) {
        setSelectedGame(game);
        setIsIframeLoading(true);
      }
    }
  }, []);

  // Synchronize selected game with the URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedGame) {
      if (params.get('game') !== selectedGame.id) {
        params.set('game', selectedGame.id);
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
    } else {
      if (params.has('game')) {
        params.delete('game');
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [selectedGame]);

  // Dynamic SEO Metadata updater for Google indexing and social shares
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');

    if (selectedGame) {
      const isCheeseGame = selectedGame.id === 'game-cheese-eater';
      const isTetrisGame = selectedGame.id === 'game-tetris';
      const isBreakoutGame = selectedGame.id === 'game-breakout';
      let titleStr = '';
      let descStr = '';

      if (isCheeseGame) {
        titleStr = locale === 'ar' 
          ? 'لعبه أكل الجبنه باكمان - العب كلاسيك أركيد مجاناً | أتاري' 
          : 'Cheese Eater Pacman Game - Play Retro Classic Arcade | Atari';
        descStr = locale === 'ar'
          ? 'العب لعبه أكل الجبنه باكمان الكلاسيكية الممتعة والمثيرة مجاناً وبدون تحميل! تحكّم بآكل الجبنة السريع، وتفادَ الأشباح الشريرة، واجمع كل قطع الجبنة الصفراء للفوز.'
          : 'Play the thrilling Cheese Eater Pacman retro game for free without downloading! Dodge the ghosts and eat all cheese pieces now.';
      } else if (isTetrisGame) {
        titleStr = locale === 'ar' 
          ? 'لعبة تتريس اون لاين - العب لعبة تتريس باللمس مجاناً وبدون تحميل | أتاري' 
          : 'Tetris Online Game - Play Retro Classic Puzzle For Free | Atari';
        descStr = locale === 'ar'
          ? 'العب لعبة تتريس اون لاين الكلاسيكية الممتعة مجاناً وبدون تحميل! تحكّم بالمكعبات المتساقطة، رتّب الصفوف بدقة على الجوال والكمبيوتر لتحصل على أعلى النقاط.'
          : 'Play the classic Tetris online game for free without downloading! Arrange the falling blocks on mobile or PC to clear lines and get the high score.';
      } else if (isBreakoutGame) {
        titleStr = locale === 'ar'
          ? 'لعبه هدم الجدران اتاري قديم بريك أوت - العب أتاري بريك اوت مجاناً'
          : 'Atari Breakout 3D Game - Play Free Brick Breaker Online | Atari';
        descStr = locale === 'ar'
          ? 'العب لعبه هدم الجدران اتاري قديم الكلاسيكية ثلاثية الأبعاد (Breakout) مجاناً وبدون تحميل! كسر جدار الطوب الملون بالمضرب، احصل على المغناطيس والتكبير، وحطم الرقم القياسي.'
          : 'Play the classic Atari Breakout 3D brick breaker game online for free with no download! Smash the colorful brick wall with the ball and paddle, collect power-ups, and get high scores.';
      } else if (selectedGame.id === 'game-candy-crush') {
        titleStr = locale === 'ar'
          ? 'لعبة كاندي كراش اون لاين مجاناً - لعبة حلوى كاندي ماتش 3'
          : 'Candy Crush Match 3 Game - Play Free Sweet Puzzle Online | Candy';
        descStr = locale === 'ar'
          ? 'العب لعبة كاندي كراش (Candy Match 3) الكلاسيكية الممتعة مجاناً أون لاين وبدون تحميل! طابق قطع الحلوى، اصنع القنابل الملونة والحلوى المخططة المميزة لتحقيق أعلى النقاط.'
          : 'Play the classic Candy Crush Match 3 game online for free with no download! Match tasty sweet candies, create delicious color bomb and striped power-ups to smash the board.';
      } else {
        titleStr = locale === 'ar'
          ? `${selectedGame.title.ar} - العب الآن | أتاري`
          : `${selectedGame.title.en} - Play Now | Atari`;
        descStr = locale === 'ar' ? selectedGame.description.ar : selectedGame.description.en;
      }

      document.title = titleStr;
      if (metaDescription) metaDescription.setAttribute('content', descStr);
      if (ogTitle) ogTitle.setAttribute('content', titleStr);
      if (ogDescription) ogDescription.setAttribute('content', descStr);
    } else {
      // Default website tags
      const defaultTitle = locale === 'ar'
        ? 'أتاري | العاب مجانية بدون تحميل - العب العاب اليوم الآن'
        : 'Atari | Free Online Games, No Download - Play Today\'s Games';
      const defaultDesc = locale === 'ar'
        ? 'استمتع بأفضل العاب مجانية بدون تحميل! اكتشف تشكيلة ممتازة تشبه العاب بوكي والعاب ماهر، تشمل العاب بنات، العاب سيارات، العاب كمبيوتر، والعاب اطفال مميزة. العب العاب اليوم الآن!'
        : 'Enjoy the best free online games with no download required! Discover a premium collection similar to Poki and Maher games, featuring girls games, car games, computer games, and special kids games. Play today\'s games now!';

      document.title = defaultTitle;
      if (metaDescription) metaDescription.setAttribute('content', defaultDesc);
      if (ogTitle) ogTitle.setAttribute('content', defaultTitle);
      if (ogDescription) ogDescription.setAttribute('content', defaultDesc);
    }
  }, [selectedGame, locale]);

  // Handle Fullscreen capability
  const toggleFullscreenMode = () => {
    if (!iframeContainerRef.current) return;
    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error going fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Monitor Escape or standard key exits from fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Filter game assets
  const filteredGames = GAME_DATABASE_LOCALIZED.filter((game) => {
    const titleMatch = (game.title[locale] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (game.description[locale] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = titleMatch || descMatch;

    if (activeCategory === 'All') {
      return queryMatch;
    } else if (activeCategory === 'Favorites') {
      return favorites.includes(game.id) && queryMatch;
    } else {
      return game.category === activeCategory && queryMatch;
    }
  });

  // Pick random game
  const playRandomGame = () => {
    const candidates = GAME_DATABASE_LOCALIZED;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setSelectedGame(candidates[randomIndex]);
    setIsIframeLoading(true);
  };

  // Favorite toggle helper
  const handleToggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  // Copy shareable link simulation
  const handleShareGame = (e: React.MouseEvent, gameTitle: string) => {
    e.stopPropagation();
    const mockUrl = `${window.location.origin}/?game=${selectedGame?.id || 'game-cheese-eater'}&lang=${locale}`;
    navigator.clipboard.writeText(mockUrl).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    });
  };

  // Hero game is the index-0 game
  const heroGame = GAME_DATABASE_LOCALIZED[0];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#090d16] text-[#e2e8f0]' 
        : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      
      {/* Sleek Header & Navbar */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all ${
        isDarkMode 
          ? 'bg-[#090d16]/90 border-slate-800/60 shadow-lg shadow-black/10' 
          : 'bg-white/90 border-slate-200/60 shadow-xs'
      } px-4 py-3.5 sm:px-6`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-[1.5px] shadow-md shadow-amber-500/10">
                <div className="w-full h-full rounded-[10px] bg-[#0c1324] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-[10px] font-semibold opacity-60 tracking-wider">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Mobile Actions: Language + Theme */}
            <div className="flex items-center gap-2 sm:hidden">
              <a
                href={`/?lang=${locale === 'ar' ? 'en' : 'ar'}`}
                onClick={(e) => {
                  e.preventDefault();
                  setLocale(locale === 'ar' ? 'en' : 'ar');
                }}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                  isDarkMode ? 'bg-[#131b2e] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {t.langLabel}
              </a>
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg border transition-all ${
                  isDarkMode ? 'bg-[#131b2e] border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
                aria-label={t.themeToggle}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search bar inside navigation (highly clean, minimal borders) */}
          <div className="flex-1 max-w-md relative">
            <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
              <Search className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${locale === 'ar' ? 'pl-4 pr-10' : 'pl-10 pr-4'} py-2 rounded-xl text-xs sm:text-sm font-medium transition-all outline-none border ${
                isDarkMode 
                  ? 'bg-[#0f172a] border-slate-800/80 text-white placeholder-slate-500 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/10' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/10'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-400 hover:text-slate-600`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop utility controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href={`/?lang=${locale === 'ar' ? 'en' : 'ar'}`}
              onClick={(e) => {
                e.preventDefault();
                setLocale(locale === 'ar' ? 'en' : 'ar');
              }}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#131b2e] border-slate-800/80 hover:border-slate-700 text-slate-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ArrowRightLeft className="w-3 h-3" />
                <span>{t.langLabel}</span>
              </div>
            </a>

            <button 
              onClick={playRandomGame}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{t.randomGame}</span>
            </button>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#131b2e] border-slate-800/80 hover:bg-slate-800 text-amber-400' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              aria-label={t.themeToggle}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-8">
        
        {/* Categories Bar - Beautiful, minimal segmented tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {(['All', 'Action', 'Puzzle', 'Racing', 'Arcade', 'Favorites'] as const).map((cat) => {
            const isActive = activeCategory === cat;
            const transKey = CATEGORY_MAP[cat];
            
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4.5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? isDarkMode 
                      ? 'bg-slate-800 text-amber-400 border border-slate-700/60 shadow-sm'
                      : 'bg-[#131b2e] text-amber-400 border border-slate-800/80 shadow-sm'
                    : isDarkMode 
                      ? 'bg-[#0f172a] text-slate-400 hover:bg-[#131b2e] hover:text-slate-300 border border-slate-800/30' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {cat === 'Favorites' && <Heart className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />}
                  {cat === 'All' && <Gamepad2 className="w-3.5 h-3.5" />}
                  {cat === 'Action' && <Sparkles className="w-3.5 h-3.5" />}
                  {cat === 'Puzzle' && <Cpu className="w-3.5 h-3.5" />}
                  {cat === 'Racing' && <TrendingUp className="w-3.5 h-3.5" />}
                  {cat === 'Arcade' && <Play className="w-3.5 h-3.5" />}
                  <span>{t[transKey]}</span>
                  {cat === 'Favorites' && favorites.length > 0 && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-full font-bold ml-1">
                      {favorites.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Hero Featured Game - Simple, extremely premium and clean */}
        {!searchQuery && activeCategory === 'All' && (
          <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#0f172a] border-slate-800/80 shadow-md' 
              : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
              
              {/* Left Side: Dynamic game card cover */}
              <div className="lg:col-span-5 aspect-video sm:aspect-square lg:aspect-square rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => { setSelectedGame(heroGame); setIsIframeLoading(true); }}>
                <img 
                  src={heroGame.thumbnailUrl} 
                  alt={heroGame.title[locale]} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {t.featured}
                </span>
              </div>

              {/* Right Side: Game metadata details */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/10">
                      {heroGame.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      ★ {t.rated}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {heroGame.title[locale]}
                  </h2>
                  
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {heroGame.description[locale]}
                  </p>
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  isDarkMode 
                    ? 'bg-[#131b2e]/60 border-slate-800/80 text-slate-300' 
                    : 'bg-slate-50 border-slate-200/80 text-slate-600'
                }`}>
                  <strong className="text-amber-500 font-bold block mb-1.5">{t.controls}:</strong>
                  {heroGame.controls[locale]}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => { setSelectedGame(heroGame); setIsIframeLoading(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t.playNow}</span>
                  </button>

                  <button 
                    onClick={(e) => handleToggleFavorite(e, heroGame.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      favorites.includes(heroGame.id)
                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                        : isDarkMode
                          ? 'bg-[#131b2e] border-slate-800 hover:bg-slate-800 text-slate-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                    title={favorites.includes(heroGame.id) ? 'Remove' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(heroGame.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Dynamic Games Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold tracking-tight">
              {activeCategory === 'All' && !searchQuery ? t.moreGames : activeCategory === 'Favorites' ? t.favorites : t[CATEGORY_MAP[activeCategory]]}
              {searchQuery && ` (${searchQuery})`}
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-slate-500/5 rounded-lg opacity-80 border border-slate-500/10">
              {filteredGames.length}
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {filteredGames.map((game) => {
                const isFav = favorites.includes(game.id);
                return (
                  <div 
                    key={game.id}
                    onClick={() => { setSelectedGame(game); setIsIframeLoading(true); }}
                    className={`group rounded-2xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#0f172a] border-slate-800/80 hover:border-slate-700' 
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square relative overflow-hidden bg-slate-900">
                      <img 
                        src={game.thumbnailUrl} 
                        alt={game.title[locale]} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Cover hover play state */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        </div>
                      </div>

                      {/* Favorite button overlay */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, game.id)}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all active:scale-90 ${
                          isFav 
                            ? 'bg-red-500 text-white shadow-sm' 
                            : 'bg-black/30 hover:bg-black/50 text-white hover:scale-105'
                        }`}
                        title={isFav ? 'Favorite' : 'Add favorite'}
                      >
                        <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {/* Category Pill Tag */}
                      <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-[9px] font-extrabold text-slate-300 px-2 py-0.5 rounded-md">
                        {game.category}
                      </span>
                    </div>

                    {/* Metadata below image */}
                    <div className="p-3">
                      <h4 className="font-extrabold text-xs tracking-tight truncate">
                        {game.title[locale]}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
                        {game.category} Classic
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty Filter View */
            <div className={`rounded-2xl p-10 text-center max-w-md mx-auto border ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-6 h-6 text-amber-500" />
              </div>
              <h4 className="font-bold text-sm">{t.noGames}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {activeCategory === 'Favorites' ? t.favoritesEmpty : t.noGames}
              </p>
              <div className="mt-5 flex justify-center">
                <button 
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.resetFilters}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Modern Professional Game modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-pop-in">
          
          <div className="relative w-full h-full sm:max-w-5xl sm:h-[85vh] bg-[#090d16] text-[#e2e8f0] sm:rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-800/60 shrink-0">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-4.5 h-4.5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight line-clamp-1">{selectedGame.title[locale]}</h3>
                  <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/10 px-2 py-0.5 rounded-md uppercase">
                    {selectedGame.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Share Option */}
                <button 
                  onClick={(e) => handleShareGame(e, selectedGame.title[locale])}
                  className="p-1.5 bg-slate-800 border border-slate-700/60 rounded-lg text-slate-200 hover:bg-slate-700 transition-all cursor-pointer relative"
                  title={t.share}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-1">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{t.share}</span>
                  </div>
                  {copiedNotification && (
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                      {t.copied}
                    </span>
                  )}
                </button>

                {/* Fullscreen Option */}
                <button 
                  onClick={toggleFullscreenMode}
                  className="p-2 bg-slate-800 border border-slate-700/60 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Favorite option */}
                <button 
                  onClick={(e) => handleToggleFavorite(e, selectedGame.id)}
                  className={`p-2 border rounded-lg transition-all cursor-pointer ${
                    favorites.includes(selectedGame.id)
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : 'bg-slate-800 border-slate-700/60 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(selectedGame.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Close modal option */}
                <button 
                  onClick={() => setSelectedGame(null)}
                  className="p-2 bg-red-950/40 border border-red-900/30 rounded-lg text-red-400 hover:bg-red-950/60 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Split viewport */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Left IFrame game canvas */}
              <div ref={iframeContainerRef} className="flex-1 bg-black relative flex flex-col h-[50vh] md:h-full">
                {isIframeLoading && (
                  <div className="absolute inset-0 bg-[#090d16] flex flex-col items-center justify-center z-10 p-4 text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-amber-500 animate-spin mb-4"></div>
                    <h4 className="text-sm font-bold text-white">تحميل اللعبة الكلاسيكية...</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      {selectedGame.title[locale]}
                    </p>
                  </div>
                )}

                <iframe 
                  src={selectedGame.embedUrl} 
                  title={selectedGame.title[locale]}
                  className="w-full h-full border-0 bg-black flex-1"
                  allow="autoplay; gamepad; fullscreen; keyboard"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsIframeLoading(false)}
                />

                {/* Floating controls inside Fullscreen */}
                {isFullscreen && (
                  <div className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} z-20 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity`}>
                    <button 
                      onClick={toggleFullscreenMode}
                      className="p-2 bg-black/80 backdrop-blur-md rounded-lg text-white"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        document.exitFullscreen().catch(()=>{});
                        setSelectedGame(null);
                      }}
                      className="p-2 bg-red-600 rounded-lg text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side Sidebar (Clean recommendations & controllers guide) */}
              <div className={`w-full md:w-72 border-t md:border-t-0 ${
                locale === 'ar' ? 'md:border-r' : 'md:border-l'
              } ${isDarkMode ? 'bg-[#0f172a] border-slate-800/60' : 'bg-[#f8fafc] border-slate-200'} flex flex-col overflow-y-auto shrink-0 p-4 h-[35vh] md:h-full`}>
                
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold tracking-wide uppercase">{t.moreGames}</h4>
                </div>

                <div className="space-y-2">
                  {GAME_DATABASE_LOCALIZED
                    .filter((g) => g.id !== selectedGame.id)
                    .slice(0, 4)
                    .map((recGame) => (
                      <div 
                        key={recGame.id}
                        onClick={() => {
                          setSelectedGame(recGame);
                          setIsIframeLoading(true);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                          isDarkMode 
                            ? 'bg-[#131b2e] border-slate-800/40 hover:border-amber-500/20 hover:bg-[#18223c]' 
                            : 'bg-white border-slate-200/60 hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={recGame.thumbnailUrl} 
                          alt={recGame.title[locale]} 
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs truncate">{recGame.title[locale]}</h5>
                          <span className="text-[9px] font-semibold text-slate-500">{recGame.category}</span>
                        </div>
                        <Play className="w-3 h-3 text-amber-500 opacity-85" />
                      </div>
                    ))}
                </div>

                {/* Instructions Drawer */}
                <div className={`mt-4 p-3.5 rounded-xl border text-[11px] leading-relaxed space-y-2 mt-auto shrink-0 ${
                  isDarkMode ? 'bg-[#131b2e] border-slate-800/40 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Info className="w-3.5 h-3.5" />
                    <span>{t.howToPlay}:</span>
                  </div>
                  <p>{selectedGame.controls[locale]}</p>
                </div>
              </div>

            </div>

            {/* Bottom Panel bar */}
            <div className="hidden sm:block px-5 py-4 bg-[#0f172a] border-t border-slate-800/60 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <h4 className="font-bold text-xs text-slate-400">{t.about} {selectedGame.title[locale]}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {selectedGame.description[locale]}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-full">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{t.audioActive}</span>
                  </div>
                  <div className="text-slate-300 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
                    ★ {t.rated}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer Block */}
      <footer className={`border-t py-10 text-center text-xs transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#060a10] border-slate-800/40 text-slate-500' 
          : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-amber-500">
            <Gamepad2 className="w-5 h-5 text-amber-500" />
            <span>{t.title}</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-[11px]">
            {t.footerText}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-bold">
            <span className="hover:text-amber-500 transition-colors cursor-pointer" onClick={() => setActiveCategory('All')}>{t.all}</span>
            <span>•</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer" onClick={() => setActiveCategory('Favorites')}>{t.favorites}</span>
            <span>•</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer" onClick={playRandomGame}>{t.randomGame}</span>
          </div>
          <p className="text-[10px] opacity-75 pt-3">
            {t.rights}
          </p>
        </div>
      </footer>

    </div>
  );
}
