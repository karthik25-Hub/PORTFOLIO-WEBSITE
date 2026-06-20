import { certifications } from '../data'
import Reveal from './Reveal'
import Shuffle from './Shuffle'
import SectionGrid from './SectionGrid'

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

export default function Certifications() {
  return (
    <section id="certifications" className="relative w-full min-h-screen bg-transparent py-24 md:py-32">
      <SectionGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-7 md:px-20">
        <SectionTitle eyebrow="// CERTIFICATIONS" size="small">
          <Shuffle text="CONTINUOUS LEARNING" triggerOnHover={true} />
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((c, i) => (
            <Reveal
              key={i}
              delay={(i % 3) * 0.06}
              className="rounded-xl p-5"
              style={{ 
                background: 'rgba(242, 235, 225, 0.3)', 
                backdropFilter: 'blur(25px) saturate(120%)',
                WebkitBackdropFilter: 'blur(25px) saturate(120%)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 20px 40px rgba(28, 27, 24, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <p className="font-sans font-medium text-[13px] text-[#1C1B18] mb-1.5 leading-snug uppercase">{c.name}</p>
              <p className="font-mono text-[11px] text-[#9A8F7E]">{c.org} · {c.date}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
