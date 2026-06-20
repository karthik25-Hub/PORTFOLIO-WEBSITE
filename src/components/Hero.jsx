import { useEffect, useRef } from 'react'
import { person } from '../data'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Shuffle from './Shuffle'
import SectionGrid from './SectionGrid'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      gsap.set(container.querySelectorAll('.hero-fade'), { opacity: 1, y: 0 })
      return
    }

    const tl = gsap.timeline()
    
    // Set initial hidden states
    gsap.set(container.querySelectorAll('.hero-fade'), { opacity: 0, y: 15 })

    // Coordinated load stagger
    tl.to(container.querySelector('.hero-pitch'), { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to(container.querySelector('.hero-tools'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4')
      .to(container.querySelectorAll('.hero-btn'), { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.35')
      .to(container.querySelector('.hero-scroll'), { opacity: 1, y: 0, duration: 0.55, ease: 'power1.out' }, '-=0.2')

    // Fade out scroll hint when scrolling down
    gsap.to(container.querySelector('.hero-scroll'), {
      opacity: 0,
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=150',
        scrub: true,
      }
    })
  }, [])

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-transparent"
    >
      <SectionGrid />

      <div className="relative z-10 max-w-4xl mx-auto px-7 md:px-20 flex flex-col items-center justify-center text-center py-12">
        <h1 className="hero-title font-head font-bold text-[#1C1B18] leading-[0.96] tracking-tight mb-6 flex flex-wrap justify-center items-center gap-y-2 gap-x-3 uppercase"
            style={{ fontSize: 'clamp(22px, 6vw, 64px)', letterSpacing: '-0.03em' }}>
          <Shuffle text="KARTHIK" triggerOnLoad={true} triggerOnHover={true} duration={0.4} shuffleTimes={2} />
          <Shuffle text="KANTAMNENI" className="text-[#C75B39]" triggerOnLoad={true} triggerOnHover={true} duration={0.4} shuffleTimes={2} />
        </h1>

        <p className="hero-fade hero-pitch font-sans text-[#6E665B] leading-relaxed max-w-lg mb-8 mx-auto text-center text-[15px] md:text-[16px]">
          {person.pitch}
        </p>

        <p className="hero-fade hero-tools font-mono text-[12px] text-[#9A8F7E] mb-10 tracking-wide text-center">
          <span className="text-[#0F8A77] mr-2">↳</span>
          {person.tools.join(' · ')}
        </p>

        <div className="hero-fade hero-btn flex gap-4 justify-center">
          <a
            href="#projects"
            className="font-mono text-[12px] tracking-wide px-7 py-3 rounded-lg text-white no-underline transition-all duration-200 uppercase"
            style={{ background: '#C75B39' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#9E3F20'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C75B39'; e.currentTarget.style.transform = '' }}
          >
            view projects →
          </a>
          <a
            href="#contact"
            className="font-mono text-[12px] tracking-wide px-7 py-3 rounded-lg no-underline transition-all duration-200 uppercase"
            style={{ color: '#6E665B', border: '1px solid rgba(28,27,24,0.18)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(28,27,24,0.45)'; e.currentTarget.style.color = '#1C1B18'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,27,24,0.18)'; e.currentTarget.style.color = '#6E665B'; e.currentTarget.style.transform = '' }}
          >
            get in touch
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-fade hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 font-mono text-[11px] tracking-widest text-[#9A8F7E] z-10 uppercase">
        <span className="w-12 h-px bg-[rgba(28,27,24,0.18)] block" />
        scroll to explore
      </div>
    </section>
  )
}
