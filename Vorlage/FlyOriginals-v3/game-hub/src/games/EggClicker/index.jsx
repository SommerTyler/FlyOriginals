import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../App'
import { useMedia } from '../../hooks/useMedia'
import Scene from './Scene'
import {
  BUILDINGS, UPGRADES, ACHIEVEMENTS, NEWS,
  calcEPS, buildingCost, PRESTIGE_THRESHOLD, prestigeMultiplier
} from './gameData'

/* ── helpers ── */
const fmt = n => {
  if (n >= 1e15) return (n/1e15).toFixed(2)+' Quad.'
  if (n >= 1e12) return (n/1e12).toFixed(2)+' Bio.'
  if (n >= 1e9)  return (n/1e9).toFixed(2)+' Mrd.'
  if (n >= 1e6)  return (n/1e6).toFixed(2)+' Mio.'
  if (n >= 1e3)  return (n/1e3).toFixed(1)+'K'
  return Math.floor(n).toLocaleString('de')
}
const fmtT = s => {
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=Math.floor(s%60)
  return h?`${h}h ${m}m`:`${m}m ${ss}s`
}

/* ── audio ── */
let _ac
const ac = () => { if (!_ac) _ac = new (window.AudioContext||window.webkitAudioContext)(); return _ac }
const snd = type => {
  try {
    const ctx=ac(), now=ctx.currentTime
    const o=ctx.createOscillator(), g=ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    if (type==='click') {
      o.frequency.setValueAtTime(520,now); o.frequency.exponentialRampToValueAtTime(260,now+.09)
      g.gain.setValueAtTime(.11,now); g.gain.exponentialRampToValueAtTime(.001,now+.09)
      o.start(now); o.stop(now+.09)
    } else if (type==='buy') {
      o.type='triangle'
      o.frequency.setValueAtTime(440,now); o.frequency.setValueAtTime(660,now+.1)
      g.gain.setValueAtTime(.14,now); g.gain.exponentialRampToValueAtTime(.001,now+.32)
      o.start(now); o.stop(now+.32)
    } else if (type==='ach') {
      [523,659,784,1046].forEach((f,i) => {
        const o2=ctx.createOscillator(),g2=ctx.createGain()
        o2.connect(g2); g2.connect(ctx.destination); o2.type='triangle'
        o2.frequency.setValueAtTime(f,now+i*.1)
        g2.gain.setValueAtTime(.13,now+i*.1); g2.gain.exponentialRampToValueAtTime(.001,now+i*.1+.3)
        o2.start(now+i*.1); o2.stop(now+i*.1+.32)
      })
    } else if (type==='gold') {
      o.type='sine'
      o.frequency.setValueAtTime(880,now); o.frequency.exponentialRampToValueAtTime(1760,now+.42)
      g.gain.setValueAtTime(.18,now); g.gain.exponentialRampToValueAtTime(.001,now+.45)
      o.start(now); o.stop(now+.45)
    } else if (type==='prestige') {
      [262,330,392,523,659,784].forEach((f,i) => {
        const o2=ctx.createOscillator(),g2=ctx.createGain()
        o2.connect(g2); g2.connect(ctx.destination); o2.type='sine'
        o2.frequency.setValueAtTime(f,now+i*.12)
        g2.gain.setValueAtTime(.18,now+i*.12); g2.gain.exponentialRampToValueAtTime(.001,now+i*.12+.5)
        o2.start(now+i*.12); o2.stop(now+i*.12+.55)
      })
    }
  } catch {}
}

/* ── initial state ── */
const mkState = (prestige = 0) => ({
  eggs: 0, total: 0, epc: 1, eps: 0,
  clicks: 0, golden: 0, godEgg: false,
  startTime: Date.now(), prestige,
  prestigeMulti: prestigeMultiplier(prestige),
  bld: BUILDINGS.map(() => 0),
  bldMult: BUILDINGS.map(() => 1),
  upgDone: UPGRADES.map(() => false),
  achUnlocked: [],
})

function loadLocal() {
  try { const r=localStorage.getItem('egc_v4'); return r?JSON.parse(r):null } catch { return null }
}

