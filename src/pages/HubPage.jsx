import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─────────────────────────────────────────────
   CURSOR
───────────────────────────────────────────── */
function Cursor() {
  const dot  = useRef(null)
  const ring = useRef(null)
  const mouse = useRef({ x: -200, y: -200 })
  const smooth = useRef({ x: -200, y: -200 })

  useEffect(() => {
    let raf
    const onMove = e => { mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1
      if (dot.current) {
        dot.current.style.left  = mouse.current.x + 'px'
        dot.current.style.top   = mouse.current.y + 'px'
      }
      if (ring.current) {
        ring.current.style.left = smooth.current.x + 'px'
        ring.current.style.top  = smooth.current.y + 'px'
      }
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={dot}  id="cur-dot" />
      <div ref={ring} id="cur-ring" />
    </>
  )
}

/* ─────────────────────────────────────────────
   PRELOADER
───────────────────────────────────────────── */
function Preloader({ onDone }) {
  const [phase, setPhase] = useState(0) // 0=loading, 1=fading

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1600)
    const t2 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 99995,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 1 ? 0 : 1,
      transition: 'opacity .8s cubic-bezier(.16,1,.3,1)',
      pointerEvents: phase === 1 ? 'none' : 'all',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--fd)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400,
        fontStyle: 'italic', color: 'var(--cream)',
        animation: 'wordIn 1.1s cubic-bezier(.16,1,.3,1) both',
        letterSpacing: '.04em', marginBottom: 28,
      }}>FlyOriginals</div>

      {/* Loading line */}
      <div style={{ width: 180, height: 1, background: 'var(--bdr)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          background: 'var(--gold)',
          animation: 'loadLine 1.4s cubic-bezier(.16,1,.3,1) both',
        }} />
      </div>
      <style>{`@keyframes loadLine{from{width:0}to{width:100%}}`}</style>

      <div style={{
        fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600,
        letterSpacing: '.36em', textTransform: 'uppercase', color: 'var(--gold)',
        opacity: .65, marginTop: 16,
        animation: 'wordIn .8s .3s both',
      }}>Film · Studio</div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }),
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    )
    document.querySelectorAll('.rv,.rv-clip,.rv-fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ─────────────────────────────────────────────
   PARALLAX HOOK
───────────────────────────────────────────── */
function useParallax(ref, speed = 0.28) {
  useEffect(() => {
    const fn = () => {
      if (!ref.current) return
      ref.current.style.transform = `translateY(${window.scrollY * speed}px)`
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
}

/* ─────────────────────────────────────────────
   MAGNETIC BUTTON
───────────────────────────────────────────── */
function Btn({ children, href, onClick, red, style: s }) {
  const ref = useRef(null)
  const onMove = e => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * 0.2
    const y = (e.clientY - r.top  - r.height / 2) * 0.2
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }
  const onOut = () => { if (ref.current) ref.current.style.transform = '' }
  const H = () => document.body.classList.add('hov')
  const LL = () => document.body.classList.remove('hov')

  const props = {
    ref, onMouseMove: onMove,
    onMouseEnter: () => { H() },
    onMouseLeave: () => { onOut(); LL() },
    onClick,
    className: `btn${red ? ' btn-r' : ''}`,
    style: {
      transition: 'transform .4s cubic-bezier(.16,1,.3,1), color .32s, border-color .32s',
      cursor: 'none', ...s,
    },
  }
  if (href) return <a href={href} {...props}>{children}</a>
  return <button type="button" {...props}>{children}</button>
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function Count({ n, suffix = '' }) {
  const [v, setV] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      const target = parseFloat(n)
      const steps = 90
      let i = 0
      const id = setInterval(() => {
        i++
        const t = i / steps
        const ease = 1 - Math.pow(1 - t, 3)
        setV(Math.round(target * ease * 10) / 10)
        if (i >= steps) clearInterval(id)
      }, 18)
    }, { threshold: 0.5 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [n])

  const display = Number.isInteger(parseFloat(n)) ? Math.floor(v).toLocaleString('de') : v.toFixed(1)
  return <span ref={ref}>{display}{suffix}</span>
}

/* ─────────────────────────────────────────────
   SPLIT TEXT (char-by-char reveal)
───────────────────────────────────────────── */
function Split({ text, delay = 0, style }) {
  return (
    <span style={{ display: 'block', ...style }}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{
          display: 'inline-block',
          animation: `charIn .65s cubic-bezier(.16,1,.3,1) ${delay + i * 0.025}s both`,
          whiteSpace: ch === ' ' ? 'pre' : 'normal',
        }}>{ch}</span>
      ))}
    </span>
  )
}

