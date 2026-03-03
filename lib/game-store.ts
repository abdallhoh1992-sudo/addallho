import { create } from "zustand"
import { type Question, getQuestionsByDifficulty, BOT_NAMES } from "./game-data"
import { createClient } from "@/lib/supabase/client"
import { showMidgameAd, gameplayStart, gameplayStop, happyTime } from "./crazygames"

export type GameScreen = "home" | "lobby" | "game" | "eliminated" | "winner" | "leaderboard" | "wallet" | "shop" | "auth"

export interface Player {
  id: string
  name: string
  isBot: boolean
  isAlive: boolean
  score: number
  streak: number
}

export interface PowerUp {
  id: string
  name: string
  active: boolean
}

export interface GameState {
  screen: GameScreen
  coins: number
  totalWins: number
  totalGames: number
  winStreak: number
  bestStreak: number
  players: Player[]
  currentQuestion: Question | null
  currentRound: number
  totalRounds: number
  timeLeft: number
  selectedAnswer: number | null
  isAnswerRevealed: boolean
  playersAlive: number
  totalPlayers: number
  roundQuestions: Question[]
  dailyChallengeCompleted: boolean
  xp: number
  level: number
  entryFee: number
  powerUps: PowerUp[]
  soundEnabled: boolean
  eliminatedThisRound: number
  userId: string | null
  displayName: string | null
  isLoggedIn: boolean

  setScreen: (screen: GameScreen) => void
  startGame: (entryFee: number) => void
  initGameAfterLobby: () => void
  submitAnswer: (answerIndex: number) => void
  nextRound: () => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  claimDailyReward: () => void
  resetGame: () => void
  toggleSound: () => void
  buyPowerUp: (id: string, price: number) => void
  loadProfile: () => Promise<void>
  syncProfile: () => Promise<void>
  logout: () => Promise<void>
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: "home",
  coins: 500,
  totalWins: 0,
  totalGames: 0,
  winStreak: 0,
  bestStreak: 0,
  players: [],
  currentQuestion: null,
  currentRound: 0,
  totalRounds: 10,
  timeLeft: 15,
  selectedAnswer: null,
  isAnswerRevealed: false,
  playersAlive: 0,
  totalPlayers: 50,
  roundQuestions: [],
  dailyChallengeCompleted: false,
  xp: 0,
  level: 1,
  entryFee: 50,
  powerUps: [],
  soundEnabled: true,
  eliminatedThisRound: 0,
  userId: null,
  displayName: null,
  isLoggedIn: false,

  setScreen: (screen) => set({ screen }),

