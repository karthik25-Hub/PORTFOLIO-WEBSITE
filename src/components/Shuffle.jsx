import React, { useRef, useEffect, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './Shuffle.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const Shuffle = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  maxDelay = 0,
  ease = 'power3.out',
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = 'evenodd',
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = '',
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
  triggerOnLoad = false, // custom prop to bypass ScrollTrigger for Hero top folds
}) => {
  const containerRef = useRef(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const animStateRef = useRef('idle') // 'idle', 'playing', 'completed'
  const activeTlRef = useRef(null)

  useEffect(() => {
    let active = true

    // Defer state updates to avoid synchronous cascading renders warning
    const timer = setTimeout(() => {
      if (!active) return
      setIsClient(true)

      if ('fonts' in document) {
        if (document.fonts.status === 'loaded') {
          setFontsLoaded(true)
        } else {
          document.fonts.ready.then(() => {
            if (active) setFontsLoaded(true)
          })
        }
      } else {
        setFontsLoaded(true)
      }
    }, 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || '')
    const mv = mm ? parseFloat(mm[1]) : 0
    const mu = mm ? mm[2] || 'px' : 'px'
    const sign = mv === 0 ? '' : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`
    return `top ${startPct}%${sign}`
  }, [threshold, rootMargin])

  // Split text by lines, words, and characters
  const lines = useMemo(() => {
    if (!text) return []
    const rawLines = text.split(/<br\s*\/?>/i)
    return rawLines.map(line => {
      const words = line.split(' ')
      return words.map(word => word.split(''))
    })
  }, [text])

  // Generate sequence of characters per letter
  const stripsData = useMemo(() => {
    if (!text) return []

    // Seeded linear congruential generator for a pure random function during render
    let seed = 12345
    for (let i = 0; i < text.length; i++) {
      seed = (seed + text.charCodeAt(i)) & 0xfffffff
    }

    const prng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    const randCharPure = (charset) => {
      const chars = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?'
      return chars.charAt(Math.floor(prng() * chars.length))
    }

    const rolls = Math.max(1, Math.floor(shuffleTimes))
    
    // Flat list of characters and their strip items
    const data = []
    let charCounter = 0
    
    lines.forEach((line) => {
      line.forEach((word) => {
        word.forEach((char) => {
          const items = []
          
          // Initial character
          items.push(char)
          
          // Scramble characters
          for (let k = 0; k < rolls; k++) {
            items.push(randCharPure(scrambleCharset))
          }
          
          // Final character
          items.push(char)

          // Handle direction insert
          if (shuffleDirection === 'right' || shuffleDirection === 'down') {
            const last = items[items.length - 1]
            items.pop()
            items.unshift(last)
          }

          data.push({
            id: charCounter++,
            char,
            items,
            steps: rolls + 1
          })
        })
      })
    })
    return data
  }, [lines, shuffleTimes, shuffleDirection, scrambleCharset, text])

  useGSAP(
    () => {
      if (!containerRef.current || !text || !fontsLoaded) return
      
      const el = containerRef.current
      const reduce = respectReducedMotion && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      const inners = el.querySelectorAll('.shuffle-char-inner')
      if (inners.length === 0) return

      if (reduce) {
        gsap.set(inners, { x: 0, y: 0 })
        onShuffleComplete?.()
        return
      }

      const isVertical = shuffleDirection === 'up' || shuffleDirection === 'down'
      
      // forward declaration so updateSizes can re-invoke play if resized mid-animation
      let playAnimation = () => {}

      const updateSizes = () => {
        const isPlaying = animStateRef.current === 'playing'
        const isCompleted = animStateRef.current === 'completed'

        inners.forEach((inner) => {
          const wrap = inner.parentElement
          const ch = inner.querySelector('.shuffle-char')
          if (!ch || !wrap) return

          wrap.style.width = ''
          wrap.style.height = ''

          const charRect = ch.getBoundingClientRect()
          const w = charRect.width || 12
          const h = charRect.height || 18
          
          wrap.style.width = w + 'px'
          wrap.style.height = isVertical ? h + 'px' : 'auto'
          
          const steps = parseFloat(inner.getAttribute('data-steps') || '2')
          
          let startX = 0, finalX = 0
          let startY = 0, finalY = 0

          if (shuffleDirection === 'right') {
            startX = -steps * w
            finalX = 0
          } else if (shuffleDirection === 'left') {
            startX = 0
            finalX = -steps * w
          } else if (shuffleDirection === 'down') {
            startY = -steps * h
            finalY = 0
          } else if (shuffleDirection === 'up') {
            startY = 0
            finalY = -steps * h
          }

          inner.setAttribute('data-start-x', String(startX))
          inner.setAttribute('data-final-x', String(finalX))
          inner.setAttribute('data-start-y', String(startY))
          inner.setAttribute('data-final-y', String(finalY))

          if (!isPlaying) {
            const currentX = isCompleted ? finalX : startX
            const currentY = isCompleted ? finalY : startY
            if (shuffleDirection === 'left' || shuffleDirection === 'right') {
              gsap.set(inner, { x: currentX, y: 0 })
            } else {
              gsap.set(inner, { x: 0, y: currentY })
            }
          }

          if (colorFrom && !isCompleted) inner.style.color = colorFrom
          if (colorTo && isCompleted) inner.style.color = colorTo
        })

        if (isPlaying && activeTlRef.current) {
          activeTlRef.current.kill()
          playAnimation()
        }
      }

      playAnimation = () => {
        animStateRef.current = 'playing'
        inners.forEach((inner) => {
          if (shuffleDirection === 'left' || shuffleDirection === 'right') {
            const startX = parseFloat(inner.getAttribute('data-start-x') || '0')
            gsap.set(inner, { x: startX, y: 0 })
          } else {
            const startY = parseFloat(inner.getAttribute('data-start-y') || '0')
            gsap.set(inner, { x: 0, y: startY })
          }
          if (colorFrom) inner.style.color = colorFrom
        })

        const tl = gsap.timeline({
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? loopDelay : 0,
          onComplete: () => {
            animStateRef.current = 'completed'
            if (!loop) {
              if (colorTo) gsap.set(inners, { color: colorTo })
              onShuffleComplete?.()
            }
          }
        })
        activeTlRef.current = tl

        const addTween = (targets, at) => {
          const vars = {
            duration,
            ease,
            stagger: animationMode === 'evenodd' ? stagger : 0
          }
          if (isVertical) {
            vars.y = (i, t) => parseFloat(t.getAttribute('data-final-y') || '0')
          } else {
            vars.x = (i, t) => parseFloat(t.getAttribute('data-final-x') || '0')
          }
          tl.to(targets, vars, at)
          if (colorFrom && colorTo) {
            tl.to(targets, { color: colorTo, duration, ease }, at)
          }
        }

        if (animationMode === 'evenodd') {
          const strips = Array.from(inners)
          const odd = strips.filter((_, i) => i % 2 === 1)
          const even = strips.filter((_, i) => i % 2 === 0)
          const oddTotal = duration + Math.max(0, odd.length - 1) * stagger
          const evenStart = odd.length ? oddTotal * 0.7 : 0
          if (odd.length) addTween(odd, 0)
          if (even.length) addTween(even, evenStart)
        } else {
          inners.forEach(strip => {
            const d = Math.random() * maxDelay
            const vars = {
              duration,
              ease
            }
            if (isVertical) {
              vars.y = parseFloat(strip.getAttribute('data-final-y') || '0')
            } else {
              vars.x = parseFloat(strip.getAttribute('data-final-x') || '0')
            }
            tl.to(strip, vars, d)
            if (colorFrom && colorTo) {
              tl.to(strip, { color: colorTo, duration, ease }, d)
            }
          })
        }
      }

      updateSizes()
      window.addEventListener('resize', updateSizes)

      let scrollTriggerInstance = null
      if (triggerOnLoad) {
        playAnimation()
      } else {
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: el,
          start: scrollTriggerStart,
          once: triggerOnce,
          onEnter: () => {
            playAnimation()
          }
        })
      }

      let hoverHandler = null
      if (triggerOnHover) {
        hoverHandler = () => {
          playAnimation()
        }
        el.addEventListener('mouseenter', hoverHandler)
      }

      return () => {
        if (scrollTriggerInstance) scrollTriggerInstance.kill()
        if (hoverHandler) {
          el.removeEventListener('mouseenter', hoverHandler)
        }
        window.removeEventListener('resize', updateSizes)
      }
    },
    {
      dependencies: [
        text,
        duration,
        maxDelay,
        ease,
        scrollTriggerStart,
        fontsLoaded,
        shuffleDirection,
        shuffleTimes,
        animationMode,
        loop,
        loopDelay,
        stagger,
        scrambleCharset,
        colorFrom,
        colorTo,
        triggerOnce,
        respectReducedMotion,
        triggerOnHover,
        triggerOnLoad,
        onShuffleComplete
      ],
      scope: containerRef
    }
  )

  const commonStyle = useMemo(() => ({ textAlign, ...style }), [textAlign, style])
  const Tag = tag || 'p'

  let flatIndex = 0

  if (!isClient) {
    return React.createElement(Tag, { className: `shuffle-parent ${className}`, style: commonStyle }, text)
  }

  return (
    <Tag
      ref={containerRef}
      className={`shuffle-parent is-ready ${className}`}
      style={commonStyle}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="shuffle-line block">
          {line.map((word, wordIdx) => (
            <span key={wordIdx} className="shuffle-word inline-block mr-[0.25em] last:mr-0 align-bottom">
              {word.map((char, charIdx) => {
                const strip = stripsData[flatIndex++]
                if (!strip) return null
                
                return (
                  <span
                    key={charIdx}
                    className="shuffle-char-wrapper inline-block overflow-hidden align-bottom"
                    style={{
                      display: 'inline-block',
                      overflow: 'hidden',
                      verticalAlign: 'bottom'
                    }}
                  >
                    <span
                      className="shuffle-char-inner inline-block transform-gpu"
                      data-steps={strip.steps}
                      style={{
                        display: 'inline-block',
                        whiteSpace: shuffleDirection === 'up' || shuffleDirection === 'down' ? 'normal' : 'nowrap',
                        willChange: 'transform'
                      }}
                    >
                      {strip.items.map((item, itemIdx) => (
                        <span
                          key={itemIdx}
                          className="shuffle-char inline-block text-center"
                          style={{
                            display: shuffleDirection === 'up' || shuffleDirection === 'down' ? 'block' : 'inline-block',
                            textAlign: 'center'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </span>
                  </span>
                )
              })}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

export default Shuffle
