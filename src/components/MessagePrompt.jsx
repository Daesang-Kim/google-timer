import { useEffect, useRef, useState } from 'react'

export default function MessagePrompt({ initialValue, initialNotifyBeforeEnd, onConfirm, onCancel }) {
  const [value, setValue] = useState(initialValue)
  const [notifyBeforeEnd, setNotifyBeforeEnd] = useState(initialNotifyBeforeEnd)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(value.trim(), notifyBeforeEnd)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <label className="modal-label" htmlFor="timer-message-input">
          무엇을 위한 타이머인가요?
        </label>
        <input
          id="timer-message-input"
          ref={inputRef}
          type="text"
          className="modal-input"
          placeholder="예: 빨래 널기, 계란 삶기 (선택 사항)"
          maxLength={40}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <label className="modal-checkbox">
          <input
            type="checkbox"
            checked={notifyBeforeEnd}
            onChange={(e) => setNotifyBeforeEnd(e.target.checked)}
          />
          종료 1분 전에 알림받기
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-text" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            시작
          </button>
        </div>
      </form>
    </div>
  )
}