  loadProfile: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ isLoggedIn: false, userId: null })
      return
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    if (profile) {
      set({
        userId: user.id,
        displayName: profile.display_name || user.email?.split("@")[0] || "Player",
        coins: profile.coins,
        totalWins: profile.total_wins,
        totalGames: profile.total_games,
        winStreak: profile.win_streak,
        bestStreak: profile.best_streak,
        xp: profile.xp,
        level: profile.level,
        isLoggedIn: true,
      })
    }
  },

  syncProfile: async () => {
    const state = get()
    if (!state.userId) return
    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({
        coins: state.coins,
        total_wins: state.totalWins,
        total_games: state.totalGames,
        win_streak: state.winStreak,
        best_streak: state.bestStreak,
        xp: state.xp,
        level: state.level,
      })
      .eq("id", state.userId)
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({
      isLoggedIn: false,
      userId: null,
      displayName: null,
      coins: 500,
      totalWins: 0,
      totalGames: 0,
      winStreak: 0,
      bestStreak: 0,
      xp: 0,
      level: 1,
      screen: "home",
    })
  },

  startGame: (entryFee) => {
    const state = get()
    if (state.coins < entryFee) return
    set({
      coins: state.coins - entryFee,
      entryFee,
      totalGames: state.totalGames + 1,
      screen: "lobby",
    })
  },

  initGameAfterLobby: () => {
    const state = get()
    const botCount = 49
    const bots: Player[] = BOT_NAMES.slice(0, botCount).map((name, i) => ({
      id: `bot-${i}`,
      name,
      isBot: true,
      isAlive: true,
      score: 0,
      streak: 0,
    }))
    const player: Player = {
      id: "player",
      name: state.displayName || "You",
      isBot: false,
      isAlive: true,
      score: 0,
      streak: 0,
    }
    const allPlayers = [player, ...bots]
    const roundQuestions = getQuestionsByDifficulty(1)
    set({
      players: allPlayers,
      currentRound: 1,
      totalRounds: 10,
      timeLeft: state.entryFee >= 200 ? 10 : 15,
      selectedAnswer: null,
      isAnswerRevealed: false,
      playersAlive: allPlayers.length,
      totalPlayers: allPlayers.length,
      roundQuestions,
      currentQuestion: roundQuestions[0] || null,
      screen: "game",
      eliminatedThisRound: 0,
    })
    gameplayStart()
  },

  submitAnswer: (answerIndex) => {
    const state = get()
    if (state.isAnswerRevealed || state.selectedAnswer !== null) return
    const isCorrect = answerIndex === state.currentQuestion?.correctAnswer
    const eliminationRate = 0.15 + state.currentRound * 0.03
    let eliminatedCount = 0
    const updatedPlayers = state.players.map((p) => {
      if (!p.isAlive) return p
      if (!p.isBot) {
        return {
          ...p,
          isAlive: isCorrect,
          score: isCorrect ? p.score + state.timeLeft * 10 : p.score,
          streak: isCorrect ? p.streak + 1 : 0,
        }
      }
      const botEliminated = Math.random() < eliminationRate
      if (botEliminated) eliminatedCount++
      return {
        ...p,
        isAlive: !botEliminated,
        score: !botEliminated ? p.score + Math.floor(Math.random() * 100) : p.score,
        streak: !botEliminated ? p.streak + 1 : 0,
      }
    })
    if (!isCorrect) eliminatedCount++
    const alive = updatedPlayers.filter((p) => p.isAlive).length
    const playerAlive = updatedPlayers.find((p) => !p.isBot)?.isAlive
    set({
      selectedAnswer: answerIndex,
      isAnswerRevealed: true,
      players: updatedPlayers,
      playersAlive: alive,
      eliminatedThisRound: eliminatedCount,
    })
    setTimeout(() => {
      if (!playerAlive) {
        const currentState = get()
        set({ screen: "eliminated", winStreak: 0 })
        gameplayStop()
        showMidgameAd() // show ad after elimination
        // Save game result to DB
        if (currentState.userId) {
          const supabase = createClient()
          supabase.from("game_results").insert({
            user_id: currentState.userId,
            placement: alive + 1,
            total_players: currentState.totalPlayers,
            coins_won: 0,
            coins_spent: currentState.entryFee,
            correct_answers: currentState.currentRound - 1,
            total_questions: currentState.currentRound,
            game_mode: currentState.entryFee >= 200 ? "pro" : "classic",
          }).then(() => currentState.syncProfile())
        }
      } else if (alive <= 1 || state.currentRound >= state.totalRounds) {
        const currentState = get()
        const newStreak = currentState.winStreak + 1
        const reward = Math.floor(state.entryFee * (1 + state.currentRound * 0.5))
        gameplayStop()
        happyTime() // CrazyGames confetti celebration
        set({
          screen: "winner",
          totalWins: currentState.totalWins + 1,
          winStreak: newStreak,
          bestStreak: Math.max(newStreak, currentState.bestStreak),
          coins: currentState.coins + reward,
          xp: currentState.xp + 50,
          level: Math.floor((currentState.xp + 50) / 200) + 1,
        })
        // Save game result to DB
        if (currentState.userId) {
          const supabase = createClient()
          supabase.from("game_results").insert({
            user_id: currentState.userId,
            placement: 1,
            total_players: currentState.totalPlayers,
            coins_won: reward,
            coins_spent: currentState.entryFee,
            correct_answers: currentState.currentRound,
            total_questions: currentState.currentRound,
            game_mode: currentState.entryFee >= 200 ? "pro" : "classic",
          }).then(() => {
            // Save updated coins to DB after win
            const latestState = get()
            latestState.syncProfile()
          })
        }
      }
    }, 2000)
  },

  nextRound: async () => {
    const state = get()
    const nextRound = state.currentRound + 1
    // Show midgame ad every 3 rounds (rounds 3, 6, 9)
    if (nextRound % 3 === 0) {
      await showMidgameAd()
    }
    const roundQuestions = getQuestionsByDifficulty(nextRound)
    set({
      currentRound: nextRound,
      timeLeft: Math.max(8, (state.entryFee >= 200 ? 10 : 15) - Math.floor(nextRound / 3)),
      selectedAnswer: null,
      isAnswerRevealed: false,
      roundQuestions,
      currentQuestion: roundQuestions[0] || null,
      eliminatedThisRound: 0,
    })
  },

  addCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }))
    setTimeout(() => get().syncProfile(), 100)
  },

  spendCoins: (amount) => {
    const state = get()
    if (state.coins < amount) return false
    set({ coins: state.coins - amount })
    setTimeout(() => get().syncProfile(), 100)
    return true
  },

  claimDailyReward: () => {
    const state = get()
    if (state.dailyChallengeCompleted) return
    set({
      coins: state.coins + 100,
      dailyChallengeCompleted: true,
      xp: state.xp + 20,
      level: Math.floor((state.xp + 20) / 200) + 1,
    })
    setTimeout(() => get().syncProfile(), 100)
  },

  resetGame: () =>
    set({
      players: [],
      currentQuestion: null,
      currentRound: 0,
      timeLeft: 15,
      selectedAnswer: null,
      isAnswerRevealed: false,
      playersAlive: 0,
      roundQuestions: [],
      screen: "home",
      eliminatedThisRound: 0,
    }),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  buyPowerUp: (id, price) => {
    const state = get()
    if (state.coins < price) return
    set({
      coins: state.coins - price,
      powerUps: [...state.powerUps, { id, name: id, active: true }],
    })
    setTimeout(() => get().syncProfile(), 100)
  },
}))
