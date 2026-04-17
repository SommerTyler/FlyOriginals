import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../App'
import Scene from './Scene'
import { BUILDINGS, UPGRADES, ACHIEVEMENTS, NEWS, calcEPS, buildingCost } from './gameData'

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = n => {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + ' Bio.'
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + ' Mrd.'
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + ' Mio.'
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + 'K'
  return Math.floor(n).toLocaleString('de')
}
const fmtT = s => { const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = Math.floor(s%60); return h ? `${h}h ${m}m` : `${m}m ${ss}s` }

// ─── audio ────────────────────────────────────────────────────────────────────
let _ac
const getAC = () => { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); return _ac }
const snd = type => {
  try {
    const ac = getAC(), now = ac.currentTime
    const o = ac.createOscillator(), g = ac.createGain()
    o.connect(g); g.connect(ac.destination)
    if (type === 'click') {
      o.frequency.setValueAtTime(520, now); o.frequency.exponentialRampToValueAtTime(260, now + .09)
      g.gain.setValueAtTime(.12, now); g.gain.exponentialRampToValueAtTime(.001, now + .09)
      o.start(now); o.stop(now + .09)
    } else if (type === 'buy') {
      o.type = 'triangle'
      o.frequency.setValueAtTime(440, now); o.frequency.setValueAtTime(660, now + .1)
      g.gain.setValueAtTime(.15, now); g.gain.exponentialRampToValueAtTime(.001, now + .3)
      o.start(now); o.stop(now + .3)
    } else if (type === 'ach') {
      [523, 659, 784, 1046].forEach((f, i) => {
        const o2 = ac.createOscillator(), g2 = ac.createGain()
        o2.connect(g2); g2.connect(ac.destination); o2.type = 'triangle'
        o2.frequency.setValueAtTime(f, now + i * .1)
        g2.gain.setValueAtTime(.14, now + i * .1); g2.gain.exponentialRampToValueAtTime(.001, now + i * .1 + .28)
        o2.start(now + i * .1); o2.stop(now + i * .1 + .3)
      })
    } else if (type === 'gold') {
      o.type = 'sine'
      o.frequency.setValueAtTime(880, now); o.frequency.exponentialRampToValueAtTime(1760, now + .4)
      g.gain.setValueAtTime(.2, now); g.gain.exponentialRampToValueAtTime(.001, now + .42)
      o.start(now); o.stop(now + .42)
    }
  } catch {}
}

// ─── initial state ─────────────────────────────────────────────────────────────
const makeInitState = () => ({
  eggs: 0, total: 0, epc: 1, eps: 0,
  clicks: 0, golden: 0, godEgg: false,
  startTime: Date.now(),
  bld: BUILDINGS.map(() => 0),
  bldMult: BUILDINGS.map(() => 1),
  upgDone: UPGRADES.map(() => false),
  achUnlocked: [],
})

