import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TimerDial from './components/TimerDial.jsx'
import DurationInputs from './components/DurationInputs.jsx'
import { useAlarmSound } from './hooks/useAlarmSound.js'
import './App.css'

const BLUE = '#1a73e8'
const RED = '#ea4335'

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export default function App() {
  // 'idle' | 'running' | 'paused' | 'finished'
  const [status, setStatus] = useState('idle')
  const [duration, setDuration] = useState({ hours: 0, minutes: 5, seconds: 0 })
  const [baseSeconds, setBaseSeconds] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const endAtRef = useRef(null)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)
  const alarm = useAlarmSound()

  const totalInputSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release?.().catch(() => {})
      wakeLockRef.current = null
    }
  }, [])

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      /* wake lock is best-effort */
    }
  }, [])

  const tick = useCallback(() => {
    const msLeft = endAtRef.current - Date.now()
    const secLeft = Math.max(0, Math.round(msLeft / 1000))
    setRemainingSeconds(secLeft)
    if (secLeft <= 0) {
      clearTick()
      releaseWakeLock()
      setStatus('finished')
      alarm.start()
      if (document.hidden && Notification?.permission === 'granted') {
        try {
          new Notification('⏰ 타이머 종료', { body: '설정한 시간이 다 되었습니다.' })
        } catch {
          /* ignore */
        }
      }
    }
  }, [alarm, clearTick, releaseWakeLock])

  const start = useCallback(() => {
    if (totalInputSeconds <= 0) return
    if (Notification && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
    setBaseSeconds(totalInputSeconds)
    setRemainingSeconds(totalInputSeconds)
    endAtRef.current = Date.now() + totalInputSeconds * 1000
    setStatus('running')
    requestWakeLock()
    clearTick()
    intervalRef.current = setInterval(tick, 250)
  }, [clearTick, requestWakeLock, tick, totalInputSeconds])

  const pause = useCallback(() => {
    clearTick()
    releaseWakeLock()
    setStatus('paused')
  }, [clearTick, releaseWakeLock])

  const resume = useCallback(() => {
    endAtRef.current = Date.now() + remainingSeconds * 1000
    setStatus('running')
    requestWakeLock()
    clearTick()
    intervalRef.current = setInterval(tick, 250)
  }, [clearTick, remainingSeconds, requestWakeLock, tick])

  const resetToSetup = useCallback(() => {
    clearTick()
    releaseWakeLock()
    alarm.stop()
    setStatus('idle')
    setRemainingSeconds(0)
    setBaseSeconds(0)
  }, [alarm, clearTick, releaseWakeLock])

  const cancelSetup = useCallback(() => {
    setDuration({ hours: 0, minutes: 0, seconds: 0 })
  }, [])

  const stopAlarm = useCallback(() => {
    alarm.stop()
    resetToSetup()
  }, [alarm, resetToSetup])

  // Keep the countdown reasonably accurate even if the tab is throttled in
  // the background by re-syncing whenever the page becomes visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [status, tick])

  useEffect(() => () => clearTick(), [clearTick])

  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      document.title = `${formatClock(remainingSeconds)} - Google 타이머`
    } else if (status === 'finished') {
      document.title = '⏰ 시간 종료! - Google 타이머'
    } else {
      document.title = 'Google 타이머'
    }
  }, [status, remainingSeconds])

  const dialMinutes = duration.minutes % 60
  const editFraction = dialMinutes / 60
  const progressFraction = useMemo(() => {
    if (baseSeconds <= 0) return 0
    return remainingSeconds / baseSeconds
  }, [baseSeconds, remainingSeconds])

  const handleDurationChange = useCallback((next) => setDuration(next), [])
  const handleDialMinutes = useCallback(
    (m) => setDuration((prev) => ({ ...prev, minutes: m })),
    [],
  )

  return (
    <div className="app">
      <header className="app-header">
        <span className="material-title">Google 타이머</span>
      </header>

      <main className="stage">
        {status === 'idle' && (
          <>
            <TimerDial editable fraction={editFraction} accentColor={RED} onChangeMinutes={handleDialMinutes}>
              <DurationInputs
                hours={duration.hours}
                minutes={duration.minutes}
                seconds={duration.seconds}
                onChange={handleDurationChange}
              />
            </TimerDial>
            <div className="actions">
              <button className="btn btn-primary" disabled={totalInputSeconds <= 0} onClick={start}>
                시작
              </button>
              <button className="btn btn-text" onClick={cancelSetup}>
                취소
              </button>
            </div>
          </>
        )}

        {(status === 'running' || status === 'paused') && (
          <>
            <TimerDial editable={false} fraction={progressFraction} accentColor={BLUE}>
              <div className="countdown">{formatClock(remainingSeconds)}</div>
              {status === 'paused' && <div className="countdown-sub">일시정지됨</div>}
            </TimerDial>
            <div className="actions">
              {status === 'running' ? (
                <button className="btn btn-primary" onClick={pause}>
                  일시정지
                </button>
              ) : (
                <button className="btn btn-primary" onClick={resume}>
                  다시 시작
                </button>
              )}
              <button className="btn btn-text" onClick={resetToSetup}>
                재설정
              </button>
            </div>
          </>
        )}

        {status === 'finished' && (
          <div className="finished">
            <div className="finished-emoji" aria-hidden>
              ⏰
            </div>
            <div className="finished-title">시간이 다 되었습니다!</div>
            <button className="btn btn-primary btn-stop" onClick={stopAlarm}>
              중지
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
