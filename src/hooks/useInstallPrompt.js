import { useCallback, useEffect, useState } from 'react'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Wraps the (Chromium-only) `beforeinstallprompt` flow and adds iOS
 * detection, since iOS never fires that event and can only be installed
 * manually via Safari's share sheet.
 */
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredEvent(e)
    }
    const onInstalled = () => {
      setDeferredEvent(null)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return
    deferredEvent.prompt()
    await deferredEvent.userChoice
    // A captured prompt event can only be used once.
    setDeferredEvent(null)
  }, [deferredEvent])

  return {
    installed,
    canPromptInstall: !installed && Boolean(deferredEvent),
    isIosManualInstall: !installed && isIos() && !deferredEvent,
    promptInstall,
  }
}
