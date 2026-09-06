function clamp(value, min, max) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function Segment({ label, value, max, onChange, autoFocus }) {
  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(-2)
    onChange(digits === '' ? 0 : clamp(Number(digits), 0, max))
  }

  return (
    <div className="segment">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="segment-input"
        value={String(value).padStart(2, '0')}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        autoFocus={autoFocus}
        aria-label={label}
      />
      <span className="segment-label">{label}</span>
    </div>
  )
}

export default function DurationInputs({ hours, minutes, seconds, onChange }) {
  return (
    <div className="duration-inputs">
      <Segment label="시간" value={hours} max={23} onChange={(h) => onChange({ hours: h, minutes, seconds })} />
      <span className="segment-colon">:</span>
      <Segment
        label="분"
        value={minutes}
        max={59}
        autoFocus
        onChange={(m) => onChange({ hours, minutes: m, seconds })}
      />
      <span className="segment-colon">:</span>
      <Segment label="초" value={seconds} max={59} onChange={(s) => onChange({ hours, minutes, seconds: s })} />
    </div>
  )
}
