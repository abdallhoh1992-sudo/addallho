import { create } from "zustand"

export type Lang = "ar" | "en"

interface I18nState {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

export const useI18n = create<I18nState>((set, get) => ({
  lang: "ar",
  setLang: (lang) => set({ lang }),
  toggleLang: () => set({ lang: get().lang === "ar" ? "en" : "ar" }),
}))

const translations = {
  ar: {
    // Home
    level: "المستوى",
    survivalQuiz: "تحدي البقاء",
    tagline: "50 لاعب يدخلوا. واحد بس يفوز.",
    dailyReward: "المكافأة اليومية",
    dailyRewardDesc: "اضغط لتحصل على 100 عملة مجانا",
    chooseChallenge: "اختر التحدي",
    classicChallenge: "التحدي الكلاسيكي",
    classicDesc: "50 لاعب - 10 جولات",
    prize: "جائزة",
    perQuestion: "لكل سؤال",
    proChallenge: "تحدي المحترفين",
    proDesc: "50 لاعب - أسئلة أصعب",
    yourStats: "إحصائياتك",
    wins: "انتصارات",
    matches: "مباريات",
    winStreak: "سلسلة الفوز",
    bestStreak: "أفضل سلسلة",
    home: "الرئيسية",
    leaderboard: "المتصدرين",
    wallet: "المحفظة",
    shop: "المتجر",
    coin: "عملة",
    coins: "عملة",
    seconds: "ثانية",
    secondsShort: "ث",

    // Quiz
    round: "الجولة",
    streak: "سلسلة",
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    eliminated: "تم إقصاء",
    player: "لاعب",
    players: "لاعب",
    nextRound: "الجولة التالية",
    preparing: "يتم تجهيز الساحة...",
    getReady: "استعد!",
    go: "انطلق!",

    // Results
    youWon: "فزت!",
    lastStanding: "كنت آخر واحد واقف من أصل",
    score: "النتيجة",
    rounds: "الجولات",
    playersRemaining: "اللاعبين المتبقين",
    reward: "المكافأة",
    balance: "الرصيد:",
    playAgain: "العب مرة ثانية",
    homeBtn: "الرئيسية",
    youEliminated: "تم إقصاؤك!",
    lostAtRound: "خسرت في الجولة",
    of: "من",
    reachedRound: "وصلت للجولة",
    playersLeft: "لاعبين باقين",
    tryAgain: "حاول مرة ثانية",

    // Wallet
    walletTitle: "المحفظة",
    currentBalance: "رصيدك الحالي",
    earnCoins: "اكسب عملات",
    watchAd: "شاهد إعلان",
    watchAdDesc: "احصل على 25 عملة مجانا",
    inviteFriends: "ادع أصدقاءك",
    inviteDesc: "50 عملة لكل صديق يسجل",
    winChallenge: "فز بالتحدي",
    winDesc: "اربح حتى 1000+ عملة",
    buyCoins: "شراء عملات",

    // Shop
    shopTitle: "المتجر",
    shopDesc: "استخدم عملاتك لشراء مزايا تساعدك في الفوز",
    powerUps: "القدرات الخاصة",
    extraTime: "وقت إضافي",
    extraTimeDesc: "+5 ثواني في الجولة القادمة",
    secondChance: "فرصة ثانية",
    secondChanceDesc: "ارجع للعبة بعد الإقصاء",
    shield: "درع الحماية",
    shieldDesc: "حماية من إقصاء واحد",
    doubleXp: "نقاط مضاعفة",
    doubleXpDesc: "XP مضاعف في المباراة القادمة",
    done: "تم",
    coinPacks: "باقات العملات",
    mostPopular: "الأكثر شعبية",

    // Leaderboard
    leaderboardTitle: "المتصدرين",
    you: "أنت",
    winsCount: "فوز",

    // Lobby
    findingPlayers: "جاري البحث عن لاعبين...",
    playersJoined: "لاعب انضم",
    matchStartsIn: "المباراة تبدأ خلال",

    // Language
    language: "English",
  },
  en: {
    // Home
    level: "Level",
    survivalQuiz: "Survival Quiz",
    tagline: "50 players enter. Only one wins.",
    dailyReward: "Daily Reward",
    dailyRewardDesc: "Tap to get 100 free coins",
    chooseChallenge: "Choose Challenge",
    classicChallenge: "Classic Challenge",
    classicDesc: "50 players - 10 rounds",
    prize: "Prize",
    perQuestion: "per question",
    proChallenge: "Pro Challenge",
    proDesc: "50 players - harder questions",
    yourStats: "Your Stats",
    wins: "Wins",
    matches: "Matches",
    winStreak: "Win Streak",
    bestStreak: "Best Streak",
    home: "Home",
    leaderboard: "Leaders",
    wallet: "Wallet",
    shop: "Shop",
    coin: "coin",
    coins: "coins",
    seconds: "seconds",
    secondsShort: "s",

    // Quiz
    round: "Round",
    streak: "Streak",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    eliminated: "Eliminated",
    player: "player",
    players: "players",
    nextRound: "Next Round",
    preparing: "Preparing the arena...",
    getReady: "Get Ready!",
    go: "GO!",

    // Results
    youWon: "You Won!",
    lastStanding: "Last one standing out of",
    score: "Score",
    rounds: "Rounds",
    playersRemaining: "Players Remaining",
    reward: "Reward",
    balance: "Balance:",
    playAgain: "Play Again",
    homeBtn: "Home",
    youEliminated: "Eliminated!",
    lostAtRound: "Lost at round",
    of: "of",
    reachedRound: "Reached Round",
    playersLeft: "Players Left",
    tryAgain: "Try Again",

    // Wallet
    walletTitle: "Wallet",
    currentBalance: "Current Balance",
    earnCoins: "Earn Coins",
    watchAd: "Watch Ad",
    watchAdDesc: "Get 25 free coins",
    inviteFriends: "Invite Friends",
    inviteDesc: "50 coins per friend who joins",
    winChallenge: "Win Challenge",
    winDesc: "Earn up to 1000+ coins",
    buyCoins: "Buy Coins",

    // Shop
    shopTitle: "Shop",
    shopDesc: "Use your coins to buy power-ups that help you win",
    powerUps: "Power-Ups",
    extraTime: "Extra Time",
    extraTimeDesc: "+5 seconds on next round",
    secondChance: "Second Chance",
    secondChanceDesc: "Return after elimination",
    shield: "Shield",
    shieldDesc: "Protection from one elimination",
    doubleXp: "Double XP",
    doubleXpDesc: "2x XP in the next match",
    done: "Done",
    coinPacks: "Coin Packs",
    mostPopular: "Most Popular",

    // Leaderboard
    leaderboardTitle: "Leaderboard",
    you: "You",
    winsCount: "wins",

    // Lobby
    findingPlayers: "Finding players...",
    playersJoined: "players joined",
    matchStartsIn: "Match starts in",

    // Language
    language: "العربية",
  },
}

export function t(key: keyof typeof translations.ar): string {
  const lang = useI18n.getState().lang
  return translations[lang][key] || key
}

export function useTranslation() {
  const lang = useI18n((s) => s.lang)
  return {
    t: (key: keyof typeof translations.ar) => translations[lang][key] || key,
    lang,
    isRTL: lang === "ar",
  }
}
