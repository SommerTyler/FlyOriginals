import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { useContent } from '../hooks/useContent'
import { useMedia } from '../hooks/useMedia'
import AdminPanel from '../components/AdminPanel'

const H = () => document.body.classList.add('hov')
const L = () => document.body.classList.remove('hov')

/* ── Cursor ────────────────────────────────────────────── */
function Cursor() {
  const dot = useRef(null), ring = useRef(null)
  const m = useRef({ x: -200, y: -200 }), s = useRef({ x: -200, y: -200 })
  useEffect(() => {
    let raf
    const mv = e => { m.current.x = e.clientX; m.current.y = e.clientY }
    const tk = () => {
      s.current.x += (m.current.x - s.current.x) * 0.1
      s.current.y += (m.current.y - s.current.y) * 0.1
      if (dot.current) { dot.current.style.left = m.current.x + 'px'; dot.current.style.top = m.current.y + 'px' }
      if (ring.current) { ring.current.style.left = s.current.x + 'px'; ring.current.style.top = s.current.y + 'px' }
      raf = requestAnimationFrame(tk)
    }
    window.addEventListener('mousemove', mv, { passive: true })
    raf = requestAnimationFrame(tk)
    return () => { window.removeEventListener('mousemove', mv); cancelAnimationFrame(raf) }
  }, [])
  return <><div ref={dot} id="cur-dot" /><div ref={ring} id="cur-ring" /></>
}

/* ── Preloader ─────────────────────────────────────────── */
function Preloader({ onDone }) {
  const [fading, setFading] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1500)
    const t2 = setTimeout(onDone, 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 99995, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: fading ? 0 : 1, transition: 'opacity .75s cubic-bezier(.16,1,.3,1)', pointerEvents: fading ? 'none' : 'all' }}>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--cream)', marginBottom: 24, animation: 'wordIn 1s .1s both' }}>FlyOriginals</div>
      <div style={{ width: 160, height: 1, background: 'rgba(184,144,48,.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gold)', animation: 'loadLine 1.3s cubic-bezier(.16,1,.3,1) both' }} />
      </div>
      <div style={{ fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600, letterSpacing: '.36em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .65, marginTop: 14, animation: 'wordIn .7s .4s both' }}>Film · Studio</div>
      <style>{`
        @keyframes wordIn{from{opacity:0;letter-spacing:.5em}to{opacity:1;letter-spacing:.04em}}
        @keyframes loadLine{from{width:0}to{width:100%}}
      `}</style>
    </div>
  )
}

/* ── Scroll reveal ─────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }),
      { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }
    )
    document.querySelectorAll('.rv,.rv-fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── Parallax ──────────────────────────────────────────── */
