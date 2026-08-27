import React, { useState, useEffect, useRef } from "react";
import {
  Gamepad2,
  Play,
  Search,
  Heart,
  Share2,
  Maximize2,
  ArrowRight,
  Sparkles,
  Info,
  Globe,
  Star,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Monitor,
  Flame,
  Clock,
  ExternalLink,
  ThumbsUp,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Game, Category } from "./types";

// Games static data
const GAMES_DATA: Game[] = [
  {
    id: "game-cheese-eater",
    titleAr: "أكل الجبنة الكلاسيكية (باكمان)",
    titleEn: "Cheese Eater Classic (Pacman)",
    descriptionAr: "العب لعبة أكل الجبنة باكمان الكلاسيكية الممتعة مجاناً وبدون تحميل! تحكّم بآكل الجبنة لتلتهم كل قطع الجبنة الصفراء في المتاهة، وتجنب الأشباح الملونة والشريرة التي تلاحقك في كل مكان. اجمع النقاط وحقق أعلى الأرقام القياسية لتثبت مهاراتك!",
    descriptionEn: "Play the legendary classic Pacman-style Cheese Eater game for free with no downloads! Guide your character to eat all the yellow cheese dots throughout the maze while evading the persistent ghosts. Collect high scores and prove your arcade retro skills!",
    thumbnail: "/src/assets/images/cheese_eater_thumbnail_1787373161126.jpg",
    iframeUrl: "/games/cheese-eater.html",
    category: "arcade",
    controlsAr: "لوحة المفاتيح: استخدم الأسهم (أعلى، أسفل، يمين، يسار) للتوجيه. الهاتف واللمس: اسحب بإصبعك على الشاشة في الاتجاه الذي تريد الذهاب إليه للتوجيه السريع.",
    controlsEn: "Keyboard: Use Arrow Keys (Up, Down, Left, Right) to steer. Touch & Mobile: Swipe your finger on the screen in the desired direction to make rapid turns.",
    rating: 4.8,
    views: 24500,
    playsCount: 12450
  },
  {
    id: "game-plane-shooter",
    titleAr: "حرب الطائرات - غارة نهر الأتاري",
    titleEn: "Retro Plane Shooter - Atari River Raid",
    descriptionAr: "عد بالزمن إلى العصر الذهبي لألعاب الأركيد مع لعبة حرب الطائرات الكلاسيكية المستوحاة من ريفر رايد الشهيرة! قم بقيادة طائرتك القتالية عبر الأخاديد المائية الوعرة، ودمر العقبات وحصون الأعداء، واجمع الوقود بانتظام لتتجنب التحطم المفاجئ.",
    descriptionEn: "Step back into the golden age of arcade gaming with Retro Plane Shooter, heavily inspired by the historic Atari River Raid! Fly your tactical jet through treacherous river canyons, destroy enemy defenses, and monitor your fuel gauge closely to survive.",
    thumbnail: "/src/assets/images/plane_shooter_thumb_1787712159818.jpg",
    iframeUrl: "/games/plane-shooter.html",
    category: "action",
    controlsAr: "لوحة المفاتيح: استخدم الأسهم للحركة والتحليق، ومفتاح المسافة (Space) لإطلاق الصواريخ. الهاتف واللمس: حرك إصبعك على الشاشة للتوجيه وسيقوم السلاح بإطلاق النار تلقائياً.",
    controlsEn: "Keyboard: Use Arrow Keys to fly and steer, and Spacebar to unleash rapid-fire missiles. Touch & Mobile: Slide your finger on screen to navigate, weapon fires automatically.",
    rating: 4.7,
    views: 19800,
    playsCount: 9810
  },
  {
    id: "game-breakout",
    titleAr: "تحطيم جدران الطوب (بريك أوت)",
    titleEn: "Atari Breakout - Brick Breaker",
    descriptionAr: "العب لعبة تحطيم الطوب الكلاسيكية والشهيرة التي تم ابتكارها بواسطة شركة أتاري التاريخية. استخدم المضرب السفلي لرد الكرة السريعة، وفجر جميع صفوف قوالب الطوب الملونة، واحصل على قوى ترقية استثنائية لمضاعفة كرات اللعب وتوسيع المضرب.",
    descriptionEn: "Play the world-famous brick-shattering arcade game created by the historic Atari company. Direct the paddle to deflect the fast-bouncing ball, pulverize layers of colored bricks, and collect special power-ups like multi-balls and paddle expansions.",
    thumbnail: "/src/assets/images/breakout_thumbnail_1787511090254.jpg",
    iframeUrl: "/games/breakout.html",
    category: "arcade",
    controlsAr: "لوحة المفاتيح: السهم الأيمن والأيسر أو تحريك مؤشر الفأرة للتحكم بالمضرب. الهاتف واللمس: اسحب المضرب بشكل أفقي يميناً ويساراً بلمسة إصبع واحدة لتتبع الكرة.",
    controlsEn: "Keyboard: Use Left/Right Arrow keys or mouse pointer to slide the paddle. Touch & Mobile: Drag the paddle horizontally along the bottom of the screen with your finger.",
    rating: 4.6,
    views: 18100,
    playsCount: 8120
  },
  {
    id: "game-tetris",
    titleAr: "لعبة الأشكال تيتريس الأركيد",
    titleEn: "Tetris Arcade - Block Puzzle",
    descriptionAr: "لعبة ترتيب المكعبات تيتريس العتيقة بنسختها الأصلية المحبوبة. قم بتدوير وملاءمة الأشكال الهندسية المختلفة والمتساقطة من الأعلى لتكوين صفوف أفقية كاملة والحد من تراكم المكعبات حتى لا تلامس السقف وتخسر اللعبة.",
    descriptionEn: "The iconic block-matching game in its original retro style. Rotate and position falling geometric shapes to complete perfect horizontal rows, clearing them out before the stack reaches the top and triggers a game-over.",
    thumbnail: "/src/assets/images/tetris_thumbnail_1787444248779.jpg",
    iframeUrl: "/games/tetris.html",
    category: "puzzle",
    controlsAr: "لوحة المفاتيح: سهم الأعلى لتدوير القطعة، سهمي اليمين واليسار للتحريك، سهم لأسفل للتسريع والتنزيل السريع. الهاتف واللمس: انقر على أزرار التوجيه المدمجة بوضوح في الشاشة.",
    controlsEn: "Keyboard: Up Arrow to rotate block, Left/Right to slide, Down Arrow to drop faster. Touch & Mobile: Tap on the intuitive visual layout control buttons rendered below the game canvas.",
    rating: 4.9,
    views: 31200,
    playsCount: 15400
  },
  {
    id: "game-candy-crush",
    titleAr: "كاندي كراش - مطابقة الحلوى",
    titleEn: "Candy Crush Match-3 Pop",
    descriptionAr: "استمتع بمغامرة مطابقة الحلوى الأسطورية وحل الألغاز الصعبة! قم بتبديل أماكن الحلوى لمطابقة ٣ قطع أو أكثر من نفس النوع لتفجيرها بنقرة واحدة، واصنع مجموعات مذهلة وتفجيرات متسلسلة لإنهاء المهام المطلوبة قبل انتهاء الحركات.",
    descriptionEn: "Immerse yourself in the legendary puzzle game of candy matching and crushing! Swap tiles to match 3 or more delicious candies, ignite chain reactions, unlock tasty boosters, and satisfy target goals within limited moves.",
    thumbnail: "/src/assets/images/candy_crush_thumbnail_1787541332465.jpg",
    iframeUrl: "/games/candy-crush.html",
    category: "puzzle",
    controlsAr: "الكمبيوتر والماوس: انقر بالزر الأيسر واسحب الحلوى لتبديل مكانها مع جارتها مباشرة. الهاتف واللمس: المس واسحب بإصبعك برفق لتمرير وتبديل قطع الحلوى الملونة.",
    controlsEn: "Desktop: Click and drag any candy tile to swap places with an adjacent one. Touch & Mobile: Swipe your finger softly to switch and match adjacent glowing candies.",
    rating: 4.5,
    views: 22000,
    playsCount: 11200
  },
  {
    id: "game-car-racing",
    titleAr: "سباق السيارات السريعة المثير",
    titleEn: "Turbo Highway Car Racing",
    descriptionAr: "شغل المحرك وانطلق بأقصى سرعة على الطريق السريع المزدحم بالسيارات! تفادَ الاصطدام بالشاحنات والمركبات المجاورة، واجمع النقاط والعملات، واحصل على كبسولات النيترو المشتعلة لتسريع سيارتك وتحطيم المسافات القصوى بدون حوادث.",
    descriptionEn: "Ignite your engine and race down the jam-packed highway at super speed! Dodge slow trucks, collect shining gold coins, and capture nitro boosters to launch your speedster and achieve record-breaking distances.",
    thumbnail: "/src/assets/images/car_racing_thumbnail_1787601761728.jpg",
    iframeUrl: "/games/car-racing.html",
    category: "racing",
    controlsAr: "لوحة المفاتيح: استخدم السهم الأيمن والأيسر للتبديل بين حارات الطريق والتوجيه. الهاتف واللمس: انقر على الأزرار الظاهرة في يسار ويمين الشاشة لتوجيه مركبتك بسلاسة.",
    controlsEn: "Keyboard: Press Left/Right Arrow keys to steer between lanes and avoid oncoming cars. Touch & Mobile: Tap on the left or right screen regions to steer smoothly.",
    rating: 4.7,
    views: 26100,
    playsCount: 13600
  }
];

