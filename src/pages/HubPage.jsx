import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function StatCounter({ value, suffix = '', label }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const target = parseInt(value)
        const step = Math.ceil(target / (1800 / 16))
        let cur = 0
        const t = setInterval(() => { cur = Math.min(cur + step, target); setCount(cur); if (cur >= target) clearInterval(t) }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>
        {count.toLocaleString('de')}{suffix}
      </div>
      <div style={{ fontFamily: 'var(--ff-label)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--white-dim)', marginTop: 6 }}>{label}</div>
    </div>
  )
}

function ProjectCard({ title, type, year, desc, emoji, delay }) {
  const [hov, setHov] = useState(false)
  return (
    <div className={`reveal ${delay || ''}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: '1px solid var(--border)', padding: '28px 24px', position: 'relative', overflow: 'hidden', transition: 'all 0.32s', background: hov ? 'rgba(201,168,76,0.04)' : 'transparent', borderColor: hov ? 'var(--border-bright)' : 'var(--border)', transform: hov ? 'translateY(-3px)' : 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--crimson-bright),transparent)', opacity: hov ? 1 : 0, transition: 'opacity 0.3s' }} />
      <div style={{ fontSize: '1.8rem', marginBottom: 14 }}>{emoji}</div>
      <div style={{ fontFamily: 'var(--ff-label)', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{type} · {year}</div>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.28rem', fontWeight: 400, color: 'var(--white)', marginBottom: 10, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--white-dim)', lineHeight: 1.65, fontFamily: 'var(--ff-body)', fontWeight: 300 }}>{desc}</div>
    </div>
  )
}

function Pill({ icon, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--border)', padding: '8px 16px', fontFamily: 'var(--ff-label)', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white-dim)' }}>
      <span>{icon}</span>{label}
    </div>
  )
}

function CornerFrame() {
  const corners = [['top','left'],['top','right'],['bottom','left'],['bottom','right']]
  return corners.map(([v,h]) => (
    <div key={v+h} style={{ position:'absolute',[v]:16,[h]:16,width:22,height:22,
      borderTop: v==='top'?'2px solid var(--gold)':'none',
      borderBottom: v==='bottom'?'2px solid var(--gold)':'none',
      borderLeft: h==='left'?'2px solid var(--gold)':'none',
      borderRight: h==='right'?'2px solid var(--gold)':'none' }} />
  ))
}

export default function HubPage() {
  const navigate = useNavigate()
  const [eggClicks, setEggClicks] = useState(0)
  const [eggVisible, setEggVisible] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const [sent, setSent] = useState(false)
  useReveal()

  useEffect(() => { const t = setTimeout(() => setEggVisible(true), 9000); return () => clearTimeout(t) }, [])

  function handleEgg() {
    const n = eggClicks + 1
    setEggClicks(n)
    if (n >= 3) navigate('/game/egg-clicker')
  }

  const inp = { width:'100%', padding:'12px 0', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', color:'var(--white)', fontFamily:'var(--ff-body)', fontSize:'0.88rem', outline:'none', transition:'border-color 0.22s' }
  const lbl = { fontFamily:'var(--ff-label)', fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--gold)', display:'block', marginBottom:8 }
  const S = ({ id, children, style={} }) => <section id={id} style={{ padding:'clamp(72px,9vh,120px) clamp(24px,6vw,90px)', position:'relative', ...style }}>{children}</section>

  return (
    <div style={{ background:'var(--crimson)', paddingTop:64 }}>
      <style>{`
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes liveDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
        @keyframes scrollBar{0%,100%{opacity:.35;transform:scaleY(.75)}50%{opacity:1;transform:scaleY(1)}}
      `}</style>

      {/* ── HERO ── */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center', opacity:.5 }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 40% 50%, transparent 20%, rgba(20,0,6,.88) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(20,0,6,.25) 0%, transparent 35%, rgba(20,0,6,.92) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'var(--gold)', opacity:.2 }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, background:'var(--gold)', opacity:.2 }} />

        <div style={{ position:'relative', zIndex:2, padding:'clamp(24px,6vw,90px)', maxWidth:860 }}>
          <div className="section-label reveal" style={{ marginBottom:22 }}>Film Studio · Live · Content</div>
          <h1 style={{ fontFamily:'var(--ff-display)', fontWeight:300, fontSize:'clamp(3rem,8vw,6.8rem)', lineHeight:.96, color:'var(--white)', marginBottom:26, animation:'heroIn 1.1s cubic-bezier(0.16,1,0.3,1) both' }}>
            Wir erzählen<br/><em style={{ color:'var(--gold)', fontStyle:'italic' }}>deine Geschichte.</em>
          </h1>
          <p style={{ fontFamily:'var(--ff-body)', fontWeight:300, fontSize:'clamp(.9rem,1.4vw,1.05rem)', lineHeight:1.8, color:'var(--white-dim)', maxWidth:500, marginBottom:38, animation:'heroIn 1.1s .18s cubic-bezier(0.16,1,0.3,1) both' }}>
            FlyOriginals ist ein unabhängiges Filmstudio für Kurzfilme, Branded Content, Livestreaming und visuelle Geschichten — die bleiben.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'heroIn 1.1s .35s cubic-bezier(0.16,1,0.3,1) both' }}>
            <a href="#portfolio" className="btn-cta btn-cta-solid">Portfolio ansehen</a>
            <a href="#contact" className="btn-cta">Projekt anfragen</a>
          </div>
        </div>

        {/* scroll indicator */}
        <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, zIndex:2, animation:'heroIn 1.1s .6s both' }}>
          <div style={{ fontFamily:'var(--ff-label)', fontSize:'.58rem', letterSpacing:'.25em', textTransform:'uppercase', color:'var(--white-dim)' }}>Scroll</div>
          <div style={{ width:1, height:38, background:'linear-gradient(180deg,var(--gold),transparent)', animation:'scrollBar 2s ease-in-out infinite' }} />
        </div>

        {/* Easter Egg */}
        {eggVisible && (
          <div onClick={handleEgg} style={{ position:'absolute', bottom:36, right:36, zIndex:10, fontSize:'.85rem', opacity: eggClicks>0?.45:.14, cursor:'pointer', transition:'all .3s', transform: eggClicks>0?'scale(1.5)':'scale(1)', filter: eggClicks>0?'brightness(2.5)':'none' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.55'}
            onMouseLeave={e=>e.currentTarget.style.opacity=eggClicks>0?'.45':'.14'}
            title={eggClicks>0?`${3-eggClicks} mehr…`:''}
          >🥚</div>
        )}
      </section>

      {/* ── STATS ── */}
      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--crimson-mid)', padding:'clamp(28px,5vh,50px) clamp(24px,6vw,90px)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:20 }}>
        <StatCounter value="50" suffix="+" label="Projekte" />
        <StatCounter value="5" suffix="" label="Jahre Erfahrung" />
        <StatCounter value="120" suffix="K" label="Reichweite" />
        <StatCounter value="12" suffix="" label="Kunden" />
      </div>

      {/* ── ABOUT ── */}
      <S id="about">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(36px,6vw,90px)', alignItems:'center' }}>
          <div>
            <div className="section-label reveal">Über uns</div>
            <h2 className="section-title reveal reveal-d1">Cineastisches<br/><em style={{ color:'var(--gold)', fontStyle:'italic' }}>Storytelling.</em></h2>
            <div className="gold-line reveal reveal-d2" />
            <p className="reveal reveal-d2" style={{ fontFamily:'var(--ff-body)', fontWeight:300, fontSize:'.9rem', lineHeight:1.85, color:'var(--white-dim)', marginBottom:18 }}>
              FlyOriginals steht für unabhängige Filmproduktion mit einem Gespür für Atmosphäre, Tempo und visuelle Identität. Wir produzieren Kurzfilme, Werbeclips und Live-Content — der nicht nach Budget aussieht, sondern nach Absicht.
            </p>
            <p className="reveal reveal-d3" style={{ fontFamily:'var(--ff-body)', fontWeight:300, fontSize:'.9rem', lineHeight:1.85, color:'var(--white-dim)', marginBottom:30 }}>
              Vom ersten Konzept bis zum finalen Schnitt begleiten wir jedes Projekt mit dem Anspruch, dass jeder Frame eine Aussage macht.
            </p>
            <div className="reveal reveal-d4" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <Pill icon="🎬" label="Kurzfilm" />
              <Pill icon="📡" label="Livestream" />
              <Pill icon="▶" label="YouTube" />
              <Pill icon="📸" label="Fotografie" />
              <Pill icon="🤝" label="Branded" />
            </div>
          </div>
          <div className="reveal reveal-d2" style={{ position:'relative', aspectRatio:'4/5', maxWidth:400 }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', backgroundPosition:'center 30%', opacity:.65 }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,var(--crimson-bright) 0%,transparent 55%)', opacity:.3 }} />
            <CornerFrame />
            <div style={{ position:'absolute', bottom:18, left:18, right:18 }}>
              <div style={{ fontFamily:'var(--ff-label)', fontSize:'.58rem', letterSpacing:'.25em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>FlyOriginals</div>
              <div style={{ fontFamily:'var(--ff-display)', fontStyle:'italic', fontSize:'1rem', color:'var(--white)' }}>"Jeder Frame hat eine Aussage."</div>
            </div>
          </div>
        </div>
      </S>

      {/* ── PORTFOLIO ── */}
      <S id="portfolio" style={{ background:'var(--crimson-mid)' }}>
        <div className="reveal" style={{ marginBottom:46 }}>
          <div className="section-label">Portfolio</div>
          <h2 className="section-title">Ausgewählte<br/><em style={{ color:'var(--gold)', fontStyle:'italic' }}>Arbeiten.</em></h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:1, background:'var(--border)' }}>
          {[
            { title:'Into the Dark', type:'Kurzfilm', year:'2024', emoji:'🎬', desc:'Atmosphärischer Noir-Kurzfilm über Vertrauen und Verrat in einer Stadt ohne Licht.' },
            { title:'Summer Campaign', type:'Branded Content', year:'2024', emoji:'🎯', desc:'Video-Kampagne für ein lokales Lifestyle-Label. Konzept bis Schnitt.', delay:'reveal-d1' },
            { title:'Live Sessions', type:'Livestream', year:'2023', emoji:'📡', desc:'Monatliche Live-Produktionen mit bis zu 2.000 gleichzeitigen Zuschauern.', delay:'reveal-d2' },
            { title:'Urban Portraits', type:'Fotografie', year:'2023', emoji:'📸', desc:'Porträt-Serie für Musiker und Künstler aus der lokalen Kreativszene.' },
            { title:'The Long Way', type:'YouTube', year:'2024', emoji:'▶', desc:'Mini-Dokumentation über eine 30-tägige Solo-Reise durch Osteuropa.', delay:'reveal-d1' },
            { title:'Neon District', type:'Kurzfilm', year:'2025', emoji:'🌆', desc:'Experimentelle Sci-Fi-Produktion. Gedreht auf Super-8, colorgraded in DaVinci.', delay:'reveal-d2' },
          ].map(p => <ProjectCard key={p.title} {...p} />)}
        </div>
        <div className="reveal reveal-d3" style={{ marginTop:38, textAlign:'center' }}>
          <a href="#contact" className="btn-cta">Dein Projekt anfragen →</a>
        </div>
      </S>

      {/* ── LIVE ── */}
      <S id="live">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(36px,6vw,90px)', alignItems:'center' }}>
          <div>
            <div className="section-label reveal">Livestream</div>
            <h2 className="section-title reveal reveal-d1">Live dabei.<br/><em style={{ color:'var(--gold)', fontStyle:'italic' }}>Immer.</em></h2>
            <div className="gold-line reveal reveal-d2" />
            <p className="reveal reveal-d2" style={{ fontFamily:'var(--ff-body)', fontWeight:300, fontSize:'.9rem', lineHeight:1.85, color:'var(--white-dim)', marginBottom:28 }}>
              Regelmäßige Live-Sessions auf Twitch und YouTube. Von Gaming-Streams bis zu Live-Filmproduktionen — die Community ist immer Teil des Prozesses.
            </p>
            <div className="reveal reveal-d3" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <a href="#" className="btn-cta btn-cta-solid" style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'#FF4040',animation:'liveDot 1.2s infinite',display:'inline-block' }} />
                Twitch folgen
              </a>
              <a href="#" className="btn-cta">YouTube abonnieren</a>
            </div>
          </div>

          <div className="reveal reveal-d2" style={{ border:'1px solid var(--border)' }}>
            <div style={{ background:'var(--crimson-mid)', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/bg.jpg)', backgroundSize:'cover', opacity:.35 }} />
              <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
                <div style={{ fontSize:'2.8rem', marginBottom:8 }}>📡</div>
                <div style={{ fontFamily:'var(--ff-label)', fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)' }}>Nächster Stream</div>
              </div>
              <div style={{ position:'absolute', top:10, left:10, background:'#CC0000', color:'white', fontFamily:'var(--ff-label)', fontSize:'.58rem', fontWeight:700, letterSpacing:'.14em', padding:'3px 8px', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:5,height:5,borderRadius:'50%',background:'white',animation:'liveDot 1.2s infinite',display:'inline-block' }} />LIVE
              </div>
            </div>
            <div style={{ padding:'13px 16px', background:'var(--crimson-mid)' }}>
              <div style={{ fontFamily:'var(--ff-display)', fontSize:'1rem', color:'var(--white)', marginBottom:3 }}>FlyOriginals Stream</div>
              <div style={{ fontFamily:'var(--ff-label)', fontSize:'.62rem', color:'var(--white-dim)', letterSpacing:'.1em' }}>Twitch · YouTube</div>
            </div>
          </div>
        </div>
      </S>

      {/* ── CONTACT ── */}
      <S id="contact" style={{ background:'var(--crimson-mid)' }}>
        <div style={{ maxWidth:620, margin:'0 auto', textAlign:'center' }}>
          <div className="section-label reveal" style={{ justifyContent:'center' }}>Kontakt</div>
          <h2 className="section-title reveal reveal-d1" style={{ marginBottom:14 }}>
            Lass uns<br/><em style={{ color:'var(--gold)', fontStyle:'italic' }}>zusammenarbeiten.</em>
          </h2>
          <p className="reveal reveal-d2" style={{ fontFamily:'var(--ff-body)', fontWeight:300, fontSize:'.88rem', color:'var(--white-dim)', lineHeight:1.8, marginBottom:44 }}>
            Hast du ein Projekt, eine Idee oder eine Kooperation im Kopf? Wir freuen uns über jede Anfrage.
          </p>
          {sent ? (
            <div style={{ border:'1px solid var(--border-bright)', padding:'38px 28px' }}>
              <div style={{ fontFamily:'var(--ff-display)', fontSize:'1.5rem', fontWeight:300, color:'var(--gold)', marginBottom:8 }}>Nachricht gesendet ✓</div>
              <div style={{ fontFamily:'var(--ff-body)', color:'var(--white-dim)', fontSize:'.85rem' }}>Wir melden uns so schnell wie möglich.</div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display:'flex', flexDirection:'column', gap:22, textAlign:'left' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22 }}>
                <div><label style={lbl}>Name</label><input style={inp} type="text" required placeholder="Dein Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
                <div><label style={lbl}>E-Mail</label><input style={inp} type="email" required placeholder="deine@email.de" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
              </div>
              <div><label style={lbl}>Nachricht</label><textarea style={{...inp,resize:'vertical',minHeight:110}} required placeholder="Erzähl uns von deinem Projekt…" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
              <button type="submit" className="btn-cta btn-cta-solid" style={{ alignSelf:'flex-start', padding:'13px 34px' }}>Nachricht senden →</button>
            </form>
          )}
        </div>
      </S>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'36px clamp(24px,6vw,90px)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontFamily:'var(--ff-display)', fontSize:'1.15rem', color:'var(--white)', marginBottom:3 }}>FlyOriginals</div>
          <div style={{ fontFamily:'var(--ff-label)', fontSize:'.58rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--white-dim)' }}>© {new Date().getFullYear()} Film Studio</div>
        </div>
        <div style={{ display:'flex', gap:22 }}>
          {['Twitch','YouTube','Instagram','TikTok'].map(s => (
            <a key={s} href="#" style={{ fontFamily:'var(--ff-label)', fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--white-dim)', textDecoration:'none', transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='var(--gold)'} onMouseLeave={e=>e.target.style.color='var(--white-dim)'}>{s}</a>
          ))}
        </div>
        <div style={{ fontFamily:'var(--ff-label)', fontSize:'.58rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--white-dim)' }}>
          Impressum · Datenschutz
        </div>
      </footer>
    </div>
  )
}
