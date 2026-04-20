import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/* ══════════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════════ */
function Cursor() {
  const dot  = useRef(null)
  const ring = useRef(null)
  const pos  = useRef({ x: -100, y: -100 })
  const ring_pos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    let raf
    const move = e => { pos.current = { x: e.clientX, y: e.clientY } }
    const animate = () => {
      if (dot.current) {
        dot.current.style.left = pos.current.x + 'px'
        dot.current.style.top  = pos.current.y + 'px'
      }
      if (ring.current) {
        ring_pos.current.x += (pos.current.x - ring_pos.current.x) * 0.11
        ring_pos.current.y += (pos.current.y - ring_pos.current.y) * 0.11
        ring.current.style.left = ring_pos.current.x + 'px'
        ring.current.style.top  = ring_pos.current.y + 'px'
      }
      raf = requestAnimationFrame(animate)
    }
    window.addEventListener('mousemove', move, { passive: true })
    raf = requestAnimationFrame(animate)
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={dot}  id="cursor-dot"  />
      <div ref={ring} id="cursor-ring" />
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }),
      { threshold: 0.07, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.clip-reveal,.fade-up,.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ══════════════════════════════════════════════════════════
   HOVER CURSOR HELPERS
══════════════════════════════════════════════════════════ */
const hoverProps = {
  onMouseEnter: () => document.body.classList.add('hovering'),
  onMouseLeave: () => document.body.classList.remove('hovering'),
}

/* ══════════════════════════════════════════════════════════
   PARALLAX HERO BG
══════════════════════════════════════════════════════════ */
function useParallax(ref, factor = 0.35) {
  useEffect(() => {
    const fn = () => {
      if (!ref.current) return
      ref.current.style.transform = `translateY(${window.scrollY * factor}px)`
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [ref, factor])
}

/* ══════════════════════════════════════════════════════════
   HERO TEXT REVEAL — char by char
══════════════════════════════════════════════════════════ */
function SplitText({ text, style, as: Tag = 'span', delay = 0 }) {
  const chars = text.split('')
  return (
    <Tag style={style}>
      {chars.map((c, i) => (
        <span key={i} style={{
          display: 'inline-block',
          animation: `charIn .7s cubic-bezier(.16,1,.3,1) both`,
          animationDelay: `${delay + i * 0.028}s`,
          whiteSpace: c === ' ' ? 'pre' : 'normal',
        }}>{c}</span>
      ))}
    </Tag>
  )
}

/* ══════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════ */
function Counter({ n, suffix = '', decimals = 0 }) {
  const [v, setV] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      const target = parseFloat(n), dur = 1800
      const steps = Math.floor(dur / 16)
      let i = 0
      const id = setInterval(() => {
        i++
        const progress = 1 - Math.pow(1 - i / steps, 3)
        setV(target * progress)
        if (i >= steps) clearInterval(id)
      }, 16)
    }, { threshold: 0.6 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [n])
  const display = decimals ? v.toFixed(decimals) : Math.floor(v).toLocaleString('de')
  return <span ref={ref}>{display}{suffix}</span>
}

/* ══════════════════════════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════════════════════════ */
function MagBtn({ children, href, onClick, red }) {
  const ref = useRef(null)
  const onMove = e => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top  - r.height / 2
    ref.current.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`
  }
  const onOut = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)' }

  const props = {
    ref, onMouseMove: onMove, onMouseLeave: onOut, onClick,
    ...hoverProps,
    className: `btn ${red ? 'btn-fill' : ''}`,
    style: { transition: 'transform .4s cubic-bezier(.16,1,.3,1), background .3s, border-color .3s, color .3s', cursor: 'none' },
  }
  if (href) return <a href={href} {...props}><span>{children}</span></a>
  return <button {...props}><span>{children}</span></button>
}

/* ══════════════════════════════════════════════════════════
   FILM STRIP DECO
══════════════════════════════════════════════════════════ */
function FilmStrip({ vertical }) {
  const holes = Array.from({ length: 14 })
  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      gap: vertical ? 12 : 12,
      opacity: 0.12,
      pointerEvents: 'none',
    }}>
      {holes.map((_, i) => (
        <div key={i} style={{
          width: vertical ? 10 : 8,
          height: vertical ? 8 : 10,
          borderRadius: 2,
          background: 'var(--cream)',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PROJECTS DATA
══════════════════════════════════════════════════════════ */
const PROJECTS = [
  { n:'01', tag:'Kurzfilm', year:'2025', title:'Neon District', sub:'Experimentelle Sci-Fi-Produktion. Gedreht auf Super-8, color-graded in DaVinci Resolve.', aspect:'portrait' },
  { n:'02', tag:'Branded Content', year:'2024', title:'Summer Campaign', sub:'Vollständige Video-Kampagne für ein lokales Lifestyle-Label — Konzept bis Schnitt.', aspect:'landscape' },
  { n:'03', tag:'Livestream', year:'2024', title:'Live Sessions', sub:'Monatliche Live-Produktionen mit bis zu 2.000 gleichzeitigen Zuschauern.', aspect:'portrait' },
  { n:'04', tag:'Fotografie', year:'2023', title:'Urban Portraits', sub:'Porträt-Serie für Musiker aus der lokalen Kreativszene.', aspect:'landscape' },
  { n:'05', tag:'YouTube', year:'2024', title:'The Long Way', sub:'Mini-Dokumentation über eine 30-tägige Solofahrt durch Osteuropa.', aspect:'portrait' },
  { n:'06', tag:'Kurzfilm', year:'2024', title:'Into the Dark', sub:'Atmosphärischer Noir über Vertrauen und Verrat in einer Stadt ohne Licht.', aspect:'landscape' },
]

function ProjectCard({ n, tag, year, title, sub, aspect, i }) {
  const [h, setH] = useState(false)
  const isPortrait = aspect === 'portrait'
  return (
    <div
      className="fade-up"
      style={{ transitionDelay: `${(i % 3) * 0.12}s` }}
      onMouseEnter={() => { setH(true); document.body.classList.add('hovering') }}
      onMouseLeave={() => { setH(false); document.body.classList.remove('hovering') }}
    >
      {/* image placeholder */}
      <div style={{
        width: '100%',
        height: isPortrait ? 320 : 210,
        background: h
          ? `linear-gradient(145deg, var(--crimson) 0%, var(--ink3) 100%)`
          : `linear-gradient(145deg, var(--ink3) 0%, var(--ink2) 100%)`,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 20,
        transition: 'all .5s cubic-bezier(.16,1,.3,1)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: h ? 0.45 : 0.2,
          transition: 'opacity .5s, transform .6s cubic-bezier(.16,1,.3,1)',
          transform: h ? 'scale(1.06)' : 'scale(1)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: h
            ? 'linear-gradient(180deg, transparent 40%, rgba(6,0,1,.9) 100%)'
            : 'linear-gradient(180deg, transparent 30%, rgba(6,0,1,.95) 100%)',
          transition: 'all .4s',
        }} />
        <div style={{ position:'absolute', top:14, left:14, fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:300, letterSpacing:'.28em', color:'var(--gold)', opacity: h ? 1 : 0.5, transition:'opacity .3s' }}>{n}</div>
        <div style={{
          position: 'absolute', bottom: 14, left: 14, right: 14,
          fontFamily: 'var(--f-display)', fontStyle: 'italic',
          fontSize: '1.1rem', fontWeight: 400, color: 'var(--cream)',
          opacity: h ? 1 : 0, transform: h ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all .35s',
        }}>Mehr ansehen →</div>
      </div>

      <div style={{ fontFamily:'var(--f-mono)', fontSize:'.54rem', fontWeight:300, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8, opacity:.85 }}>
        {tag} — {year}
      </div>
      <div style={{ fontFamily:'var(--f-display)', fontSize:'1.25rem', fontWeight:400, color: h ? 'var(--gold2)' : 'var(--cream)', marginBottom:8, lineHeight:1.2, transition:'color .25s' }}>
        {title}
      </div>
      <div style={{ fontFamily:'var(--f-sans)', fontSize:'.78rem', fontWeight:300, color:'var(--cream30)', lineHeight:1.75 }}>
        {sub}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function HubPage() {
  const navigate = useNavigate()
  const bgRef = useRef(null)
  const [eggN, setEggN] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', msg:'' })
  const [sent, setSent] = useState(false)
  const [heroReady, setHeroReady] = useState(false)

  useReveal()
  useParallax(bgRef, 0.3)

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 120); return () => clearTimeout(t) }, [])
  useEffect(() => { const t = setTimeout(() => setEggOn(true), 12000); return () => clearTimeout(t) }, [])

  const clickEgg = () => { const n = eggN+1; setEggN(n); if (n >= 3) navigate('/game/egg-clicker') }
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const fcs = e => { e.target.style.borderColor='var(--gold2)'; e.target.style.color='var(--cream)' }
  const blr = e => { e.target.style.borderColor='var(--bdr)'; e.target.style.color='var(--cream60)' }

  const inpBase = {
    display:'block', width:'100%', padding:'14px 0',
    background:'transparent', border:'none', borderBottom:'1px solid var(--bdr)',
    color:'var(--cream60)', fontFamily:'var(--f-sans)', fontSize:'.85rem', fontWeight:300,
    outline:'none', transition:'border-color .25s, color .25s', cursor:'none',
    caretColor: 'var(--gold2)',
  }

  return (
    <div style={{ background:'var(--ink)' }}>
      <Cursor />

      <style>{`
        @keyframes charIn {
          from { opacity:0; transform:translateY(60%) rotateX(-40deg); }
          to   { opacity:1; transform:translateY(0) rotateX(0); }
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.2;transform:scale(.4)} }
        @keyframes scrollLine { 0%,100%{opacity:.2;transform:scaleY(.5)} 50%{opacity:1;transform:scaleY(1)} }
        @keyframes goldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(184,151,46,.3)} 50%{box-shadow:0 0 0 12px rgba(184,151,46,0)} }
      `}</style>

      {/* ════════════════════════════════════════════
          01 — HERO
      ════════════════════════════════════════════ */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'hidden' }}>

        {/* Parallax BG */}
        <div ref={bgRef} style={{ position:'absolute', inset:'-20%', willChange:'transform' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 35%', opacity:.5 }} />
        </div>

        {/* Overlays */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(115deg, rgba(6,0,1,.97) 42%, rgba(6,0,1,.55) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 55%, var(--ink) 100%)' }} />

        {/* Film strip — left */}
        <div style={{ position:'absolute', left:28, top:'50%', transform:'translateY(-50%)', zIndex:2 }}>
          <FilmStrip vertical />
        </div>

        {/* TOP line + label */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent 4%, var(--bdr2) 35%, transparent 96%)' }} />

        {/* Content */}
        <div style={{ position:'relative', zIndex:3, padding:'0 clamp(80px,9vw,120px)', paddingTop:64, maxWidth:1100 }}>

          {/* eyebrow */}
          {heroReady && (
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32, animation:'fadeUp .8s .1s both' }}>
              <div style={{ width:28, height:1, background:'var(--gold)', opacity:.8 }} />
              <span style={{ fontFamily:'var(--f-mono)', fontSize:'.56rem', fontWeight:300, letterSpacing:'.32em', textTransform:'uppercase', color:'var(--gold)', opacity:.85 }}>
                Film Studio · Live · Content
              </span>
            </div>
          )}

          {/* MAIN TITLE */}
          {heroReady && (
            <div style={{ marginBottom:32, perspective:800 }}>
              <div style={{ fontFamily:'var(--f-display)', fontWeight:400, fontSize:'clamp(3.6rem,8.5vw,7.8rem)', lineHeight:.92, color:'var(--cream)', overflow:'hidden' }}>
                <SplitText text="Wir erzählen" delay={0.28} style={{ display:'block', marginBottom:'0.08em' }} />
                <SplitText text="deine Geschichte." delay={0.62} style={{ display:'block', fontStyle:'italic', color:'var(--gold2)' }} />
              </div>
            </div>
          )}

          {/* sub + CTAs */}
          {heroReady && (
            <>
              <p style={{ fontFamily:'var(--f-sans)', fontWeight:300, fontSize:'clamp(.85rem,1.2vw,.98rem)', lineHeight:1.9, color:'var(--cream30)', maxWidth:460, marginBottom:48, animation:'fadeUp .9s .9s both' }}>
                FlyOriginals ist ein unabhängiges Filmstudio für Kurzfilme,<br />
                Branded Content und Live-Content — Produktionen, die bleiben.
              </p>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', animation:'fadeUp .9s 1.05s both' }}>
                <MagBtn href="#portfolio" red>Portfolio ansehen</MagBtn>
                <MagBtn href="#kontakt">Projekt anfragen</MagBtn>
              </div>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, zIndex:4, animation:'fadeUp .8s 1.4s both' }}>
          <div style={{ fontFamily:'var(--f-mono)', fontSize:'.48rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--cream30)' }}>Scroll</div>
          <div style={{ width:1, height:48, background:'linear-gradient(180deg,var(--gold),transparent)', animation:'scrollLine 2.2s ease-in-out infinite' }} />
        </div>

        {/* FRAME NUMBER deco */}
        <div style={{ position:'absolute', bottom:34, right:clamp36px, fontFamily:'var(--f-mono)', fontSize:'.48rem', letterSpacing:'.22em', color:'var(--cream30)', animation:'fadeUp .8s 1.5s both' }}>
          <span style={{ color:'var(--gold)', opacity:.6 }}>00:00:01:00</span>
        </div>

        {/* Easter Egg */}
        {eggOn && (
          <button onClick={clickEgg} {...hoverProps} style={{
            position:'absolute', bottom:32, right:36, background:'none', border:'none',
            cursor:'none', fontSize:'.85rem', opacity: eggN>0?.55:.1,
            transition:'all .35s', transform: eggN>0?'scale(1.7)':'scale(1)',
            filter: eggN>0?'brightness(3)':'none', padding:6,
          }}
            onMouseEnter={() => { document.body.classList.add('hovering') }}
            onMouseLeave={() => { document.body.classList.remove('hovering') }}
          >🥚</button>
        )}

        {/* bottom line */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent 4%, var(--bdr2) 35%, transparent 96%)' }} />
      </section>

      {/* ════════════════════════════════════════════
          02 — STATS
      ════════════════════════════════════════════ */}
      <div style={{ background:'var(--ink2)', padding:'clamp(40px,5vw,60px) clamp(80px,9vw,120px)', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
        {[
          ['50','+','Projekte abgeschlossen'],
          ['5','','Jahre Erfahrung'],
          ['120','K','Social Reichweite'],
          ['12','','Zufriedene Kunden'],
        ].map(([n,s,l],i) => (
          <div key={l} className="fade-in" style={{ transitionDelay:`${i*.12}s`, borderLeft: i>0?'1px solid var(--bdr)':'none', padding:'0 clamp(20px,3vw,48px) 0 clamp(16px,2.5vw,40px)', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--f-display)', fontStyle:'italic', fontSize:'clamp(2.4rem,4vw,3.4rem)', fontWeight:400, color:'var(--gold2)', lineHeight:1, marginBottom:8 }}>
              <Counter n={n} suffix={s} />
            </div>
            <div style={{ fontFamily:'var(--f-mono)', fontSize:'.52rem', fontWeight:300, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--cream30)' }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="hdiv" />

      {/* ════════════════════════════════════════════
          03 — ABOUT
      ════════════════════════════════════════════ */}
      <section id="about" style={{ padding:'clamp(80px,10vw,130px) clamp(80px,9vw,120px)', display:'grid', gridTemplateColumns:'5fr 4fr', gap:'clamp(48px,7vw,100px)', alignItems:'center' }}>

        {/* Text */}
        <div>
          <div className="eyebrow fade-up">Über FlyOriginals</div>
          <h2 className="dh fade-up d1" style={{ marginBottom:0 }}>
            Cineastisches<br /><em>Storytelling.</em>
          </h2>
          <div className="rule fade-up d2" />
          <p className="fade-up d2" style={{ fontFamily:'var(--f-sans)', fontWeight:300, fontSize:'.92rem', lineHeight:1.95, color:'var(--cream30)', marginBottom:20 }}>
            FlyOriginals steht für unabhängige Filmproduktion mit einem Gespür für Atmosphäre, Rhythmus und visuelle Identität. Wir produzieren Kurzfilme, Werbeclips und Live-Content — der nicht nach Budget aussieht, sondern nach Absicht.
          </p>
          <p className="fade-up d3" style={{ fontFamily:'var(--f-sans)', fontWeight:300, fontSize:'.92rem', lineHeight:1.95, color:'var(--cream30)', marginBottom:44 }}>
            Vom ersten Konzept bis zum finalen Schnitt begleiten wir jedes Projekt mit dem Anspruch, dass jeder Frame eine Aussage macht und jede Sekunde verdient ist.
          </p>

          {/* Service list */}
          <div className="fade-up d3">
            {[
              ['🎬','Kurzfilm & Regie','Narrativ. Atmosphärisch. Unvergesslich.'],
              ['📡','Livestreaming','Bis zu 2.000 Zuschauer. Professionell produziert.'],
              ['▶','YouTube & Content','Storytelling das Reichweite erzeugt.'],
              ['📸','Fotografie','Editorial. Natürlich. Charakterstark.'],
              ['🤝','Branded Content','Marken, die in Erinnerung bleiben.'],
            ].map(([ico,name,desc]) => (
              <div key={name} {...hoverProps} style={{
                display:'grid', gridTemplateColumns:'40px 1fr', gap:'0 14px', alignItems:'center',
                padding:'14px 0', borderBottom:'1px solid var(--bdr)',
                cursor:'none', transition:'background .2s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.paddingLeft='8px';document.body.classList.add('hovering')}}
                onMouseLeave={e=>{e.currentTarget.style.paddingLeft='0';document.body.classList.remove('hovering')}}
              >
                <span style={{ fontSize:'1rem', opacity:.55, textAlign:'center' }}>{ico}</span>
                <div>
                  <div style={{ fontFamily:'var(--f-sans)', fontSize:'.82rem', fontWeight:500, color:'var(--cream)', marginBottom:1 }}>{name}</div>
                  <div style={{ fontFamily:'var(--f-sans)', fontSize:'.72rem', fontWeight:300, color:'var(--cream30)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image block */}
        <div className="fade-up d2" style={{ position:'relative' }}>
          {/* Film strip top */}
          <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)' }}>
            <FilmStrip />
          </div>

          <div style={{ position:'relative', aspectRatio:'2/3', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 20%', opacity:.65 }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(170deg, rgba(110,0,24,.3) 0%, transparent 50%, rgba(6,0,1,.8) 100%)' }} />

            {/* Corner brackets */}
            {[{t:16,l:16,bt:1,bl:1},{t:16,r:16,bt:1,br:1},{b:16,l:16,bb:1,bl:1},{b:16,r:16,bb:1,br:1}].map((s,i)=>(
              <div key={i} style={{ position:'absolute', width:20, height:20, ...Object.fromEntries(Object.entries(s).filter(([k])=>/^[tlbr]$/.test(k)).map(([k,v])=>[k,v])), borderTop: s.bt?'1px solid var(--gold3)':'none', borderBottom: s.bb?'1px solid var(--gold3)':'none', borderLeft: s.bl?'1px solid var(--gold3)':'none', borderRight: s.br?'1px solid var(--gold3)':'none' }} />
            ))}

            {/* Quote overlay */}
            <div style={{ position:'absolute', bottom:24, left:24, right:24 }}>
              <div style={{ width:24, height:1, background:'var(--gold)', marginBottom:12 }} />
              <div style={{ fontFamily:'var(--f-display)', fontStyle:'italic', fontSize:'1.05rem', fontWeight:400, color:'var(--cream)', lineHeight:1.4 }}>
                "Jeder Frame<br />hat eine Aussage."
              </div>
              <div style={{ fontFamily:'var(--f-mono)', fontSize:'.5rem', letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gold)', marginTop:10, opacity:.7 }}>
                FlyOriginals · Film Studio
              </div>
            </div>
          </div>

          {/* Film strip bottom */}
          <div style={{ position:'absolute', bottom:-16, left:'50%', transform:'translateX(-50%)' }}>
            <FilmStrip />
          </div>
        </div>
      </section>

      <div className="hdiv" />

      {/* ════════════════════════════════════════════
          04 — PORTFOLIO
      ════════════════════════════════════════════ */}
      <section id="portfolio" style={{ background:'var(--ink2)', padding:'clamp(80px,10vw,130px) clamp(80px,9vw,120px)' }}>

        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:60, flexWrap:'wrap', gap:20 }}>
          <div>
            <div className="eyebrow">Ausgewählte Arbeiten</div>
            <h2 className="dh">Portfolio.<br /><em>Unsere Projekte.</em></h2>
          </div>
          <MagBtn href="#kontakt" className="fade-up d2">Alle Projekte anfragen →</MagBtn>
        </div>

        {/* 3-col grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'clamp(28px,3vw,44px)' }}>
          {PROJECTS.map((p,i) => <ProjectCard key={p.n} {...p} i={i} />)}
        </div>
      </section>

      <div className="hdiv" />

      {/* ════════════════════════════════════════════
          05 — LIVE
      ════════════════════════════════════════════ */}
      <section id="live" style={{ padding:'clamp(80px,10vw,130px) clamp(80px,9vw,120px)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(48px,7vw,100px)', alignItems:'center' }}>

        <div>
          <div className="eyebrow fade-up">Livestream</div>
          <h2 className="dh fade-up d1">Live dabei.<br /><em>Immer.</em></h2>
          <div className="rule fade-up d2" />
          <p className="fade-up d2" style={{ fontFamily:'var(--f-sans)', fontWeight:300, fontSize:'.92rem', lineHeight:1.95, color:'var(--cream30)', marginBottom:36 }}>
            Regelmäßige Live-Sessions auf Twitch und YouTube. Von Gaming-Streams bis zu vollständig produzierten Live-Filmevents — die Community ist immer Teil des Prozesses.
          </p>
          <div className="fade-up d3" style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <MagBtn href="#" red>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#ff5050', display:'inline-block', animation:'liveDot 1.1s ease-in-out infinite', flexShrink:0 }} />
              Twitch folgen
            </MagBtn>
            <MagBtn href="#">YouTube abonnieren</MagBtn>
          </div>
        </div>

        {/* Stream mockup */}
        <div className="fade-up d2">
          <div style={{ border:'1px solid var(--bdr)', position:'relative' }}>
            {/* screen */}
            <div style={{ aspectRatio:'16/9', position:'relative', overflow:'hidden', background:'var(--ink3)' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', opacity:.3 }} />
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(110,0,24,.25) 0%, transparent 70%)' }} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:'2.2rem', opacity:.7 }}>📡</div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.52rem', fontWeight:300, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--gold)', opacity:.75 }}>Nächster Stream</div>
              </div>

              {/* LIVE badge */}
              <div style={{ position:'absolute', top:14, left:14, background:'#cc0000', padding:'5px 11px', display:'flex', alignItems:'center', gap:6, fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:400, letterSpacing:'.16em', color:'white' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'white', display:'inline-block', animation:'liveDot 1s ease-in-out infinite' }} />
                LIVE
              </div>

              {/* frame counter */}
              <div style={{ position:'absolute', bottom:12, right:12, fontFamily:'var(--f-mono)', fontSize:'.44rem', letterSpacing:'.14em', color:'rgba(255,255,255,.25)' }}>
                REC ● 00:00:00
              </div>
            </div>

            {/* info bar */}
            <div style={{ padding:'16px 20px', background:'var(--ink2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontFamily:'var(--f-display)', fontSize:'1rem', fontWeight:400, color:'var(--cream)', marginBottom:3 }}>FlyOriginals Stream</div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.52rem', fontWeight:300, letterSpacing:'.1em', color:'var(--cream30)' }}>Twitch · YouTube</div>
              </div>
              <div style={{ fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:300, letterSpacing:'.14em', color:'var(--gold)', opacity:.7, display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--gold)', display:'inline-block', animation:'liveDot 1s infinite' }} />
                Online
              </div>
            </div>
          </div>

          {/* CTA under stream */}
          <div style={{ marginTop:20, padding:'16px 20px', border:'1px solid var(--bdr)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:'var(--f-sans)', fontSize:'.78rem', fontWeight:300, color:'var(--cream30)' }}>Verpasse keinen Stream mehr.</div>
            <a href="#" {...hoverProps} style={{ fontFamily:'var(--f-mono)', fontSize:'.54rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--gold2)', textDecoration:'none', transition:'color .2s', cursor:'none' }}
              onMouseOver={e=>e.target.style.color='var(--gold3)'}
              onMouseOut={e=>e.target.style.color='var(--gold2)'}
            >Benachrichtigung →</a>
          </div>
        </div>
      </section>

      <div className="hdiv" />

      {/* ════════════════════════════════════════════
          06 — CONTACT
      ════════════════════════════════════════════ */}
      <section id="kontakt" style={{ background:'var(--ink2)', padding:'clamp(80px,10vw,130px) clamp(80px,9vw,120px)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'4fr 5fr', gap:'clamp(48px,7vw,100px)', alignItems:'start' }}>

          {/* Left: info */}
          <div>
            <div className="eyebrow fade-up">Kontakt aufnehmen</div>
            <h2 className="dh fade-up d1">Lass uns<br /><em>zusammenarbeiten.</em></h2>
            <div className="rule fade-up d2" />
            <p className="fade-up d2" style={{ fontFamily:'var(--f-sans)', fontWeight:300, fontSize:'.9rem', lineHeight:1.95, color:'var(--cream30)', marginBottom:44 }}>
              Hast du ein Projekt, eine Idee oder eine Kooperation? Schreib uns eine Nachricht — wir antworten innerhalb von 24 Stunden.
            </p>

            <div className="fade-up d3">
              {[
                ['E-Mail','hello@flyoriginals.de'],
                ['Twitch','twitch.tv/flyoriginals'],
                ['YouTube','youtube.com/@flyoriginals'],
                ['Instagram','@flyoriginals'],
              ].map(([l,v]) => (
                <div key={l} style={{ padding:'16px 0', borderBottom:'1px solid var(--bdr)' }}>
                  <div style={{ fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:300, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--gold)', opacity:.75, marginBottom:5 }}>{l}</div>
                  <div style={{ fontFamily:'var(--f-sans)', fontSize:'.85rem', fontWeight:300, color:'var(--cream60)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="fade-up d2">
            {sent ? (
              <div style={{ border:'1px solid var(--bdr2)', padding:'56px 44px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.56rem', letterSpacing:'.28em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16 }}>
                  ✓ Übertragen
                </div>
                <div style={{ fontFamily:'var(--f-display)', fontStyle:'italic', fontSize:'1.6rem', fontWeight:400, color:'var(--cream)', marginBottom:12 }}>
                  Nachricht gesendet.
                </div>
                <div style={{ fontFamily:'var(--f-sans)', fontWeight:300, fontSize:'.85rem', color:'var(--cream30)', lineHeight:1.8 }}>
                  Wir melden uns innerhalb von 24 Stunden.
                </div>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true)}} style={{ display:'flex', flexDirection:'column', gap:32 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
                  <div>
                    <label style={{ fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:300, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--gold)', display:'block', marginBottom:10, opacity:.8 }}>Name</label>
                    <input style={inpBase} type="text" required placeholder="Dein Name" value={form.name} onChange={upd('name')} onFocus={fcs} onBlur={blr} {...hoverProps} />
                  </div>
                  <div>
                    <label style={{ fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:300, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--gold)', display:'block', marginBottom:10, opacity:.8 }}>E-Mail</label>
                    <input style={inpBase} type="email" required placeholder="deine@email.de" value={form.email} onChange={upd('email')} onFocus={fcs} onBlur={blr} {...hoverProps} />
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily:'var(--f-mono)', fontSize:'.5rem', fontWeight:300, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--gold)', display:'block', marginBottom:10, opacity:.8 }}>Projekt / Nachricht</label>
                  <textarea style={{ ...inpBase, resize:'vertical', minHeight:130 }} required placeholder="Erzähl uns von deinem Projekt, deiner Idee oder deiner Anfrage…" value={form.msg} onChange={upd('msg')} onFocus={fcs} onBlur={blr} {...hoverProps} />
                </div>
                <div>
                  <MagBtn red onClick={()=>{}} style={{ cursor:'none' }}>
                    Nachricht senden →
                  </MagBtn>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <div className="hdiv" />
      <footer style={{ padding:'32px clamp(80px,9vw,120px)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontFamily:'var(--f-display)', fontSize:'1.05rem', fontWeight:400, color:'var(--cream)', marginBottom:4, letterSpacing:'.04em' }}>FlyOriginals</div>
          <div style={{ fontFamily:'var(--f-mono)', fontSize:'.46rem', fontWeight:300, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--cream30)' }}>
            © {new Date().getFullYear()} · Film Studio
          </div>
        </div>
        <div style={{ display:'flex', gap:28 }}>
          {['Twitch','YouTube','Instagram','TikTok'].map(s => (
            <a key={s} href="#" {...hoverProps} style={{ fontFamily:'var(--f-mono)', fontSize:'.54rem', fontWeight:300, letterSpacing:'.16em', textTransform:'uppercase', color:'var(--cream30)', textDecoration:'none', transition:'color .22s', cursor:'none' }}
              onMouseOver={e=>e.target.style.color='var(--gold2)'}
              onMouseOut={e=>e.target.style.color='var(--cream30)'}
            >{s}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {['Impressum','Datenschutz'].map(s => (
            <a key={s} href="#" {...hoverProps} style={{ fontFamily:'var(--f-mono)', fontSize:'.48rem', fontWeight:300, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--cream30)', textDecoration:'none', transition:'color .2s', cursor:'none' }}
              onMouseOver={e=>e.target.style.color='var(--cream60)'}
              onMouseOut={e=>e.target.style.color='var(--cream30)'}
            >{s}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}

// small helper to avoid inline "clamp" string in JSX attribute
const clamp36px = 'clamp(24px,4vw,60px)'
