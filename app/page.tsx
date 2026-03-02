"use client"

import { useEffect } from "react"
import { useGameStore } from "@/lib/game-store"
import { useI18n } from "@/lib/i18n"
import { initCrazyGames, loadingStop } from "@/lib/crazygames"
import { HomeScreen } from "@/components/game/home-screen"
import { LobbyScreen } from "@/components/game/lobby-screen"
import { QuizScreen } from "@/components/game/quiz-screen"
import { WinnerScreen, EliminatedScreen } from "@/components/game/result-screens"
import { WalletScreen } from "@/components/game/wallet-screen"
import { LeaderboardScreen } from "@/components/game/leaderboard-screen"
import { ShopScreen } from "@/components/game/shop-screen"
import { AuthScreen } from "@/components/game/auth-screen"

export default function Page() {
  const { screen } = useGameStore()
  const lang = useI18n((s) => s.lang)

  // Initialize CrazyGames SDK
  useEffect(() => {
    initCrazyGames()
    // Signal loading complete
    const timer = setTimeout(() => loadingStop(), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Update HTML dir and lang dynamically
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <div key={screen} className="screen-enter">
        {screen === "home" && <HomeScreen />}
        {screen === "lobby" && <LobbyScreen />}
        {screen === "game" && <QuizScreen />}
        {screen === "winner" && <WinnerScreen />}
        {screen === "eliminated" && <EliminatedScreen />}
        {screen === "wallet" && <WalletScreen />}
        {screen === "leaderboard" && <LeaderboardScreen />}
        {screen === "shop" && <ShopScreen />}
        {screen === "auth" && <AuthScreen />}
      </div>
    </div>
  )
}
