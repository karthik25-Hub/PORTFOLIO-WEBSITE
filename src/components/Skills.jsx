import { useEffect, useRef } from 'react'
import { skills } from '../data'
import Reveal from './Reveal'
import Shuffle from './Shuffle'
import SectionGrid from './SectionGrid'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Pill({ label }) {
  return (
    <span
      className="skill-pill font-mono text-[10.5px] px-3 py-1 rounded-full inline-block"
      style={{ color: '#6E665B', background: '#F2EBE1', border: '1px solid #E3D8C8' }}
    >
      {label}
    </span>
  )
}

function SkillBlock({ title, children }) {
  const blockRef = useRef(null)

  useEffect(() => {
    const block = blockRef.current
    if (!block) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const pills = block.querySelectorAll('.skill-pill')
    if (pills.length === 0) return

    gsap.fromTo(pills,
      { scale: 0.65, opacity: 0, y: 8 },
      {
        scale: 1, opacity: 1, y: 0,
        duration: 0.45, stagger: 0.035, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: block, start: 'top 88%', toggleActions: 'play none none none' }
      }
    )
  }, [])

  return (
    <div ref={blockRef} className="rounded-xl p-5" style={{ background: '#FBF7F0', border: '1px solid #E3D8C8' }}>
      <p className="font-mono text-[10.5px] tracking-[0.08em] text-[#0F8A77] mb-3 uppercase">{title}</p>
      {children}
    </div>
  )
}

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

export default function Skills() {
  return (
    <section id="skills" className="relative w-full min-h-screen bg-transparent py-24 md:py-32">
      <SectionGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-7 md:px-20">
        <SectionTitle eyebrow="// SKILLS" size="small">
          <Shuffle text="WHAT I WORK WITH" triggerOnHover={true} />
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Reveal delay={0.0}>
            <SkillBlock title="// ENERGY & TECHNICAL">
              <div className="flex flex-wrap gap-1.5">{skills.energy.map(s => <Pill key={s} label={s} />)}</div>
            </SkillBlock>
          </Reveal>
          <Reveal delay={0.08}>
            <SkillBlock title="// TOOLS & SOFTWARE">
              <div className="flex flex-wrap gap-1.5">{skills.tools.map(s => <Pill key={s} label={s} />)}</div>
            </SkillBlock>
          </Reveal>
          <Reveal delay={0.16}>
            <SkillBlock title="// BUSINESS & DATA">
              <div className="flex flex-wrap gap-1.5">{skills.business.map(s => <Pill key={s} label={s} />)}</div>
            </SkillBlock>
          </Reveal>
          <Reveal delay={0.24}>
            <SkillBlock title="// LANGUAGES">
              <div className="flex flex-col">
                {skills.languages.map((l, i) => (
                  <div
                    key={l.lang}
                    className="flex items-baseline justify-between py-1.5 font-mono"
                    style={{ borderBottom: i < skills.languages.length - 1 ? '1px solid #E3D8C8' : 'none' }}
                  >
                    <span className="text-[12px] text-[#1C1B18]">{l.lang}</span>
                    <span className="text-[11px] text-[#9A8F7E]">{l.level}</span>
                  </div>
                ))}
              </div>
            </SkillBlock>
          </Reveal>
          </div>
        </div>
      </section>
  )
}
