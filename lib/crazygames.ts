// CrazyGames SDK v2 wrapper
// https://docs.crazygames.com/sdk/html5-v2/

declare global {
  interface Window {
    CrazyGames?: {
      SDK: {
        ad: {
          requestAd: (type: "midgame" | "rewarded", callbacks: {
            adStarted: () => void
            adFinished: () => void
            adError: (error: string, errorData?: { reason: string; message: string }) => void
          }) => void
          hasAdblock: (callback: (error: unknown, result: boolean) => void) => void
        }
        game: {
          gameplayStart: () => void
          gameplayStop: () => void
          happyTime: () => void
          loadingStart: () => void
          loadingStop: () => void
        }
        getEnvironment: (callback: (error: unknown, env: "local" | "crazygames" | "disabled") => void) => void
      }
    }
  }
}

let sdkEnvironment: "local" | "crazygames" | "disabled" | "unknown" = "unknown"

export function initCrazyGames() {
  if (typeof window === "undefined") return
  if (!window.CrazyGames?.SDK) {
    sdkEnvironment = "disabled"
    return
  }
  window.CrazyGames.SDK.getEnvironment((_err, env) => {
    sdkEnvironment = env || "disabled"
    console.log("[CrazyGames] Environment:", sdkEnvironment)
  })
}

export function isCrazyGamesAvailable(): boolean {
  return sdkEnvironment === "crazygames" || sdkEnvironment === "local"
}

export function getEnvironment() {
  return sdkEnvironment
}

// Show a rewarded ad - returns a promise that resolves with true if rewarded, false if error/skipped
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) {
      // Fallback: simulate a short delay and grant reward (for non-CrazyGames environments)
      setTimeout(() => resolve(true), 1500)
      return
    }
    window.CrazyGames.SDK.ad.requestAd("rewarded", {
      adStarted: () => {
        console.log("[CrazyGames] Rewarded ad started")
      },
      adFinished: () => {
        console.log("[CrazyGames] Rewarded ad finished - granting reward")
        resolve(true)
      },
      adError: (error, errorData) => {
        console.log("[CrazyGames] Rewarded ad error:", error, errorData)
        resolve(false)
      },
    })
  })
}

// Show a midgame (interstitial) ad - between rounds or after elimination
export function showMidgameAd(): Promise<void> {
  return new Promise((resolve) => {
    if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) {
      resolve()
      return
    }
    window.CrazyGames.SDK.ad.requestAd("midgame", {
      adStarted: () => {
        console.log("[CrazyGames] Midgame ad started")
      },
      adFinished: () => {
        console.log("[CrazyGames] Midgame ad finished")
        resolve()
      },
      adError: () => {
        resolve()
      },
    })
  })
}

// Notify CrazyGames about gameplay events
export function gameplayStart() {
  if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) return
  window.CrazyGames.SDK.game.gameplayStart()
}

export function gameplayStop() {
  if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) return
  window.CrazyGames.SDK.game.gameplayStop()
}

export function happyTime() {
  if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) return
  window.CrazyGames.SDK.game.happyTime()
}

export function loadingStart() {
  if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) return
  window.CrazyGames.SDK.game.loadingStart()
}

export function loadingStop() {
  if (!isCrazyGamesAvailable() || !window.CrazyGames?.SDK) return
  window.CrazyGames.SDK.game.loadingStop()
}
