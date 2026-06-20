import { useEffect, useRef, useState } from 'react'

/**
 * Custom magnet cursor following the design system (clay body, teal poles).
 * Smoothly trails the pointer, grows + tilts upright over interactive targets.
 * Only renders on fine pointers (desktop); native cursor stays on touch.
 */
export default function MagnetCursor() {
  const dotRef = useRef(null)
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(pointer: fine)').matches
  })

  useEffect(() => {
    if (!enabled) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = dotRef.current
    if (!el) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let cx = mx
    let cy = my
    let hovering = false
    let down = false
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      const t = e.target
      hovering = !!(t && t.closest('a, button, [role="button"], .magic-bento-card, .bento-toggle, input, textarea, .sm-toggle'))
    }
    const onDown = () => { down = true }
    const onUp = () => { down = false }
    const onLeaveWin = () => { el.style.opacity = '0' }
    const onEnterWin = () => { el.style.opacity = '1' }

    const lerp = reduce ? 1 : 0.18

    const tick = () => {
      raf = requestAnimationFrame(tick)
      cx += (mx - cx) * lerp
      cy += (my - cy) * lerp
      const scale = (hovering ? 1.45 : 1) * (down ? 0.82 : 1)
      const rot = hovering ? 0 : -22
      el.style.transform =
        `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`
      el.style.setProperty('--mc-glow', hovering ? '0.9' : '0.35')
    }
    tick()

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeaveWin)
    document.addEventListener('mouseenter', onEnterWin)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeaveWin)
      document.removeEventListener('mouseenter', onEnterWin)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={dotRef} className="magnet-cursor" aria-hidden="true">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        {/* glow */}
        <circle cx="16" cy="16" r="14" fill="#C75B39" style={{ opacity: 'var(--mc-glow, 0.35)' }} className="mc-glow" />
        {/* horseshoe body — clay */}
        <path
          d="M9 8 V16 a7 7 0 0 0 14 0 V8"
          stroke="#C75B39"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* poles — teal tips */}
        <path d="M9 8 V12" stroke="#0F8A77" strokeWidth="5" strokeLinecap="round" />
        <path d="M23 8 V12" stroke="#0F8A77" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
