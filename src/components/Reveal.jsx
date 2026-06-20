import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Fades + rises its children into view when scrolled to.
 * Uses high-performance GSAP ScrollTrigger hardware-accelerated animations.
 * Respects prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', y = 28, style = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 })
      return
    }

    // Set initial states
    gsap.set(el, { opacity: 0, y })

    // Create GSAP ScrollTrigger animation
    const anim = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%', // Trigger when the top of the element hits 92% of the viewport height
        once: true,
      }
    })

    return () => {
      anim.kill()
      if (anim.scrollTrigger) anim.scrollTrigger.kill()
    }
  }, [delay, y])

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}

