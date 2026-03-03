"use client"

import { useEffect, useState, useCallback } from "react"
import { useGameStore } from "@/lib/game-store"
import { useTranslation } from "@/lib/i18n"
import { SFX } from "@/lib/sounds"
import { Users, Clock, Zap, CheckCircle2, XCircle, ShieldAlert } from "lucide-react"

export function QuizScreen() {
  const {
    currentQuestion,
    currentRound,
    totalRounds,
    timeLeft: initialTime,
    selectedAnswer,
    isAnswerRevealed,
    playersAlive,
    totalPlayers,
    submitAnswer,
    nextRound,
    players,
    eliminatedThisRound,
    soundEnabled,
  } = useGameStore()
  const { t, lang } = useTranslation()

  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [showNextBtn, setShowNextBtn] = useState(false)
  const [shakeWrong, setShakeWrong] = useState(false)

  useEffect(() => {
    setTimeLeft(initialTime)
    setShowNextBtn(false)
    setShakeWrong(false)
  }, [currentRound, initialTime])

  useEffect(() => {
    if (isAnswerRevealed) {
      const t = setTimeout(() => setShowNextBtn(true), 1500)
      return () => clearTimeout(t)
    }
  }, [isAnswerRevealed])

  useEffect(() => {
    if (isAnswerRevealed || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitAnswer(-1)
          return 0
        }
        if (soundEnabled && prev <= 6) SFX.tickUrgent()
        else if (soundEnabled) SFX.tick()
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isAnswerRevealed, timeLeft, submitAnswer])

  const handleAnswer = useCallback(
    (index: number) => {
      if (isAnswerRevealed || selectedAnswer !== null) return
      submitAnswer(index)
      if (index === currentQuestion?.correctAnswer) {
        if (soundEnabled) SFX.correct()
      } else {
        if (soundEnabled) SFX.wrong()
        setShakeWrong(true)
        setTimeout(() => setShakeWrong(false), 500)
      }
    },
    [isAnswerRevealed, selectedAnswer, submitAnswer, currentQuestion]
  )

  if (!currentQuestion) return null

  const timePercent = (timeLeft / initialTime) * 100
  const isTimeWarning = timeLeft <= 5
  const playerScore = players.find((p) => !p.isBot)?.score || 0
  const playerStreak = players.find((p) => !p.isBot)?.streak || 0

  const questionText = lang === "en" ? currentQuestion.questionEn : currentQuestion.question
  const options = lang === "en" ? currentQuestion.optionsEn : currentQuestion.options
  const category = lang === "en" ? currentQuestion.categoryEn : currentQuestion.category
  const difficultyText = currentQuestion.difficulty === "easy" ? t("easy") : currentQuestion.difficulty === "medium" ? t("medium") : t("hard")

  const getOptionStyle = (index: number) => {
    if (!isAnswerRevealed) {
      return "border-border bg-card hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
    }
    if (index === currentQuestion.correctAnswer) {
      return "border-primary bg-primary/20 ring-1 ring-primary/50"
    }
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return "border-destructive bg-destructive/20 ring-1 ring-destructive/50"
    }
    return "border-border/50 bg-card/50 opacity-40"
  }

  const getOptionLetter = (index: number) => {
    return ["A", "B", "C", "D"][index]
  }

  return (
    <div className={`flex min-h-dvh flex-col bg-background ${shakeWrong ? "animate-shake" : ""}`}>
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border bg-card/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{playersAlive}</span>
          <span className="text-xs text-muted-foreground">/ {totalPlayers}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
          <span className="text-xs text-muted-foreground">{t("round")}</span>
          <span className="text-sm font-bold text-foreground">{currentRound}</span>
          <span className="text-xs text-muted-foreground">/ {totalRounds}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-sm font-bold text-foreground">{playerScore}</span>
        </div>
      </header>

      {/* Timer */}
      <div className="px-4 pt-4">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isTimeWarning ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${timePercent}%` }}
          />
          {isTimeWarning && (
            <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/20" />
          )}
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <Clock className={`h-5 w-5 ${isTimeWarning ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
          <span className={`text-2xl font-bold font-[var(--font-heading)] ${isTimeWarning ? "text-destructive" : "text-foreground"}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Streak */}
      {playerStreak > 1 && (
        <div className="mx-4 mt-2 flex items-center justify-center gap-1 rounded-lg bg-accent/10 py-1.5 ring-1 ring-accent/20">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-bold text-accent">
            {t("streak")} {playerStreak}x
          </span>
        </div>
      )}

      {/* Question */}
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {category}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            currentQuestion.difficulty === "easy" ? "bg-primary/10 text-primary" :
            currentQuestion.difficulty === "medium" ? "bg-accent/20 text-accent" :
            "bg-destructive/20 text-destructive"
          }`}>
            {difficultyText}
          </span>
        </div>

        <h2 className="text-xl font-bold leading-relaxed text-foreground text-balance">
          {questionText}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isAnswerRevealed}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${getOptionStyle(index)}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                isAnswerRevealed && index === currentQuestion.correctAnswer
                  ? "bg-primary text-primary-foreground"
                  : isAnswerRevealed && index === selectedAnswer && index !== currentQuestion.correctAnswer
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {getOptionLetter(index)}
              </span>
              <span className="flex-1 font-medium text-foreground">{option}</span>
              {isAnswerRevealed && index === currentQuestion.correctAnswer && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              )}
              {isAnswerRevealed && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
              )}
            </button>
          ))}
        </div>

        {/* Eliminated counter */}
        {isAnswerRevealed && eliminatedThisRound > 0 && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-3 ring-1 ring-destructive/20 animate-in fade-in slide-in-from-bottom-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {t("eliminated")} {eliminatedThisRound} {t("player")}
            </span>
          </div>
        )}

        {/* Next Round Button */}
        {showNextBtn && (
          <button
            onClick={nextRound}
            className="mt-auto rounded-xl bg-primary p-4 text-center font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2"
          >
            {t("nextRound")}
          </button>
        )}
      </main>
    </div>
  )
}
