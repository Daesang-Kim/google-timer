import { useCallback, useRef } from 'react'

const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 130
const TICK_OUTER = RADIUS - 6
const TICK_INNER_MINOR = RADIUS - 14
const TICK_INNER_MAJOR = RADIUS - 22

function polarToCartesian(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function describePieSlice(fraction) {
  const clamped = Math.max(0, Math.min(1, fraction))
  if (clamped <= 0) return ''
  if (clamped >= 0.9999) {
    // Full circle: draw as two arcs (a single arc can't span 360deg).
    const top = polarToCartesian(0, RADIUS)
    const bottom = polarToCartesian(180, RADIUS)
    return [
      `M${CENTER},${CENTER}`,
      `L${top.x},${top.y}`,
      `A${RADIUS},${RADIUS} 0 1 1 ${bottom.x},${bottom.y}`,
      `A${RADIUS},${RADIUS} 0 1 1 ${top.x},${top.y}`,
      'Z',
    ].join(' ')
  }
  const angle = clamped * 360
  const start = polarToCartesian(0, RADIUS)
  const end = polarToCartesian(angle, RADIUS)
  const largeArc = angle > 180 ? 1 : 0
  return `M${CENTER},${CENTER} L${start.x},${start.y} A${RADIUS},${RADIUS} 0 ${largeArc} 1 ${end.x},${end.y} Z`
}

function angleFromPointer(clientX, clientY, rect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI
  if (deg < 0) deg += 360
  return deg
}

/**
 * Google-Timer-style circular dial.
 * - editable=true: drag around the ring to set minutes (0-59), shows a knob.
 * - editable=false: renders a shrinking progress wedge for the countdown.
 */
export default function TimerDial({ editable, fraction, accentColor, onChangeMinutes, children }) {
  const svgRef = useRef(null)
  const draggingRef = useRef(false)

  const updateFromEvent = useCallback(
    (clientX, clientY) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const deg = angleFromPointer(clientX, clientY, rect)
      let minutes = Math.round((deg / 360) * 60)
      if (minutes === 60) minutes = 0
      onChangeMinutes(minutes)
    },
    [onChangeMinutes],
  )

  const handlePointerDown = useCallback(
    (e) => {
      if (!editable) return
      draggingRef.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      updateFromEvent(e.clientX, e.clientY)
    },
    [editable, updateFromEvent],
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!editable || !draggingRef.current) return
      updateFromEvent(e.clientX, e.clientY)
    },
    [editable, updateFromEvent],
  )

  const handlePointerUp = useCallback((e) => {
    draggingRef.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
  }, [])

  const ticks = []
  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0
    const angle = (i / 60) * 360
    const outer = polarToCartesian(angle, TICK_OUTER)
    const inner = polarToCartesian(angle, isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR)
    ticks.push(
      <line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        className={isMajor ? 'dial-tick dial-tick--major' : 'dial-tick'}
      />,
    )
  }

  const wedgePath = describePieSlice(fraction)
  const knobAngle = fraction * 360
  const knobPos = polarToCartesian(knobAngle, RADIUS)

  return (
    <div className="dial-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`dial ${editable ? 'dial--editable' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <circle cx={CENTER} cy={CENTER} r={RADIUS} className="dial-track" />
        {wedgePath && <path d={wedgePath} fill={accentColor} className="dial-wedge" />}
        <g>{ticks}</g>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} className="dial-outline" />
        {editable && (
          <circle cx={knobPos.x} cy={knobPos.y} r={11} fill={accentColor} className="dial-knob" />
        )}
      </svg>
      <div className="dial-center">{children}</div>
    </div>
  )
}
