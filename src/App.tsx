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
  Share2,
  Globe,
  ArrowUp
} from 'lucide-react';
import cheeseThumbnail from './assets/images/cheese_eater_thumbnail_1787373161126.jpg';
import tetrisThumbnail from './assets/images/tetris_thumbnail_1787444248779.jpg';
import breakoutThumbnail from './assets/images/breakout_thumbnail_1787511090254.jpg';
import candyCrushThumbnail from './assets/images/candy_crush_thumbnail_1787541332465.jpg';
import carRacingThumbnail from './assets/images/car_racing_thumbnail_1787601761728.jpg';
import planeShooterThumbnail from './assets/images/plane_shooter_thumb_1787712159818.jpg';
import ludoThumbnail from './assets/images/ludo_thumbnail_1787977186825.jpg';
import bubbleShooter3DThumbnail from './assets/images/bubble_shooter_3d_thumbnail_1788115719156.jpg';
import tripuzzleThumbnail from './assets/images/tripuzzle_thumbnail_1788133227750.jpg';
import numberSearchThumbnail from './assets/images/number_search_thumbnail_1788145573502.jpg';
import zumaThumbnail from './assets/images/zuma_thumbnail_1788190967005.jpg';
import sudokuThumbnail from './assets/images/sudoku_thumbnail_1788237960483.jpg';
import taxiRushThumbnail from './assets/images/taxi_rush_thumbnail_1788539643138.jpg';

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
    share: "مشاركة",
    quickLinks: "روابط سريعة",
    categories: "أقسام الألعاب",
    settings: "تفضيلات المظهر",
    language: "لغة العرض",
    aboutPlatform: "عن منصة أتاري",
    backToTop: "العودة للأعلى",
    currentLang: "اللغة الحالية: العربية",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الاستخدام",
    copyrightPolicy: "سياسة حقوق النشر (DMCA)",
    legalPages: "الصفحات القانونية",
    close: "إغلاق"
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
    share: "Share Game",
    quickLinks: "Quick Links",
    categories: "Game Categories",
    settings: "Appearance Settings",
    language: "Display Language",
    aboutPlatform: "About Atari Hub",
    backToTop: "Back to Top",
    currentLang: "Current: English",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    copyrightPolicy: "Copyright & DMCA Policy",
    legalPages: "Legal Information",
    close: "Close"
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
  },
  {
    id: 'game-ludo',
    category: 'Puzzle' as const,
    thumbnailUrl: ludoThumbnail,
    embedUrl: '/games/ludo.html',
    title: { ar: 'لعبه لودو اون لاين الكلاسيكية الاحترافية', en: 'Retro Ludo Board Pro' },
    description: {
      ar: 'استمتع بلعب لعبه لودو اون لاين الكلاسيكية الشهيرة والمحبوبة مجاناً وبدون تحميل على الجوال والكمبيوتر! تحكّم بقطعك الأربعة، ارمِ النرد واحصّل على الرقم 6 للانطلاق، وتفادَ قطع الخصوم أو قم بأسرها لتعود لبيتها، وتنافس في وضع اللعب الفردي ضد كمبيوتر ذكي أو مع أصدقائك بوضع اللعب المحلي الممتع والمثالي بدون أخطاء.',
      en: 'Play the popular classic Ludo board game online for free with no downloads! Control your four tokens, roll the dice, unlock with a 6, capture opponent tokens to send them back home, and compete in single-player vs smart computer AI or multi-player with friends locally.'
    },
    controls: {
      ar: 'الماوس/الكيبورد: انقر على النرد أو اضغط على مفتاح المسافة (Spacebar) للرمي، ثم انقر فوق القطعة النشطة والمضيئة لتحريكها. على الجوال: انقر فوق النرد للرمي، ثم انقر فوق قطعك المضيئة للتحرك بسلاسة وبدون تعقيد.',
      en: 'Mouse/Keyboard: Click the dice or press Spacebar to roll, then click any glowing active token to move it. Mobile/Touch: Tap the dice to roll, then tap your glowing tokens to move them smoothly.'
    }
  },
  {
    id: 'game-bubble-shooter-3d',
    category: 'Puzzle' as const,
    thumbnailUrl: bubbleShooter3DThumbnail,
    embedUrl: '/games/bubble-shooter-3d.html',
    title: { ar: 'بابل شوتر آنلاین - لعبة بابل شوتر 3D', en: 'Bubble Shooter 3D Online' },
    description: {
      ar: 'استمتع بلعب بابل شوتر آنلاین مجاناً وبدون تحميل على موقع أتاري للألعاب! صوّب قاذفة الفقاعات الملونة بذكاء، وطابق 3 كرات أو أكثر من نفس اللون لتفجيرها وإخلاء ساحة اللعب تماماً. استمتع بمستويات لا حصر لها، ورسومات ثلاثية الأبعاد جذابة، ونظام نقاط تفاعلي ممتع.',
      en: 'Play Bubble Shooter 3D online for free with no downloads on Atari Games! Aim your bubble launcher strategically and match 3 or more bubbles of the same color to pop them and clear the board. Enjoy endless engaging levels, beautiful 3D bubble designs, and fun high score trackers.'
    },
    controls: {
      ar: 'الماوس/الكيبورد: صوّب بالماوس وانقر بزر الماوس الأيسر للإطلاق وتفجير الفقاعات المتطابقة. على الجوال: المس الشاشة ووجّه مسار الإطلاق ثم افلت إصبعك لإطلاق الفقاعة.',
      en: 'Mouse/Keyboard: Aim with the mouse and left-click to fire and pop matching bubbles. Mobile/Touch: Tap, hold to aim the path, and release to shoot the bubble.'
    }
  },
  {
    id: 'game-tri-puzzle',
    category: 'Puzzle' as const,
    thumbnailUrl: tripuzzleThumbnail,
    embedUrl: '/games/tri-puzzle.html',
    title: { ar: 'لعبة تراي بازل - TriPuzzle أون لاين', en: 'TriPuzzle Block Craft' },
    description: {
      ar: 'العب لعبة الألغاز والذكاء الهندسية الشهيرة تراي بازل (TriPuzzle) مجاناً وبدون تحميل على موقع أتاري للألعاب! تحدى عقلك واسحب المثلثات الملونة لتشكيل الأشكال الهندسية المتطابقة بشكل مثالي وتجاوز المستويات الشيقة والمسلية.',
      en: 'Play the popular geometric brain-training TriPuzzle game online for free on Atari Games! Challenge your cognitive skills, drag colored triangular blocks, and fit them perfectly into structural grid shapes to clear levels.'
    },
    controls: {
      ar: 'الماوس/الكيبورد: اسحب المثلثات الملونة من اللوحة السفلية وضعها داخل الشكل المناسب. على الجوال: المس المثلث واسحبه لتطابق الأشكال الهندسية بدقة وسلاسة.',
      en: 'Mouse/Keyboard: Drag the colored triangles from the tray and fit them inside the geometric frame. Mobile/Touch: Tap and slide the triangular blocks with your finger to complete the puzzles.'
    }
  },
  {
    id: 'game-number-search',
    category: 'Puzzle' as const,
    thumbnailUrl: numberSearchThumbnail,
    embedUrl: '/games/number-search.html',
    title: { ar: 'البحث عن الأرقام - Number Search Game Printable', en: 'Number Search Game Printable' },
    description: {
      ar: 'العب واستمتع بأفضل لعبة البحث عن الأرقام (number search game printable) مجاناً وبدون تحميل على موقع أتاري للألعاب! تحدى سرعة بديهتك ودقة ملاحظتك أون لاين.',
      en: 'Enjoy the ultimate classic number search game printable style directly on your browser! Scan the grid, find target numbers as fast as possible, and connect them.'
    },
    controls: {
      ar: 'الماوس/الكيبورد: انقر واسحب مؤشر الماوس فوق خط الأرقام المتجاورة أفقياً أو عمودياً أو قطرياً لتحديدها. على الجوال: المس واسحب إصبعك لتحديد وحل الأرقام.',
      en: 'Mouse/Keyboard: Click and drag your cursor over adjacent grid numbers to select them horizontally, vertically, or diagonally. Mobile/Touch: Tap and slide your finger to connect target numbers.'
    }
  },
  {
    id: 'game-zuma-legend',
    category: 'Puzzle' as const,
    thumbnailUrl: zumaThumbnail,
    embedUrl: '/games/zuma.html',
    title: { ar: 'لعبة زومة كلاسيك مجاناً | zuma game free download', en: 'Zuma Game Free Download & Play Online | Zuma Legend' },
    description: {
      ar: 'إذا كنت تبحث عن روابط zuma game free download لتجربة لعبة زومة الكلاسيكية، نوفر لك هنا إمكانية لعب لعبة زومة ليجند الأسطورية أون لاين مجاناً وبدون الحاجة لتحميل أي ملفات! طابق 3 كرات أو أكثر وفجّر السلسلة في 100 مستوى رائع ومثير.',
      en: 'Looking for a zuma game free download? Experience the legendary Zuma game online free with no installation required! Match 3 or more colored marbles, blast the chain, and conquer all 100 challenging levels directly on your device.'
    },
    controls: {
      ar: 'الماوس/الكيبورد: صوّب وحرّك بالماوس لتوجيه الإطلاق، وانقر بزر الماوس الأيسر لإطلاق الكرة. انقر فوق الضفدع لتغيير لون الكرة المطلقة. على الجوال: المس الشاشة ووجّه مسار الضفدع لتحديد زاوية الإطلاق ثم اضغط للإطلاق وتغيير الألوان.',
      en: 'Mouse/Keyboard: Aim with the cursor to steer, and left-click to fire. Tap the shooter frog to swap the current ball color with the next one. Mobile/Touch: Tap on screen in the desired direction to aim and shoot marbles.'
    }
  },
  {
    id: 'game-daily-mini-sudoku',
    category: 'Puzzle' as const,
    thumbnailUrl: sudokuThumbnail,
    embedUrl: '/games/daily-mini-sudoku.html',
    title: { ar: 'لعبة سودوكو المصغرة اليومية | mini sudoku online', en: 'Daily Mini Sudoku Online | mini sudoku online' },
    description: {
      ar: 'استمتع بتجربة لعبة mini sudoku online اليومية المميزة والسهلة مجاناً! حل ألغاز سودوكو المصغرة الممتعة لتنشيط ذكائك وذاكرتك يومياً بدون تحميل مباشرة من متصفحك.',
      en: 'Play the ultimate mini sudoku online game for free! Solve daily quick 6x6 grid puzzles directly in your browser. Perfect for a quick, brain-stimulating challenge anytime, anywhere.'
    },
    controls: {
      ar: 'لوحة المفاتيح والماوس: انقر فوق المربع الفارغ لاختياره ثم اضغط على الرقم المناسب من لوحة المفاتيح أو من الأرقام المعروضة بالشاشة. على الجوال: اضغط على المربع ثم حدد الرقم المطلوب لملء الشبكة.',
      en: 'Mouse/Keyboard: Click on any empty cell to select it, then press the desired number from your keyboard or screen keypad. Mobile/Touch: Tap on a cell and choose the correct number to fill.'
    }
  },
  {
    id: 'game-taxi-rush',
    category: 'Racing' as const,
    thumbnailUrl: taxiRushThumbnail,
    embedUrl: '/games/taxi-rush.html',
    title: { ar: 'لعبة تاكسي راش أون لاين مجاناً | crazy taxi city rush game', en: 'Taxi Rush Game Free Online | Play Crazy Taxi City Rush Game' },
    description: {
      ar: 'العب لعبة تاكسي راش (Taxi Rush) الممتعة والمثيرة مجاناً أون لاين! تحكّم بسيارة الأجرة السريعة في وسط المدينة المزدحم وتفادَ الحوادث في لعبة crazy taxi city rush game الأسطورية بدون تحميل.',
      en: 'Play the exciting Taxi Rush game free online with no downloads! Drive your fast cab through heavy traffic and pick up passengers in this legendary crazy taxi city rush game.'
    },
    controls: {
      ar: 'لوحة المفاتيح: استخدم أسهم الاتجاهات لليمين واليسار (◀ ▶) أو مفاتيح A / D للتوجيه والتحكم بالسيارة. على الجوال: استخدم الأزرار التفاعلية المريحة الظاهرة أسفل اللعبة للتوجيه يميناً ويساراً.',
      en: 'Keyboard: Use Left/Right Arrow keys or A/D keys to steer your yellow cab. Mobile/Touch: Tap the left or right glowing button arrows on the screen to turn smoothly.'
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
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isUrlLoaded, setIsUrlLoaded] = useState<boolean>(false);

  // Dynamic Game State loaded from local database + GameMonetize Feed
  const [games, setGames] = useState<any[]>(() => GAME_DATABASE_LOCALIZED);
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(false);

  // Fetch dynamic games from proxy, with direct client-side fallback if proxy is cached/unavailable
  useEffect(() => {
    let active = true;
    async function loadGames() {
      setIsLoadingGames(true);
      
      // Define a general normalizer for any GameMonetize raw or proxied item
      const normalizeItem = (item: any) => {
        const gameId = String(item.id || `gm-${Math.random().toString(36).substring(2, 11)}`);
        const gameTitle = String(item.title || "Untitled Game").trim();
        const gameCategory = String(item.category || "Arcade").trim();
        const gameThumb = String(item.thumb || item.thumbnailUrl || "").trim();
        const gameUrl = String(item.url || item.embedUrl || "").trim();
        const gameDesc = String(item.description || "").trim();
        const gameControls = String(item.instructions || item.controls || "Mouse and Keyboard controls").trim();

        return {
          id: gameId,
          category: gameCategory,
          thumbnailUrl: gameThumb,
          embedUrl: gameUrl,
          title: {
            ar: gameTitle,
            en: gameTitle
          },
          description: {
            ar: gameDesc,
            en: gameDesc
          },
          controls: {
            ar: gameControls,
            en: gameControls
          }
        };
      };

      try {
        // Try fetching through our secure backend proxy first
        try {
          const res = await fetch('/api/games');
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            const text = await res.text();
            if (text.trim().startsWith('[')) {
              const data = JSON.parse(text);
              if (active && Array.isArray(data)) {
                const normalized = data.map(normalizeItem);
                setGames(prev => {
                  const existingIds = prev.map(g => g.id);
                  const fresh = normalized.filter((g: any) => !existingIds.includes(g.id));
                  return [...prev, ...fresh];
                });
                return; // Successfully loaded from proxy
              }
            }
          }
          throw new Error('Proxy responded with non-JSON or invalid format');
        } catch (proxyError) {
          console.warn('Backend proxy unavailable, falling back to direct client-side fetch:', proxyError);
          
          // Fallback: Fetch directly from GameMonetize (which has Access-Control-Allow-Origin: *)
          const res = await fetch('https://gamemonetize.com/feed.php?format=0&num=50&page=1');
          if (!res.ok) {
            throw new Error(`Direct fetch failed: ${res.statusText}`);
          }
          const text = await res.text();
          if (!text.trim().startsWith('[')) {
            throw new Error('Received non-JSON content from direct GameMonetize feed (probably HTML / CORS block / Adblocker)');
          }
          const data = JSON.parse(text);
          if (active && Array.isArray(data)) {
            const normalized = data.map(normalizeItem);
            setGames(prev => {
              const existingIds = prev.map(g => g.id);
              const fresh = normalized.filter((g: any) => !existingIds.includes(g.id));
              return [...prev, ...fresh];
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching dynamic games feed through both paths (using local fallback database):', err);
      } finally {
        if (active) setIsLoadingGames(false);
      }
    }
    loadGames();
    return () => {
      active = false;
    };
  }, []);

  // Compute dynamic categories present in the active games database
  const availableCategories = React.useMemo(() => {
    const cats = new Set<string>();
    games.forEach(g => {
      if (g.category) {
        cats.add(g.category);
      }
    });
    const standardCats = ['Action', 'Puzzle', 'Racing', 'Arcade'];
    const otherCats = Array.from(cats).filter(c => !standardCats.includes(c)).sort();
    return ['All', ...standardCats, ...otherCats, 'Favorites'];
  }, [games]);

  // Translate category titles
  const getCategoryName = (cat: string) => {
    if (locale === 'en') {
      if (cat === 'All') return 'All';
      if (cat === 'Favorites') return 'My Favorites';
      return cat;
    } else {
      const arabicMap: Record<string, string> = {
        'All': 'الكل',
        'Action': 'حركة وإثارة',
        'Puzzle': 'ذكاء وألغاز',
        'Racing': 'سباقات وسرعة',
        'Arcade': 'أركيد كلاسيك',
        'Favorites': 'ألعاب المفضلة',
        '3D': 'ثلاثي الأبعاد',
        'Adventure': 'مغامرات',
        'Shooting': 'إطلاق نار',
        'Sports': 'رياضة',
        'Girls': 'بنات',
        'Boys': 'أولاد',
        'Multiplayer': 'ألعاب جماعية',
        'Simulation': 'محاكاة',
        'Platformer': 'ألعاب منصات',
        'Driving': 'قيادة وسيارات',
        'Strategy': 'إستراتيجية',
        'Fighting': 'قتال ومواجهة',
        'Hypercasual': 'ألعاب خفيفة'
      };
      return arabicMap[cat] || cat;
    }
  };

  // Interactive Game Overlay Playroom Modal
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Active Legal Page Modal Tab: 'privacy' | 'terms' | 'dmca' | null
  const [activeLegalTab, setActiveLegalTab] = useState<'privacy' | 'terms' | 'dmca' | null>(null);

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

  // Load game from URL search parameters only on startup once games load
  useEffect(() => {
    if (isUrlLoaded || games.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (gameId) {
      const game = games.find(g => g.id === gameId);
      if (game) {
        setSelectedGame(game);
        setIsIframeLoading(true);
      }
    }
    setIsUrlLoaded(true);
  }, [games, isUrlLoaded]);

  // Set an automatic safety fallback timer to dismiss the loading screen
  useEffect(() => {
    if (selectedGame && isIframeLoading) {
      const timer = setTimeout(() => {
        setIsIframeLoading(false);
      }, 2500); // 2.5 seconds maximum loading screen visibility
      return () => clearTimeout(timer);
    }
  }, [selectedGame, isIframeLoading]);

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

  // Listen for goBack messages from game iframes to close play modal automatically
  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.data === 'goBack') {
        setSelectedGame(null);
      }
    };
    window.addEventListener('message', handleGameMessage);
    return () => {
      window.removeEventListener('message', handleGameMessage);
    };
  }, []);

  // Back button (popstate) and Keyboard Escape support to close active game modal gracefully on mobile/desktop
  useEffect(() => {
    if (!selectedGame) return;

    const stateKey = 'game_playroom_active';
    // Push temporary state so that physical or browser back gestures trigger popstate instead of leaving the site
    window.history.pushState({ modalActive: stateKey }, '');

    const handlePopState = (e: PopStateEvent) => {
      setSelectedGame(null);
      setIsFullscreen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGame(null);
        setIsFullscreen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      // Clean up browser history stack if user clicked the Close "X" button manually
      if (window.history.state && window.history.state.modalActive === stateKey) {
        window.history.back();
      }
    };
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
      } else if (
        selectedGame.id === 'game-going-up-rooftop' || 
        selectedGame.id === 'going-up-rooftop' ||
        (selectedGame.title && selectedGame.title.en && selectedGame.title.en.toLowerCase().includes('going up rooftop')) ||
        (selectedGame.title && selectedGame.title.ar && selectedGame.title.ar.toLowerCase().includes('going up rooftop'))
      ) {
        titleStr = locale === 'ar'
          ? 'لعبة Going Up Rooftop اون لاين - العب أركيد كلاسيك مجاناً'
          : 'Going Up Rooftop Game Online - Play Free Classic Arcade | Atari';
        descStr = locale === 'ar'
          ? 'العب لعبة Going Up Rooftop اون لاين الكلاسيكية مجاناً وبدون تحميل! تسلق أسطح المنازل والمباني العالية، تجنب العقبات الخطيرة، وحقق أعلى النقاط في هذه اللعبة الحماسية الشيقة (going up rooftop game online).'
          : 'Play the exciting going up rooftop game online for free with no download! Climb rooftop heights, dodge challenging obstacles, and reach the top in this thrilling classic retro arcade game.';
      } else if (
        selectedGame.id === 'game-taxi-rush' ||
        selectedGame.id === 'taxi-rush' ||
        (selectedGame.title && selectedGame.title.en && selectedGame.title.en.toLowerCase().includes('taxi')) ||
        (selectedGame.title && selectedGame.title.ar && selectedGame.title.ar.toLowerCase().includes('تاكسي'))
      ) {
        titleStr = locale === 'ar'
          ? 'لعبة تاكسي راش أون لاين مجاناً | crazy taxi city rush game'
          : 'Taxi Rush Game Free Online | Play Crazy Taxi City Rush Game';
        descStr = locale === 'ar'
          ? 'العب لعبة تاكسي راش (Taxi Rush) الممتعة والمثيرة مجاناً أون لاين! تحكّم بسيارة الأجرة السريعة في وسط المدينة المزدحم وتفادَ الحوادث في لعبة crazy taxi city rush game الأسطورية بدون تحميل.'
          : 'Play the exciting Taxi Rush game free online with no downloads! Drive your fast cab through heavy traffic and pick up passengers in this legendary crazy taxi city rush game.';
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
  const filteredGames = games.filter((game) => {
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
    if (games.length === 0) return;
    const randomIndex = Math.floor(Math.random() * games.length);
    setSelectedGame(games[randomIndex]);
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
          {availableCategories.map((cat) => {
            const isActive = activeCategory === cat;
            
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
                  {!['Favorites', 'All', 'Action', 'Puzzle', 'Racing', 'Arcade'].includes(cat) && <Sparkles className="w-3.5 h-3.5" />}
                  <span>{getCategoryName(cat)}</span>
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

        {/* Dynamic Games Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              {activeCategory === 'All' && !searchQuery ? t.moreGames : activeCategory === 'Favorites' ? t.favorites : getCategoryName(activeCategory)}
              {searchQuery && ` (${searchQuery})`}
            </h2>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-slate-500/5 rounded-lg opacity-80 border border-slate-500/10">
              {filteredGames.length}
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {filteredGames.map((game, index) => {
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
                        loading={index < 4 ? "eager" : "lazy"}
                        fetchPriority={index < 4 ? "high" : "auto"}
                        decoding="async"
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
                        {getCategoryName(game.category)}
                      </span>
                    </div>

                    {/* Metadata below image */}
                    <div className="p-3">
                      <h3 className="font-extrabold text-xs tracking-tight truncate">
                        {game.title[locale]}
                      </h3>
                      <p className={`text-[10px] mt-0.5 font-semibold truncate ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {getCategoryName(game.category)} Classic
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
              <h3 className="font-bold text-sm">{t.noGames}</h3>
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

                {/* Close modal option - High contrast easily tappable bilingual button */}
                <button 
                  onClick={() => setSelectedGame(null)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-500/15 hover:bg-red-500/25 active:scale-95 border border-red-500/45 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer font-bold text-xs shadow-lg shadow-red-500/5 min-h-[38px]"
                  title={locale === 'ar' ? 'خروج من اللعبة' : 'Exit Game'}
                >
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{locale === 'ar' ? 'خروج' : 'Exit'}</span>
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
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
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
                  <h3 className="text-xs font-bold tracking-wide uppercase">{t.moreGames}</h3>
                </div>

                <div className="space-y-2">
                  {games
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
                          <h4 className="font-bold text-xs truncate">{recGame.title[locale]}</h4>
                          <span className={`text-[9px] font-bold ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>{getCategoryName(recGame.category)}</span>
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
                  <h3 className="font-bold text-xs text-slate-400">{t.about} {selectedGame.title[locale]}</h3>
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

      {/* Legal Information Modal Dialog */}
      {activeLegalTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setActiveLegalTab(null)}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Modal Container */}
          <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 flex flex-col max-h-[85vh] ${
            isDarkMode 
              ? 'bg-[#0b1220] border-slate-800 text-slate-100' 
              : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                  {t.legalPages}
                </h2>
              </div>
              <button 
                onClick={() => setActiveLegalTab(null)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                }`}
                aria-label={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selectors */}
            <div className={`p-2 border-b flex items-center gap-1 shrink-0 ${
              isDarkMode ? 'border-slate-800/80 bg-[#090d16]' : 'border-slate-100 bg-slate-50'
            }`}>
              {(['privacy', 'terms', 'dmca'] as const).map((tab) => {
                const isActive = activeLegalTab === tab;
                const tabTitle = tab === 'privacy' 
                  ? t.privacyPolicy 
                  : tab === 'terms' 
                    ? t.termsOfService 
                    : t.copyrightPolicy;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveLegalTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 cursor-pointer text-center truncate ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                        : isDarkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                    }`}
                  >
                    {tabTitle}
                  </button>
                );
              })}
            </div>

            {/* Legal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed max-h-[50vh] scrollbar-thin">
              {activeLegalTab === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="text-amber-500 font-extrabold text-sm sm:text-base">
                    {locale === 'ar' ? 'سياسة الخصوصية وحماية بيانات المستخدم' : 'Privacy Policy & User Data Protection'}
                  </h3>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "نحن في منصة أتاري نهتم بخصوصيتك للغاية. لا نقوم بجمع أو حفظ أي بيانات شخصية خاصة بك عند استخدام الألعاب الكلاسيكية على موقعنا."
                      : "At Atari Hub, we care deeply about your privacy. We do not collect or store any of your personal data when playing retro games on our platform."}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "يتم حفظ تفضيلاتك مثل الألعاب المفضلة وقائمتها، بالإضافة إلى خيار الوضع الداكن أو الفاتح محلياً بشكل آمن في متصفحك (عبر تقنية Local Storage) لضمان عودتك إليها بسهولة دون الحاجة لتسجيل حساب، ولا يتم مشاركتها أبداً مع أي خوادم خارجية أو أطراف ثالثة."
                      : "Your preferences, such as saved favorites and color themes, are stored locally inside your browser (using secure Local Storage) so you can resume your session seamlessly without signing up. This information never leaves your device."}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "يتم استخدام تحليلات جوجل (Google Analytics) فقط كأداة إحصائية مجهولة الهوية وآمنة لقياس سرعة تحميل الصفحات وتحديد الألعاب الأكثر شعبية لتمكيننا من تزويدكم بتجربة لعب مستقرة ومحسنة دوماً."
                      : "Anonymized, privacy-compliant Google Analytics may be utilized simply to monitor loading times and understand game popularity, helping us allocate server bandwidth effectively for your best entertainment."}
                  </p>
                </div>
              )}

              {activeLegalTab === 'terms' && (
                <div className="space-y-4">
                  <h3 className="text-amber-500 font-extrabold text-sm sm:text-base">
                    {locale === 'ar' ? 'شروط الخدمة والاستخدام العادل' : 'Terms of Service & Fair Use'}
                  </h3>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "مرحباً بك في منصة أتاري للألعاب الكلاسيكية. إن تصفحك للموقع أو لعب أي من الألعاب المتوفرة عليه يمثل موافقة صريحة على شروطنا البسيطة التالية:"
                      : "Welcome to Atari Hub. By accessing our retro games platform, you agree to comply with our simple and fair terms of service below:"}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "١. جميع الألعاب المتوفرة هنا مجانية بنسبة ١٠٠٪ ومتاحة لجميع الزوار بغرض الترفيه الشخصي غير التجاري والمباشر عبر متصفح الويب الخاص بك."
                      : "1. All vintage and arcade games hosted on our website are 100% free of charge and intended strictly for personal, non-commercial entertainment directly inside your web browser."}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "٢. يُمنع منعاً باتاً استخدام برمجيات الكشط التلقائي، أو الروبوتات الضارة، أو توجيه هجمات حرمان من الخدمة (DDoS) التي تستهلك موارد الخادم وتسبب بطء الموقع للاعبين الآخرين."
                      : "2. Scraping content, abusing bandwidth, or executing automated requests that strain our infrastructure is strictly prohibited, ensuring that retro game loading times remain instant for everyone."}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "٣. تحتفظ المنصة بالحق في تحديث قاعدة الألعاب، أو إزالة أي لعبة لأسباب تنظيمية، أو تعديل طريقة التحكم لتعزيز جودة اللعب وسرعة استجابة الأكواد."
                      : "3. We reserve the full rights to update our retro collection, deprecate specific emulated versions for optimization, and modify controls to optimize playability without prior individual alerts."}
                  </p>
                </div>
              )}

              {activeLegalTab === 'dmca' && (
                <div className="space-y-4">
                  <h3 className="text-amber-500 font-extrabold text-sm sm:text-base">
                    {locale === 'ar' ? 'حقوق النشر والملكية الفكرية (DMCA)' : 'Copyright & DMCA Take-Down Policy'}
                  </h3>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "منصة أتاري تحترم بشدة حقوق الملكية الفكرية وحقوق النشر للغير وتعمل وفق تشريعات النشر الرقمي الدولية."
                      : "Atari Hub highly respects intellectual property rights, creator contributions, and international digital copyright legislations."}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "جميع الألعاب المتوفرة أون لاين على المنصة مبنية على كود مفتوح المصدر (HTML5 / JavaScript)، أو تقع ضمن نطاق الملكية العامة للألعاب التاريخية التي انتهت فترة حمايتها الحصرية، أو يتم تشغيلها عبر محاكيات مرخصة ومتاحة للجميع مجاناً."
                      : "All classic games available on our platform are built with open-source technologies, belong to the historical public domain of legacy video games, or run through secure, licensed client-side web emulators."}
                  </p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {locale === 'ar' 
                      ? "إذا كنت تمتلك حقوق الملكية الفكرية أو النشر لأي لعبة من الألعاب المعروضة هنا، وتعارض نشرها المجاني للجمهور، يرجى تزويدنا بإثبات ملكيتك للمحتوى عبر إرسال بريد إلكتروني إلى فريق الإدارة وسنقوم بحذف اللعبة من المنصة نهائياً في غضون ٢٤ ساعة عمل فور استلام طلبك ومراجعته."
                      : "If you are the legal copyright owner of any featured arcade classic and object to its free emulated presentation here, please contact us with proof of ownership. We will verify your request and remove the specific game within 24 business hours."}
                  </p>
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed font-bold ${
                    isDarkMode ? 'bg-[#131b2e]/65 border-slate-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {locale === 'ar' 
                      ? "للتواصل مع الدعم القانوني وإرسال البلاغات: support@atari.hub" 
                      : "For legal inquiries and DMCA complaints: support@atari.hub"}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className={`p-5 border-t flex justify-end shrink-0 ${
              isDarkMode ? 'border-slate-800/80 bg-[#090d16]' : 'border-slate-100 bg-slate-50'
            }`}>
              <button
                onClick={() => setActiveLegalTab(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
              >
                {t.close}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer Block */}
      <footer className={`border-t py-12 md:py-16 text-xs transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#060a10] border-slate-800/50 text-slate-400' 
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 text-start">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-[10px] bg-[#0c1324] flex items-center justify-center">
                    <Gamepad2 className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {t.title}
                  </div>
                  <p className="text-[10px] font-semibold opacity-80">
                    {t.subtitle}
                  </p>
                </div>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.footerText}
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
                  isDarkMode ? 'bg-[#0f172a] border border-slate-800/80 text-slate-400' : 'bg-white border border-slate-200 text-slate-600'
                }`}>
                  ★ {t.rated}
                </div>
                <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
                  isDarkMode ? 'bg-[#0f172a] border border-slate-800/80 text-slate-400' : 'bg-white border border-slate-200 text-slate-600'
                }`}>
                  {games.length} {locale === 'ar' ? 'ألعاب كلاسيكية' : 'Retro Games'}
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links (أقسام الألعاب / Game Categories) */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.categories}</span>
              </h3>
              <ul className="space-y-2.5 text-[11px] font-semibold">
                {(['All', 'Action', 'Puzzle', 'Racing', 'Arcade', 'Favorites'] as const).map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => {
                          setActiveCategory(cat);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer text-start ${
                          isActive 
                            ? 'text-amber-500 font-bold' 
                            : isDarkMode 
                              ? 'text-slate-400 hover:text-amber-500' 
                              : 'text-slate-600 hover:text-amber-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-amber-500 scale-125' : 'bg-slate-400/30'}`}></span>
                        <span>{getCategoryName(cat)}</span>
                        {cat === 'Favorites' && favorites.length > 0 && (
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded-full font-bold">
                            {favorites.length}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Quick Launch Games (اكتشف الألعاب / Discover Games) */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{locale === 'ar' ? 'اكتشف الألعاب' : 'Quick Play'}</span>
              </h3>
              <ul className="space-y-2 text-[11px] font-semibold">
                {games.slice(0, 5).map((game) => (
                  <li key={game.id}>
                    <button
                      onClick={() => {
                        setSelectedGame(game);
                        setIsIframeLoading(true);
                      }}
                      className={`flex items-center gap-2 transition-all duration-200 cursor-pointer text-start ${
                        selectedGame?.id === game.id 
                          ? 'text-amber-500 font-bold' 
                          : isDarkMode 
                            ? 'text-slate-400 hover:text-amber-500' 
                            : 'text-slate-600 hover:text-amber-500'
                      }`}
                    >
                      <img src={game.thumbnailUrl} alt="" className="w-5 h-5 rounded-md object-cover border border-slate-700/20" />
                      <span className="truncate">{game.title[locale]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom copyright and Back to Top block */}
          <div className={`pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] ${
            isDarkMode ? 'border-slate-800/40 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
              <p className="font-medium">
                {t.rights}
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3 font-semibold">
                <span className="opacity-40 hidden sm:inline">•</span>
                <button 
                  onClick={() => setActiveLegalTab('privacy')}
                  className="hover:text-amber-500 transition-colors cursor-pointer"
                >
                  {t.privacyPolicy}
                </button>
                <span className="opacity-40">•</span>
                <button 
                  onClick={() => setActiveLegalTab('terms')}
                  className="hover:text-amber-500 transition-colors cursor-pointer"
                >
                  {t.termsOfService}
                </button>
                <span className="opacity-40">•</span>
                <button 
                  onClick={() => setActiveLegalTab('dmca')}
                  className="hover:text-amber-500 transition-colors cursor-pointer"
                >
                  {t.copyrightPolicy}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
                isDarkMode 
                  ? 'bg-[#0f172a]/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{t.backToTop}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
