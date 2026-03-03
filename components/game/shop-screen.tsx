"use client"

import { useState, useCallback } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { PRODUCTS } from "@/lib/products"
import { startCheckoutSession } from "@/app/actions/stripe"
import { BottomNav } from "./bottom-nav"
import {
  Coins, Zap, Shield, Clock, Star, Check,
  X, CreditCard, Sparkles, Heart,
} from "lucide-react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function ShopScreen() {
  const { coins, soundEnabled, spendCoins, buyPowerUp, powerUps, isLoggedIn, setScreen } = useGameStore()
  const { t, isRTL } = useTranslation()
  const [purchasedItems, setPurchasedItems] = useState<string[]>([])
  const [checkoutProduct, setCheckoutProduct] = useState<string | null>(null)

  const powerUpItems = [
    { id: "extra-time", icon: Clock, name: t("extraTime"), desc: t("extraTimeDesc"), price: 75, color: "text-primary" },
    { id: "second-chance", icon: Heart, name: t("secondChance"), desc: t("secondChanceDesc"), price: 150, color: "text-accent" },
    { id: "shield", icon: Shield, name: t("shield"), desc: t("shieldDesc"), price: 100, color: "text-primary" },
    { id: "double-xp", icon: Star, name: t("doubleXp"), desc: t("doubleXpDesc"), price: 50, color: "text-accent" },
  ]

  const handleBuyPowerUp = (item: typeof powerUpItems[0]) => {
    if (purchasedItems.includes(item.id) || powerUps.some((p) => p.id === item.id)) return
    if (spendCoins(item.price)) {
      if (soundEnabled) SFX.purchase()
      buyPowerUp(item.id, 0)
      setPurchasedItems((prev) => [...prev, item.id])
    }
  }

  const handleBuyCoins = (productId: string) => {
    if (!isLoggedIn) {
      setScreen("auth")
      return
    }
    setCheckoutProduct(productId)
  }

  const fetchClientSecret = useCallback(async () => {
    if (!checkoutProduct) throw new Error("No product selected")
    const secret = await startCheckoutSession(checkoutProduct)
    if (!secret) throw new Error("Failed to create checkout session")
    return secret
  }, [checkoutProduct])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("shopTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("shopDesc")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5">
          <Coins className="h-4 w-4 text-accent" />
          <span className="font-bold text-accent">{coins.toLocaleString()}</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-28">
        {/* Power-Ups */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            {t("powerUps")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {powerUpItems.map((item) => {
              const owned = purchasedItems.includes(item.id) || powerUps.some((p) => p.id === item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => handleBuyPowerUp(item)}
                  disabled={owned || coins < item.price}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all active:scale-[0.97] ${
                    owned
                      ? "border-primary/30 bg-primary/10"
                      : coins < item.price
                        ? "border-border bg-card opacity-50"
                        : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${owned ? "bg-primary/20" : "bg-secondary"}`}>
                    {owned ? <Check className="h-5 w-5 text-primary" /> : <item.icon className={`h-5 w-5 ${item.color}`} />}
                  </div>
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                  <p className="text-center text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                  {!owned && (
                    <div className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5">
                      <Coins className="h-3 w-3 text-accent" />
                      <span className="text-xs font-bold text-accent">{item.price}</span>
                    </div>
                  )}
                  {owned && <span className="text-xs font-medium text-primary">{t("done")}</span>}
                </button>
              )
            })}
          </div>
        </section>

        {/* Coin Packs - Stripe */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
            <CreditCard className="h-5 w-5 text-accent" />
            {t("coinPacks")}
          </h2>
          <div className="flex flex-col gap-3">
            {PRODUCTS.map((product, idx) => (
              <button
                key={product.id}
                onClick={() => handleBuyCoins(product.id)}
                className={`relative flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-secondary active:scale-[0.98] ${
                  idx === 1 ? "border-accent/50 bg-accent/5 ring-1 ring-accent/20" : "border-border bg-card"
                }`}
              >
                {idx === 1 && (
                  <span
                    className="absolute -top-2.5 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold text-accent-foreground"
                    style={{ [isRTL ? "right" : "left"]: "12px" }}
                  >
                    {t("mostPopular")}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                    <Coins className="h-6 w-6 text-accent" />
                    {idx >= 2 && <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent" />}
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="font-bold text-foreground">{product.coins.toLocaleString()} {t("coins")}</p>
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                  </div>
                </div>
                <div className="rounded-full bg-primary px-4 py-2">
                  <span className="text-sm font-bold text-primary-foreground">
                    ${(product.priceInCents / 100).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {!isLoggedIn && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {isRTL ? "سجل دخول لشراء العملات" : "Sign in to buy coins"}
            </p>
          )}
        </section>
      </main>

      {/* Stripe Checkout Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-t-2xl bg-background p-4 animate-slide-up-fade safe-bottom" style={{ maxHeight: "85vh", overflowY: "auto" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {isRTL ? "إتمام الشراء" : "Complete Purchase"}
              </h3>
              <button
                onClick={() => setCheckoutProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="min-h-[300px]">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="shop" />
    </div>
  )
}
