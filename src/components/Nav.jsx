import { useEffect, useState } from 'react'
import { person } from '../data'
import StaggeredMenu from './StaggeredMenu'

const menuItems = [
  { label: 'Projects', ariaLabel: 'View projects', link: '#projects' },
  { label: 'About', ariaLabel: 'Learn about me', link: '#about' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '#contact' },
]

const socialItems = [
  { label: 'LinkedIn', link: person.linkedin },
  { label: 'Email', link: `mailto:${person.email}` },
]

export default function Nav({ onMenuOpen, onMenuClose }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // menu button goes light only over the dark contact section
      const el = document.getElementById('contact')
      if (el) {
        const r = el.getBoundingClientRect()
        setDark(r.top <= 40 && r.bottom > 40)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      socialItems={socialItems}
      displaySocials={true}
      displayItemNumbering={true}
      isFixed={true}
      closeOnClickAway={true}
      colors={['#C75B39', '#0F8A77']}
      accentColor="#C75B39"
      menuButtonColor={dark ? '#fff' : '#1C1B18'}
      openMenuButtonColor="#fff"
      changeMenuColorOnOpen={true}
      onMenuOpen={onMenuOpen}
      onMenuClose={onMenuClose}
    />
  )
}
