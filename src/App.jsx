import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import Nav from './components/Nav'
import ChapterMarkers from './components/ChapterMarkers'
import Hero from './components/Hero'
import Projects from './components/Projects'
import AboutMe from './components/AboutMe'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Certifications from './components/Certifications'
import Contact from './components/Contact'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Setup smooth scrolling globally on the window
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Handle scroll-to anchor smooth clicks
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a')
      if (target && target.hash && target.hash.startsWith('#')) {
        const el = document.querySelector(target.hash)
        if (el) {
          e.preventDefault()
          lenis.scrollTo(el, { duration: 1.4 })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      lenis.destroy()
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return (
    <>
      <Nav onMenuOpen={() => setMenuOpen(true)} onMenuClose={() => setMenuOpen(false)} />
      <ChapterMarkers hidden={menuOpen} />
      <main className="relative z-10 w-full overflow-x-hidden">
        <Hero />
        <Projects />
        <AboutMe />
        <Skills />
        <Experience />
        <Certifications />
        <Contact />
      </main>
    </>
  )
}
