// Web Audio API sound effects - no external files needed
const AudioCtx = typeof window !== "undefined" ? (window.AudioContext || (window as any).webkitAudioContext) : null

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx && AudioCtx) ctx = new AudioCtx()
  return ctx
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + duration)
}

export const SFX = {
  correct: () => {
    playTone(523, 0.1, "sine", 0.12)
    setTimeout(() => playTone(659, 0.1, "sine", 0.12), 80)
    setTimeout(() => playTone(784, 0.15, "sine", 0.12), 160)
  },
  wrong: () => {
    playTone(311, 0.15, "sawtooth", 0.08)
    setTimeout(() => playTone(233, 0.25, "sawtooth", 0.08), 120)
  },
  tick: () => {
    playTone(800, 0.05, "sine", 0.06)
  },
  tickUrgent: () => {
    playTone(1000, 0.08, "square", 0.1)
  },
  countdown: () => {
    playTone(440, 0.12, "sine", 0.1)
  },
  go: () => {
    playTone(523, 0.08, "sine", 0.12)
    setTimeout(() => playTone(659, 0.08, "sine", 0.12), 60)
    setTimeout(() => playTone(784, 0.08, "sine", 0.12), 120)
    setTimeout(() => playTone(1047, 0.2, "sine", 0.12), 180)
  },
  win: () => {
    const notes = [523, 587, 659, 784, 880, 1047]
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.15, "sine", 0.1), i * 100)
    })
  },
  eliminated: () => {
    playTone(440, 0.15, "sawtooth", 0.06)
    setTimeout(() => playTone(349, 0.15, "sawtooth", 0.06), 150)
    setTimeout(() => playTone(261, 0.3, "sawtooth", 0.06), 300)
  },
  click: () => {
    playTone(600, 0.04, "sine", 0.08)
  },
  coin: () => {
    playTone(1200, 0.06, "sine", 0.1)
    setTimeout(() => playTone(1600, 0.08, "sine", 0.1), 60)
  },
  powerUp: () => {
    playTone(400, 0.06, "sine", 0.1)
    setTimeout(() => playTone(600, 0.06, "sine", 0.1), 60)
    setTimeout(() => playTone(800, 0.06, "sine", 0.1), 120)
    setTimeout(() => playTone(1200, 0.12, "sine", 0.1), 180)
  },
  purchase: () => {
    playTone(800, 0.05, "sine", 0.1)
    setTimeout(() => playTone(1000, 0.05, "sine", 0.1), 50)
    setTimeout(() => playTone(1200, 0.05, "sine", 0.1), 100)
    setTimeout(() => playTone(1600, 0.12, "sine", 0.12), 150)
  },
}
