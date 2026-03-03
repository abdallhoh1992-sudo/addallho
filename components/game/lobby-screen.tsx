"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { findOrCreateRoom, subscribeToRoom, broadcastGameStart, leaveRoom, type RoomPlayer } from "@/lib/multiplayer"
import { Users, Zap, Wifi, WifiOff } from "lucide-react"

export function LobbyScreen() {
  const { initGameAfterLobby, soundEnabled, isLoggedIn, userId, displayName, entryFee } = useGameStore()
  const { t, isRTL } = useTranslation()
  const [playersJoined, setPlayersJoined] = useState(1)
  const [realPlayers, setRealPlayers] = useState<RoomPlayer[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [phase, setPhase] = useState<"joining" | "countdown" | "go">("joining")
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const botFillStarted = useRef(false)

  // Real multiplayer matchmaking
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      // Not logged in: use bot simulation
      startBotSimulation()
      return
    }

    // Try to find/create a real multiplayer room
    setIsMultiplayer(true)
    let cancelled = false

    async function joinRoom() {
      const room = await findOrCreateRoom(entryFee, userId!, displayName || "Player")
      if (cancelled || !room) {
        // Fallback to bot simulation
        setIsMultiplayer(false)
        startBotSimulation()
        return
      }

      setRoomId(room.id)

      // Subscribe to room updates
      subscribeToRoom(
        room.id,
        (player) => {
          setRealPlayers((prev) => {
            if (prev.find((p) => p.user_id === player.user_id)) return prev
            return [...prev, player]
          })
        },
        (count) => {
          setPlayersJoined(count)
          // If enough real players or wait 15 seconds, fill with bots
          if (count >= 50) {
            triggerCountdown()
          }
        },
        () => {
          triggerCountdown()
        },
      )

      // Auto-fill with bots after 8 seconds if not enough real players
      setTimeout(() => {
        if (!cancelled && !botFillStarted.current) {
          botFillStarted.current = true
          fillWithBots()
        }
      }, 8000)
    }

    joinRoom()

    return () => {
      cancelled = true
      leaveRoom()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startBotSimulation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setPlayersJoined((prev) => {
        const next = prev + Math.floor(Math.random() * 4) + 1
        if (next >= 50) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 50
        }
        return next
      })
    }, 200)
  }, [])

  const fillWithBots = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setPlayersJoined((prev) => {
        const next = prev + Math.floor(Math.random() * 3) + 1
        if (next >= 50) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 50
        }
        return next
      })
    }, 300)
  }, [])

  const triggerCountdown = useCallback(() => {
    if (phase !== "joining") return
    setPhase("countdown")
    setCountdown(3)
  }, [phase])

  useEffect(() => {
    if (playersJoined >= 50 && phase === "joining") {
      setTimeout(() => {
        if (isMultiplayer && roomId) {
          broadcastGameStart(roomId)
        }
        triggerCountdown()
      }, 500)
    }
  }, [playersJoined, phase, isMultiplayer, roomId, triggerCountdown])

  useEffect(() => {
    if (countdown === null || phase !== "countdown") return
    if (countdown <= 0) {
      setPhase("go")
      if (soundEnabled) SFX.go()
      setTimeout(() => initGameAfterLobby(), 800)
      return
    }
    if (soundEnabled) SFX.countdown()
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, phase, initGameAfterLobby, soundEnabled])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-6">
      {phase === "joining" && (
        <div className="flex flex-col items-center gap-8 animate-slide-up-fade">
          {/* Multiplayer indicator */}
          {isMultiplayer && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">
                {isRTL ? "لعب جماعي مباشر" : "Live Multiplayer"}
              </span>
            </div>
          )}
          {!isMultiplayer && (
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
              <WifiOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {isRTL ? "لعب فردي مع بوتات" : "Solo vs Bots"}
              </span>
            </div>
          )}

          {/* Pulsing ring */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-lg font-medium text-muted-foreground">{t("findingPlayers")}</p>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-bold text-foreground font-[var(--font-heading)]">
                {playersJoined}
              </span>
              <span className="text-lg text-muted-foreground">/ 50</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("playersJoined")}</p>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-64 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(playersJoined / 50) * 100}%` }}
            />
          </div>

          {/* Animated joining names - show real players first, then bots */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {realPlayers.slice(0, 4).map((p, i) => (
              <span
                key={p.user_id}
                className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary animate-slide-up-fade"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {p.display_name}
              </span>
            ))}
            {Array.from({ length: Math.min(Math.max(0, 8 - realPlayers.length), playersJoined) }).map((_, i) => (
              <span
                key={`bot-${i}`}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground animate-slide-up-fade"
                style={{ animationDelay: `${(realPlayers.length + i) * 100}ms` }}
              >
                {["Ahmed_97", "Sara_Pro", "NightWolf", "QuizKing", "BrainMax", "SpeedQ", "ThinkFast", "MindPower"][i]}
              </span>
            ))}
          </div>
        </div>
      )}

      {phase === "countdown" && countdown !== null && (
        <div className="flex flex-col items-center gap-6 animate-scale-in">
          <p className="text-xl font-medium text-muted-foreground">{t("matchStartsIn")}</p>
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="68" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
              <circle
                cx="72" cy="72" r="68" fill="none" stroke="currentColor" strokeWidth="4"
                strokeDasharray={427} strokeDashoffset={427 - (427 * (3 - countdown)) / 3}
                strokeLinecap="round" className="text-primary transition-all duration-1000"
              />
            </svg>
            <span key={countdown} className="text-7xl font-bold text-primary font-[var(--font-heading)] animate-count-pulse">
              {countdown}
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">{t("getReady")}</p>
        </div>
      )}

      {phase === "go" && (
        <div className="flex flex-col items-center gap-4 animate-scale-in">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-primary/20">
            <Zap className="h-16 w-16 text-primary" />
          </div>
          <span className="text-6xl font-bold text-primary font-[var(--font-heading)]">
            {t("go")}
          </span>
        </div>
      )}
    </div>
  )
}
