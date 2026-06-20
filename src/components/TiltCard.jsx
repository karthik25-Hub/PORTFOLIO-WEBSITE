import { useRef } from 'react'

/**
 * Wraps a card so it leans toward the cursor (subtle 3D tilt + lift).
 * Pure CSS transforms via rAF; respects prefers-reduced-motion.
 */
export default function TiltCard({ children, className = '', max = 7 }) {
  const ref = useRef(null)
  const raf = useRef(0)

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width  - 0.5   // -0.5 … 0.5
    const py = (e.clientY - r.top)  / r.height - 0.5
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.transform =
        `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-5px)`
    })
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    if (raf.current) cancelAnimationFrame(raf.current)
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
