import { useEffect, useRef } from 'react'

/**
 * Per-section vector-field grid background.
 * Fills its parent opaquely (so stacked sections read cleanly) and draws the
 * animated, cursor-reactive grid. `dark` → black fill + white lines;
 * otherwise sand fill + dark lines. Pauses when scrolled out of view.
 */
export default function SectionGrid({ dark = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const BG = dark ? '#141310' : '#F2EBE1'
    const LINE = dark ? '255,255,255' : '28,27,24'
    const LINE_A = dark ? 0.10 : 0.06
    const ARROW_A = dark ? 0.20 : 0.14

    let w = 0, h = 0
    const resize = () => {
      w = parent.offsetWidth
      h = parent.offsetHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, w * dpr)
      canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('resize', resize)

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, r: 220 }
    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = e.clientX - rect.left
      mouse.ty = e.clientY - rect.top
    }
    window.addEventListener('mousemove', onMove)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // pause when offscreen
    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { rootMargin: '100px' })
    io.observe(parent)

    const warp = (bx, by, t) => {
      let x = bx + Math.sin(bx * 0.005 + t) * 6
      let y = by + Math.cos(by * 0.005 - t) * 6
      if (!reduce) {
        const dx = x - mouse.x
        const dy = y - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < mouse.r) {
          const f = (mouse.r - d) / mouse.r
          const a = Math.atan2(dy, dx)
          x += Math.cos(a) * f * 45
          y += Math.sin(a) * f * 45
        }
      }
      return { x, y }
    }

    const SPACING = 65, STEP = 30

    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)

      // always paint the opaque background so stacking stays clean,
      // but skip the (expensive) field when offscreen
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, w, h)
      if (!visible) return

      const t = Date.now() * 0.0008
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08

      ctx.lineWidth = 1.6
      ctx.strokeStyle = `rgba(${LINE},${LINE_A})`
      for (let bx = 0; bx <= w; bx += SPACING) {
        ctx.beginPath()
        for (let by = 0; by <= h; by += STEP) {
          const p = warp(bx, by, t)
          by === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }
      for (let by = 0; by <= h; by += SPACING) {
        ctx.beginPath()
        for (let bx = 0; bx <= w; bx += STEP) {
          const p = warp(bx, by, t)
          bx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }

      ctx.strokeStyle = `rgba(${LINE},${ARROW_A})`
      ctx.lineWidth = 1.3
      for (let bx = SPACING; bx < w; bx += SPACING) {
        for (let by = SPACING; by < h; by += SPACING) {
          const p = warp(bx, by, t)
          const dx = p.x - mouse.x, dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          const mAng = Math.atan2(dy, dx)
          const bAng = bx * 0.015 + by * 0.015 + t
          const infR = 240
          const inf = dist < infR ? Math.pow(1 - dist / infR, 2) : 0
          const ang = inf * mAng + (1 - inf) * bAng
          const len = 14
          const x1 = p.x - Math.cos(ang) * len / 2, y1 = p.y - Math.sin(ang) * len / 2
          const x2 = p.x + Math.cos(ang) * len / 2, y2 = p.y + Math.sin(ang) * len / 2
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
          const hs = 4.5, aL = ang - Math.PI - 0.5, aR = ang - Math.PI + 0.5
          ctx.beginPath()
          ctx.moveTo(x2, y2); ctx.lineTo(x2 + Math.cos(aL) * hs, y2 + Math.sin(aL) * hs)
          ctx.moveTo(x2, y2); ctx.lineTo(x2 + Math.cos(aR) * hs, y2 + Math.sin(aR) * hs)
          ctx.stroke()
        }
      }
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [dark])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0, pointerEvents: 'none' }} aria-hidden="true" />
}