function loadLocal() {
  try {
    const raw = localStorage.getItem('egc_v3')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

// ═════════════════════════════════════════════════════════════════════════════
export default function EggClicker() {
  const { user, profile } = useAuth()
  const [gs, setGs] = useState(() => loadLocal() || makeInitState())
  const [floats, setFloats] = useState([])
  const [achQueue, setAchQueue] = useState([])
  const [showAch, setShowAch] = useState(null)
  const [tab, setTab] = useState('bld')     // bld | upg | ach | stats
  const [goldenEgg, setGoldenEgg] = useState(null)
  const [toast, setToast] = useState('')
  const [newsIdx, setNewsIdx] = useState(0)
  const floatId = useRef(0)
  const gsRef = useRef(gs)
  const loopRef = useRef(null)
  const lastTime = useRef(performance.now())
  const achUnlockedRef = useRef(new Set(gs.achUnlocked))

  // keep ref current
  useEffect(() => { gsRef.current = gs }, [gs])

  // ── derived eps ────────────────────────────────────────────────────────────
  const derivedEps = useMemo(() => calcEPS(gs), [gs.bld, gs.bldMult])

  // ── game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = (now) => {
      const dt = Math.min((now - lastTime.current) / 1000, 0.1)
      lastTime.current = now
      setGs(prev => {
        const eps = calcEPS(prev)
        const gained = eps * dt
        return { ...prev, eggs: prev.eggs + gained, total: prev.total + gained, eps }
      })
      loopRef.current = requestAnimationFrame(loop)
    }
    loopRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(loopRef.current)
  }, [])

  // ── achievement checker ────────────────────────────────────────────────────
  useEffect(() => {
    const s = { ...gs, eps: derivedEps }
    ACHIEVEMENTS.forEach(a => {
      if (!achUnlockedRef.current.has(a.id) && a.ck(s)) {
        achUnlockedRef.current.add(a.id)
        setGs(prev => ({ ...prev, achUnlocked: [...prev.achUnlocked, a.id] }))
        setAchQueue(q => [...q, a])
        snd('ach')
      }
    })
  }, [gs.total, gs.clicks, gs.golden, gs.bld, derivedEps])

  // ── achievement popup queue ────────────────────────────────────────────────
  useEffect(() => {
    if (!achQueue.length || showAch) return
    const next = achQueue[0]
    setShowAch(next)
    setAchQueue(q => q.slice(1))
    const t = setTimeout(() => setShowAch(null), 3200)
    return () => clearTimeout(t)
  }, [achQueue, showAch])

  // ── golden egg spawner ─────────────────────────────────────────────────────
  useEffect(() => {
    let timer
    const schedule = () => {
      timer = setTimeout(() => {
        setGoldenEgg({ id: Date.now(), x: 15 + Math.random() * 60, y: 20 + Math.random() * 45 })
        setTimeout(() => setGoldenEgg(null), 10000)
        schedule()
      }, 30000 + Math.random() * 90000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  // ── news ticker ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNewsIdx(i => (i + 1) % NEWS.length), 28000)
    return () => clearInterval(t)
  }, [])

  // ── auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => saveGame(), 30000)
    return () => clearInterval(t)
  }, [])

  // ─── ACTIONS ──────────────────────────────────────────────────────────────
  const handleEggClick = useCallback((e) => {
    snd('click')
    setGs(prev => {
      const gain = prev.godEgg ? Math.max(calcEPS(prev), 1) : prev.epc
      floatId.current++
      setFloats(f => [...f.slice(-12), { id: floatId.current, x: e.clientX, y: e.clientY, val: gain }])
      setTimeout(() => setFloats(f => f.filter(fl => fl.id !== floatId.current - 12)), 1000)
      return { ...prev, eggs: prev.eggs + gain, total: prev.total + gain, clicks: prev.clicks + 1 }
    })
  }, [])

  const buyBuilding = useCallback((idx) => {
    setGs(prev => {
      const cost = buildingCost(idx, prev.bld[idx])
      if (prev.eggs < cost) return prev
      snd('buy')
      const newBld = [...prev.bld]; newBld[idx]++
      return { ...prev, eggs: prev.eggs - cost, bld: newBld }
    })
  }, [])

  const buyUpgrade = useCallback((u, uIdx) => {
    setGs(prev => {
      if (prev.upgDone[uIdx] || prev.eggs < u.cost || !u.show(prev)) return prev
      snd('buy')
      const newDone = [...prev.upgDone]; newDone[uIdx] = true
      const applied = u.fx({ ...prev, upgDone: newDone })
      return applied
    })
  }, [])

  const catchGolden = useCallback(() => {
    snd('gold')
    setGoldenEgg(null)
    setGs(prev => {
      const bonus = Math.max(calcEPS(prev) * 60, 100)
      floatId.current++
      setFloats(f => [...f, { id: floatId.current, x: window.innerWidth * .5, y: window.innerHeight * .4, val: bonus, gold: true }])
      return { ...prev, eggs: prev.eggs + bonus, total: prev.total + bonus, golden: prev.golden + 1 }
    })
    showToast('🌟 Goldenes Ei gefangen! +60s Bonus!')
  }, [])

  // ─── SAVE / LOAD ──────────────────────────────────────────────────────────
  async function saveGame() {
    const state = gsRef.current
    localStorage.setItem('egc_v3', JSON.stringify(state))
    if (!user) return
    const score = Math.floor(state.total)
    try {
      await supabase.from('game_saves').upsert({
        user_id: user.id, game_id: 'egg-clicker',
        save_data: state, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,game_id' })
      await supabase.from('leaderboard').upsert({
        user_id: user.id, game_id: 'egg-clicker',
        score, score_label: fmt(score) + ' Eier',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,game_id' })
    } catch (err) { console.error('Save error', err) }
    showToast('💾 Gespeichert!')
  }

  // Load from Supabase on login
  useEffect(() => {
    if (!user) return
    supabase.from('game_saves')
      .select('save_data')
      .eq('user_id', user.id).eq('game_id', 'egg-clicker')
      .single()
      .then(({ data }) => {
        if (data?.save_data) {
          const remote = data.save_data
          const local = loadLocal()
          // Use whichever has more total eggs
          const best = (!local || remote.total > local.total) ? remote : local
          setGs(best)
          achUnlockedRef.current = new Set(best.achUnlocked || [])
          showToast('☁️ Spielstand geladen!')
        }
      })
  }, [user])

  function resetGame() {
    if (!confirm('Spielstand wirklich löschen?')) return
    localStorage.removeItem('egc_v3')
    const fresh = makeInitState()
    setGs(fresh); achUnlockedRef.current = new Set()
    showToast('🗑 Zurückgesetzt!')
  }

  let toastTimer
  function showToast(msg) {
    setToast(msg); clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToast(''), 2200)
  }

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────
  const sceneBuildings = useMemo(() =>
    BUILDINGS.map((b, i) => ({ ...b, cnt: gs.bld[i] })),
  [gs.bld])

  const eggFace = useMemo(() => {
    const faces = [[0,'🐣'],[100,'🥚'],[5000,'🐔'],[1e5,'🌟'],[1e7,'👑'],[1e10,'🌌']]
    let face = '🐣'
    for (const [t, f] of faces) if (gs.total >= t) face = f
    return face
  }, [gs.total])

  const visibleUpgrades = useMemo(() =>
    UPGRADES.map((u, i) => ({ ...u, done: gs.upgDone[i], i }))
      .filter(u => u.done || u.show(gs)),
  [gs.total, gs.bld, gs.upgDone])

  const achUnlockedSet = useMemo(() => new Set(gs.achUnlocked), [gs.achUnlocked])

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const panelStyle = { display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--panel)', flexShrink:0 }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, fontFamily:'Nunito,sans-serif', overflow:'hidden' }}>

      {/* ── Floating click labels ── */}
      {floats.map(fl => (
        <div key={fl.id} style={{
          position: 'fixed', left: fl.x - 30, top: fl.y - 20, pointerEvents:'none', zIndex:9999,
          fontFamily:'Fredoka One,cursive', fontSize: fl.gold ? '1.2rem' : '0.9rem',
          color: fl.gold ? '#B8860B' : 'var(--brown-d)',
          animation:'eggFloatUI .9s ease-out forwards',
        }}>+{fmt(fl.val)}{fl.gold ? ' 🌟' : ' 🥚'}</div>
      ))}
      <style>{`@keyframes eggFloatUI{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-80px) scale(.5)}}`}</style>

      {/* ── Achievement popup ── */}
      {showAch && (
        <div style={{
          position:'fixed', bottom:32, right:14, zIndex:1001,
          background:'var(--brown-d)', color:'var(--yolk)',
          padding:'10px 16px', borderRadius:14, display:'flex', gap:10, alignItems:'center',
          boxShadow:'0 4px 24px rgba(0,0,0,.35)', maxWidth:260,
          animation:'slideIn .3s ease',
        }}>
          <style>{`@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:none;opacity:1}}`}</style>
          <div style={{fontSize:'1.6rem'}}>{showAch.ico}</div>
          <div>
            <div style={{fontFamily:'Fredoka One,cursive',fontSize:'.85rem'}}>🏆 {showAch.n}</div>
            <div style={{fontSize:'.7rem',color:'var(--brown-l)',fontFamily:'Nunito,sans-serif',fontWeight:700}}>{showAch.d}</div>
          </div>
        </div>
      )}

      {/* ── Golden Egg ── */}
      {goldenEgg && (
        <div
          onClick={catchGolden}
          style={{
            position:'fixed', left:`${goldenEgg.x}%`, top:`${goldenEgg.y}%`,
            fontSize:'2.4rem', cursor:'pointer', zIndex:500,
            animation:'goldenBob 1s ease-in-out infinite',
            filter:'drop-shadow(0 0 12px gold)',
          }}
        >🌟</div>
      )}
      <style>{`@keyframes goldenBob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.1)}}`}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', top:62, left:'50%', transform:'translateX(-50%)',
          background:'var(--brown-d)', color:'var(--yolk)',
          fontFamily:'Fredoka One,cursive', padding:'8px 20px', borderRadius:20,
          zIndex:999, whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,.3)',
          animation:'fadeInOut 2.2s ease forwards',
        }}>{toast}</div>
      )}
      <style>{`@keyframes fadeInOut{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}`}</style>

      {/* ── Main layout: Left | Center | Right ── */}
      <div style={{ display:'grid', gridTemplateColumns:'250px 1fr 288px', flex:1, minHeight:0, overflow:'hidden' }}>

        {/* ─── LEFT: Upgrades ─── */}
        <div style={{ ...panelStyle, borderRight:'2px solid var(--border)' }}>
          <div style={{ fontFamily:'Fredoka One,cursive', fontSize:'.82rem', color:'var(--brown)', textAlign:'center', padding:'7px 8px', borderBottom:'1px solid var(--border)', background:'var(--cream-d)', flexShrink:0 }}>
            ⬆ Verbesserungen
          </div>
          <div style={{ overflowY:'auto', padding:7, flex:1, display:'flex', flexDirection:'column', gap:5 }}>
            {visibleUpgrades.length === 0 && (
              <div style={{ padding:16, textAlign:'center', color:'var(--text-ll)', fontSize:'.78rem' }}>
                Produziere mehr Eier um Upgrades freizuschalten…
              </div>
            )}
            {visibleUpgrades.map(u => {
              const canBuy = !u.done && gs.eggs >= u.cost && u.show(gs)
              const canSee = !u.done && !canBuy
              return (
                <div key={u.id}
                  onClick={() => !u.done && canBuy && buyUpgrade(u, u.i)}
                  style={{
                    background:'var(--cream)', border:`1.5px solid var(--border)`,
                    borderRadius:10, padding:'7px 9px', cursor: canBuy ? 'pointer' : 'default',
                    opacity: u.done ? .5 : canSee ? .35 : 1,
                    transition:'background .12s, transform .08s',
                    ...(canBuy ? {} : {}),
                  }}
                  onMouseEnter={e => canBuy && (e.currentTarget.style.background='#D4EDDA', e.currentTarget.style.transform='translateX(3px)')}
                  onMouseLeave={e => (e.currentTarget.style.background='var(--cream)', e.currentTarget.style.transform='')}
                >
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    <span style={{fontSize:'1rem'}}>{u.i}</span>
                    <span style={{fontFamily:'Fredoka One,cursive', fontSize:'.77rem', color:'var(--brown-d)', flex:1}}>{u.n}</span>
                  </div>
                  <div style={{fontSize:'.67rem', color:'var(--text-l)', fontWeight:700, marginTop:2}}>
                    {u.done ? '✓ Gekauft' : `🥚 ${fmt(u.cost)}`}
                  </div>
                  <div style={{fontSize:'.65rem', color:'var(--text-ll)', marginTop:3, lineHeight:1.3}}>{u.d}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── CENTER ─── */}
        <div style={{ display:'flex', flexDirection:'column', minWidth:0, position:'relative', background:'var(--sky-b)' }}>

          {/* Scene */}
          <div style={{ flex:1, minHeight:0, position:'relative' }}>
            <Scene buildings={sceneBuildings} eggPerSec={derivedEps} />
          </div>

          {/* Bottom HUD */}
          <div style={{
            background:'var(--panel)', borderTop:'2px solid var(--border)',
            padding:'10px 16px', flexShrink:0, zIndex:10,
          }}>
            {/* Egg count */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:'Fredoka One,cursive', fontSize:'1.8rem', color:'var(--brown-d)', lineHeight:1 }}>
                  🥚 {fmt(gs.eggs)}
                </div>
                <div style={{ fontSize:'.75rem', color:'var(--text-l)', fontWeight:700 }}>
                  {fmt(derivedEps)}/Sek · {fmt(gs.total)} gesamt
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-secondary" style={{ padding:'5px 10px', fontSize:'.7rem' }} onClick={saveGame}>💾</button>
                <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:'.7rem' }} onClick={resetGame}>🗑</button>
              </div>
            </div>

            {/* Mini stats row */}
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              {[
                ['Klicks', fmt(gs.clicks)],
                ['Eier/Klick', gs.godEgg ? '=EPS' : fmt(gs.epc)],
                ['Erfolge', `${gs.achUnlocked.length}/${ACHIEVEMENTS.length}`],
                ['Goldene 🌟', gs.golden],
              ].map(([l,v]) => (
                <div key={l} style={{ background:'var(--cream-d)', border:'1px solid var(--border)', borderRadius:8, padding:'3px 10px', textAlign:'center', flex:'1 1 60px' }}>
                  <div style={{ fontFamily:'Fredoka One,cursive', fontSize:'.88rem', color:'var(--brown-d)' }}>{v}</div>
                  <div style={{ fontSize:'.6rem', color:'var(--text-ll)', fontWeight:700 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* EGG BUTTON */}
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div
                onClick={handleEggClick}
                style={{
                  width:130, height:155,
                  background:'radial-gradient(ellipse at 36% 30%, #FFFDE0, #FFEE90 40%, #F0C840 75%, #C89010)',
                  borderRadius:'50% 50% 50% 50% / 58% 58% 42% 42%',
                  border:'3px solid var(--yolk-d)',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'2.5rem', userSelect:'none',
                  boxShadow:'0 8px 28px rgba(200,144,10,.35), inset 0 -6px 16px rgba(0,0,0,.07)',
                  transition:'transform .07s, box-shadow .07s',
                  position:'relative', overflow:'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(200,144,10,.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 28px rgba(200,144,10,.35)' }}
                onMouseDown={e => { e.currentTarget.style.transform='scale(.92)' }}
                onMouseUp={e => { e.currentTarget.style.transform='scale(1.05)' }}
              >
                <div style={{ position:'absolute', top:'16%', left:'20%', width:'26%', height:'14%', background:'rgba(255,255,255,.55)', borderRadius:'50%', transform:'rotate(-32deg)' }} />
                {eggFace}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Tabs ─── */}
        <div style={{ ...panelStyle, borderLeft:'2px solid var(--border)' }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'2px solid var(--border)', background:'var(--cream-dd)', flexShrink:0 }}>
            {[['bld','🏗'],['ach','🏆'],['stats','📊']].map(([t,ico]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'7px 3px', background:'none', border:'none',
                borderBottom: tab===t ? '3px solid var(--yolk-d)' : '3px solid transparent',
                marginBottom:-2, cursor:'pointer', fontFamily:'Fredoka One,cursive', fontSize:'.65rem',
                color: tab===t ? 'var(--brown-d)' : 'var(--text-l)',
              }}>{ico} {t==='bld'?'Gebäude':t==='ach'?'Erfolge':'Statistik'}</button>
            ))}
          </div>

          {/* Buildings tab */}
          {tab === 'bld' && (
            <div style={{ overflowY:'auto', padding:7, flex:1, display:'flex', flexDirection:'column', gap:5 }}>
              {BUILDINGS.map((b, i) => {
                const cost = buildingCost(i, gs.bld[i])
                const can = gs.eggs >= cost
                const eps = b.bEps * gs.bldMult[i]
                return (
                  <div key={b.id}
                    onClick={() => can && buyBuilding(i)}
                    style={{
                      background:'var(--cream)', border:'1.5px solid var(--border)',
                      borderRadius:10, padding:'6px 9px',
                      display:'flex', alignItems:'center', gap:7,
                      cursor: can ? 'pointer' : 'not-allowed', opacity: can ? 1 : .4,
                      transition:'background .12s, transform .08s',
                    }}
                    onMouseEnter={e => can && (e.currentTarget.style.background='var(--yolk-l)', e.currentTarget.style.transform='translateX(3px)', e.currentTarget.style.borderColor='var(--yolk-d)')}
                    onMouseLeave={e => (e.currentTarget.style.background='var(--cream)', e.currentTarget.style.transform='', e.currentTarget.style.borderColor='var(--border)')}
                  >
                    <div style={{fontSize:'1.5rem', flexShrink:0}}>{b.ico}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontFamily:'Fredoka One,cursive', fontSize:'.8rem', color:'var(--brown-d)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.name}</div>
                      <div style={{fontSize:'.67rem', color:'var(--text-l)', fontWeight:700}}>🥚 {fmt(cost)} · {fmt(eps)}/s ea.</div>
                    </div>
                    <div style={{fontFamily:'Fredoka One,cursive', fontSize:'1.35rem', color:'var(--brown)', minWidth:28, textAlign:'right'}}>{gs.bld[i]}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Achievements tab */}
          {tab === 'ach' && (
            <div style={{ overflowY:'auto', padding:7, flex:1 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                {ACHIEVEMENTS.map(a => {
                  const won = achUnlockedSet.has(a.id)
                  const [cur, max] = a.pg({ ...gs, eps: derivedEps })
                  const pct = Math.min((cur / max) * 100, 100)
                  return (
                    <div key={a.id} style={{
                      background: won ? 'var(--yolk-l)' : 'var(--cream)',
                      border: `1.5px solid ${won ? 'var(--yolk-d)' : 'var(--border)'}`,
                      borderRadius:10, padding:'8px 6px', textAlign:'center',
                      opacity: won ? 1 : .35,
                    }}>
                      <div style={{fontSize:'1.4rem'}}>{won ? a.ico : '❓'}</div>
                      <div style={{fontFamily:'Fredoka One,cursive', fontSize:'.7rem', color:'var(--brown-d)', marginTop:2}}>{won ? a.n : '???'}</div>
                      <div style={{fontSize:'.6rem', color:'var(--text-l)', marginTop:2, lineHeight:1.2}}>{won ? a.d : 'Noch gesperrt'}</div>
                      {!won && (
                        <div style={{height:3, background:'var(--border)', borderRadius:3, marginTop:5, overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${pct}%`, background:'var(--yolk-d)', borderRadius:3, transition:'width .4s'}} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stats tab */}
          {tab === 'stats' && (
            <div style={{ overflowY:'auto', padding:7, flex:1 }}>
              {[
                ['📊 Allgemein', [
                  ['Spielzeit', fmtT(Math.floor((Date.now() - gs.startTime) / 1000))],
                  ['Eier gesamt', fmt(gs.total)],
                  ['Aktuell', fmt(gs.eggs) + ' 🥚'],
                  ['Eier/Sek', fmt(derivedEps)],
                  ['Eier/Klick', gs.godEgg ? '= EPS' : fmt(gs.epc)],
                  ['Klicks gesamt', fmt(gs.clicks)],
                  ['Goldene Eier', gs.golden + ' 🌟'],
                  ['Upgrades', UPGRADES.filter((_, i) => gs.upgDone[i]).length + '/' + UPGRADES.length],
                  ['Erfolge', gs.achUnlocked.length + '/' + ACHIEVEMENTS.length],
                ]],
                ['🏗 Gebäude', BUILDINGS.map((b, i) => [
                  `${b.ico} ${b.name}`, `${gs.bld[i]}× · ${fmt(b.bEps * gs.bldMult[i] * gs.bld[i])}/s`
                ])],
              ].map(([title, rows]) => (
                <div key={title}>
                  <div style={{ fontFamily:'Fredoka One,cursive', fontSize:'.8rem', color:'var(--brown)', padding:'6px 0 3px', borderBottom:'1px dashed var(--border)', marginTop:6 }}>{title}</div>
                  {rows.map(([l, v]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 2px', borderBottom:'1px solid var(--cream-dd)', fontSize:'.75rem' }}>
                      <span style={{color:'var(--text-l)', fontWeight:700}}>{l}</span>
                      <span style={{fontFamily:'Fredoka One,cursive', color:'var(--brown-d)'}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
              {!user && (
                <div style={{ marginTop:14, padding:'10px 12px', background:'var(--yolk-l)', border:'1.5px solid var(--yolk-d)', borderRadius:10, fontSize:'.75rem', color:'var(--brown-d)', textAlign:'center', lineHeight:1.4 }}>
                  🔑 Logge dich ein um deinen Fortschritt in der Cloud zu speichern und in der Rangliste zu erscheinen!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── News Ticker ── */}
      <div style={{ background:'var(--brown-d)', color:'var(--yolk)', fontSize:'.72rem', fontWeight:700, padding:'3px 10px', flexShrink:0, display:'flex', alignItems:'center', gap:8, overflow:'hidden', whiteSpace:'nowrap' }}>
        <span style={{ background:'var(--yolk)', color:'var(--brown-d)', padding:'1px 8px', borderRadius:4, fontSize:'.65rem', flexShrink:0 }}>📰 NEWS</span>
        <span style={{ animation:'newsScroll 28s linear infinite' }} key={newsIdx}>{NEWS[newsIdx]}</span>
        <style>{`@keyframes newsScroll{from{transform:translateX(300px)}to{transform:translateX(-100%)}}`}</style>
      </div>
    </div>
  )
}
