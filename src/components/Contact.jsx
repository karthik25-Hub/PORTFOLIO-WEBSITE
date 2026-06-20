import { useEffect, useRef } from 'react'
import { person } from '../data'
import Reveal from './Reveal'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Shuffle from './Shuffle'
import SectionGrid from './SectionGrid'

gsap.registerPlugin(ScrollTrigger)

function ContactLink({ href, label, value, icon, dim = false }) {
  return (
    <a
      href={dim ? undefined : href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={`contact-link flex items-center gap-4 no-underline rounded-xl px-5 py-4 transition-all duration-200 ${dim ? 'dim' : ''}`}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.025)',
        opacity: dim ? 0.38 : 1, // default visible so it displays instantly on load
        cursor: dim ? 'default' : 'pointer',
        pointerEvents: dim ? 'none' : 'auto',
        maxWidth: 420,
      }}
      onMouseEnter={dim ? undefined : e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.055)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
        e.currentTarget.style.transform = 'translateX(5px)'
      }}
      onMouseLeave={dim ? undefined : e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = ''
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <span className="font-mono text-[10px] tracking-[0.06em] block mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </span>
        <span className="font-sans text-[14px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {value}
        </span>
      </div>
      <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 15 }}>→</span>
    </a>
  )
}

export default function Contact() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const links = container.querySelectorAll('.contact-link')
    if (links.length === 0) return

    // Staggered fade and slide-in for the contact options
    gsap.fromTo(links,
      { x: -18, opacity: 0 },
      {
        x: 0,
        opacity: (i, el) => el.classList.contains('dim') ? 0.38 : 1,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )
  }, [])

  return (
    <section
      ref={containerRef}
      id="contact"
      className="relative w-full min-h-screen bg-[#141310] py-24 md:py-36"
    >
      <SectionGrid dark />

      <div className="relative z-10 max-w-6xl mx-auto px-7 md:px-20">
        
        <div className="mb-10">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.12em] text-[#0F8A77] mb-5">// LET'S CONNECT</p>
          </Reveal>
          <h2
            className="font-head font-bold text-white mb-4 tracking-tight uppercase"
            style={{ fontSize: 'clamp(38px, 4.5vw, 64px)', letterSpacing: '-0.035em', lineHeight: 1.08 }}
          >
            <Shuffle text="GOT A PROJECT" delay={0.0} triggerOnHover={true} />
            <br />
            <Shuffle text="OR" delay={0.12} triggerOnHover={true} />{' '}
            <Shuffle text="OPPORTUNITY?" className="text-[#C75B39]" delay={0.18} triggerOnHover={true} />
          </h2>
          <Reveal delay={0.35}>
            <p className="font-sans text-[15px] md:text-[16px] leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Open to internships, analyst roles and EU institutional opportunities from July 2026.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3">
          <ContactLink
            href={`mailto:${person.email}`}
            label="email"
            value={person.email}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
            }
          />
          <ContactLink
            href={person.linkedin}
            label="linkedin"
            value={person.linkedinHandle}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            }
          />
          <ContactLink
            href="#"
            label="github"
            value="coming soon"
            dim
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
              </svg>
            }
          />
        </div>

        {/* Footer line */}
        <p
          className="font-mono text-[11px] mt-24 tracking-wide"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          © 2025 Karthik Kantamneni · Padua, Italy
        </p>

      </div>
    </section>
  )
}
