import { useEffect, useRef } from 'react'

/**
 * Global vector-field grid background (2D canvas, fixed, behind everything).
 * Draws dark lines over the light page; for any element tagged
 * [data-grid-dark] it fills that region black and redraws the grid in WHITE,
 * so the field stays visible over dark sections.
 */
export default function GridCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const mouse = { x: -1000, y: -1000, tx: -1000, ty: -1000, r: 220 }
    const onMove = e => { mouse.tx = e.clientX; mouse.ty = e.clientY }
    const onLeave = () => { mouse.tx = -1000; mouse.ty = -1000 }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

    const SPACING = 65
    const STEP = 30

    const drawField = (lineRGB, lineA, arrowRGB, arrowA, t) => {
      // vertical lines
      ctx.lineWidth = 1.6
      ctx.strokeStyle = `rgba(${lineRGB},${lineA})`
      for (let bx = 0; bx <= width; bx += SPACING) {
        ctx.beginPath()
        for (let by = 0; by <= height; by += STEP) {
          const p = warp(bx, by, t)
          by === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }
      // horizontal lines
      for (let by = 0; by <= height; by += SPACING) {
        ctx.beginPath()
        for (let bx = 0; bx <= width; bx += STEP) {
          const p = warp(bx, by, t)
          bx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }
      // field arrows
      ctx.strokeStyle = `rgba(${arrowRGB},${arrowA})`
      ctx.lineWidth = 1.3
      for (let bx = SPACING; bx < width; bx += SPACING) {
        for (let by = SPACING; by < height; by += SPACING) {
          const p = warp(bx, by, t)
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          const mAng = Math.atan2(dy, dx)
          const bAng = bx * 0.015 + by * 0.015 + t
          const infR = 240
          const inf = dist < infR ? Math.pow(1 - dist / infR, 2) : 0
          const ang = inf * mAng + (1 - inf) * bAng
          const len = 14
          const x1 = p.x - Math.cos(ang) * len / 2
          const y1 = p.y - Math.sin(ang) * len / 2
          const x2 = p.x + Math.cos(ang) * len / 2
          const y2 = p.y + Math.sin(ang) * len / 2
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
          const hs = 4.5
          const aL = ang - Math.PI - 0.5
          const aR = ang - Math.PI + 0.5
          ctx.beginPath()
          ctx.moveTo(x2, y2); ctx.lineTo(x2 + Math.cos(aL) * hs, y2 + Math.sin(aL) * hs)
          ctx.moveTo(x2, y2); ctx.lineTo(x2 + Math.cos(aR) * hs, y2 + Math.sin(aR) * hs)
          ctx.stroke()
        }
      }
    }

    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      ctx.clearRect(0, 0, width, height)

      const t = Date.now() * 0.0008
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08

      // dark grid over the light page
      drawField('28,27,24', 0.06, '28,27,24', 0.14, t)

      // dark sections: fill black + redraw grid white within their rects
      const darkEls = document.querySelectorAll('[data-grid-dark]')
      darkEls.forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > height) return
        ctx.save()
        ctx.beginPath()
        ctx.rect(r.left, r.top, r.width, r.height)
        ctx.clip()
        ctx.fillStyle = '#141310'
        ctx.fillRect(r.left, r.top, r.width, r.height)
        drawField('255,255,255', 0.10, '255,255,255', 0.22, t)
        ctx.restore()
      })
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  )
}
