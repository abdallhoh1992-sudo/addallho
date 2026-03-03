"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { Trophy, Coins, XCircle, RotateCcw, Home, Star, Zap } from "lucide-react"

function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string; size: number }>>([])

  useEffect(() => {
    const colors = [
      "bg-primary", "bg-accent", "bg-primary/70", "bg-accent/70",
      "bg-primary/50", "bg-accent/50",
    ]
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
    }))
    setParticles(items)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animation: `confetti-fall 3s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function WinnerScreen() {
  const { currentRound, playersAlive, totalPlayers, players, resetGame, coins, entryFee, soundEnabled } = useGameStore()
  const { t } = useTranslation()

  useEffect(() => { if (soundEnabled) SFX.win() }, [soundEnabled])

  const playerScore = players.find((p) => !p.isBot)?.score || 0
  const reward = Math.floor(entryFee * (1 + currentRound * 0.5))

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background p-6">
      <Confetti />
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        {/* Trophy Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" style={{ animationDuration: "2s" }} />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-accent/20 ring-2 ring-accent/40">
            <Trophy className="h-14 w-14 text-accent" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary ring-2 ring-background">
            <Star className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-foreground font-[var(--font-heading)]">
            {t("youWon")}
          </h1>
          <p className="text-center text-muted-foreground">
            {t("lastStanding")} {totalPlayers} {t("players")}
          </p>
        </div>

        {/* Stats */}
        <div className="w-full max-w-xs space-y-3">
          {[
            { label: t("score"), value: playerScore.toString(), icon: Zap, accent: true },
            { label: t("rounds"), value: currentRound.toString(), icon: null, accent: false },
            { label: t("playersRemaining"), value: playersAlive.toString(), icon: null, accent: false },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <span className="text-muted-foreground">{stat.label}</span>
              <div className="flex items-center gap-1.5">
                {stat.icon && <stat.icon className="h-4 w-4 text-accent" />}
                <span className="font-bold text-foreground">{stat.value}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 p-4 ring-1 ring-accent/20">
            <span className="font-medium text-accent">{t("reward")}</span>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-accent" />
              <span className="font-bold text-accent">+{reward}</span>
            </div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2">
          <Coins className="h-4 w-4 text-accent" />
          <span className="text-sm text-muted-foreground">{t("balance")}</span>
          <span className="font-bold text-foreground">{coins.toLocaleString()}</span>
        </div>

        {/* Actions */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary p-4 font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <RotateCcw className="h-5 w-5" />
            {t("playAgain")}
          </button>
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
          >
            <Home className="h-5 w-5" />
            {t("homeBtn")}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EliminatedScreen() {
  const { currentRound, totalRounds, playersAlive, players, resetGame, soundEnabled } = useGameStore()
  const { t } = useTranslation()

  useEffect(() => { if (soundEnabled) SFX.eliminated() }, [soundEnabled])

  const playerScore = players.find((p) => !p.isBot)?.score || 0

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        {/* X Icon */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-destructive/20 ring-2 ring-destructive/30">
            <XCircle className="h-14 w-14 text-destructive" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-foreground font-[var(--font-heading)]">
            {t("youEliminated")}
          </h1>
          <p className="text-center text-muted-foreground">
            {t("lostAtRound")} {currentRound} {t("of")} {totalRounds}
          </p>
        </div>

        {/* Stats */}
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="text-muted-foreground">{t("score")}</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">{playerScore}</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="text-muted-foreground">{t("reachedRound")}</span>
            <span className="font-bold text-foreground">{currentRound} / {totalRounds}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="text-muted-foreground">{t("playersLeft")}</span>
            <span className="font-bold text-foreground">{playersAlive}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary p-4 font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <RotateCcw className="h-5 w-5" />
            {t("tryAgain")}
          </button>
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
          >
            <Home className="h-5 w-5" />
            {t("homeBtn")}
          </button>
        </div>
      </div>
    </div>
  )
}
