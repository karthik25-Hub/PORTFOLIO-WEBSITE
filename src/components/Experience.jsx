import { useEffect, useRef } from 'react'
import { experience } from '../data'
import Reveal from './Reveal'
import Shuffle from './Shuffle'
import SectionGrid from './SectionGrid'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const accent = { clay: '#C75B39', teal: '#0F8A77', faint: '#9A8F7E' }

const SectionTitle = ({ eyebrow, children, size = 'big', color = '#1C1B18' }) => (
  <div className="mb-8">
    <Reveal>
      <p className="font-mono text-[11px] tracking-[0.12em] text-[#0F8A77] mb-3 uppercase">{eyebrow}</p>
    </Reveal>
    <h2
      className="font-head font-semibold tracking-tight uppercase"
      style={{
        color,
        fontSize: size === 'big' ? 'clamp(28px, 3vw, 42px)' : 'clamp(24px, 2.4vw, 34px)',
        letterSpacing: '-0.025em',
      }}
    >
      {children}
    </h2>
  </div>
)

export default function Experience() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const items = container.querySelectorAll('.experience-item')
    if (items.length === 0) return

    gsap.fromTo(items,
      { opacity: 0, y: 15 },
      {
        opacity: 1, y: 0,
        duration: 0.5, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none none none' }
      }
    )
  }, [])

  return (
    <section ref={containerRef} id="experience" className="relative w-full min-h-screen bg-transparent py-24 md:py-32">
      <SectionGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-7 md:px-20">
        <SectionTitle eyebrow="// PROFESSIONAL EXPERIENCE" size="small">
          <Shuffle text="WORK & SIMULATIONS" triggerOnHover={true} />
        </SectionTitle>

        <div className="flex flex-col gap-4">
          {experience.map((e, i) => (
            <Reveal key={i} delay={Math.min(i * 0.06, 0.3)} className="experience-item">
              <div
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 rounded-xl p-6"
                style={{
                  background: 'rgba(251, 247, 240, 0.35)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderTop: '1px solid rgba(227, 216, 200, 0.6)',
                  borderRight: '1px solid rgba(227, 216, 200, 0.6)',
                  borderBottom: '1px solid rgba(227, 216, 200, 0.6)',
                  borderLeft: `3px solid ${accent[e.color] || accent.faint}`,
                  boxShadow: '0 4px 20px rgba(28, 27, 24, 0.02)'
                }}
              >
                {/* meta */}
                <div className="md:col-span-3">
                  <p className="font-head font-semibold text-[15px] text-[#1C1B18] mb-1 uppercase leading-snug">{e.role}</p>
                  <p className="font-mono text-[11px] text-[#0F8A77] mb-1">{e.company}</p>
                  <p className="font-mono text-[11px] text-[#9A8F7E]">{e.period} · {e.location}</p>
                </div>
                {/* detail */}
                <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#9A8F7E] mb-1">Accomplished</p>
                    <p className="font-sans text-[13px] text-[#1C1B18] leading-relaxed">{e.accomplished}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#0F8A77] mb-1">Impact</p>
                    <p className="font-sans text-[13px] text-[#0B6657] font-medium leading-relaxed">{e.impact}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#9A8F7E] mb-1">Method</p>
                    <p className="font-sans text-[13px] text-[#6E665B] leading-relaxed">{e.action}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
