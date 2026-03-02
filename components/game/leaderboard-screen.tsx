"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "./bottom-nav"
import { ArrowRight, ArrowLeft, Coins, Crown, Medal, Loader2 } from "lucide-react"

interface LeaderboardEntry {
  display_name: string
  total_wins: number
  coins: number
}

const FALLBACK_DATA: LeaderboardEntry[] = [
  { display_name: "QuizKing", total_wins: 142, coins: 58300 },
  { display_name: "BrainMax", total_wins: 128, coins: 49200 },
  { display_name: "SpeedQ", total_wins: 115, coins: 43100 },
  { display_name: "NightWolf", total_wins: 98, coins: 38600 },
  { display_name: "Sara_Pro", total_wins: 87, coins: 32400 },
  { display_name: "MindPower", total_wins: 76, coins: 28900 },
  { display_name: "ThinkFast", total_wins: 65, coins: 24100 },
  { display_name: "SmartPlay", total_wins: 54, coins: 19800 },
  { display_name: "GameOn99", total_wins: 43, coins: 15200 },
  { display_name: "ProQuiz", total_wins: 38, coins: 12100 },
]

export function LeaderboardScreen() {
  const { setScreen, totalWins, coins } = useGameStore()
  const { t, isRTL } = useTranslation()
  const BackArrow = isRTL ? ArrowRight : ArrowLeft
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>(FALLBACK_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("profiles")
          .select("display_name, total_wins, coins")
          .order("total_wins", { ascending: false })
          .limit(20)
        if (data && data.length > 0) {
          setLeaders(data)
        }
      } catch {
        // Use fallback data
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const playerRank = leaders.filter((p) => p.total_wins > totalWins).length + 1

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-accent" />
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />
    if (rank === 3) return <Medal className="h-5 w-5 text-accent/70" />
    return <span className="text-sm font-bold text-muted-foreground">{rank}</span>
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card/50 p-4 backdrop-blur-sm">
        <button onClick={() => setScreen("home")} className="transition-transform active:scale-90">
          <BackArrow className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t("leaderboardTitle")}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {/* Your Rank */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 ring-1 ring-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/30">
                <span className="text-sm font-bold text-primary">#{playerRank}</span>
              </div>
              <div>
                <p className="font-bold text-foreground">{t("you")}</p>
                <p className="text-xs text-muted-foreground">{totalWins} {t("winsCount")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">{coins.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {leaders.map((player, index) => (
              <div
                key={`${player.display_name}-${index}`}
                className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                  index < 3 ? "border-accent/30 bg-accent/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{player.display_name || "Player"}</p>
                    <p className="text-xs text-muted-foreground">{player.total_wins} {t("winsCount")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-accent" />
                  <span className="text-sm font-bold text-foreground">{player.coins.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="leaderboard" />
    </div>
  )
}
