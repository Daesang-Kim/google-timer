import { useCallback, useRef } from 'react'

// Generates the repeating alarm beep with the Web Audio API so no external
// audio asset is needed (keeps the PWA fully offline-capable).
export function useAlarmSound() {
  const ctxRef = useRef(null)
  const intervalRef = useRef(null)

  const beep = useCallback((ctx, time, freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.35, time + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.24)
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    ctxRef.current = ctx

    const playCycle = () => {
      if (ctx.state === 'suspended') ctx.resume()
      const now = ctx.currentTime
      beep(ctx, now, 988)
      beep(ctx, now + 0.28, 988)
      beep(ctx, now + 0.56, 1318)
    }
    playCycle()
    intervalRef.current = setInterval(playCycle, 1300)
  }, [beep])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
  }, [])

  return { start, stop }
}