function useParallax(ref, speed = 0.26) {
  useEffect(() => {
    const fn = () => { if (ref.current) ref.current.style.transform = `translateY(${window.scrollY * speed}px)` }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
}

/* ── Magnetic Button ───────────────────────────────────── */
function Btn({ children, href, onClick, red, full }) {
  const ref = useRef(null)
  const mv = e => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .18}px,${(e.clientY - r.top - r.height/2) * .18}px)`
  }
  const out = () => { if (ref.current) ref.current.style.transform = '' }
  const props = {
    ref, onMouseMove: mv,
    onMouseEnter: () => H(),
    onMouseLeave: () => { out(); L() },
    onClick,
    className: `btn${red ? ' btn-r' : ''}`,
    style: { transition: 'transform .4s cubic-bezier(.16,1,.3,1),color .3s,border-color .3s', cursor: 'none', ...(full && { width: '100%', justifyContent: 'center' }) },
  }
  return href ? <a href={href} {...props}>{children}</a> : <button type="button" {...props}>{children}</button>
}

/* ── Animated counter ──────────────────────────────────── */
function Count({ n, suffix = '' }) {
  const [v, setV] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      const target = parseFloat(n), steps = 90
      let i = 0
      const id = setInterval(() => {
        i++; const ease = 1 - Math.pow(1 - i/steps, 3)
        setV(Math.round(target * ease))
        if (i >= steps) clearInterval(id)
      }, 18)
    }, { threshold: 0.5 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [n])
  return <span ref={ref}>{v.toLocaleString('de')}{suffix}</span>
}

/* ── Split text ────────────────────────────────────────── */
function Split({ text, delay = 0, italic, gold }) {
  return (
    <span style={{ display: 'block', fontStyle: italic ? 'italic' : 'normal', color: gold ? 'var(--gold3)' : 'inherit' }}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{ display: 'inline-block', animation: `charIn .6s cubic-bezier(.16,1,.3,1) ${delay + i * 0.024}s both`, whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>{ch}</span>
      ))}
    </span>
  )
}

/* ── Film strip ────────────────────────────────────────── */
const Strip = ({ n = 10, v }) => (
  <div style={{ display: 'flex', flexDirection: v ? 'column' : 'row', gap: v ? 10 : 10, opacity: .1, pointerEvents: 'none', flexShrink: 0 }}>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ width: v ? 8 : 6, height: v ? 6 : 8, borderRadius: 1, background: 'var(--cream)', flexShrink: 0 }} />
    ))}
  </div>
)

/* ── Corner frame ──────────────────────────────────────── */
const CFrame = ({ size = 18, gap = 15 }) =>
  [['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
    <div key={v+h} style={{ position:'absolute', [v]:gap, [h]:gap, width:size, height:size,
      borderTop:    v==='top'    ? '1px solid var(--gold3)' : 'none',
      borderBottom: v==='bottom' ? '1px solid var(--gold3)' : 'none',
      borderLeft:   h==='left'   ? '1px solid var(--gold3)' : 'none',
      borderRight:  h==='right'  ? '1px solid var(--gold3)' : 'none',
    }} />
  ))

/* ── Marquee ───────────────────────────────────────────── */
const MTEXT = 'Film · Regie · Livestream · YouTube · Fotografie · Branded Content · Storytelling · '
const Marquee = () => (
  <div style={{ overflow:'hidden', whiteSpace:'nowrap', borderTop:'1px solid var(--bdr)', borderBottom:'1px solid var(--bdr)', background:'var(--bg2)', padding:'10px 0' }}>
    <div style={{ display:'inline-block', fontFamily:'var(--fu)', fontSize:'.58rem', fontWeight:600, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--gold)', opacity:.55, animation:'marq 36s linear infinite', willChange:'transform' }}>
      {MTEXT.repeat(8)}
    </div>
  </div>
)


/* ── Portfolio card ────────────────────────────────────── */
function PCard({ n, tag, yr, title, desc, span, mobile }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => { H(); setHov(true) }} onMouseLeave={() => { L(); setHov(false) }}
      style={{ gridColumn: mobile ? 'span 1' : `span ${span}`, minHeight: span === 2 ? 260 : 300, position: 'relative', overflow: 'hidden', cursor: 'none', background: 'var(--bg3)', border: '1px solid var(--bdr)', transition: 'border-color .3s', borderColor: hov ? 'var(--bdr2)' : 'var(--bdr)' }}
      className="rv"
    >
      <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center', opacity: hov ? .52 : .18, transform: hov ? 'scale(1.07)' : 'scale(1)', transition:'opacity .6s,transform .7s cubic-bezier(.16,1,.3,1)' }} />
      <div style={{ position:'absolute', inset:0, background: hov ? 'linear-gradient(180deg,rgba(107,0,24,.4) 0%,rgba(5,0,1,.92) 100%)' : 'linear-gradient(180deg,transparent 20%,rgba(5,0,1,.96) 100%)', transition:'background .5s' }} />
      <div style={{ position:'absolute', top:16, left:18, fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:600, letterSpacing:'.26em', color:'var(--gold)', opacity:.6 }}>{n}</div>
      <div style={{ position:'absolute', top:14, right:14, fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gold2)', opacity: hov ? 1 : 0, transition:'opacity .3s', background:'rgba(5,0,1,.65)', padding:'3px 9px', border:'1px solid var(--bdr)' }}>{tag} · {yr}</div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 18px 18px' }}>
        <div style={{ width:'100%', height:1, background:'var(--gold)', transform: hov ? 'scaleX(1)' : 'scaleX(0)', transformOrigin:'left', transition:'transform .5s cubic-bezier(.16,1,.3,1)', marginBottom:12 }} />
        <h3 style={{ fontFamily:'var(--fd)', fontSize:'clamp(1rem,1.7vw,1.4rem)', fontWeight:400, color: hov ? 'var(--gold3)' : 'var(--cream)', marginBottom:7, lineHeight:1.15, transition:'color .3s' }}>{title}</h3>
        <p style={{ fontFamily:'var(--fu)', fontSize:'.72rem', fontWeight:400, lineHeight:1.65, color:'var(--c60)', opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(8px)', transition:'opacity .4s,transform .4s cubic-bezier(.16,1,.3,1)' }}>{desc}</p>
      </div>
    </div>
  )
}

/* ── Hamburger menu (mobile) ───────────────────────────── */
function MobileMenu({ onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(5,0,1,.98)', zIndex:600, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32, animation:'fadeIn .25s ease' }}>
      <button onClick={onClose} style={{ position:'absolute', top:20, right:20, background:'none', border:'none', color:'var(--c60)', fontSize:'1.4rem', cursor:'pointer', lineHeight:1 }}>✕</button>
      {['About','Portfolio','Live','Kontakt'].map(l => (
        <a key={l} href={`#${l.toLowerCase()}`} onClick={onClose} style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize:'2.4rem', fontWeight:400, color:'var(--cream)', textDecoration:'none', transition:'color .2s' }}
          onMouseOver={e => e.target.style.color='var(--gold3)'}
          onMouseOut={e => e.target.style.color='var(--cream)'}
        >{l}</a>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function HubPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { content, loading: cLoading, saveSection } = useContent()
  const { isMobile, isTablet } = useMedia()
  const mobile = isMobile || isTablet

  const [loaded, setLoaded]     = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [eggN, setEggN]         = useState(0)
  const [eggOn, setEggOn]       = useState(false)
  const [form, setForm]         = useState({ name:'', email:'', msg:'' })
  const [sent, setSent]         = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const bgRef = useRef(null)

  useReveal()
  if (!mobile) useParallax(bgRef, 0.26)

  useEffect(() => { const t = setTimeout(() => setEggOn(true), 14000); return () => clearTimeout(t) }, [])

  const clickEgg = () => { const n = eggN+1; setEggN(n); if (n >= 3) navigate('/game/egg-clicker') }
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const fcs = e => e.target.style.borderColor = 'var(--gold2)'
  const blr = e => e.target.style.borderColor = 'var(--bdr)'
  const inpS = { display:'block', width:'100%', padding:'13px 0', background:'transparent', border:'none', borderBottom:'1px solid var(--bdr)', color:'var(--cream)', fontFamily:'var(--fu)', fontSize:'.85rem', fontWeight:400, outline:'none', caretColor:'var(--gold2)', cursor:'none', transition:'border-color .25s' }
  const lblS = { display:'block', fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:600, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--gold)', opacity:.8, marginBottom:8 }

  const c = content
  const PAD = mobile ? '0 20px' : 'clamp(28px,6vw,90px)'
  const SEC = `clamp(72px,9vw,130px) ${PAD}`

  return (
    <div style={{ background:'var(--bg)', paddingTop:'clamp(70px,9vw,120px)', paddingBottom:'clamp(70px,9vw,120px)' }}>

      {/* ══ FIXED TORN PAPER FRAME ════════════════════════════ */}
      {/* TOP — parchment strip with torn edge facing down */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
        height: 'clamp(80px, 10vw, 130px)',
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        <img src="/torn.png" alt="" style={{
          position: 'absolute', top: 0, left: '-5%',
          width: '110%', height: 'auto',
          transform: 'rotate(-4deg)',
          transformOrigin: 'top left',
          userSelect: 'none',
          filter: 'brightness(.92)',
        }} />
      </div>

      {/* BOTTOM — parchment strip flipped, torn edge facing up */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 400,
        height: 'clamp(80px, 10vw, 130px)',
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        <img src="/torn.png" alt="" style={{
          position: 'absolute', bottom: 0, left: '-5%',
          width: '110%', height: 'auto',
          transform: 'rotate(4deg) scaleY(-1)',
          transformOrigin: 'bottom left',
          userSelect: 'none',
          filter: 'brightness(.92)',
        }} />
      </div>
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}
      {!mobile && <Cursor />}

      {/* Mobile hamburger overlay */}
      {mobileMenu && <MobileMenu onClose={() => setMobileMenu(false)} />}

      {/* Mobile hamburger button */}
      {mobile && (
        <button onClick={() => setMobileMenu(true)} style={{ position:'fixed', top:14, right:16, zIndex:400, background:'none', border:'1px solid var(--bdr)', color:'var(--gold2)', padding:'7px 12px', fontFamily:'var(--fu)', fontSize:'.6rem', fontWeight:600, letterSpacing:'.12em', cursor:'pointer' }}>
          ☰ Menu
        </button>
      )}

      {/* Admin toggle button */}
      {isAdmin && (
        <button onMouseEnter={H} onMouseLeave={L}
          onClick={() => setAdminOpen(true)}
          style={{
            position:'fixed', bottom: mobile ? 14 : 28, right: mobile ? 14 : 28, zIndex:900,
            background:'var(--red2)', border:'1px solid var(--red3)',
            color:'var(--cream)', fontFamily:'var(--fu)', fontSize:'.58rem', fontWeight:700,
            letterSpacing:'.14em', textTransform:'uppercase',
            padding: mobile ? '10px 16px' : '11px 22px', cursor:'none',
            boxShadow:'0 4px 24px rgba(145,0,32,.5)',
            transition:'all .25s', display:'flex', alignItems:'center', gap:7,
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--red3)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--red2)'}
        >✏️ {mobile ? '' : 'Website bearbeiten'}</button>
      )}

      {/* Admin Panel */}
      {adminOpen && (
        <AdminPanel
          content={c}
          saveSection={saveSection}
          onClose={() => setAdminOpen(false)}
        />
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes charIn{from{opacity:0;transform:translateY(52%) skewY(2deg)}to{opacity:1;transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scrollCue{0%,100%{opacity:.15;transform:scaleY(.5)}50%{opacity:1;transform:scaleY(1)}}
        @keyframes liveBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.2;transform:scale(.4)}}
        @keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes wordIn{from{opacity:0;letter-spacing:.5em}to{opacity:1}}
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'hidden', paddingTop:64 }}>

        <div style={{ position:'absolute', top:64, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,var(--bdr2) 25%,var(--bdr2) 75%,transparent)', zIndex:3 }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,var(--bdr2) 25%,var(--bdr2) 75%,transparent)', zIndex:3 }} />

        <div ref={bgRef} style={{ position:'absolute', inset:'-25%', willChange:'transform' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 40%', opacity: mobile ? .35 : .5 }} />
        </div>
        <div style={{ position:'absolute', inset:0, background: mobile ? 'rgba(5,0,1,.85)' : 'linear-gradient(120deg,rgba(5,0,1,.97) 40%,rgba(5,0,1,.6) 100%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'linear-gradient(180deg,transparent,var(--bg))' }} />

        {!mobile && (
          <>
            <div style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', zIndex:2 }}><Strip n={14} v /></div>
            <div style={{ position:'absolute', right:18, top:'50%', transform:'translateY(-50%)', zIndex:2 }}><Strip n={14} v /></div>
          </>
        )}

        {loaded && (
          <div style={{ position:'relative', zIndex:4, padding: mobile ? '0 24px' : '0 clamp(60px,8vw,110px)', maxWidth:1000 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:mobile?20:28, animation:'fadeUp .8s .05s both' }}>
              <div style={{ width:22, height:1, background:'var(--gold)', opacity:.8 }} />
              <span style={{ fontFamily:'var(--fu)', fontSize:'.56rem', fontWeight:600, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--gold2)', opacity:.85 }}>{c.hero.eyebrow}</span>
            </div>

            <h1 style={{ fontFamily:'var(--fd)', fontWeight:400, fontSize: mobile ? 'clamp(2.8rem,11vw,4.5rem)' : 'clamp(3.4rem,8vw,7.5rem)', lineHeight:.94, color:'var(--cream)', marginBottom: mobile?22:28, perspective:1000 }}>
              <Split text={c.hero.title1} delay={0.22} />
              <Split text={c.hero.title2} delay={0.56} italic gold />
            </h1>

            <p style={{ fontFamily:'var(--fu)', fontWeight:400, fontSize: mobile ? '.85rem' : 'clamp(.82rem,1.1vw,.95rem)', lineHeight:1.9, color:'var(--c40)', maxWidth:440, marginBottom: mobile?36:48, animation:'fadeUp .9s .92s both' }}>
              {c.hero.subtitle}
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'fadeUp .9s 1.05s both' }}>
              <Btn href="#portfolio" red>Portfolio ansehen</Btn>
              <Btn href="#kontakt">Projekt anfragen</Btn>
            </div>
          </div>
        )}

        {!mobile && loaded && (
          <>
            <div style={{ position:'absolute', bottom:30, left:'clamp(60px,8vw,110px)', display:'flex', alignItems:'center', gap:10, zIndex:4, animation:'fadeUp .8s 1.3s both' }}>
              <div style={{ width:1, height:40, background:'linear-gradient(180deg,var(--gold),transparent)', animation:'scrollCue 2.2s ease-in-out infinite' }} />
              <span style={{ fontFamily:'var(--fu)', fontSize:'.46rem', fontWeight:600, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--c20)', writingMode:'vertical-rl' }}>Scroll</span>
            </div>
            <div style={{ position:'absolute', bottom:34, right:'clamp(36px,5vw,70px)', fontFamily:'var(--fu)', fontSize:'.44rem', fontWeight:600, letterSpacing:'.16em', color:'var(--c20)', animation:'fadeUp .8s 1.4s both', zIndex:4 }}>
              <span style={{ color:'var(--gold)', opacity:.45 }}>■ REC</span> &nbsp;00:00:01:00
            </div>
          </>
        )}

        {eggOn && (
          <button onClick={clickEgg} onMouseEnter={H} onMouseLeave={L} style={{ position:'absolute', bottom:28, right:'clamp(80px,10vw,140px)', zIndex:10, background:'none', border:'none', cursor: mobile?'pointer':'none', fontSize:'.9rem', opacity: eggN>0?.55:.08, transition:'all .4s', transform: eggN>0?'scale(1.9)':'scale(1)', filter: eggN>0?'brightness(3.5)':'none', padding:6 }}>🥚</button>
        )}
      </section>

      <Marquee />

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <div style={{ background:'var(--bg2)', padding:`clamp(36px,4.5vw,58px) ${PAD}`, display:'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: mobile ? '24px 0' : 0 }}>
        {c.stats.items.map((it, i) => (
          <div key={i} className="rv-fade" style={{ transitionDelay:`${i*.09}s`, textAlign:'center', borderLeft: (!mobile && i>0) ? '1px solid var(--bdr)' : 'none', padding:`0 clamp(12px,2vw,44px)`, borderTop: (mobile && i>=2) ? '1px solid var(--bdr)' : 'none', paddingTop: (mobile && i>=2) ? 24 : 0 }}>
            <div style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize:'clamp(2rem,3.5vw,3rem)', fontWeight:400, color:'var(--gold3)', lineHeight:1, marginBottom:8 }}>
              <Count n={it.n} suffix={it.s} />
            </div>
            <div style={{ fontFamily:'var(--fu)', fontSize:'.54rem', fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--c40)', lineHeight:1.6, whiteSpace:'pre-line' }}>{it.label}</div>
          </div>
        ))}
      </div>
      <div className="hdiv" />

      {/* ══ ABOUT ══════════════════════════════════════════════ */}
      <section id="about" style={{ padding:SEC, display:'grid', gridTemplateColumns: mobile ? '1fr' : '55fr 45fr', gap: mobile ? '44px' : 'clamp(48px,7vw,96px)', alignItems:'center' }}>
        <div>
          <div className="eyebrow rv">{c.about.eyebrow}</div>
          <h2 className="dh rv d1" dangerouslySetInnerHTML={{ __html: c.about.title.replace('Storytelling.', '<em>Storytelling.</em>') }} />
          <div className="rule rv d2" />
          <p className="rv d2" style={{ fontFamily:'var(--fu)', fontWeight:400, fontSize:'.88rem', lineHeight:1.95, color:'var(--c60)', marginBottom:16 }}>{c.about.p1}</p>
          <p className="rv d3" style={{ fontFamily:'var(--fu)', fontWeight:400, fontSize:'.88rem', lineHeight:1.95, color:'var(--c60)', marginBottom: mobile?32:40 }}>{c.about.p2}</p>
          <div className="rv d3" style={{ borderTop:'1px solid var(--bdr)' }}>
            {[['🎬','Kurzfilm & Regie','Narrativ. Atmosphärisch.'],['📡','Livestreaming','Professionell produziert.'],['▶','YouTube & Content','Reichweite schaffen.'],['📸','Fotografie','Editorial. Charakterstark.'],['🤝','Branded Content','Marken die bleiben.']].map(([ico,name,desc]) => (
              <div key={name} onMouseEnter={H} onMouseLeave={L} style={{ display:'grid', gridTemplateColumns:'30px 1fr', gap:'0 14px', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--bdr)', cursor: mobile?'default':'none', transition:'padding-left .28s cubic-bezier(.16,1,.3,1)' }}
                onMouseOver={e => !mobile && (e.currentTarget.style.paddingLeft='9px')}
                onMouseOut={e => !mobile && (e.currentTarget.style.paddingLeft='0')}
              >
                <span style={{ fontSize:'.88rem', opacity:.5, textAlign:'center' }}>{ico}</span>
                <div>
                  <div style={{ fontFamily:'var(--fu)', fontSize:'.8rem', fontWeight:600, color:'var(--cream)', marginBottom:2 }}>{name}</div>
                  <div style={{ fontFamily:'var(--fu)', fontSize:'.7rem', fontWeight:400, color:'var(--c40)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!mobile && (
          <div className="rv d2" style={{ position:'relative' }}>
            <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)' }}><Strip n={9} /></div>
            <div style={{ position:'relative', aspectRatio:'2/3', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 22%', opacity:.65 }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(175deg,rgba(107,0,24,.3) 0%,transparent 45%,rgba(5,0,1,.82) 100%)' }} />
              <CFrame />
              <div style={{ position:'absolute', bottom:22, left:22, right:22 }}>
                <div style={{ width:18, height:1, background:'var(--gold)', marginBottom:11 }} />
                <div style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize:'1.05rem', fontWeight:400, color:'var(--cream)', lineHeight:1.45 }}>"{c.about.quote}"</div>
                <div style={{ fontFamily:'var(--fu)', fontSize:'.48rem', fontWeight:600, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--gold)', opacity:.65, marginTop:11 }}>FlyOriginals · Film Studio</div>
              </div>
            </div>
            <div style={{ position:'absolute', bottom:-16, left:'50%', transform:'translateX(-50%)' }}><Strip n={9} /></div>
          </div>
        )}
      </section>
      <div className="hdiv" />

      {/* ══ SHOWREEL ═══════════════════════════════════════════ */}
      <section style={{ position:'relative', height: mobile ? 240 : 'clamp(300px,42vw,520px)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center', opacity:.42 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,var(--bg) 0%,rgba(5,0,1,.45) 35%,rgba(5,0,1,.45) 65%,var(--bg) 100%)' }} />
        <div className="rv" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <a href="#" onMouseEnter={H} onMouseLeave={L} style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:16, textDecoration:'none', cursor: mobile ? 'pointer' : 'none' }}>
            <div style={{ width: mobile?64:78, height: mobile?64:78, borderRadius:'50%', border:'1px solid var(--bdr2)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .35s cubic-bezier(.16,1,.3,1)' }}
              onMouseOver={e => { e.currentTarget.style.transform='scale(1.12)'; e.currentTarget.style.borderColor='var(--gold3)'; e.currentTarget.style.background='rgba(184,144,48,.1)' }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--bdr2)'; e.currentTarget.style.background='transparent' }}
            >
              <span style={{ fontSize: mobile?'1.2rem':'1.5rem', marginLeft:3 }}>▶</span>
            </div>
            <div>
              <div style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize: mobile?'1.4rem':'clamp(1.5rem,3vw,2.4rem)', fontWeight:400, color:'var(--cream)', marginBottom:5 }}>Showreel ansehen</div>
              <div style={{ fontFamily:'var(--fu)', fontSize:'.56rem', fontWeight:600, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--gold2)', opacity:.7 }}>YouTube · 2025</div>
            </div>
          </a>
        </div>
      </section>
      <div className="hdiv" />

      {/* ══ PORTFOLIO ══════════════════════════════════════════ */}
      <section id="portfolio" style={{ background:'var(--bg2)', padding:SEC }}>
        <div className="rv" style={{ display:'flex', justifyContent:'space-between', alignItems: mobile?'flex-start':'flex-end', flexDirection: mobile?'column':'row', marginBottom: mobile?36:52, gap:16 }}>
          <div>
            <div className="eyebrow">{c.portfolio.eyebrow}</div>
            <h2 className="dh">{c.portfolio.title}<br /><em>Projekte &amp; Referenzen.</em></h2>
          </div>
          <Btn href="#kontakt">Alle anfragen →</Btn>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap:1, background:'var(--bdr)' }}>
          {c.portfolio.projects.map(p => <PCard key={p.n} {...p} mobile={mobile} />)}
        </div>
      </section>
      <div className="hdiv" />

      {/* ══ PHILOSOPHY ═════════════════════════════════════════ */}
      <section style={{ padding: mobile ? '72px 24px' : SEC, textAlign:'center' }}>
        <div className="rv" style={{ maxWidth:740, margin:'0 auto' }}>
          <div style={{ width:1, height:44, background:'linear-gradient(180deg,transparent,var(--gold))', margin:'0 auto 28px' }} />
          <blockquote style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize: mobile ? '1.5rem' : 'clamp(1.6rem,3.2vw,2.6rem)', fontWeight:400, color:'var(--cream)', lineHeight:1.2, marginBottom:24 }}>
            "Wir glauben daran, dass jede Geschichte es verdient,<br />
            <em style={{ color:'var(--gold3)' }}>perfekt</em> erzählt zu werden."
          </blockquote>
          <div style={{ width:1, height:44, background:'linear-gradient(180deg,var(--gold),transparent)', margin:'0 auto 20px' }} />
          <div style={{ fontFamily:'var(--fu)', fontSize:'.54rem', fontWeight:600, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--gold)', opacity:.6 }}>FlyOriginals · Film Studio</div>
        </div>
      </section>
      <div className="hdiv" />

      {/* ══ LIVE ═══════════════════════════════════════════════ */}
      <section id="live" style={{ background:'var(--bg2)', padding:SEC, display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr', gap: mobile?'44px':'clamp(48px,7vw,96px)', alignItems:'center' }}>
        <div>
          <div className="eyebrow rv">{c.live.eyebrow}</div>
          <h2 className="dh rv d1">{c.live.title}<br /><em>{c.live.subtitle}</em></h2>
          <div className="rule rv d2" />
          <p className="rv d2" style={{ fontFamily:'var(--fu)', fontWeight:400, fontSize:'.88rem', lineHeight:1.95, color:'var(--c60)', marginBottom:32 }}>{c.live.text}</p>

          <div className="rv d3" style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--bdr)', marginBottom:28, border:'1px solid var(--bdr)' }}>
            {[{icon:'📡',name:'Twitch',note:'Live Gaming & Events',url:c.live.twitch,color:'#9147ff'},{icon:'▶',name:'YouTube',note:'VODs & Highlights',url:c.live.youtube,color:'#ff0000'}].map(p => (
              <div key={p.name} onMouseEnter={H} onMouseLeave={L} style={{ display:'flex', alignItems:'center', gap:14, background:'var(--bg2)', padding:'14px 16px', cursor: mobile?'default':'none', transition:'background .22s' }}
                onMouseOver={e => e.currentTarget.style.background='var(--c04)'}
                onMouseOut={e => e.currentTarget.style.background='var(--bg2)'}
              >
                <div style={{ width:34, height:34, borderRadius:'50%', background:p.color+'22', border:`1px solid ${p.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.85rem', flexShrink:0 }}>{p.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--fu)', fontSize:'.78rem', fontWeight:600, color:'var(--cream)', marginBottom:2 }}>{p.name}</div>
                  <div style={{ fontFamily:'var(--fu)', fontSize:'.65rem', fontWeight:400, color:'var(--c40)' }}>{p.note}</div>
                </div>
                <div style={{ fontFamily:'var(--fu)', fontSize:'.58rem', fontWeight:400, color:'var(--gold2)', opacity:.7 }}>{p.url} →</div>
              </div>
            ))}
          </div>

          <div className="rv d4" style={{ display:'flex', gap:12 }}>
            <Btn href={c.socials?.twitch || '#'} red>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#ff5050', display:'inline-block', animation:'liveBlink 1.1s ease-in-out infinite', flexShrink:0 }} />
              Twitch folgen
            </Btn>
            <Btn href={c.socials?.youtube || '#'}>YouTube</Btn>
          </div>
        </div>

        <div className="rv d2">
          <div style={{ border:'1px solid var(--bdr)', overflow:'hidden' }}>
            <div style={{ aspectRatio:'16/9', position:'relative', background:'var(--bg3)' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', opacity:.3 }} />
              <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px)', pointerEvents:'none', opacity:.7 }} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:9 }}>
                <div style={{ fontSize:'2rem', opacity:.55 }}>📡</div>
                <div style={{ fontFamily:'var(--fu)', fontSize:'.52rem', fontWeight:600, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gold2)', opacity:.65 }}>Nächster Stream</div>
              </div>
              <div style={{ position:'absolute', top:11, left:11, background:'#cc0000', padding:'4px 9px', display:'flex', alignItems:'center', gap:5, fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:700, letterSpacing:'.12em', color:'white' }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'white', display:'inline-block', animation:'liveBlink 1s infinite' }} /> LIVE
              </div>
              <div style={{ position:'absolute', bottom:9, right:11, fontFamily:'var(--fu)', fontSize:'.42rem', letterSpacing:'.1em', color:'rgba(255,255,255,.2)', fontWeight:600 }}>■ REC 00:00:00</div>
            </div>
            <div style={{ padding:'14px 18px', background:'var(--bg3)', borderTop:'1px solid var(--bdr)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontFamily:'var(--fd)', fontSize:'1rem', fontWeight:400, color:'var(--cream)', marginBottom:2 }}>FlyOriginals Stream</div>
                <div style={{ fontFamily:'var(--fu)', fontSize:'.56rem', fontWeight:400, letterSpacing:'.07em', color:'var(--c40)' }}>Twitch · YouTube</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'var(--fu)', fontSize:'.48rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--gold)', opacity:.65 }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--gold)', display:'inline-block', animation:'liveBlink 1s infinite' }} /> Online
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="hdiv" />

      {/* ══ CONTACT ════════════════════════════════════════════ */}
      <section id="kontakt" style={{ padding:SEC }}>
        <div style={{ display:'grid', gridTemplateColumns: mobile?'1fr':'42fr 58fr', gap: mobile?'44px':'clamp(48px,7vw,96px)', alignItems:'start' }}>
          <div>
            <div className="eyebrow rv">{c.contact.eyebrow}</div>
            <h2 className="dh rv d1">{c.contact.title}<br /><em>{c.contact.subtitle}</em></h2>
            <div className="rule rv d2" />
            <p className="rv d2" style={{ fontFamily:'var(--fu)', fontWeight:400, fontSize:'.88rem', lineHeight:1.95, color:'var(--c60)', marginBottom:36 }}>{c.contact.text}</p>
            <div className="rv d3">
              {[['E-Mail',c.contact.email],['Twitch',c.contact.twitch],['YouTube',c.contact.youtube],['Instagram',c.contact.instagram]].map(([l,v]) => (
                <div key={l} onMouseEnter={H} onMouseLeave={L} style={{ padding:'14px 0', borderBottom:'1px solid var(--bdr)', cursor: mobile?'default':'none', transition:'padding-left .28s' }}
                  onMouseOver={e => !mobile && (e.currentTarget.style.paddingLeft='8px')}
                  onMouseOut={e => !mobile && (e.currentTarget.style.paddingLeft='0')}
                >
                  <div style={{ fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:600, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--gold)', opacity:.7, marginBottom:4 }}>{l}</div>
                  <div style={{ fontFamily:'var(--fu)', fontSize:'.82rem', fontWeight:400, color:'var(--c60)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rv d2">
            {sent ? (
              <div style={{ border:'1px solid var(--bdr2)', padding:mobile?'40px 24px':'56px 44px', textAlign:'center' }}>
                <div style={{ width:1, height:38, background:'linear-gradient(180deg,transparent,var(--gold))', margin:'0 auto 22px' }} />
                <div style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize:'1.6rem', fontWeight:400, color:'var(--cream)', marginBottom:10 }}>Nachricht gesendet.</div>
                <div style={{ fontFamily:'var(--fu)', fontWeight:400, fontSize:'.8rem', color:'var(--c40)', lineHeight:1.8 }}>Wir melden uns innerhalb von 24 Stunden.</div>
                <div style={{ width:1, height:38, background:'linear-gradient(180deg,var(--gold),transparent)', margin:'22px auto 0' }} />
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display:'flex', flexDirection:'column', gap:28 }}>
                <div style={{ display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr', gap:24 }}>
                  <div><label style={lblS}>Name</label><input style={inpS} type="text" required placeholder="Dein Name" value={form.name} onChange={upd('name')} onFocus={fcs} onBlur={blr} onMouseEnter={H} onMouseLeave={L} /></div>
                  <div><label style={lblS}>E-Mail</label><input style={inpS} type="email" required placeholder="deine@email.de" value={form.email} onChange={upd('email')} onFocus={fcs} onBlur={blr} onMouseEnter={H} onMouseLeave={L} /></div>
                </div>
                <div><label style={lblS}>Nachricht</label><textarea style={{ ...inpS, resize:'vertical', minHeight:130 }} required placeholder="Erzähl uns von deinem Projekt…" value={form.msg} onChange={upd('msg')} onFocus={fcs} onBlur={blr} onMouseEnter={H} onMouseLeave={L} /></div>
                <Btn red onClick={() => {}} full={mobile}>Nachricht senden →</Btn>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <div className="hdiv" />
      <footer style={{ background:'var(--bg2)' }}>
        <div style={{ borderBottom:'1px solid var(--bdr)', padding:`clamp(36px,4.5vw,60px) ${PAD}`, overflow:'hidden' }}>
          <div style={{ fontFamily:'var(--fd)', fontStyle:'italic', fontSize: mobile?'clamp(2.2rem,11vw,5rem)':'clamp(2.5rem,8vw,8rem)', fontWeight:300, color:'var(--c08)', lineHeight:1, letterSpacing:'-.02em', userSelect:'none', pointerEvents:'none', whiteSpace:'nowrap' }}>
            FlyOriginals
          </div>
        </div>
        <div style={{ padding:`20px ${PAD}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
          <div style={{ fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--c20)' }}>© {new Date().getFullYear()} FlyOriginals · Film Studio</div>
          <div style={{ display:'flex', gap: mobile?16:26, flexWrap:'wrap' }}>
            {[['Twitch',c.socials?.twitch||'#'],['YouTube',c.socials?.youtube||'#'],['Instagram',c.socials?.instagram||'#'],['TikTok',c.socials?.tiktok||'#']].map(([s,url]) => (
              <a key={s} href={url} onMouseEnter={H} onMouseLeave={L} style={{ fontFamily:'var(--fu)', fontSize:'.54rem', fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--c20)', textDecoration:'none', transition:'color .2s', cursor: mobile?'pointer':'none' }}
                onMouseOver={e => e.target.style.color='var(--gold2)'}
                onMouseOut={e => e.target.style.color='var(--c20)'}
              >{s}</a>
            ))}
          </div>
          <div style={{ display:'flex', gap:16 }}>
            {['Impressum','Datenschutz'].map(s => (
              <a key={s} href="#" onMouseEnter={H} onMouseLeave={L} style={{ fontFamily:'var(--fu)', fontSize:'.5rem', fontWeight:600, letterSpacing:'.13em', textTransform:'uppercase', color:'var(--c20)', textDecoration:'none', transition:'color .2s', cursor: mobile?'pointer':'none' }}
                onMouseOver={e => e.target.style.color='var(--c40)'}
                onMouseOut={e => e.target.style.color='var(--c20)'}
              >{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
