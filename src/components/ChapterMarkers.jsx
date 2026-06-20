import { useEffect, useState } from 'react'

const chapters = [
  { id: 'hero',           num: '01', label: 'INTRO' },
  { id: 'projects',       num: '02', label: 'WORK' },
  { id: 'about',          num: '03', label: 'ABOUT' },
  { id: 'skills',         num: '04', label: 'SKILLS' },
  { id: 'experience',     num: '05', label: 'EXPERIENCE' },
  { id: 'certifications', num: '06', label: 'LEARNING' },
  { id: 'contact',        num: '07', label: 'CONNECT' },
]

export default function ChapterMarkers({ hidden = false }) {
  const [active, setActive] = useState('hero')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2
      let current = chapters[0].id
      for (const c of chapters) {
        const el = document.getElementById(c.id)
        if (el && el.offsetTop <= mid) current = c.id
      }
      setActive(current)
      // only the contact section has a full dark background
      setDark(current === 'contact')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const baseCol = dark ? 'rgba(255,255,255,0.35)' : 'rgba(28,27,24,0.35)'

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-5 transition-opacity duration-300"
      aria-label="section navigation"
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {chapters.map(c => {
        const isActive = active === c.id
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="group flex items-center justify-end gap-3 no-underline"
            aria-current={isActive ? 'true' : undefined}
          >
            <span
              className="font-mono text-[10px] tracking-wide transition-all duration-300"
              style={{
                color: isActive ? '#0F8A77' : baseCol,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0)' : 'translateX(6px)',
              }}
            >
              {c.num} {c.label}
            </span>
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: isActive ? 22 : 6,
                height: 6,
                background: isActive ? '#0F8A77' : baseCol,
              }}
            />
          </a>
        )
      })}
    </nav>
  )
}
