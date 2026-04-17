import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── scroll reveal ─────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.rv').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── animated number ───────────────────────────────────── */
function Count({ n, suffix = '' }) {
  const [v, setV] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      const target = parseInt(n), dur = 1600
      const step = Math.max(1, Math.ceil(target / (dur / 16)))
      let cur = 0
      const id = setInterval(() => { cur = Math.min(cur + step, target); setV(cur); if (cur >= target) clearInterval(id) }, 16)
    }, { threshold: 0.6 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [n])
  return (
    <div ref={ref}>
      <div style={{ fontFamily:'var(--display)', fontSize:'clamp(2rem,3.8vw,3rem)', fontWeight:300, color:'var(--gold)', lineHeight:1 }}>
        {v.toLocaleString('de')}{suffix}
      </div>
    </div>
  )
}

/* ── section wrapper ───────────────────────────────────── */
const S = ({ id, bg, children }) => (
  <section id={id} style={{ padding:'clamp(80px,10vw,130px) clamp(24px,6vw,90px)', background: bg || 'transparent', position:'relative' }}>
    {children}
  </section>
)

/* ── thin divider ──────────────────────────────────────── */
const Div = () => (
  <div style={{ height:1, background:'linear-gradient(90deg, transparent, var(--bdr-b), transparent)', margin:0 }} />
)

/* ── project card ──────────────────────────────────────── */
const PROJECTS = [
  { tag:'Kurzfilm', year:'2025', title:'Neon District', sub:'Sci-Fi Kurzfilm in der Innenstadt, gedreht auf Super-8.' },
  { tag:'Branded Content', year:'2024', title:'Summer Campaign', sub:'Vollständige Videokampagne für ein Lifestyle-Label.' },
  { tag:'Livestream', year:'2024', title:'Live Sessions', sub:'Monatliche Produktionen mit 2.000+ gleichzeitigen Zuschauern.' },
  { tag:'Fotografie', year:'2023', title:'Urban Portraits', sub:'Porträt-Serie für Musiker aus der lokalen Kreativszene.' },
  { tag:'YouTube', year:'2024', title:'The Long Way', sub:'Mini-Doku über eine 30-tägige Solofahrt durch Osteuropa.' },
  { tag:'Kurzfilm', year:'2024', title:'Into the Dark', sub:'Atmosphärischer Noir über Vertrauen und Verrat.' },
]

function Card({ tag, year, title, sub, i }) {
  const [h, setH] = useState(false)
  return (
    <div className={`rv ${i > 2 ? 'd2' : ''}`}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        borderBottom: '1px solid var(--bdr)', borderRight: i % 3 !== 2 ? '1px solid var(--bdr)' : 'none',
        padding: '36px 32px', position:'relative', overflow:'hidden', cursor:'default',
        background: h ? 'rgba(201,168,76,.04)' : 'transparent',
        transition:'background .3s',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, width: h ? '100%' : '0%', height:1, background:'var(--gold)', transition:'width .45s ease' }} />
      <div style={{ fontFamily:'var(--ui)', fontSize:'.58rem', fontWeight:600, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--gold)', marginBottom:16 }}>{tag} — {year}</div>
      <div style={{ fontFamily:'var(--display)', fontSize:'1.45rem', fontWeight:400, color:'var(--white)', marginBottom:10, lineHeight:1.15 }}>{title}</div>
      <div style={{ fontFamily:'var(--ui)', fontSize:'.78rem', fontWeight:300, color:'var(--white-60)', lineHeight:1.7 }}>{sub}</div>
      <div style={{ marginTop:22, fontFamily:'var(--ui)', fontSize:'.58rem', fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color: h ? 'var(--gold)' : 'transparent', transition:'color .25s' }}>Mehr erfahren →</div>
    </div>
  )
}

/* ── service row ───────────────────────────────────────── */
const SERVICES = [
  ['🎬', 'Kurzfilm & Regie'],
  ['📡', 'Livestreaming'],
  ['▶', 'YouTube Content'],
  ['📸', 'Fotografie'],
  ['🤝', 'Branded Content'],
]

