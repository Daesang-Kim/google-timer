import { useEffect, useRef, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'

export default function InstallButton() {
  const { installed, canPromptInstall, isIosManualInstall, promptInstall } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!showIosTip) return
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowIosTip(false)
    }
    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [showIosTip])

  if (installed || (!canPromptInstall && !isIosManualInstall)) return null

  return (
    <div className="install-wrap" ref={wrapRef}>
      <button
        type="button"
        className="install-btn"
        onClick={() => (canPromptInstall ? promptInstall() : setShowIosTip((v) => !v))}
      >
        <span className="install-btn-icon" aria-hidden>
          ⊕
        </span>
        홈 화면에 추가
      </button>

      {showIosTip && (
        <div className="install-tip" role="dialog">
          <p>
            Safari 하단(또는 상단) 공유 아이콘 <span aria-hidden>⬆️</span> 을 누른 뒤
            <br />
            <strong>&ldquo;홈 화면에 추가&rdquo;</strong>를 선택하세요.
          </p>
          <p className="install-tip-sub">타이머 종료 알림은 홈 화면에 추가한 뒤에만 받을 수 있어요.</p>
          <button type="button" className="install-tip-close" onClick={() => setShowIosTip(false)}>
            확인
          </button>
        </div>
      )}
    </div>
  )
}
