import { projects } from '../data'
import Reveal from './Reveal'
import Shuffle from './Shuffle'
import MagicBento from './MagicBento'
import SectionGrid from './SectionGrid'

export default function Projects() {
  return (
    <section id="projects" className="relative w-full min-h-screen bg-transparent py-24 md:py-32">
      <SectionGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-7 md:px-20">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.12em] text-[#0F8A77] mb-3">// SELECTED WORK</p>
        </Reveal>
        <h2
          className="font-head font-semibold text-[#1C1B18] mb-16 tracking-tight uppercase"
          style={{ fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.025em' }}
        >
          <Shuffle text="PROJECTS" triggerOnHover={true} />
        </h2>

        <MagicBento
          items={projects}
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={8}
          glowColor="199, 91, 57"
        />
      </div>
    </section>
  )
}
