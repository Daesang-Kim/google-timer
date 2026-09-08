function formatShortcutLabel(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const parts = []
  if (h) parts.push(`${h}시간`)
  if (m) parts.push(`${m}분`)
  if (s) parts.push(`${s}초`)
  return parts.length ? parts.join(' ') : '0초'
}

export default function ShortcutBar({ shortcuts, onSelect, onAdd, canAdd, onRemove }) {
  return (
    <div className="shortcut-bar">
      {shortcuts.map((s) => (
        <div key={s.id} className="shortcut-chip">
          <button type="button" className="shortcut-chip-main" onClick={() => onSelect(s.seconds)}>
            {formatShortcutLabel(s.seconds)}
          </button>
          <button
            type="button"
            className="shortcut-chip-remove"
            aria-label={`${formatShortcutLabel(s.seconds)} 단축키 삭제`}
            onClick={() => onRemove(s.id)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="shortcut-chip shortcut-chip-add"
        disabled={!canAdd}
        title="지금 설정한 시간을 단축키로 저장"
        onClick={onAdd}
      >
        + 현재 시간 저장
      </button>
    </div>
  )
}
