import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'google-timer:shortcuts'
const DEFAULT_SHORTCUTS = [
  { id: 'default-1m', seconds: 60 },
  { id: 'default-3m', seconds: 180 },
  { id: 'default-5m', seconds: 300 },
  { id: 'default-10m', seconds: 600 },
]

function loadShortcuts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SHORTCUTS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((s) => s && typeof s.seconds === 'number')) {
      return parsed
    }
  } catch {
    /* corrupt/unavailable storage - fall back to defaults */
  }
  return DEFAULT_SHORTCUTS
}

/** Frequently-used durations, persisted to localStorage across visits. */
export function useTimerShortcuts() {
  const [shortcuts, setShortcuts] = useState(loadShortcuts)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts))
    } catch {
      /* storage may be unavailable (private mode, quota) - best effort only */
    }
  }, [shortcuts])

  const addShortcut = useCallback((seconds) => {
    if (seconds <= 0) return
    setShortcuts((prev) => {
      if (prev.some((s) => s.seconds === seconds)) return prev
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      return [...prev, { id, seconds }]
    })
  }, [])

  const removeShortcut = useCallback((id) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { shortcuts, addShortcut, removeShortcut }
}
