"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { showRewardedAd } from "@/lib/crazygames"
import { PRODUCTS } from "@/lib/products"
import { BottomNav } from "./bottom-nav"
import { Coins, ArrowRight, ArrowLeft, Plus, TrendingUp, Gift, Trophy, CreditCard, X, Sparkles, Star, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

const Checkout = dynamic(() => import("@/components/checkout"), { ssr: false })

export function WalletScreen() {
  const { coins, setScreen, addCoins, soundEnabled, isLoggedIn } = useGameStore()
  const { t, isRTL } = useTranslation()
  const BackArrow = isRTL ? ArrowRight : ArrowLeft
  const [checkoutProduct, setCheckoutProduct] = useState<string | null>(null)
  const [watchingAd, setWatchingAd] = useState(false)

  const watchAdReward = async () => {
    setWatchingAd(true)
    const rewarded = await showRewardedAd()
    setWatchingAd(false)
    if (rewarded) {
      if (soundEnabled) SFX.coin()
      addCoins(25)
    }
  }

  const handleBuyCoins = (productId: string) => {
    if (!isLoggedIn) {
      setScreen("auth")
      return
    }
    if (soundEnabled) SFX.click()
    setCheckoutProduct(productId)
  }

  if (checkoutProduct) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border bg-card/50 p-4 backdrop-blur-sm">
          <button onClick={() => setCheckoutProduct(null)} className="active:scale-90 transition-transform">
            <X className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">
            {isRTL ? "إتمام الشراء" : "Checkout"}
          </h1>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          <Checkout productId={checkoutProduct} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card/50 p-4 backdrop-blur-sm">
        <button onClick={() => setScreen("home")} className="active:scale-90 transition-transform">
          <BackArrow className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t("walletTitle")}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pb-24">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 ring-1 ring-primary/10">
          <div className="absolute -top-6 end-4 opacity-10">
            <Coins className="h-24 w-24 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{t("currentBalance")}</p>
          <div className="mt-2 flex items-center gap-3">
            <Coins className="h-8 w-8 text-accent" />
            <span className="text-4xl font-bold text-foreground">{coins.toLocaleString()}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("coin")}</p>
        </div>

        {/* Earn Methods */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">{t("earnCoins")}</h2>

          <button
            onClick={watchAdReward}
            disabled={watchingAd}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                {watchingAd ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <TrendingUp className="h-5 w-5 text-primary" />}
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="font-medium text-foreground">{watchingAd ? (isRTL ? "جاري تحميل الإعلان..." : "Loading ad...") : t("watchAd")}</p>
                <p className="text-xs text-muted-foreground">{t("watchAdDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1">
              <Plus className="h-3 w-3 text-accent" />
              <span className="text-sm font-bold text-accent">25</span>
            </div>
          </button>

          <button className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:bg-secondary active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Gift className="h-5 w-5 text-accent" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="font-medium text-foreground">{t("inviteFriends")}</p>
                <p className="text-xs text-muted-foreground">{t("inviteDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1">
              <Plus className="h-3 w-3 text-accent" />
              <span className="text-sm font-bold text-accent">50</span>
            </div>
          </button>

          <button
            onClick={() => setScreen("home")}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:bg-secondary active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="font-medium text-foreground">{t("winChallenge")}</p>
                <p className="text-xs text-muted-foreground">{t("winDesc")}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Purchase Options - Stripe */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t("buyCoins")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handleBuyCoins(pack.id)}
                className="relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
              >
                {pack.bonus && (
                  <div className="absolute -top-2 start-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5">
                    <Star className="h-2.5 w-2.5 text-accent-foreground" />
                    <span className="text-[10px] font-bold text-accent-foreground whitespace-nowrap">{pack.bonus}</span>
                  </div>
                )}
                <div className="relative">
                  <Coins className="h-8 w-8 text-accent" />
                  {pack.bonus && <Sparkles className="absolute -top-1 -end-1 h-3 w-3 text-accent animate-pulse" />}
                </div>
                <span className="text-lg font-bold text-foreground">{pack.coins.toLocaleString()}</span>
                <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                  ${(pack.priceInCents / 100).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="wallet" />
    </div>
  )
}
