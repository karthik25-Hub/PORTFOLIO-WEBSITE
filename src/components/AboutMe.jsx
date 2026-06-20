import { education } from '../data'
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

export default function AboutMe() {
  return (
    <section id="about" className="relative w-full min-h-screen bg-[#141310] py-24 md:py-32">
      <SectionGrid dark />

      <div className="relative z-10 max-w-6xl mx-auto px-7 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Bio info */}
          <div className="lg:col-span-7">
            <SectionTitle eyebrow="// ABOUT ME" color="#C75B39">
              <Shuffle text="ENERGY ENGINEER.<br />CURIOUS ANALYST." triggerOnHover={true} />
            </SectionTitle>
            <Reveal delay={0.12}>
              <p className="font-sans text-[15px] md:text-[16px] leading-[1.7] text-[rgba(255,255,255,0.6)] max-w-xl">
                Master's candidate at <strong className="text-white font-medium">Università di Padova</strong> in Energy and Nuclear Engineering, combining technical depth in renewables, grid modelling and thermal systems with a business mindset shaped by startup experience and cross-functional teamwork.
                <br /><br />
                Available from <strong className="text-white font-medium">July 2026</strong>. Open to roles in energy systems, analytics and EU institutional environments.
              </p>
            </Reveal>
          </div>

          {/* Education timeline */}
          <div className="lg:col-span-5 text-left">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.12em] text-[#0F8A77] mb-5 uppercase">// EDUCATION</p>
            </Reveal>
            <ul className="list-none flex flex-col gap-4">
              {education.map((e, i) => (
                <Reveal
                  key={i}
                  delay={i * 0.08}
                  as="li"
                  className="flex gap-4 py-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <div className="font-mono text-[11px] pt-0.5 whitespace-nowrap min-w-[72px] text-[#9A8F7E]">
                    {e.period}
                  </div>
                  <div>
                    <p className="font-head font-medium text-[14px] md:text-[15px] text-white mb-0.5 uppercase">{e.degree}</p>
                    <p className="font-sans text-[13px] text-[rgba(255,255,255,0.5)] mb-1">{e.school}</p>
                    <p className="font-mono text-[11px] text-[#0F8A77]">Thesis: {e.thesis}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
