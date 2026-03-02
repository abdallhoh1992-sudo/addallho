"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { Shield, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react"

export function AuthScreen() {
  const { setScreen, loadProfile, soundEnabled } = useGameStore()
  const { t, lang } = useTranslation()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const supabase = createClient()

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email.split("@")[0] },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
        },
      })
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess(lang === "ar" ? "تم التسجيل! تحقق من بريدك الإلكتروني للتفعيل." : "Signed up! Check your email to confirm.")
        if (soundEnabled) SFX.coin()
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError(signInError.message)
      } else {
        await loadProfile()
        if (soundEnabled) SFX.powerUp()
        setScreen("home")
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-card/80 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => setScreen("home")}
          className="rounded-lg bg-secondary p-2 text-foreground transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {mode === "login"
            ? lang === "ar" ? "تسجيل الدخول" : "Login"
            : lang === "ar" ? "حساب جديد" : "Sign Up"
          }
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "تحدي البقاء" : "Survival Quiz"}
          </h2>
          <p className="text-center text-sm text-muted-foreground">
            {lang === "ar"
              ? "سجّل عشان تحفظ تقدمك وتنافس عالمياً"
              : "Sign in to save your progress and compete globally"
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={lang === "ar" ? "اسم العرض" : "Display Name"}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary py-3 pe-4 ps-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-secondary py-3 pe-4 ps-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-border bg-secondary py-3 pe-4 ps-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</p>
          )}
          {success && (
            <p className="rounded-lg bg-primary/10 p-3 text-center text-sm text-primary">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-all active:scale-95 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login"
              ? lang === "ar" ? "دخول" : "Login"
              : lang === "ar" ? "تسجيل" : "Sign Up"
            }
          </button>
        </form>

        {/* Switch mode */}
        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess("") }}
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {mode === "login"
            ? lang === "ar" ? "ما عندك حساب؟ سجّل الآن" : "No account? Sign up"
            : lang === "ar" ? "عندك حساب؟ سجّل دخول" : "Have an account? Login"
          }
        </button>

        {/* Guest */}
        <button
          onClick={() => setScreen("home")}
          className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          {lang === "ar" ? "متابعة كزائر" : "Continue as guest"}
        </button>
      </div>
    </div>
  )
}