/* ─────────────────────────────────────────────
   FILM STRIP
───────────────────────────────────────────── */
const FilmStrip = ({ count = 12, vertical = false }) => (
  <div style={{
    display: 'flex', flexDirection: vertical ? 'column' : 'row',
    gap: vertical ? 11 : 11, opacity: .1, pointerEvents: 'none', flexShrink: 0,
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        width: vertical ? 9 : 7, height: vertical ? 7 : 9,
        borderRadius: 1.5, background: 'var(--cream)', flexShrink: 0,
      }} />
    ))}
  </div>
)

/* ─────────────────────────────────────────────
   CORNER FRAME
───────────────────────────────────────────── */
const CornerFrame = ({ size = 20, gap = 18, color = 'var(--gold3)' }) => {
  const corners = [
    { top: gap, left: gap, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    { top: gap, right: gap, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` },
    { bottom: gap, left: gap, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
    { bottom: gap, right: gap, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` },
  ]
  return corners.map((s, i) => (
    <div key={i} style={{ position: 'absolute', width: size, height: size, ...s }} />
  ))
}

/* ─────────────────────────────────────────────
   MARQUEE BAND
───────────────────────────────────────────── */
function Marquee() {
  const text = 'Film · Regie · Livestream · YouTube · Fotografie · Branded Content · Storytelling · '
  const repeated = text.repeat(8)
  return (
    <div style={{
      overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid var(--bdr)',
      borderBottom: '1px solid var(--bdr)', background: 'var(--bg2)',
      padding: '11px 0',
    }}>
      <div style={{
        display: 'inline-block',
        fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 600,
        letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold)',
        opacity: .6, animation: 'marq 38s linear infinite',
        willChange: 'transform',
      }}>{repeated}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────── */
const PROJECTS = [
  { n: '01', tag: 'Kurzfilm', yr: '2025', title: 'Neon District', desc: 'Experimentelle Sci-Fi-Produktion. Gedreht auf Super-8, color-graded in DaVinci Resolve. Ein Projekt über Isolation und Licht.', col: 'span 1', rows: '280px' },
  { n: '02', tag: 'Branded Content', yr: '2024', title: 'Summer Campaign', desc: 'Vollständige Video-Kampagne für ein lokales Lifestyle-Label — Konzept bis Schnitt.', col: 'span 2', rows: '280px' },
  { n: '03', tag: 'Fotografie', yr: '2023', title: 'Urban Portraits', desc: 'Porträt-Serie für Musiker aus der lokalen Kreativszene.', col: 'span 2', rows: '320px' },
  { n: '04', tag: 'Livestream', yr: '2024', title: 'Live Sessions', desc: 'Monatliche Live-Produktionen. 2.000+ gleichzeitige Zuschauer. Vollständig produziert.', col: 'span 1', rows: '320px' },
  { n: '05', tag: 'YouTube', yr: '2024', title: 'The Long Way', desc: 'Mini-Dokumentation. 30-tägige Solofahrt. Osteuropa.', col: 'span 1', rows: '260px' },
  { n: '06', tag: 'Kurzfilm', yr: '2024', title: 'Into the Dark', desc: 'Atmosphärischer Noir über Vertrauen und Verrat in einer Stadt ohne Licht.', col: 'span 1', rows: '260px' },
  { n: '07', tag: 'Branded Content', yr: '2025', title: 'Agency Reel', desc: 'Showreel für eine Kreativagentur. Color-grading, Schnitt, Motion.', col: 'span 1', rows: '260px' },
]

function PCard({ n, tag, yr, title, desc, col, rows }) {
  const [hov, setHov] = useState(false)
  const H = () => { document.body.classList.add('hov'); setHov(true) }
  const LL = () => { document.body.classList.remove('hov'); setHov(false) }

  return (
    <div className="rv" onMouseEnter={H} onMouseLeave={LL}
      style={{
        gridColumn: col, height: rows, position: 'relative', overflow: 'hidden',
        cursor: 'none', background: 'var(--bg3)',
        border: '1px solid var(--bdr)',
        transition: 'border-color .35s',
        borderColor: hov ? 'var(--bdr2)' : 'var(--bdr)',
      }}>

      {/* BG image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: hov ? .5 : .18,
        transform: hov ? 'scale(1.07)' : 'scale(1)',
        transition: 'opacity .6s, transform .7s cubic-bezier(.16,1,.3,1)',
      }} />

      {/* Gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hov
          ? 'linear-gradient(180deg, rgba(107,0,24,.4) 0%, rgba(5,0,1,.92) 100%)'
          : 'linear-gradient(180deg, transparent 20%, rgba(5,0,1,.96) 100%)',
        transition: 'background .5s',
      }} />

      {/* Top: number + tag */}
      <div style={{
        position: 'absolute', top: 18, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--fu)', fontSize: '.52rem', fontWeight: 600,
          letterSpacing: '.28em', color: 'var(--gold)', opacity: .7,
        }}>{n}</span>
        <span style={{
          fontFamily: 'var(--fu)', fontSize: '.52rem', fontWeight: 600,
          letterSpacing: '.2em', textTransform: 'uppercase',
          color: 'var(--gold2)', opacity: hov ? 1 : 0,
          transition: 'opacity .3s',
          background: 'rgba(5,0,1,.6)', padding: '3px 10px',
          border: '1px solid var(--bdr)',
        }}>{tag} · {yr}</span>
      </div>

      {/* Bottom: title + desc */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
        {/* Slide-up line */}
        <div style={{
          width: '100%', height: 1, background: 'var(--gold)',
          transform: hov ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
          marginBottom: 14,
        }} />
        <h3 style={{
          fontFamily: 'var(--fd)', fontSize: 'clamp(1.1rem,1.8vw,1.5rem)', fontWeight: 400,
          color: hov ? 'var(--gold3)' : 'var(--cream)', marginBottom: 8, lineHeight: 1.15,
          transition: 'color .3s',
        }}>{title}</h3>
        <p style={{
          fontFamily: 'var(--fu)', fontSize: '.72rem', fontWeight: 400, lineHeight: 1.65,
          color: 'var(--c60)', opacity: hov ? 1 : 0,
          transform: hov ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity .4s, transform .4s cubic-bezier(.16,1,.3,1)',
        }}>{desc}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function HubPage() {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [eggN, setEggN] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', msg: '' })
  const [sent, setSent] = useState(false)
  const bgRef = useRef(null)
  const H = () => document.body.classList.add('hov')
  const LL = () => document.body.classList.remove('hov')

  useReveal()
  useParallax(bgRef, 0.27)

  useEffect(() => { const t = setTimeout(() => setEggOn(true), 14000); return () => clearTimeout(t) }, [])

  const clickEgg = () => {
    const n = eggN + 1; setEggN(n)
    if (n >= 3) navigate('/game/egg-clicker')
  }

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const fcs = e => e.target.style.borderColor = 'var(--gold2)'
  const blr = e => e.target.style.borderColor = 'var(--bdr)'
  const inpS = {
    display: 'block', width: '100%', padding: '14px 0',
    background: 'transparent', border: 'none', borderBottom: '1px solid var(--bdr)',
    color: 'var(--cream)', fontFamily: 'var(--fu)', fontSize: '.86rem', fontWeight: 400,
    outline: 'none', caretColor: 'var(--gold2)', cursor: 'none',
    transition: 'border-color .25s',
  }
  const lblS = {
    display: 'block', fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600,
    letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .8, marginBottom: 8,
  }

  const PAD = 'clamp(28px, 6vw, 90px)'

  return (
    <div style={{ background: 'var(--bg)' }}>
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}
      <Cursor />

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section id="hero" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        overflow: 'hidden', paddingTop: 64,
      }}>

        {/* Letterbox bars */}
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--bdr2) 25%, var(--bdr2) 75%, transparent)', zIndex: 3 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--bdr2) 25%, var(--bdr2) 75%, transparent)', zIndex: 3 }} />

        {/* BG parallax */}
        <div ref={bgRef} style={{ position: 'absolute', inset: '-25%', willChange: 'transform' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 40%', opacity: .5 }} />
        </div>

        {/* Overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(5,0,1,.97) 40%, rgba(5,0,1,.6) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg,transparent,var(--bg))' }} />

        {/* Film strips */}
        <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <FilmStrip count={16} vertical />
        </div>
        <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <FilmStrip count={16} vertical />
        </div>

        {/* Content */}
        {loaded && (
          <div style={{ position: 'relative', zIndex: 4, padding: `0 ${PAD}`, paddingLeft: 'clamp(60px,8vw,110px)', maxWidth: 1000 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30, animation: 'fadeUp .8s .05s both' }}>
              <div style={{ width: 26, height: 1, background: 'var(--gold)', opacity: .8 }} />
              <span style={{ fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600, letterSpacing: '.32em', textTransform: 'uppercase', color: 'var(--gold2)', opacity: .85 }}>
                Film Studio · Live · Content
              </span>
            </div>

            <div style={{ perspective: '1000px', marginBottom: 30 }}>
              <h1 style={{ fontFamily: 'var(--fd)', fontWeight: 400, fontSize: 'clamp(3.4rem, 8vw, 7.6rem)', lineHeight: .92, color: 'var(--cream)' }}>
                <Split text="Wir erzählen" delay={0.22} style={{ marginBottom: '0.05em', display: 'block' }} />
                <Split text="deine Geschichte." delay={0.58} style={{ fontStyle: 'italic', color: 'var(--gold3)', display: 'block' }} />
              </h1>
            </div>

            <p style={{ fontFamily: 'var(--fu)', fontWeight: 400, fontSize: 'clamp(.82rem,1.15vw,.95rem)', lineHeight: 1.95, color: 'var(--c40)', maxWidth: 440, marginBottom: 48, animation: 'fadeUp .9s .92s both' }}>
              FlyOriginals ist ein unabhängiges Filmstudio für Kurzfilme, Branded Content und Livestreaming — Produktionen, die im Gedächtnis bleiben.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeUp .9s 1.08s both' }}>
              <Btn href="#portfolio" red>Portfolio ansehen</Btn>
              <Btn href="#kontakt">Projekt anfragen</Btn>
            </div>
          </div>
        )}

        {/* Bottom-left: scroll cue */}
        {loaded && (
          <div style={{ position: 'absolute', bottom: 32, left: 'clamp(60px,8vw,110px)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 4, animation: 'fadeUp .8s 1.3s both' }}>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg,var(--gold),transparent)', animation: 'scrollCue 2.2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--fu)', fontSize: '.48rem', fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--c20)', writingMode: 'vertical-rl' }}>Scroll</span>
          </div>
        )}

        {/* Frame counter deco */}
        {loaded && (
          <div style={{ position: 'absolute', bottom: 36, right: 'clamp(36px,5vw,70px)', fontFamily: 'var(--fu)', fontSize: '.44rem', fontWeight: 600, letterSpacing: '.18em', color: 'var(--c20)', animation: 'fadeUp .8s 1.4s both', zIndex: 4 }}>
            <span style={{ color: 'var(--gold)', opacity: .45 }}>■ REC</span> &nbsp;00:00:01:00
          </div>
        )}

        {/* Easter Egg */}
        {eggOn && (
          <button onClick={clickEgg} onMouseEnter={H} onMouseLeave={LL} style={{
            position: 'absolute', bottom: 30, right: 'clamp(80px,10vw,140px)', zIndex: 10,
            background: 'none', border: 'none', cursor: 'none', fontSize: '.9rem',
            opacity: eggN > 0 ? .55 : .08,
            transition: 'opacity .4s, transform .25s',
            transform: eggN > 0 ? 'scale(1.9)' : 'scale(1)',
            filter: eggN > 0 ? 'brightness(3.5) saturate(2)' : 'none',
            padding: 6,
          }}>🥚</button>
        )}
      </section>

      {/* ═══ MARQUEE ═══════════════════════════════════════════ */}
      <Marquee />

      {/* ═══ STATS ══════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--bg2)',
        padding: `clamp(44px,5vw,68px) ${PAD}`,
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
      }}>
        {[
          ['50', '+', 'Abgeschlossene\nProjekte'],
          ['5', '', 'Jahre\nErfahrung'],
          ['120', 'K', 'Social Media\nReichweite'],
          ['12', '', 'Zufriedene\nKunden'],
        ].map(([n, s, l], i) => (
          <div key={i} className="rv-fade" style={{
            transitionDelay: `${i * .1}s`, textAlign: 'center',
            borderLeft: i > 0 ? '1px solid var(--bdr)' : 'none',
            padding: `0 clamp(16px,2.5vw,44px)`,
          }}>
            <div style={{ fontFamily: 'var(--fd)', fontStyle: 'italic', fontSize: 'clamp(2.2rem,3.8vw,3.2rem)', fontWeight: 400, color: 'var(--gold3)', lineHeight: 1, marginBottom: 10 }}>
              <Count n={n} suffix={s} />
            </div>
            <div style={{ fontFamily: 'var(--fu)', fontSize: '.54rem', fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--c40)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="hdiv" />

      {/* ═══ ABOUT ══════════════════════════════════════════════ */}
      <section id="about" style={{ padding: `clamp(88px,10vw,140px) ${PAD}`, display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 'clamp(52px,7vw,100px)', alignItems: 'center' }}>

        <div>
          <div className="eyebrow rv">Über FlyOriginals</div>
          <h2 className="dh rv d1">Cineastisches<br /><em>Storytelling.</em></h2>
          <div className="rule rv d2" />
          <p className="rv d2" style={{ fontFamily: 'var(--fu)', fontWeight: 400, fontSize: '.88rem', lineHeight: 1.95, color: 'var(--c60)', marginBottom: 18 }}>
            FlyOriginals steht für unabhängige Filmproduktion mit einem unverwechselbaren Gespür für Atmosphäre, Rhythmus und visuelle Identität. Wir produzieren Kurzfilme, Werbeclips und Live-Content — der nicht nach Budget aussieht, sondern nach Absicht.
          </p>
          <p className="rv d3" style={{ fontFamily: 'var(--fu)', fontWeight: 400, fontSize: '.88rem', lineHeight: 1.95, color: 'var(--c60)', marginBottom: 44 }}>
            Vom ersten Konzept bis zum finalen Schnitt begleiten wir jedes Projekt mit dem Anspruch, dass jeder Frame eine Aussage macht — und jede Sekunde verdient ist.
          </p>

          <div className="rv d3" style={{ borderTop: '1px solid var(--bdr)' }}>
            {[
              ['🎬', 'Kurzfilm & Regie', 'Narrativ. Atmosphärisch. Unvergesslich.'],
              ['📡', 'Livestreaming', 'Bis zu 2.000 Zuschauer. Professionell produziert.'],
              ['▶',  'YouTube & Content', 'Storytelling das Reichweite schafft.'],
              ['📸', 'Fotografie', 'Editorial. Natürlich. Charakterstark.'],
              ['🤝', 'Branded Content', 'Marken, die im Gedächtnis bleiben.'],
            ].map(([ico, name, desc]) => (
              <div key={name} onMouseEnter={H} onMouseLeave={LL}
                style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr', gap: '0 16px',
                  alignItems: 'center', padding: '13px 0',
                  borderBottom: '1px solid var(--bdr)', cursor: 'none',
                  transition: 'padding-left .28s cubic-bezier(.16,1,.3,1)',
                }}
                onMouseOver={e => e.currentTarget.style.paddingLeft = '10px'}
                onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}
              >
                <span style={{ fontSize: '.9rem', opacity: .5, textAlign: 'center' }}>{ico}</span>
                <div>
                  <div style={{ fontFamily: 'var(--fu)', fontSize: '.8rem', fontWeight: 600, color: 'var(--cream)', marginBottom: 2 }}>{name}</div>
                  <div style={{ fontFamily: 'var(--fu)', fontSize: '.7rem', fontWeight: 400, color: 'var(--c40)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image frame */}
        <div className="rv d2" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)' }}>
            <FilmStrip count={10} />
          </div>

          <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 22%', opacity: .65 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(175deg, rgba(107,0,24,.3) 0%, transparent 45%, rgba(5,0,1,.82) 100%)' }} />
            <CornerFrame size={18} gap={16} />
            <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22 }}>
              <div style={{ width: 20, height: 1, background: 'var(--gold)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--fd)', fontStyle: 'italic', fontSize: '1.08rem', fontWeight: 400, color: 'var(--cream)', lineHeight: 1.45 }}>
                "Jeder Frame<br />hat eine Aussage."
              </div>
              <div style={{ fontFamily: 'var(--fu)', fontSize: '.48rem', fontWeight: 600, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .65, marginTop: 12 }}>
                FlyOriginals · Film Studio
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)' }}>
            <FilmStrip count={10} />
          </div>
        </div>
      </section>

      <div className="hdiv" />

      {/* ═══ SHOWREEL ═══════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: 'clamp(320px,45vw,560px)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .45 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--bg) 0%, rgba(5,0,1,.5) 40%, rgba(5,0,1,.5) 60%, var(--bg) 100%)' }} />

        {/* Play button */}
        <div className="rv" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <a href="#" onMouseEnter={H} onMouseLeave={LL} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 20, textDecoration: 'none', cursor: 'none' }}>
            <div onMouseEnter={H} onMouseLeave={LL}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '1px solid var(--bdr2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .35s cubic-bezier(.16,1,.3,1)',
                position: 'relative',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.borderColor = 'var(--gold3)'; e.currentTarget.style.background = 'rgba(184,144,48,.12)' }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--bdr2)'; e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '1.5rem', marginLeft: 4 }}>▶</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontStyle: 'italic', fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontWeight: 400, color: 'var(--cream)', marginBottom: 6 }}>
                Showreel ansehen
              </div>
              <div style={{ fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--gold2)', opacity: .75 }}>
                YouTube · 2025
              </div>
            </div>
          </a>
        </div>

        {/* Side labels */}
        <div style={{ position: 'absolute', left: 'clamp(24px,4vw,60px)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, opacity: .35 }}>
          <FilmStrip count={8} vertical />
        </div>
        <div style={{ position: 'absolute', right: 'clamp(24px,4vw,60px)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, opacity: .35 }}>
          <FilmStrip count={8} vertical />
        </div>
      </section>

      <div className="hdiv" />

      {/* ═══ PORTFOLIO ══════════════════════════════════════════ */}
      <section id="portfolio" style={{ background: 'var(--bg2)', padding: `clamp(88px,10vw,140px) ${PAD}` }}>
        <div className="rv" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div className="eyebrow">Ausgewählte Arbeiten</div>
            <h2 className="dh">Portfolio.<br /><em>Projekte &amp; Referenzen.</em></h2>
          </div>
          <Btn href="#kontakt">Alle Projekte anfragen →</Btn>
        </div>

        {/* Masonry-style grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--bdr)' }}>
          {PROJECTS.map((p, i) => <PCard key={p.n} {...p} style={{ transitionDelay: `${(i % 3) * .1}s` }} />)}
        </div>
      </section>

      <div className="hdiv" />

      {/* ═══ PHILOSOPHY ══════════════════════════════════════════ */}
      <section style={{ padding: `clamp(88px,10vw,140px) ${PAD}`, textAlign: 'center' }}>
        <div className="rv" style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(180deg,transparent,var(--gold))', margin: '0 auto 32px' }} />
          <blockquote style={{
            fontFamily: 'var(--fd)', fontStyle: 'italic',
            fontSize: 'clamp(1.7rem,3.5vw,2.9rem)', fontWeight: 400,
            color: 'var(--cream)', lineHeight: 1.18, marginBottom: 28,
          }}>
            "Wir glauben daran, dass jede Geschichte<br />
            es verdient, <em>perfekt</em> erzählt zu werden."
          </blockquote>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(180deg,var(--gold),transparent)', margin: '0 auto 24px' }} />
          <div style={{ fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600, letterSpacing: '.32em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .65 }}>
            FlyOriginals · Film Studio
          </div>
        </div>
      </section>

      <div className="hdiv" />

      {/* ═══ LIVE ═══════════════════════════════════════════════ */}
      <section id="live" style={{ background: 'var(--bg2)', padding: `clamp(88px,10vw,140px) ${PAD}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(52px,7vw,100px)', alignItems: 'center' }}>

        <div>
          <div className="eyebrow rv">Livestream</div>
          <h2 className="dh rv d1">Live dabei.<br /><em>Immer präsent.</em></h2>
          <div className="rule rv d2" />
          <p className="rv d2" style={{ fontFamily: 'var(--fu)', fontWeight: 400, fontSize: '.88rem', lineHeight: 1.95, color: 'var(--c60)', marginBottom: 36 }}>
            Regelmäßige Live-Sessions auf Twitch und YouTube. Von Gaming-Streams bis zu vollständig produzierten Live-Filmevents — die Community ist immer Teil des Prozesses.
          </p>

          {/* Platform cards */}
          <div className="rv d3" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--bdr)', marginBottom: 32 }}>
            {[
              { icon: '📡', name: 'Twitch', handle: '/flyoriginals', note: 'Live Gaming & Events', color: '#9147ff' },
              { icon: '▶',  name: 'YouTube', handle: '/@flyoriginals', note: 'VODs & Highlights', color: '#ff0000' },
            ].map(p => (
              <div key={p.name} onMouseEnter={H} onMouseLeave={LL}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--bg2)', padding: '16px 18px', cursor: 'none',
                  transition: 'background .25s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--c04)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--bg2)'}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.color + '22', border: `1px solid ${p.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--fu)', fontSize: '.78rem', fontWeight: 600, color: 'var(--cream)', marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--fu)', fontSize: '.66rem', fontWeight: 400, color: 'var(--c40)' }}>{p.note}</div>
                </div>
                <div style={{ fontFamily: 'var(--fu)', fontSize: '.6rem', fontWeight: 400, color: 'var(--gold2)', opacity: .7 }}>{p.handle} →</div>
              </div>
            ))}
          </div>

          <div className="rv d4" style={{ display: 'flex', gap: 12 }}>
            <Btn href="#" red>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5050', display: 'inline-block', animation: 'liveBlink 1.1s ease-in-out infinite', flexShrink: 0 }} />
              Twitch folgen
            </Btn>
            <Btn href="#">YouTube</Btn>
          </div>
        </div>

        {/* Stream card */}
        <div className="rv d2">
          <div style={{ border: '1px solid var(--bdr)', overflow: 'hidden' }}>

            {/* Screen */}
            <div style={{ aspectRatio: '16/9', position: 'relative', background: 'var(--bg3)' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', opacity: .32 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(107,0,24,.3), transparent 70%)' }} />

              {/* Scan lines */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px)', pointerEvents: 'none', opacity: .6 }} />

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '2.2rem', opacity: .6 }}>📡</div>
                <div style={{ fontFamily: 'var(--fu)', fontSize: '.54rem', fontWeight: 600, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold2)', opacity: .7 }}>Nächster Stream</div>
              </div>

              {/* LIVE badge */}
              <div style={{ position: 'absolute', top: 12, left: 12, background: '#cc0000', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 700, letterSpacing: '.14em', color: 'white' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', display: 'inline-block', animation: 'liveBlink 1s ease-in-out infinite' }} /> LIVE
              </div>

              {/* Timecode */}
              <div style={{ position: 'absolute', bottom: 10, right: 12, fontFamily: 'var(--fu)', fontSize: '.44rem', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(255,255,255,.22)' }}>
                ■ REC 00:00:00
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '16px 20px', background: 'var(--bg3)', borderTop: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: '1.02rem', fontWeight: 400, color: 'var(--cream)', marginBottom: 3 }}>FlyOriginals Stream</div>
                <div style={{ fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 400, letterSpacing: '.08em', color: 'var(--c40)' }}>Twitch · YouTube</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .7 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'liveBlink 1s infinite' }} /> Online
              </div>
            </div>
          </div>

          {/* Subscribe hint */}
          <div onMouseEnter={H} onMouseLeave={LL}
            style={{ marginTop: 12, padding: '13px 18px', border: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'none', transition: 'border-color .25s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--bdr2)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--bdr)'}
          >
            <span style={{ fontFamily: 'var(--fu)', fontSize: '.72rem', fontWeight: 400, color: 'var(--c40)' }}>Verpasse keinen Stream mehr.</span>
            <a href="#" onMouseEnter={H} onMouseLeave={LL} style={{ fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold2)', textDecoration: 'none', cursor: 'none', transition: 'color .2s' }}
              onMouseOver={e => e.target.style.color = 'var(--gold3)'}
              onMouseOut={e => e.target.style.color = 'var(--gold2)'}
            >Benachrichtigung →</a>
          </div>
        </div>
      </section>

      <div className="hdiv" />

      {/* ═══ CONTACT ════════════════════════════════════════════ */}
      <section id="kontakt" style={{ padding: `clamp(88px,10vw,140px) ${PAD}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '42fr 58fr', gap: 'clamp(52px,7vw,100px)', alignItems: 'start' }}>

          {/* Left */}
          <div>
            <div className="eyebrow rv">Kontakt aufnehmen</div>
            <h2 className="dh rv d1">Lass uns<br /><em>zusammenarbeiten.</em></h2>
            <div className="rule rv d2" />
            <p className="rv d2" style={{ fontFamily: 'var(--fu)', fontWeight: 400, fontSize: '.88rem', lineHeight: 1.95, color: 'var(--c60)', marginBottom: 44 }}>
              Hast du ein Projekt, eine Idee oder eine Kooperation? Schreib uns — wir antworten innerhalb von 24 Stunden.
            </p>
            <div className="rv d3">
              {[
                ['E-Mail', 'hello@flyoriginals.de'],
                ['Twitch', 'twitch.tv/flyoriginals'],
                ['YouTube', 'youtube.com/@flyoriginals'],
                ['Instagram', '@flyoriginals'],
              ].map(([l, v]) => (
                <div key={l} onMouseEnter={H} onMouseLeave={LL}
                  style={{ padding: '15px 0', borderBottom: '1px solid var(--bdr)', cursor: 'none', transition: 'padding-left .28s' }}
                  onMouseOver={e => e.currentTarget.style.paddingLeft = '8px'}
                  onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}
                >
                  <div style={{ fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .75, marginBottom: 5 }}>{l}</div>
                  <div style={{ fontFamily: 'var(--fu)', fontSize: '.82rem', fontWeight: 400, color: 'var(--c60)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="rv d2">
            {sent ? (
              <div style={{ border: '1px solid var(--bdr2)', padding: '60px 44px', textAlign: 'center' }}>
                <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg,transparent,var(--gold))', margin: '0 auto 24px' }} />
                <div style={{ fontFamily: 'var(--fd)', fontStyle: 'italic', fontSize: '1.7rem', fontWeight: 400, color: 'var(--cream)', marginBottom: 12 }}>Nachricht gesendet.</div>
                <div style={{ fontFamily: 'var(--fu)', fontWeight: 400, fontSize: '.82rem', color: 'var(--c40)', lineHeight: 1.8 }}>Wir melden uns innerhalb von 24 Stunden.</div>
                <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg,var(--gold),transparent)', margin: '24px auto 0' }} />
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                  <div>
                    <label style={lblS}>Name</label>
                    <input style={inpS} type="text" required placeholder="Dein Name"
                      value={form.name} onChange={upd('name')} onFocus={fcs} onBlur={blr}
                      onMouseEnter={H} onMouseLeave={LL} />
                  </div>
                  <div>
                    <label style={lblS}>E-Mail</label>
                    <input style={inpS} type="email" required placeholder="deine@email.de"
                      value={form.email} onChange={upd('email')} onFocus={fcs} onBlur={blr}
                      onMouseEnter={H} onMouseLeave={LL} />
                  </div>
                </div>
                <div>
                  <label style={lblS}>Nachricht</label>
                  <textarea style={{ ...inpS, resize: 'vertical', minHeight: 140 }} required
                    placeholder="Erzähl uns von deinem Projekt, deiner Idee oder deiner Anfrage…"
                    value={form.msg} onChange={upd('msg')} onFocus={fcs} onBlur={blr}
                    onMouseEnter={H} onMouseLeave={LL} />
                </div>
                <Btn red onClick={() => {}}>Nachricht senden →</Btn>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════ */}
      <div className="hdiv" />
      <footer style={{ background: 'var(--bg2)' }}>

        {/* Big wordmark */}
        <div style={{
          borderBottom: '1px solid var(--bdr)',
          padding: `clamp(44px,5vw,64px) ${PAD}`,
          overflow: 'hidden',
        }}>
          <div style={{
            fontFamily: 'var(--fd)', fontStyle: 'italic',
            fontSize: 'clamp(2.5rem,8vw,8rem)', fontWeight: 300,
            color: 'var(--c08)', lineHeight: 1,
            letterSpacing: '-.02em',
            userSelect: 'none', pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}>
            FlyOriginals
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: `24px ${PAD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--c20)' }}>
            © {new Date().getFullYear()} FlyOriginals · Film Studio
          </div>

          <div style={{ display: 'flex', gap: 28 }}>
            {['Twitch', 'YouTube', 'Instagram', 'TikTok'].map(s => (
              <a key={s} href="#" onMouseEnter={H} onMouseLeave={LL} style={{ fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--c20)', textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseOver={e => e.target.style.color = 'var(--gold2)'}
                onMouseOut={e => e.target.style.color = 'var(--c20)'}
              >{s}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            {['Impressum', 'Datenschutz'].map(s => (
              <a key={s} href="#" onMouseEnter={H} onMouseLeave={LL} style={{ fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--c20)', textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseOver={e => e.target.style.color = 'var(--c40)'}
                onMouseOut={e => e.target.style.color = 'var(--c20)'}
              >{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