/* ── prestige modal ── */
function PrestigeModal({ onConfirm, onCancel, prestige, eps }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(8px)' }}>
      <div style={{ background:'#0c0004',border:'1px solid rgba(184,144,48,.4)',padding:'36px 32px',maxWidth:420,width:'100%',textAlign:'center',animation:'slideUp .3s ease' }}>
        <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div style={{ fontSize:'2.5rem', marginBottom:16 }}>⭐</div>
        <div style={{ fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'1.7rem',fontWeight:400,color:'#ece0cc',marginBottom:8 }}>Prestige durchführen</div>
        <div style={{ fontFamily:'Syne,sans-serif',fontSize:'.6rem',fontWeight:600,letterSpacing:'.22em',textTransform:'uppercase',color:'#b89030',marginBottom:20,opacity:.75 }}>Prestige #{prestige + 1}</div>
        <div style={{ fontFamily:'Syne,sans-serif',fontSize:'.82rem',fontWeight:400,lineHeight:1.8,color:'rgba(236,224,204,.6)',marginBottom:8 }}>
          Du setzt deinen Fortschritt zurück und erhältst dauerhaft:
        </div>
        <div style={{ fontFamily:'Cormorant Garamond,serif',fontStyle:'italic',fontSize:'1.3rem',color:'#cca848',marginBottom:8 }}>
          +10% Produktionsbonus
        </div>
        <div style={{ fontFamily:'Syne,sans-serif',fontSize:'.7rem',color:'rgba(236,224,204,.4)',marginBottom:24 }}>
          (Gesamt nach Prestige: {((prestige+1)*10)}% Bonus)<br />
          Achievements bleiben erhalten.
        </div>
        <div style={{ fontFamily:'Syne,sans-serif',fontSize:'.72rem',color:'rgba(236,224,204,.5)',marginBottom:24 }}>
          ⚠ Dein Spielstand wird zurückgesetzt. Gebäude, Upgrades und Eier gehen verloren.
        </div>
        <div style={{ display:'flex',gap:12,justifyContent:'center' }}>
          <button onClick={onConfirm} style={{ padding:'12px 28px',background:'#920020',border:'1px solid #b5002a',color:'#ece0cc',fontFamily:'Syne,sans-serif',fontSize:'.6rem',fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',cursor:'pointer',transition:'background .2s' }}
            onMouseOver={e=>e.currentTarget.style.background='#b5002a'}
            onMouseOut={e=>e.currentTarget.style.background='#920020'}
          >⭐ Jetzt Prestige!</button>
          <button onClick={onCancel} style={{ padding:'12px 28px',background:'transparent',border:'1px solid rgba(184,144,48,.3)',color:'rgba(236,224,204,.5)',fontFamily:'Syne,sans-serif',fontSize:'.6rem',fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s' }}
            onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(184,144,48,.6)';e.currentTarget.style.color='rgba(236,224,204,.8)'}}
            onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(184,144,48,.3)';e.currentTarget.style.color='rgba(236,224,204,.5)'}}
          >Abbrechen</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function EggClicker() {
  const { user, profile } = useAuth()
  const { isMobile } = useMedia()
  const [gs, setGs] = useState(() => loadLocal() || mkState(0))
  const [floats, setFloats] = useState([])
  const [achQueue, setAchQueue] = useState([])
  const [showAch, setShowAch] = useState(null)
  const [tab, setTab] = useState('bld')
  const [goldenEgg, setGoldenEgg] = useState(null)
  const [toast, setToast] = useState('')
  const [newsIdx, setNewsIdx] = useState(0)
  const [showPrestige, setShowPrestige] = useState(false)
  const [eggShake, setEggShake] = useState(false)
  const floatId = useRef(0)
  const gsRef = useRef(gs)
  const loopRef = useRef(null)
  const lastT = useRef(performance.now())
  const achRef = useRef(new Set(gs.achUnlocked))
  let toastTimer = useRef(null)

  useEffect(() => { gsRef.current = gs }, [gs])

  /* ── derived EPS including prestige multiplier ── */
  const derivedEps = useMemo(() => calcEPS(gs) * gs.prestigeMulti, [gs.bld, gs.bldMult, gs.prestigeMulti])

  /* ── game loop ── */
  useEffect(() => {
    const loop = now => {
      const dt = Math.min((now - lastT.current) / 1000, 0.1)
      lastT.current = now
      setGs(prev => {
        const eps = calcEPS(prev) * prev.prestigeMulti
        const gained = eps * dt
        return { ...prev, eggs: prev.eggs + gained, total: prev.total + gained, eps }
      })
      loopRef.current = requestAnimationFrame(loop)
    }
    loopRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(loopRef.current)
  }, [])

  /* ── achievement checker ── */
  useEffect(() => {
    const s = { ...gs, eps: derivedEps }
    ACHIEVEMENTS.forEach(a => {
      if (!achRef.current.has(a.id) && a.ck(s)) {
        achRef.current.add(a.id)
        setGs(prev => ({ ...prev, achUnlocked: [...prev.achUnlocked, a.id] }))
        setAchQueue(q => [...q, a])
        snd('ach')
      }
    })
  }, [gs.total, gs.clicks, gs.golden, gs.prestige, gs.bld, derivedEps])

  /* ── ach popup queue ── */
  useEffect(() => {
    if (!achQueue.length || showAch) return
    const next = achQueue[0]
    setShowAch(next)
    setAchQueue(q => q.slice(1))
    const t = setTimeout(() => setShowAch(null), 3200)
    return () => clearTimeout(t)
  }, [achQueue, showAch])

  /* ── golden egg timer ── */
  useEffect(() => {
    let timer
    const schedule = () => {
      timer = setTimeout(() => {
        setGoldenEgg({ id: Date.now(), x: 15 + Math.random()*60, y: 18 + Math.random()*45 })
        setTimeout(() => setGoldenEgg(null), 10000)
        schedule()
      }, 30000 + Math.random()*90000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  /* ── news ticker ── */
  useEffect(() => {
    const t = setInterval(() => setNewsIdx(i => (i+1) % NEWS.length), 28000)
    return () => clearInterval(t)
  }, [])

  /* ── auto-save ── */
  useEffect(() => {
    const t = setInterval(saveGame, 30000)
    return () => clearInterval(t)
  }, [])

  /* ── load from Supabase ── */
  useEffect(() => {
    if (!user) return
    supabase.from('game_saves').select('save_data').eq('user_id', user.id).eq('game_id', 'egg-clicker').single()
      .then(({ data }) => {
        if (!data?.save_data) return
        const remote = data.save_data, local = loadLocal()
        const best = (!local || remote.total > local.total) ? remote : local
        setGs({ ...mkState(best.prestige||0), ...best })
        achRef.current = new Set(best.achUnlocked||[])
        showToast('☁️ Spielstand geladen!')
      })
  }, [user])

  /* ── actions ── */
  const handleClick = useCallback(e => {
    snd('click')
    setEggShake(true); setTimeout(() => setEggShake(false), 180)
    setGs(prev => {
      const gain = prev.godEgg ? Math.max(calcEPS(prev) * prev.prestigeMulti, 1) : prev.epc
      floatId.current++
      const id = floatId.current
      setFloats(f => [...f.slice(-14), { id, x: e?.clientX || 400, y: e?.clientY || 300, val: gain }])
      setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id)), 1000)
      return { ...prev, eggs: prev.eggs + gain, total: prev.total + gain, clicks: prev.clicks + 1 }
    })
  }, [])

  const buyBuilding = useCallback(idx => {
    setGs(prev => {
      const cost = buildingCost(idx, prev.bld[idx])
      if (prev.eggs < cost) return prev
      snd('buy')
      const newBld = [...prev.bld]; newBld[idx]++
      return { ...prev, eggs: prev.eggs - cost, bld: newBld }
    })
  }, [])

  const buyUpgrade = useCallback((u, ui) => {
    setGs(prev => {
      if (prev.upgDone[ui] || prev.eggs < u.cost || !u.show(prev)) return prev
      snd('buy')
      const newDone = [...prev.upgDone]; newDone[ui] = true
      return u.fx({ ...prev, upgDone: newDone })
    })
  }, [])

  const catchGolden = useCallback(() => {
    snd('gold')
    setGoldenEgg(null)
    setGs(prev => {
      const bonus = Math.max(calcEPS(prev) * prev.prestigeMulti * 60, 100)
      floatId.current++
      setFloats(f => [...f, { id: floatId.current, x: window.innerWidth*.5, y: window.innerHeight*.4, val: bonus, gold: true }])
      return { ...prev, eggs: prev.eggs + bonus, total: prev.total + bonus, golden: prev.golden + 1 }
    })
    showToast('🌟 Goldenes Ei! +60s Bonus!')
  }, [])

  /* ── prestige ── */
  const doPrestige = useCallback(() => {
    const newPrestige = (gsRef.current.prestige||0) + 1
    snd('prestige')
    const achs = gsRef.current.achUnlocked
    const fresh = mkState(newPrestige)
    fresh.achUnlocked = achs
    setGs(fresh)
    achRef.current = new Set(achs)
    setShowPrestige(false)
    localStorage.setItem('egc_v4', JSON.stringify(fresh))
    showToast(`⭐ Prestige #${newPrestige} aktiv! +${newPrestige*10}% Bonus!`)
  }, [])

  /* ── save / reset ── */
  async function saveGame() {
    const state = gsRef.current
    localStorage.setItem('egc_v4', JSON.stringify(state))
    if (!user) return
    const score = Math.floor(state.total)
    try {
      await supabase.from('game_saves').upsert({ user_id: user.id, game_id: 'egg-clicker', save_data: state, updated_at: new Date().toISOString() }, { onConflict:'user_id,game_id' })
      await supabase.from('leaderboard').upsert({ user_id: user.id, game_id: 'egg-clicker', score, score_label: fmt(score)+' Eier', updated_at: new Date().toISOString() }, { onConflict:'user_id,game_id' })
    } catch {}
    showToast('💾 Gespeichert!')
  }

  function resetGame() {
    if (!confirm('Spielstand wirklich löschen?')) return
    localStorage.removeItem('egc_v4')
    const fresh = mkState(0)
    setGs(fresh); achRef.current = new Set()
    showToast('🗑 Zurückgesetzt!')
  }

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2400)
  }

  /* ── derived for render ── */
  const sceneBuildings = useMemo(() => BUILDINGS.map((b,i) => ({ ...b, cnt: gs.bld[i] })), [gs.bld])
  const achSet = useMemo(() => new Set(gs.achUnlocked), [gs.achUnlocked])
  const visUpgrades = useMemo(() =>
    UPGRADES.map((u,i) => ({ ...u, done: gs.upgDone[i], i })).filter(u => u.done || u.show(gs)),
  [gs.total, gs.bld, gs.upgDone])

  const eggFace = useMemo(() => {
    const faces = [[0,'🐣'],[100,'🥚'],[5000,'🐔'],[1e5,'🌟'],[1e7,'👑'],[1e10,'🌌'],[1e13,'♾']]
    let f = '🐣'
    for (const [t,e] of faces) if (gs.total >= t) f = e
    return f
  }, [gs.total])

  const canPrestige = gs.total >= PRESTIGE_THRESHOLD

  /* ── STYLES ── */
  const PS = { display:'flex', flexDirection:'column', overflow:'hidden', background:'#0c0004', flexShrink:0 }
  const TAB_BTN = (active) => ({
    flex:1, padding:'7px 2px', background:'none', border:'none',
    borderBottom: active ? '2px solid #b89030' : '2px solid transparent',
    marginBottom:-1, cursor:'pointer', fontFamily:'Syne,sans-serif', fontSize:'.58rem',
    fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase',
    color: active ? '#b89030' : 'rgba(236,224,204,.35)', transition:'color .2s',
  })

  const prestige = gs.prestige || 0

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, fontFamily:'Syne,sans-serif', overflow:'hidden' }}>

      {/* ── Float labels ── */}
      {floats.map(fl => (
        <div key={fl.id} style={{ position:'fixed', left:fl.x-30, top:fl.y-20, pointerEvents:'none', zIndex:9999, fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize: fl.gold?'1.2rem':'.9rem', color: fl.gold?'#dfc068':'#b89030', animation:'fUp .9s ease-out forwards' }}>
          +{fmt(fl.val)}{fl.gold?' 🌟':' 🥚'}
        </div>
      ))}
      <style>{`
        @keyframes fUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-80px) scale(.5)}}
        @keyframes achIn{from{transform:translateX(120%);opacity:0}to{transform:none;opacity:1}}
        @keyframes eggPop{0%{transform:scale(1)}25%{transform:scale(.88)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
        @keyframes goldenBob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.1)}}
        @keyframes prestigeGlow{0%,100%{box-shadow:0 0 0 0 rgba(184,144,48,.3)}50%{box-shadow:0 0 0 14px rgba(184,144,48,0)}}
      `}</style>

      {/* ── Achievement popup ── */}
      {showAch && (
        <div style={{ position:'fixed', bottom:28, right:12, zIndex:1001, background:'#060001', border:'1px solid rgba(184,144,48,.4)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 4px 24px rgba(0,0,0,.5)', maxWidth:260, animation:'achIn .3s ease' }}>
          <div style={{ fontSize:'1.5rem' }}>{showAch.ico}</div>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize:'.88rem', color:'#ece0cc' }}>🏆 {showAch.n}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.62rem', fontWeight:600, color:'#b89030', opacity:.75, marginTop:2 }}>{showAch.d}</div>
          </div>
        </div>
      )}

      {/* ── Golden egg ── */}
      {goldenEgg && (
        <div onClick={catchGolden} style={{ position:'fixed', left:`${goldenEgg.x}%`, top:`${goldenEgg.y}%`, fontSize:'2.2rem', cursor:'pointer', zIndex:500, animation:'goldenBob 1s ease-in-out infinite', filter:'drop-shadow(0 0 12px gold)' }}>🌟</div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:'fixed', top:66, left:'50%', transform:'translateX(-50%)', background:'#060001', border:'1px solid rgba(184,144,48,.35)', color:'#cca848', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'.62rem', letterSpacing:'.1em', padding:'8px 18px', zIndex:999, whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,.4)' }}>
          {toast}
        </div>
      )}

      {/* ── Prestige Modal ── */}
      {showPrestige && (
        <PrestigeModal
          prestige={prestige}
          eps={derivedEps}
          onConfirm={doPrestige}
          onCancel={() => setShowPrestige(false)}
        />
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr 280px', flex:1, minHeight:0, overflow:'hidden' }}>

        {/* ─── LEFT: Upgrades ─── */}
        {!isMobile && (
          <div style={{ ...PS, borderRight:'1px solid rgba(184,144,48,.14)' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.6rem', fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'#b89030', textAlign:'center', padding:'7px 8px', borderBottom:'1px solid rgba(184,144,48,.14)', background:'#0c0004', flexShrink:0, opacity:.8 }}>
              ⬆ Upgrades
            </div>
            <div style={{ overflowY:'auto', padding:7, flex:1, display:'flex', flexDirection:'column', gap:5 }}>
              {visUpgrades.length === 0 && (
                <div style={{ padding:14, textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:'.72rem', color:'rgba(236,224,204,.25)', lineHeight:1.6 }}>
                  Produziere mehr Eier um Upgrades freizuschalten…
                </div>
              )}
              {visUpgrades.map(u => {
                const can = !u.done && gs.eggs >= u.cost && u.show(gs)
                return (
                  <div key={u.id} onClick={() => !u.done && can && buyUpgrade(u, u.i)}
                    style={{ background: u.done ? 'rgba(72,144,72,.08)' : 'rgba(255,255,255,.03)', border:`1px solid ${u.done?'rgba(72,144,72,.2)':can?'rgba(184,144,48,.2)':'rgba(236,224,204,.06)'}`, borderRadius:0, padding:'7px 9px', cursor: can ? 'pointer' : 'default', opacity: u.done ? .55 : can ? 1 : .28, transition:'background .15s, border-color .15s' }}
                    onMouseOver={e => can && (e.currentTarget.style.background='rgba(184,144,48,.08)')}
                    onMouseOut={e => e.currentTarget.style.background=u.done?'rgba(72,144,72,.08)':'rgba(255,255,255,.03)'}
                  >
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ fontSize:'.9rem' }}>{u.i}</span>
                      <span style={{ fontFamily:'Syne,sans-serif', fontSize:'.7rem', fontWeight:700, color:'#ece0cc', flex:1 }}>{u.n}</span>
                    </div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.6rem', fontWeight:600, color:'#b89030', marginTop:2, opacity:.75 }}>{u.done ? '✓ Gekauft' : `🥚 ${fmt(u.cost)}`}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.6rem', fontWeight:400, color:'rgba(236,224,204,.4)', marginTop:2, lineHeight:1.3 }}>{u.d}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── CENTER ─── */}
        <div style={{ display:'flex', flexDirection:'column', minWidth:0, position:'relative' }}>

          {/* Scene */}
          {!isMobile && (
            <div style={{ flex:1, minHeight:0, position:'relative', overflow:'hidden' }}>
              <Scene buildings={sceneBuildings} eggPerSec={derivedEps} />
            </div>
          )}

          {/* HUD */}
          <div style={{ background:'#060001', borderTop:'1px solid rgba(184,144,48,.14)', padding: isMobile?'12px 16px':'10px 14px', flexShrink:0, zIndex:10 }}>

            {/* Prestige bar */}
            {prestige > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'5px 8px', background:'rgba(184,144,48,.07)', border:'1px solid rgba(184,144,48,.15)' }}>
                <span style={{ fontSize:'.85rem' }}>⭐</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.56rem', fontWeight:700, color:'#cca848', letterSpacing:'.1em' }}>PRESTIGE ×{prestige} — +{prestige*10}% Produktion aktiv</div>
                </div>
              </div>
            )}

            {/* Egg count */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize: isMobile?'1.5rem':'1.7rem', color:'#ece0cc', lineHeight:1 }}>
                  🥚 {fmt(gs.eggs)}
                </div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.62rem', fontWeight:600, color:'rgba(184,144,48,.65)', marginTop:2 }}>
                  {fmt(derivedEps)}/Sek · {fmt(gs.total)} gesamt
                  {prestige > 0 && <span style={{ color:'#cca848', marginLeft:6 }}>×{gs.prestigeMulti.toFixed(1)}</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:5 }}>
                {canPrestige && (
                  <button onClick={() => setShowPrestige(true)} style={{ padding:'5px 10px', background:'rgba(184,144,48,.15)', border:'1px solid rgba(184,144,48,.4)', color:'#cca848', fontFamily:'Syne,sans-serif', fontSize:'.56rem', fontWeight:700, letterSpacing:'.1em', cursor:'pointer', animation:'prestigeGlow 2s ease-in-out infinite', transition:'background .2s' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(184,144,48,.28)'}
                    onMouseOut={e=>e.currentTarget.style.background='rgba(184,144,48,.15)'}
                  >⭐ Prestige!</button>
                )}
                <button onClick={saveGame} style={{ padding:'5px 8px', background:'transparent', border:'1px solid rgba(184,144,48,.2)', color:'rgba(184,144,48,.6)', fontFamily:'Syne,sans-serif', fontSize:'.6rem', cursor:'pointer' }}>💾</button>
                <button onClick={resetGame} style={{ padding:'5px 8px', background:'transparent', border:'1px solid rgba(236,224,204,.1)', color:'rgba(236,224,204,.3)', fontFamily:'Syne,sans-serif', fontSize:'.6rem', cursor:'pointer' }}>🗑</button>
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
              {[['Klicks',fmt(gs.clicks)],['Eier/Klick',gs.godEgg?'=EPS':fmt(gs.epc)],['Erfolge',`${gs.achUnlocked.length}/${ACHIEVEMENTS.length}`],['🌟 Golden',gs.golden],['Prestige',prestige]].map(([l,v]) => (
                <div key={l} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(184,144,48,.1)', padding:'3px 8px', textAlign:'center', flex:'1 1 50px' }}>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'.9rem', fontWeight:400, color:'#ece0cc' }}>{v}</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.5rem', fontWeight:600, color:'rgba(184,144,48,.55)', letterSpacing:'.06em', textTransform:'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Prestige progress */}
            {!canPrestige && (
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Syne,sans-serif', fontSize:'.52rem', fontWeight:600, color:'rgba(184,144,48,.5)', marginBottom:4, letterSpacing:'.1em' }}>
                  <span>Prestige-Fortschritt</span>
                  <span>{Math.min(100, (gs.total/PRESTIGE_THRESHOLD*100)).toFixed(1)}%</span>
                </div>
                <div style={{ height:2, background:'rgba(184,144,48,.12)', borderRadius:1, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100,gs.total/PRESTIGE_THRESHOLD*100)}%`, background:'linear-gradient(90deg,#b89030,#dfc068)', borderRadius:1, transition:'width .5s' }} />
                </div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.5rem', color:'rgba(184,144,48,.4)', marginTop:3 }}>
                  Noch {fmt(Math.max(0, PRESTIGE_THRESHOLD - gs.total))} Eier bis Prestige
                </div>
              </div>
            )}

            {/* EGG BUTTON */}
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div onClick={handleClick}
                style={{
                  width: isMobile?110:122, height: isMobile?132:146,
                  background:'radial-gradient(ellipse at 36% 30%,#FFFDE0,#FFEE90 38%,#F0C840 72%,#C89010)',
                  borderRadius:'50% 50% 50% 50% / 58% 58% 42% 42%',
                  border:'2px solid #C8900A', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.4rem',
                  boxShadow:'0 6px 24px rgba(200,144,10,.32),inset 0 -5px 14px rgba(0,0,0,.08)',
                  transition:'transform .08s, box-shadow .08s', position:'relative', overflow:'hidden',
                  userSelect:'none',
                  animation: eggShake ? 'eggPop .18s ease' : 'none',
                }}
                onMouseOver={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(200,144,10,.44)' }}
                onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 24px rgba(200,144,10,.32),inset 0 -5px 14px rgba(0,0,0,.08)' }}
                onMouseDown={e => e.currentTarget.style.transform='scale(.9)'}
                onMouseUp={e => e.currentTarget.style.transform='scale(1.05)'}
              >
                <div style={{ position:'absolute', top:'15%', left:'18%', width:'25%', height:'13%', background:'rgba(255,255,255,.55)', borderRadius:'50%', transform:'rotate(-32deg)' }} />
                {eggFace}
              </div>
            </div>
          </div>

          {/* Mobile: tab bar */}
          {isMobile && (
            <div style={{ display:'flex', borderTop:'1px solid rgba(184,144,48,.14)', background:'#060001', flexShrink:0 }}>
              {[['bld','🏗'],['upg','⬆'],['ach','🏆'],['stats','📊']].map(([t,ico]) => (
                <button key={t} onClick={() => setTab(t)} style={TAB_BTN(tab===t)}>{ico}</button>
              ))}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Tabs ─── */}
        <div style={{ ...PS, borderLeft:'1px solid rgba(184,144,48,.14)', display: isMobile && tab!=='bld'&&tab!=='upg'&&tab!=='ach'&&tab!=='stats' ? 'none' : 'flex' }}>
          {!isMobile && (
            <div style={{ display:'flex', borderBottom:'1px solid rgba(184,144,48,.14)', background:'#0c0004', flexShrink:0 }}>
              {[['bld','🏗'],['ach','🏆'],['stats','📊']].map(([t,ico]) => (
                <button key={t} onClick={() => setTab(t)} style={TAB_BTN(tab===t)}>{ico}</button>
              ))}
            </div>
          )}

          {/* Buildings */}
          {(tab==='bld') && (
            <div style={{ overflowY:'auto', padding:7, flex:1, display:'flex', flexDirection:'column', gap:5 }}>
              {BUILDINGS.map((b,i) => {
                const cost = buildingCost(i, gs.bld[i])
                const can = gs.eggs >= cost
                const eps = b.bEps * gs.bldMult[i] * gs.prestigeMulti
                return (
                  <div key={b.id} onClick={() => can && buyBuilding(i)}
                    style={{ background:'rgba(255,255,255,.03)', border:`1px solid ${can?'rgba(184,144,48,.2)':'rgba(236,224,204,.06)'}`, padding:'6px 9px', display:'flex', alignItems:'center', gap:7, cursor: can?'pointer':'not-allowed', opacity: can?1:.35, transition:'background .12s' }}
                    onMouseOver={e => can && (e.currentTarget.style.background='rgba(184,144,48,.08)')}
                    onMouseOut={e => (e.currentTarget.style.background='rgba(255,255,255,.03)')}
                  >
                    <div style={{ fontSize:'1.4rem', flexShrink:0 }}>{b.ico}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.72rem', fontWeight:700, color:'#ece0cc', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.name}</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.6rem', fontWeight:600, color:'rgba(184,144,48,.65)' }}>🥚 {fmt(cost)} · {fmt(eps)}/s</div>
                    </div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize:'1.25rem', color:'#cca848', minWidth:26, textAlign:'right' }}>{gs.bld[i]}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Mobile upgrades tab */}
          {(tab==='upg') && (
            <div style={{ overflowY:'auto', padding:7, flex:1, display:'flex', flexDirection:'column', gap:5 }}>
              {visUpgrades.map(u => {
                const can = !u.done && gs.eggs >= u.cost && u.show(gs)
                return (
                  <div key={u.id} onClick={() => !u.done && can && buyUpgrade(u, u.i)}
                    style={{ background:'rgba(255,255,255,.03)', border:`1px solid ${can?'rgba(184,144,48,.2)':'rgba(236,224,204,.06)'}`, padding:'7px 9px', cursor: can?'pointer':'default', opacity: u.done?.55:can?1:.28, transition:'background .15s' }}
                    onMouseOver={e => can && (e.currentTarget.style.background='rgba(184,144,48,.08)')}
                    onMouseOut={e => (e.currentTarget.style.background='rgba(255,255,255,.03)')}
                  >
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ fontSize:'.9rem' }}>{u.i}</span>
                      <span style={{ fontFamily:'Syne,sans-serif', fontSize:'.7rem', fontWeight:700, color:'#ece0cc', flex:1 }}>{u.n}</span>
                    </div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.6rem', fontWeight:600, color:'#b89030', marginTop:2, opacity:.75 }}>{u.done?'✓ Gekauft':`🥚 ${fmt(u.cost)}`}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.6rem', color:'rgba(236,224,204,.4)', marginTop:2 }}>{u.d}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Achievements */}
          {(tab==='ach') && (
            <div style={{ overflowY:'auto', padding:7, flex:1 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                {ACHIEVEMENTS.map(a => {
                  const won = achSet.has(a.id)
                  const [cur,max] = a.pg({...gs,eps:derivedEps})
                  const pct = Math.min((cur/max)*100,100)
                  return (
                    <div key={a.id} style={{ background: won?'rgba(184,144,48,.08)':'rgba(255,255,255,.02)', border:`1px solid ${won?'rgba(184,144,48,.3)':'rgba(236,224,204,.06)'}`, padding:'8px 6px', textAlign:'center', opacity: won?1:.28 }}>
                      <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{won?a.ico:'❓'}</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.62rem', fontWeight:700, color:'#ece0cc', marginBottom:2 }}>{won?a.n:'???'}</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.55rem', fontWeight:400, color:'rgba(184,144,48,.6)', lineHeight:1.3 }}>{won?a.d:'Noch gesperrt'}</div>
                      {!won && <div style={{ height:2, background:'rgba(184,144,48,.12)', marginTop:6, overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:'#b89030', transition:'width .4s' }} /></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stats */}
          {(tab==='stats') && (
            <div style={{ overflowY:'auto', padding:7, flex:1 }}>
              {[
                ['📊 Allgemein', [
                  ['Spielzeit', fmtT(Math.floor((Date.now()-gs.startTime)/1000))],
                  ['Eier gesamt', fmt(gs.total)],
                  ['Aktuell', fmt(gs.eggs)+' 🥚'],
                  ['Eier/Sek', fmt(derivedEps)],
                  ['Prestige-Bonus', `×${gs.prestigeMulti?.toFixed(1)||1}`],
                  ['Eier/Klick', gs.godEgg?'= EPS':fmt(gs.epc)],
                  ['Klicks', fmt(gs.clicks)],
                  ['Goldene Eier', gs.golden+' 🌟'],
                  ['Prestige', prestige+' ⭐'],
                  ['Upgrades', UPGRADES.filter((_,i)=>gs.upgDone[i]).length+'/'+UPGRADES.length],
                  ['Erfolge', gs.achUnlocked.length+'/'+ACHIEVEMENTS.length],
                ]],
                ['🏗 Gebäude', BUILDINGS.map((b,i) => [`${b.ico} ${b.name}`, `${gs.bld[i]}× · ${fmt(b.bEps*gs.bldMult[i]*gs.prestigeMulti*gs.bld[i])}/s`])],
              ].map(([title, rows]) => (
                <div key={title}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.62rem', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'#b89030', padding:'6px 2px 3px', borderBottom:'1px solid rgba(184,144,48,.14)', marginTop:6, opacity:.8 }}>{title}</div>
                  {rows.map(([l,v]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 2px', borderBottom:'1px solid rgba(236,224,204,.05)', fontFamily:'Syne,sans-serif', fontSize:'.7rem' }}>
                      <span style={{ color:'rgba(184,144,48,.65)', fontWeight:600 }}>{l}</span>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'.85rem', color:'#ece0cc' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
              {!user && (
                <div style={{ marginTop:14, padding:'10px 12px', background:'rgba(184,144,48,.07)', border:'1px solid rgba(184,144,48,.2)', fontFamily:'Syne,sans-serif', fontSize:'.7rem', fontWeight:400, color:'rgba(184,144,48,.8)', lineHeight:1.5, textAlign:'center' }}>
                  🔑 Login um Fortschritt in der Cloud zu speichern und in der Rangliste zu erscheinen!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── News Ticker ── */}
      <div style={{ background:'#030000', borderTop:'1px solid rgba(184,144,48,.1)', padding:'3px 10px', flexShrink:0, display:'flex', alignItems:'center', gap:8, overflow:'hidden', whiteSpace:'nowrap' }}>
        <span style={{ background:'#b89030', color:'#060001', padding:'1px 8px', fontFamily:'Syne,sans-serif', fontSize:'.52rem', fontWeight:700, letterSpacing:'.14em', flexShrink:0 }}>NEWS</span>
        <span key={newsIdx} style={{ fontFamily:'Syne,sans-serif', fontSize:'.64rem', fontWeight:600, color:'rgba(184,144,48,.6)', animation:'newsScroll 28s linear both' }}>{NEWS[newsIdx]}</span>
        <style>{`@keyframes newsScroll{from{transform:translateX(350px)}to{transform:translateX(-200%)}}`}</style>
      </div>
    </div>
  )
}