// Categories data

const CATEGORIES: Category[] = [
  { id: "all", nameAr: "كل الألعاب", nameEn: "All Games" },
  { id: "arcade", nameAr: "ألعاب أركيد", nameEn: "Arcade Games" },
  { id: "puzzle", nameAr: "ألعاب ذكاء وألغاز", nameEn: "Puzzle & Brain" },
  { id: "racing", nameAr: "ألعاب سباقات", nameEn: "Racing Games" },
  { id: "action", nameAr: "ألعاب حركة وقتال", nameEn: "Action Games" }
];

export default function App() {
  // Localization and Route States
  const [lang, setLang] = useState<"ar" | "en">(() => {
    // Read from query param or localStorage
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "ar" || urlLang === "en") return urlLang;
    
    const saved = localStorage.getItem("atari_lang");
    return saved === "en" ? "en" : "ar";
  });

  const [selectedGameId, setSelectedGameId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get("game");
    const gameExists = GAMES_DATA.some(g => g.id === gameParam);
    return gameExists ? gameParam : null;
  });

  // UI state managers
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedGameId, setCopiedGameId] = useState<string | null>(null);
  
  // Game interactions (ratings, local statistics stored in localStorage)
  const [likedGames, setLikedGames] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("atari_likes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [localPlays, setLocalPlays] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("atari_plays");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [aspectRatio, setAspectRatio] = useState<"landscape" | "portrait" | "square">("portrait");

  // Keep search inputs synced, filter list
  const filteredGames = GAMES_DATA.filter((game) => {
    const title = lang === "ar" ? game.titleAr : game.titleEn;
    const desc = lang === "ar" ? game.descriptionAr : game.descriptionEn;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sync state changes with URLs for SEO-friendly navigation and tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    if (selectedGameId) {
      params.set("game", selectedGameId);
    } else {
      params.delete("game");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    
    localStorage.setItem("atari_lang", lang);

    // Update dynamic window title for Google Indexing & Tab UX
    if (selectedGameId) {
      const game = GAMES_DATA.find(g => g.id === selectedGameId);
      if (game) {
        const titleText = lang === "ar" ? game.titleAr : game.titleEn;
        document.title = `${titleText} - العب أونلاين مجاناً | أتاري`;
        
        // Auto-detect optimal aspect ratio based on game category
        if (game.category === "arcade" && game.id !== "game-cheese-eater") {
          setAspectRatio("landscape");
        } else if (game.category === "racing" || game.category === "action") {
          setAspectRatio("portrait");
        } else if (game.id === "game-cheese-eater" || game.id === "game-tetris") {
          setAspectRatio("portrait");
        } else {
          setAspectRatio("landscape");
        }
      }
    } else {
      document.title = lang === "ar" 
        ? "أتاري | العاب مجانية بدون تحميل - العب العاب اليوم الآن" 
        : "Atari | Free Games Online - Play Retro Arcade Web Games";
    }
  }, [lang, selectedGameId]);

  // Handle Likes
  const toggleLike = (gameId: string) => {
    const newLikes = { ...likedGames, [gameId]: !likedGames[gameId] };
    setLikedGames(newLikes);
    localStorage.setItem("atari_likes", JSON.stringify(newLikes));
  };

  // Track Plays
  const incrementPlayCount = (gameId: string) => {
    const currentCount = localPlays[gameId] || 0;
    const newPlays = { ...localPlays, [gameId]: currentCount + 1 };
    setLocalPlays(newPlays);
    localStorage.setItem("atari_plays", JSON.stringify(newPlays));
  };

  const handlePlayGame = (gameId: string) => {
    setSelectedGameId(gameId);
    incrementPlayCount(gameId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShareGame = (gameId: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?game=${gameId}&lang=${lang}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedGameId(gameId);
      setTimeout(() => setCopiedGameId(null), 2500);
    });
  };

  // Active game logic
  const activeGame = GAMES_DATA.find((g) => g.id === selectedGameId);

  // Direction Helper
  const isRTL = lang === "ar";

  return (
    <div 
      className={`min-h-screen bg-[#070a13] text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950`}
      dir={isRTL ? "rtl" : "ltr"}
      id="atari-app-root"
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#080c18]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedGameId(null)}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
              <Gamepad2 className="w-6 h-6 stroke-[2.5]" />
              <div className="absolute -inset-0.5 bg-amber-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200">
                {isRTL ? "أتَـارِي" : "ATARI CLASSICS"}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                {isRTL ? "منصة ألعاب زمان" : "RETRO ARCADE HUB"}
              </p>
            </div>
          </div>

          {/* Quick Search & Filters */}
          {!selectedGameId && (
            <div className="relative w-full max-w-sm sm:max-w-md">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? "ابحث عن لعبة الكبار..." : "Search classic arcade..."}
                className="w-full bg-[#0d1424] text-slate-100 text-sm pl-4 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 placeholder-slate-500 transition-all duration-300"
              />
            </div>
          )}

          {/* Home back button in header */}
          {selectedGameId && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedGameId(null)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ArrowRight className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
                <span>{isRTL ? "الرئيسية" : "Home"}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        
        <AnimatePresence mode="wait">
          {activeGame ? (
            /* ========================================================
               GAME PLAY COMPONENT SCREEN
               ======================================================== */
            <motion.div
              key="game-player-mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              id="game-player-section"
            >
              {/* Left Column: The Interactive Game Screen Container */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Embedded Game Stage Card */}
                <div className="bg-[#0b101f] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  
                  {/* Top Bar inside Play Stage */}
                  <div className="bg-[#0e1529] px-4 py-3 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      <h2 className="text-sm font-bold text-slate-200">
                        {isRTL ? activeGame.titleAr : activeGame.titleEn}
                      </h2>
                    </div>

                    {/* Aspect Ratio Controllers & Screen Controls */}
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex bg-[#070a13] p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => setAspectRatio("portrait")}
                          className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all cursor-pointer ${
                            aspectRatio === "portrait" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isRTL ? "طولي" : "Vertical"}
                        </button>
                        <button
                          onClick={() => setAspectRatio("landscape")}
                          className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all cursor-pointer ${
                            aspectRatio === "landscape" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isRTL ? "عرضي" : "Landscape"}
                        </button>
                        <button
                          onClick={() => setAspectRatio("square")}
                          className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all cursor-pointer ${
                            aspectRatio === "square" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isRTL ? "مربع" : "Square"}
                        </button>
                      </div>

                      {/* Launch Full Game directly in a new window */}
                      <a
                        href={activeGame.iframeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-amber-400 transition"
                        title={isRTL ? "افتح اللعبة في نافذة كاملة جديدة" : "Open game in fresh tab"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* HTML Game Embed Frame (Dynamic Height based on orientation) */}
                  <div 
                    className={`relative bg-[#05070e] flex items-center justify-center transition-all duration-300 w-full overflow-hidden ${
                      aspectRatio === "landscape" ? "aspect-video" : aspectRatio === "square" ? "aspect-square" : "aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4]"
                    }`}
                    style={{ maxHeight: aspectRatio === "portrait" ? "680px" : "auto" }}
                  >
                    <iframe
                      src={activeGame.iframeUrl}
                      title={activeGame.titleEn}
                      className="w-full h-full border-0 rounded-b-xl"
                      allow="autoplay; focus; fullscreen; keyboard;"
                      id="game-iframe-element"
                    />
                  </div>
                </div>

                {/* Sub-panel: Like, Share, and Play Statistics */}
                <div className="bg-[#0b101f] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-lg">
                  <div className="flex items-center gap-6">
                    {/* Like counter */}
                    <button
                      onClick={() => toggleLike(activeGame.id)}
                      className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        likedGames[activeGame.id]
                          ? "bg-amber-500/10 border-amber-500 text-amber-400"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedGames[activeGame.id] ? "fill-amber-500" : ""}`} />
                      <span>
                        {likedGames[activeGame.id]
                          ? (isRTL ? "أعجبتني اللعبة!" : "Liked!")
                          : (isRTL ? "أعجبني" : "Like Game")}
                      </span>
                    </button>

                    {/* Copied and Shared url helper */}
                    <button
                      onClick={() => handleShareGame(activeGame.id)}
                      className="flex items-center gap-2 py-2 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      {copiedGameId === activeGame.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">{isRTL ? "تم نسخ الرابط!" : "Copied link!"}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-slate-400" />
                          <span>{isRTL ? "مشاركة الرابط" : "Share URL"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>{activeGame.playsCount + (localPlays[activeGame.id] || 0)} {isRTL ? "زيارة لعب" : "Game plays"}</span>
                    </span>
                    <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{activeGame.rating}</span>
                    </span>
                  </div>
                </div>

                {/* Sub-panel: Game Details & Controls Instructions */}
                <div className="bg-[#0b101f] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Info className="w-5 h-5 text-amber-400" />
                    <span>{isRTL ? "نبذة عن اللعبة" : "About Game"}</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {isRTL ? activeGame.descriptionAr : activeGame.descriptionEn}
                  </p>

                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Monitor className="w-5 h-5 text-amber-400" />
                    <span>{isRTL ? "طريقة التحكم واللعب" : "How to Control & Play"}</span>
                  </h3>
                  <div className="bg-[#070a13] p-4 rounded-xl border border-slate-800/60 text-sm text-slate-300 leading-relaxed">
                    {isRTL ? activeGame.controlsAr : activeGame.controlsEn}
                  </div>
                </div>

              </div>

              {/* Right Column: Other Retro Games Sidebar Recommendation list */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                <div className="bg-[#0b101f] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
                  <h3 className="text-md font-extrabold text-slate-100 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <span>{isRTL ? "ألعاب كلاسيكية مقترحة" : "Recommended Retro Games"}</span>
                  </h3>

                  <div className="flex flex-col gap-3">
                    {GAMES_DATA.filter((g) => g.id !== activeGame.id).map((game) => (
                      <div
                        key={game.id}
                        onClick={() => handlePlayGame(game.id)}
                        className="group flex gap-3 p-2 bg-slate-900/40 hover:bg-[#0d1424] border border-slate-800/40 hover:border-slate-700 rounded-xl cursor-pointer transition-all duration-300"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img
                            src={game.thumbnail}
                            alt={game.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">
                            {isRTL ? game.titleAr : game.titleEn}
                          </h4>
                          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                            {game.category}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {game.rating}
                            </span>
                            <span>•</span>
                            <span>{game.playsCount + (localPlays[game.id] || 0)} {isRTL ? "لعبة" : "plays"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return Home Card */}
                <div className="bg-gradient-to-tr from-[#0e1629] to-[#0d1323] border border-amber-500/20 rounded-2xl p-5 text-center shadow-lg">
                  <h4 className="text-sm font-bold text-amber-400 mb-2">
                    {isRTL ? "هل تود العودة لقائمة كل الألعاب؟" : "Want to browse more games?"}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {isRTL 
                      ? "اكتشف تشكيلة ممتازة من ألعاب زمان الكلاسيكية مثل الأتاري والسيارات بدون تنزيل."
                      : "Discover a wide variety of retro games instantly without downloading anything."}
                  </p>
                  <button
                    onClick={() => setSelectedGameId(null)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    {isRTL ? "العودة للقائمة الرئيسية" : "Back to Main Catalog"}
                  </button>
                </div>

              </div>
            </motion.div>
          ) : (
            /* ========================================================
               PORTAL DASHBOARD COMPONENT SCREEN
               ======================================================== */
            <motion.div
              key="portal-home-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-8"
            >
              {/* Featured Hero Banner Slider */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0d16] border border-slate-800 shadow-2xl">
                
                {/* Hero Gradient Mask */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10 md:hidden" />

                {/* Hero layout content grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 relative z-20 min-h-[300px] sm:min-h-[380px] items-center">
                  
                  {/* Left Hero Details */}
                  <div className="md:col-span-7 p-6 sm:p-10 flex flex-col items-start gap-4 text-right md:text-left">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isRTL ? "لعبة الأسبوع الأكثر طلباً" : "Most Played Game Of The Week"}</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      {isRTL ? "لعبة أكل الجبنة الكلاسيكية (باكمان)" : "Pacman Cheese Eater"}
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                      {isRTL 
                        ? "استمتع بمطاردة الأشباح وتناول الجبنة الذهبية في المتاهة الشهيرة. العبها الآن مباشرة على هاتفك أو كمبيوترك بدون تنزيل ومجاناً."
                        : "Evade ghosts and swallow yellow pellets in the maze of nostalgia. Experience it instantly on mobile or desktop for free."}
                    </p>

                    <button
                      onClick={() => handlePlayGame("game-cheese-eater")}
                      className="mt-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.03] cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{isRTL ? "العب الآن مجاناً" : "Play Now For Free"}</span>
                    </button>
                  </div>

                  {/* Right Hero Visual Thumbnail */}
                  <div className="md:col-span-5 h-[200px] md:h-full relative overflow-hidden self-stretch">
                    <img
                      src="/src/assets/images/cheese_eater_thumbnail_1787373161126.jpg"
                      alt="Featured Retro Game"
                      className="w-full h-full object-cover scale-105 hover:scale-100 transition-all duration-700 opacity-60 md:opacity-90"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                </div>
              </div>

              {/* Category selector slider pills */}
              <div className="flex flex-col gap-3">
                <h3 className="text-md font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-amber-500" />
                  <span>{isRTL ? "تصفح حسب فئات الألعاب" : "Explore By Category"}</span>
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        selectedCategory === category.id
                          ? "bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                          : "bg-[#0d1424] hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100"
                      }`}
                    >
                      {isRTL ? category.nameAr : category.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Games Catalog Grid */}
              <div className="flex flex-col gap-5">
                
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-amber-400" />
                    <span>
                      {selectedCategory === "all"
                        ? (isRTL ? "جميع الألعاب المتوفرة أون لاين" : "All Web Games Catalog")
                        : (isRTL ? `ألعاب الفئة المحددة` : `Games Under Selected Category`)}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold ml-1">
                      {filteredGames.length}
                    </span>
                  </h3>

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                    >
                      {isRTL ? "إعادة تعيين البحث" : "Clear search filter"}
                    </button>
                  )}
                </div>

                {/* Grid layout */}
                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {filteredGames.map((game) => {
                      const isLiked = likedGames[game.id];
                      return (
                        <div
                          key={game.id}
                          className="group bg-[#0a0f1d] border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:translate-y-[-4px]"
                        >
                          {/* Image box */}
                          <div className="aspect-[4/3] relative overflow-hidden bg-slate-900 cursor-pointer" onClick={() => handlePlayGame(game.id)}>
                            <img
                              src={game.thumbnail}
                              alt={game.titleEn}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Hot Play Badge overlay */}
                            <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-200 tracking-wide uppercase">
                              {game.category}
                            </div>

                            {/* Floating Click to Play Overlay */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 shadow-lg scale-75 group-hover:scale-100 transition-all duration-300">
                                <Play className="w-5 h-5 fill-slate-950 translate-x-[1.5px]" />
                              </div>
                            </div>
                          </div>

                          {/* Detail body card */}
                          <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="text-md font-bold text-slate-100 group-hover:text-amber-400 transition line-clamp-1 cursor-pointer" onClick={() => handlePlayGame(game.id)}>
                                  {isRTL ? game.titleAr : game.titleEn}
                                </h4>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(game.id);
                                  }}
                                  className="text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                                  title="Like game"
                                >
                                  <Heart className={`w-4 h-4 ${isLiked ? "text-rose-500 fill-rose-500" : ""}`} />
                                </button>
                              </div>

                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                                {isRTL ? game.descriptionAr : game.descriptionEn}
                              </p>
                            </div>

                            {/* Action footer */}
                            <div className="flex items-center justify-between border-t border-slate-900 pt-3.5 mt-auto">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>{game.rating}</span>
                                <span className="text-slate-700">•</span>
                                <span>{game.playsCount + (localPlays[game.id] || 0)} {isRTL ? "لعبوا" : "plays"}</span>
                              </div>

                              <button
                                onClick={() => handlePlayGame(game.id)}
                                className="px-4 py-2 bg-slate-900 hover:bg-amber-500 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isRTL ? "ابدأ اللعب" : "Start Play"}</span>
                                <Play className="w-2.5 h-2.5 fill-current" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#0a0f1d] border border-slate-800 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-2">
                      {isRTL ? "عذراً، لم نجد أي ألعاب تطابق بحثك الحالي." : "Sorry, we couldn't find any games matching your request."}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                      className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg mt-2 cursor-pointer"
                    >
                      {isRTL ? "عرض جميع الألعاب" : "Show All Games"}
                    </button>
                  </div>
                )}
              </div>

              {/* Informative Atari & Retro Gaming Editorial Content block */}
              <div className="bg-[#0b101f]/30 border border-slate-850 rounded-2xl p-6 sm:p-8 mt-8 leading-relaxed max-w-4xl mx-auto text-center">
                <h3 className="text-md sm:text-lg font-bold text-slate-200 mb-3">
                  {isRTL ? "لماذا تحظى منصة ألعاب أتاري الكلاسيكية بشعبية كبرى؟" : "Why are Atari Classic Web Games and Retro Hubs so Popular?"}
                </h3>
                <div className="text-xs sm:text-sm text-slate-400 space-y-3">
                  <p>
                    {isRTL 
                      ? "تعتبر ألعاب الأتاري القديمة (مثل ألعاب باكمان، تيتريس، وريفر رايد) النواة الأولى لعالم ألعاب الفيديو الحديث. لقد نشأت عليها أجيال متعاقبة، واليوم نوفر لك في موقع 'أتاري' تشكيلة مميزة من هذه الألعاب الممتعة بصيغة HTML5 عصرية تتيح لك تشغيلها مباشرة على متصفح هاتف الآيفون، الأندرويد، أو الكمبيوتر دون الحاجة لتحميل ملفات ثقيلة أو تثبيت تطبيقات خارجية."
                      : "Retro Atari games such as Pacman, Tetris, and River Raid represent the foundation of modern digital gaming. These timeless classics have brought joy to generations. Today on 'Atari Classics', we recreate these arcade memories in full HTML5, allowing you to play instantly on iOS, Android, or desktop without any storage installations."}
                  </p>
                  <p>
                    {isRTL 
                      ? "تتميز هذه الألعاب ببساطة آليات التحكم فيها وعمق التحدي الذي تقدمه، حيث تعتمد على سرعة البديهة والتركيز الفائق لتحطيم الأرقام القياسية ومنافسة الأصدقاء في كسب أعلى نتيجة. نتمنى لكم وقتاً ممتعاً ومسلياً مع باقة الألعاب المجانية لدينا!"
                      : "Our retro selection features elegant controls combined with challenging gameplay. Challenge yourself to reach high scores, test your reflexes, and experience premium vintage gaming at its best. Enjoy your gameplay session!"}
                  </p>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Main Footer */}
      <footer className="bg-[#04060c] border-t border-slate-900/90 py-10 px-6 text-slate-500 text-xs mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start">
            <p className="font-bold text-slate-400 text-sm">
              {isRTL ? "أتاري للألعاب الكلاسيكية المجانية © 2026" : "Atari Retro Classic Games Hub © 2026"}
            </p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-md mx-auto md:mx-0">
              {isRTL ? "جميع الألعاب مجانية وتعمل مباشرة بدون تحميل على الكمبيوتر والجوال." : "All arcade web games are 100% free with instant loading in-browser."}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400">
            <span className="cursor-pointer hover:text-amber-400 transition font-medium" onClick={() => setSelectedGameId(null)}>
              {isRTL ? "كل الألعاب" : "All Games"}
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:text-amber-400 transition font-medium" onClick={() => { setSelectedGameId(null); setSelectedCategory("arcade"); }}>
              {isRTL ? "أركيد" : "Arcade"}
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:text-amber-400 transition font-medium" onClick={() => { setSelectedGameId(null); setSelectedCategory("puzzle"); }}>
              {isRTL ? "ألغاز" : "Puzzles"}
            </span>
            
            <div className="h-4 w-[1px] bg-slate-800/80 hidden sm:block" />
            
            {/* Beautiful, low-key, professional Language Selector in Footer */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0d1424] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm shadow-amber-500/[0.03]"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
