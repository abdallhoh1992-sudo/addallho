"use client"

import { useEffect } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation, useI18n } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { BottomNav } from "./bottom-nav"
import { Zap, Trophy, Coins, Gift, Star, ChevronLeft, ChevronRight, Users, Flame, Globe, Volume2, VolumeX, LogIn, LogOut, User } from "lucide-react"

export function HomeScreen() {
  const {
    coins, totalWins, totalGames, winStreak, bestStreak,
    level, xp, setScreen, startGame, claimDailyReward,
    dailyChallengeCompleted, soundEnabled, toggleSound,
    isLoggedIn, displayName, loadProfile, logout,
  } = useGameStore()
  const { t, lang, isRTL } = useTranslation()
  const toggleLang = useI18n((s) => s.toggleLang)

  useEffect(() => { loadProfile() }, [loadProfile])

  const xpProgress = ((xp % 200) / 200) * 100
  const BackArrow = isRTL ? ChevronLeft : ChevronRight

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <Zap className="h-5 w-5 text-primary" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {level}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("level")} {level}</p>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 transition-colors hover:bg-secondary/80 active:scale-95"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">{t("language")}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80 active:scale-95"
            aria-label="Toggle sound"
          >
            {soundEnabled
              ? <Volume2 className="h-4 w-4 text-muted-foreground" />
              : <VolumeX className="h-4 w-4 text-muted-foreground" />
            }
          </button>

          {/* Auth */}
          {isLoggedIn ? (
            <button onClick={() => logout()} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80 active:scale-95" aria-label="Logout">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <button onClick={() => setScreen("auth")} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 transition-colors hover:bg-primary/30 active:scale-95" aria-label="Login">
              <LogIn className="h-4 w-4 text-primary" />
            </button>
          )}

          {/* Coins */}
          <button
            onClick={() => setScreen("wallet")}
            className="flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 transition-colors hover:bg-accent/30 active:scale-95"
          >
            <Coins className="h-4 w-4 text-accent" />
            <span className="font-bold text-accent">{coins.toLocaleString()}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="relative animate-float">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary/30">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent">
              <Trophy className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-center text-3xl font-bold text-foreground font-[var(--font-heading)] text-balance">
            {t("survivalQuiz")}
          </h1>
          <p className="text-center text-sm text-muted-foreground">{t("tagline")}</p>
          {isLoggedIn && displayName && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <User className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">{displayName}</span>
            </div>
          )}
        </div>

        {/* Daily Reward */}
        {!dailyChallengeCompleted && (
          <button
            onClick={() => { if (soundEnabled) SFX.coin(); claimDailyReward() }}
            className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 p-4 transition-all hover:bg-accent/20 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Gift className="h-5 w-5 text-accent" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="font-bold text-foreground">{t("dailyReward")}</p>
                <p className="text-xs text-muted-foreground">{t("dailyRewardDesc")}</p>
              </div>
            </div>
            <BackArrow className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        {/* Game Modes */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">{t("chooseChallenge")}</h2>

          {/* Classic Mode */}
          <button
            onClick={() => { if (soundEnabled) SFX.click(); startGame(50) }}
            className="group relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-5 transition-all hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] animate-glow-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-lg font-bold text-foreground">{t("classicChallenge")}</p>
                  <p className="text-sm text-muted-foreground">{t("classicDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1">
                <Coins className="h-3.5 w-3.5 text-accent" />
                <span className="text-sm font-bold text-accent">50</span>
              </div>
            </div>
            <div className="relative mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" /> {t("prize")}: 250+
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" /> 15{t("secondsShort")} {t("perQuestion")}
              </span>
            </div>
          </button>

          {/* Pro Mode */}
          <button
            onClick={() => { if (soundEnabled) SFX.click(); startGame(200) }}
            className="group relative overflow-hidden rounded-xl border border-accent/30 bg-accent/5 p-5 transition-all hover:bg-accent/10 hover:border-accent/50 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 ring-1 ring-accent/30">
                  <Flame className="h-6 w-6 text-accent" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-lg font-bold text-foreground">{t("proChallenge")}</p>
                  <p className="text-sm text-muted-foreground">{t("proDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1">
                <Coins className="h-3.5 w-3.5 text-accent" />
                <span className="text-sm font-bold text-accent">200</span>
              </div>
            </div>
            <div className="relative mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" /> {t("prize")}: 1000+
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" /> 10{t("secondsShort")} {t("perQuestion")}
              </span>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">{t("yourStats")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Trophy, color: "text-primary", label: t("wins"), value: totalWins },
              { icon: Users, color: "text-primary", label: t("matches"), value: totalGames },
              { icon: Flame, color: "text-accent", label: t("winStreak"), value: winStreak },
              { icon: Star, color: "text-accent", label: t("bestStreak"), value: bestStreak },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