/* ═══════════════════════════════════════════════════════ */
export default function HubPage() {
  const nav = useNavigate()
  const [eggN, setEggN] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', msg:'' })
  const [sent, setSent] = useState(false)
  useReveal()

  useEffect(() => { const t = setTimeout(() => setEggOn(true), 11000); return () => clearTimeout(t) }, [])
  const clickEgg = () => { const n = eggN + 1; setEggN(n); if (n >= 3) nav('/game/egg-clicker') }

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const baseInp = { width:'100%', padding:'13px 0', background:'transparent', border:'none', borderBottom:'1px solid var(--bdr)', color:'var(--white)', fontFamily:'var(--ui)', fontSize:'.85rem', fontWeight:300, outline:'none', transition:'border-color .2s' }
  const lbl = { fontFamily:'var(--ui)', fontSize:'.55rem', fontWeight:600, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gold)', display:'block', marginBottom:7 }
  const focus = e => { e.target.style.borderColor = 'var(--gold)' }
  const blur  = e => { e.target.style.borderColor = 'var(--bdr)' }

  return (
    <div style={{ background:'var(--bg)', paddingTop:62 }}>

      {/* ═══ HERO ════════════════════════════════════════ */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden' }}>

        {/* background image */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 40%', opacity:.45 }} />

        {/* gradients */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(110deg, rgba(14,0,4,.96) 38%, rgba(14,0,4,.55) 100%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'35%', background:'linear-gradient(180deg,transparent,var(--bg))' }} />

        {/* top / bottom lines */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent 5%,var(--bdr-b) 50%,transparent 95%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent 5%,var(--bdr-b) 50%,transparent 95%)' }} />

        {/* content */}
        <div style={{ position:'relative', zIndex:2, padding:'0 clamp(24px,6vw,90px)', maxWidth:820 }}>
          <div style={{ fontFamily:'var(--ui)', fontSize:'.6rem', fontWeight:600, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--gold)', marginBottom:28, display:'flex', alignItems:'center', gap:10, animation:'hIn 1s .1s both' }}>
            <span style={{ width:28, height:1, background:'var(--gold)', display:'inline-block' }} />
            Film Studio · Live · Content
          </div>
          <h1 style={{ fontFamily:'var(--display)', fontWeight:300, fontSize:'clamp(3rem,7.5vw,6.5rem)', lineHeight:.96, color:'var(--white)', marginBottom:30, animation:'hIn 1s .2s both' }}>
            Wir erzählen<br />
            <em style={{ fontStyle:'italic', color:'var(--gold)' }}>deine Geschichte.</em>
          </h1>
          <p style={{ fontFamily:'var(--ui)', fontWeight:300, fontSize:'clamp(.85rem,1.3vw,1rem)', lineHeight:1.85, color:'var(--white-60)', maxWidth:480, marginBottom:44, animation:'hIn 1s .35s both' }}>
            FlyOriginals ist ein unabhängiges Filmstudio für Kurzfilme, Livestreaming und Branded Content — Produktionen, die im Gedächtnis bleiben.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'hIn 1s .5s both' }}>
            <a href="#portfolio" className="btn btn-red">Portfolio ansehen</a>
            <a href="#kontakt" className="btn">Projekt anfragen</a>
          </div>
        </div>

        {/* scroll cue */}
        <div style={{ position:'absolute', bottom:38, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:7, zIndex:2, animation:'hIn 1s .7s both' }}>
          <div style={{ fontFamily:'var(--ui)', fontSize:'.52rem', fontWeight:500, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--white-25)' }}>Scroll</div>
          <div style={{ width:1, height:42, background:'linear-gradient(180deg,var(--gold),transparent)', animation:'pulse 2s ease-in-out infinite' }} />
        </div>

        {/* easter egg */}
        {eggOn && (
          <button onClick={clickEgg} style={{ position:'absolute', bottom:36, right:44, background:'none', border:'none', cursor:'pointer', fontSize:'.9rem', opacity: eggN > 0 ? .5 : .12, transition:'all .3s', transform: eggN > 0 ? 'scale(1.6)' : 'scale(1)', filter: eggN > 0 ? 'brightness(3)' : 'none', padding:4 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.5'}
            onMouseLeave={e => e.currentTarget.style.opacity = eggN > 0 ? '.5' : '.12'}
            title={eggN > 0 ? `${3 - eggN}× mehr…` : ''}
          >🥚</button>
        )}

        <style>{`
          @keyframes hIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
          @keyframes pulse{0%,100%{opacity:.3;transform:scaleY(.7)}50%{opacity:1;transform:scaleY(1)}}
          @keyframes dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.5)}}
        `}</style>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════ */}
      <Div />
      <div style={{ background:'var(--bg2)', padding:'clamp(36px,5vw,56px) clamp(24px,6vw,90px)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:32, textAlign:'center' }}>
        {[['50','+','Projekte'],['5','','Jahre'],['120','K','Reichweite'],['12','','Kunden']].map(([n,s,l]) => (
          <div key={l}>
            <Count n={n} suffix={s} />
            <div style={{ fontFamily:'var(--ui)', fontSize:'.58rem', fontWeight:500, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--white-60)', marginTop:7 }}>{l}</div>
          </div>
        ))}
      </div>
      <Div />

      {/* ═══ ABOUT ═══════════════════════════════════════ */}
      <S id="about">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(40px,7vw,100px)', alignItems:'center' }}>

          {/* text */}
          <div>
            <div className="eyebrow rv">Über uns</div>
            <h2 className="sh rv d1">Cineastisches<br /><em>Storytelling.</em></h2>
            <div className="gr rv d2" />
            <p className="rv d2" style={{ fontFamily:'var(--ui)', fontWeight:300, fontSize:'.88rem', lineHeight:1.9, color:'var(--white-60)', marginBottom:16 }}>
              FlyOriginals steht für unabhängige Filmproduktion mit einem Gespür für Atmosphäre und visuelle Identität. Wir produzieren Kurzfilme, Werbeclips und Live-Content — der nicht nach Budget aussieht, sondern nach Absicht.
            </p>
            <p className="rv d3" style={{ fontFamily:'var(--ui)', fontWeight:300, fontSize:'.88rem', lineHeight:1.9, color:'var(--white-60)', marginBottom:36 }}>
              Vom ersten Konzept bis zum finalen Schnitt begleiten wir jedes Projekt mit dem Anspruch, dass jeder Frame eine Aussage macht.
            </p>
            <div className="rv d4" style={{ display:'flex', flexDirection:'column', gap:0, borderTop:'1px solid var(--bdr)' }}>
              {SERVICES.map(([ico, txt]) => (
                <div key={txt} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom:'1px solid var(--bdr)', fontFamily:'var(--ui)', fontSize:'.72rem', fontWeight:400, letterSpacing:'.06em', color:'var(--white-60)' }}>
                  <span style={{ fontSize:'.95rem', opacity:.7 }}>{ico}</span>{txt}
                </div>
              ))}
            </div>
          </div>

          {/* image frame */}
          <div className="rv d2" style={{ position:'relative', aspectRatio:'3/4' }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 25%', opacity:.6 }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(170deg, rgba(176,0,42,.25) 0%, transparent 60%, rgba(14,0,4,.7) 100%)' }} />

            {/* corner frame decorations */}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
              <div key={v+h} style={{ position:'absolute', [v]:18, [h]:18, width:20, height:20,
                borderTop: v==='top'    ? '1px solid var(--gold)' : 'none',
                borderBottom: v==='bottom' ? '1px solid var(--gold)' : 'none',
                borderLeft: h==='left'  ? '1px solid var(--gold)' : 'none',
                borderRight: h==='right' ? '1px solid var(--gold)' : 'none',
              }} />
            ))}

            <div style={{ position:'absolute', bottom:24, left:24, right:24 }}>
              <div style={{ fontFamily:'var(--ui)', fontSize:'.52rem', fontWeight:600, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--gold)', marginBottom:6 }}>FlyOriginals</div>
              <div style={{ fontFamily:'var(--display)', fontStyle:'italic', fontSize:'1.05rem', fontWeight:300, color:'var(--white)', lineHeight:1.3 }}>
                "Jeder Frame<br />hat eine Aussage."
              </div>
            </div>
          </div>
        </div>
      </S>

      {/* ═══ PORTFOLIO ═══════════════════════════════════ */}
      <Div />
      <S id="portfolio" bg="var(--bg2)">
        <div className="rv" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:56, flexWrap:'wrap', gap:20 }}>
          <div>
            <div className="eyebrow">Portfolio</div>
            <h2 className="sh">Ausgewählte<br /><em>Arbeiten.</em></h2>
          </div>
          <a href="#kontakt" className="btn rv d2">Projekt anfragen →</a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid var(--bdr)', borderLeft:'1px solid var(--bdr)' }}>
          {PROJECTS.map((p, i) => <Card key={p.title} {...p} i={i} />)}
        </div>
      </S>
      <Div />

      {/* ═══ LIVE ════════════════════════════════════════ */}
      <S id="live">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(40px,7vw,100px)', alignItems:'center' }}>
          <div>
            <div className="eyebrow rv">Livestream</div>
            <h2 className="sh rv d1">Live dabei.<br /><em>Immer.</em></h2>
            <div className="gr rv d2" />
            <p className="rv d2" style={{ fontFamily:'var(--ui)', fontWeight:300, fontSize:'.88rem', lineHeight:1.9, color:'var(--white-60)', marginBottom:32 }}>
              Regelmäßige Live-Sessions auf Twitch und YouTube. Von Gaming-Streams bis zu Live-Filmproduktionen — die Community ist immer Teil des Prozesses.
            </p>
            <div className="rv d3" style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="#" className="btn btn-red" style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#ff4040', display:'inline-block', animation:'dot 1.2s ease-in-out infinite' }} />
                Twitch
              </a>
              <a href="#" className="btn">YouTube</a>
            </div>
          </div>

          {/* stream card */}
          <div className="rv d2">
            <div style={{ border:'1px solid var(--bdr)', overflow:'hidden' }}>
              <div style={{ aspectRatio:'16/9', position:'relative', overflow:'hidden', background:'var(--bg3)' }}>
                <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', opacity:.35 }} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
                  <div style={{ fontSize:'2.4rem' }}>📡</div>
                  <div style={{ fontFamily:'var(--ui)', fontSize:'.58rem', fontWeight:600, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gold)' }}>Nächster Stream</div>
                </div>
                <div style={{ position:'absolute', top:12, left:12, background:'#cc0000', padding:'4px 10px', display:'flex', alignItems:'center', gap:5, fontFamily:'var(--ui)', fontSize:'.52rem', fontWeight:700, letterSpacing:'.14em', color:'white' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'white', display:'inline-block', animation:'dot 1s ease-in-out infinite' }} />
                  LIVE
                </div>
              </div>
              <div style={{ padding:'16px 18px', background:'var(--bg2)', borderTop:'1px solid var(--bdr)' }}>
                <div style={{ fontFamily:'var(--display)', fontSize:'1.05rem', fontWeight:400, color:'var(--white)', marginBottom:3 }}>FlyOriginals Stream</div>
                <div style={{ fontFamily:'var(--ui)', fontSize:'.6rem', fontWeight:400, letterSpacing:'.08em', color:'var(--white-60)' }}>Twitch · YouTube</div>
              </div>
            </div>
          </div>
        </div>
      </S>

      {/* ═══ CONTACT ═════════════════════════════════════ */}
      <Div />
      <S id="kontakt" bg="var(--bg2)">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(40px,7vw,100px)', alignItems:'start' }}>

          {/* left */}
          <div>
            <div className="eyebrow rv">Kontakt</div>
            <h2 className="sh rv d1">Lass uns<br /><em>zusammenarbeiten.</em></h2>
            <div className="gr rv d2" />
            <p className="rv d2" style={{ fontFamily:'var(--ui)', fontWeight:300, fontSize:'.88rem', lineHeight:1.9, color:'var(--white-60)', marginBottom:36 }}>
              Hast du ein Projekt, eine Idee oder eine Kooperation im Kopf? Schreib uns — wir antworten schnell.
            </p>
            <div className="rv d3" style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[['📧','E-Mail','flyoriginals@email.de'],['📡','Twitch','twitch.tv/flyoriginals'],['▶','YouTube','youtube.com/flyoriginals']].map(([ico,lab,val]) => (
                <div key={lab} style={{ display:'flex', gap:16, padding:'14px 0', borderBottom:'1px solid var(--bdr)', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'.9rem', marginTop:2, opacity:.6 }}>{ico}</span>
                  <div>
                    <div style={{ fontFamily:'var(--ui)', fontSize:'.56rem', fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:2 }}>{lab}</div>
                    <div style={{ fontFamily:'var(--ui)', fontSize:'.8rem', color:'var(--white-60)' }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* form */}
          <div className="rv d2">
            {sent ? (
              <div style={{ border:'1px solid var(--bdr-b)', padding:'52px 36px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--display)', fontStyle:'italic', fontSize:'1.6rem', fontWeight:300, color:'var(--gold)', marginBottom:10 }}>Nachricht gesendet.</div>
                <div style={{ fontFamily:'var(--ui)', fontSize:'.8rem', color:'var(--white-60)', lineHeight:1.7 }}>Wir melden uns so schnell wie möglich bei dir.</div>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display:'flex', flexDirection:'column', gap:28 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                  <div><label style={lbl}>Name</label><input style={baseInp} type="text" required placeholder="Dein Name" value={form.name} onChange={upd('name')} onFocus={focus} onBlur={blur} /></div>
                  <div><label style={lbl}>E-Mail</label><input style={baseInp} type="email" required placeholder="deine@email.de" value={form.email} onChange={upd('email')} onFocus={focus} onBlur={blur} /></div>
                </div>
                <div><label style={lbl}>Nachricht</label><textarea style={{ ...baseInp, resize:'vertical', minHeight:120 }} required placeholder="Erzähl uns von deinem Projekt…" value={form.msg} onChange={upd('msg')} onFocus={focus} onBlur={blur} /></div>
                <button type="submit" className="btn btn-red" style={{ alignSelf:'flex-start', padding:'14px 32px' }}>Nachricht senden →</button>
              </form>
            )}
          </div>
        </div>
      </S>
      <Div />

      {/* ═══ FOOTER ══════════════════════════════════════ */}
      <footer style={{ padding:'32px clamp(24px,6vw,90px)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontFamily:'var(--display)', fontSize:'1.1rem', fontWeight:400, color:'var(--white)', marginBottom:3 }}>FlyOriginals</div>
          <div style={{ fontFamily:'var(--ui)', fontSize:'.52rem', fontWeight:500, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--white-25)' }}>© {new Date().getFullYear()} · Film Studio</div>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          {['Twitch','YouTube','Instagram','TikTok'].map(s => (
            <a key={s} href="#" style={{ fontFamily:'var(--ui)', fontSize:'.6rem', fontWeight:500, letterSpacing:'.16em', textTransform:'uppercase', color:'var(--white-25)', textDecoration:'none', transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='var(--gold)'}
              onMouseLeave={e=>e.target.style.color='var(--white-25)'}>{s}</a>
          ))}
        </div>
        <div style={{ fontFamily:'var(--ui)', fontSize:'.52rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--white-25)' }}>
          Impressum · Datenschutz
        </div>
      </footer>

    </div>
  )
}
