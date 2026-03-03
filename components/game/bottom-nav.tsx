"use client"

import { useGameStore, type GameScreen } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { Zap, Trophy, Coins, Gift } from "lucide-react"

const NAV_ITEMS: { screen: GameScreen; iconKey: string; labelKey: "home" | "leaderboard" | "wallet" | "shop" }[] = [
  { screen: "home", iconKey: "zap", labelKey: "home" },
  { screen: "leaderboard", iconKey: "trophy", labelKey: "leaderboard" },
  { screen: "wallet", iconKey: "coins", labelKey: "wallet" },
  { screen: "shop", iconKey: "gift", labelKey: "shop" },
]

const ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  trophy: Trophy,
  coins: Coins,
  gift: Gift,
}

export function BottomNav({ active }: { active: GameScreen }) {
  const { setScreen, soundEnabled } = useGameStore()
  const { t } = useTranslation()

  return (
    <nav className="safe-bottom border-t border-border bg-card/90 backdrop-blur-lg" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.iconKey]
          const isActive = active === item.screen
          return (
            <button
              key={item.screen}
              onClick={() => {
                if (soundEnabled && !isActive) SFX.click()
                setScreen(item.screen)
              }}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all active:scale-90 ${
                isActive ? "bg-primary/10" : "hover:bg-secondary/50"
              }`}
              aria-label={t(item.labelKey)}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute -top-0.5 h-0.5 w-6 rounded-full bg-primary" />
              )}
              <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {t(item.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
