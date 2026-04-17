import { useMemo, useEffect, useState, useRef } from 'react'

// ═══ CSS KEYFRAMES injected once ══════════════════════════════════════════════
const STYLES = `
@keyframes walkLTR { from { left: -90px; } to { left: 110%; } }
@keyframes walkRTL { from { left: 110%; } to { left: -90px; } }
@keyframes legA { 0%,100%{transform:rotate(30deg)}50%{transform:rotate(-30deg)} }
@keyframes legB { 0%,100%{transform:rotate(-30deg)}50%{transform:rotate(30deg)} }
@keyframes roboBob { 0%,100%{transform:translateY(0) scaleX(1)}50%{transform:translateY(-7px) scaleX(1)} }
@keyframes roboBobR { 0%,100%{transform:translateY(0) scaleX(-1)}50%{transform:translateY(-7px) scaleX(-1)} }
@keyframes cloudDrift { from{transform:translateX(-220px)}to{transform:translateX(110vw)} }
@keyframes portalSpin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
@keyframes portalPulse { 0%,100%{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.08)} }
@keyframes smokeRise {
  0%  {transform:translateX(0) translateY(0) scale(.4);opacity:.7}
  60% {transform:translateX(6px) translateY(-28px) scale(1.2);opacity:.4}
  100%{transform:translateX(-4px) translateY(-48px) scale(1.8);opacity:0}
}
@keyframes eggFloat {
  0%  {transform:translateY(0) scale(1);opacity:1}
  100%{transform:translateY(-70px) scale(.4);opacity:0}
}
@keyframes labBlink {0%,89%,100%{opacity:.9}90%,97%{opacity:.15}}
@keyframes labBlink2{0%,79%,100%{opacity:.9}80%,87%{opacity:.2}}
@keyframes rocketFly {
  0%{transform:translate(-120px,80px) rotate(-45deg);opacity:0}
  8%{opacity:1}
  92%{opacity:1}
  100%{transform:translate(110vw,-60px) rotate(-45deg);opacity:0}
}
@keyframes starTwinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
@keyframes galaxyRotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes godBeam{0%,100%{opacity:.4;transform:scaleY(.85)}50%{opacity:.75;transform:scaleY(1)}}
@keyframes godGlow{0%,100%{box-shadow:0 0 40px 20px rgba(255,220,50,.3)}50%{box-shadow:0 0 80px 40px rgba(255,220,50,.6)}}
@keyframes cropSway{0%,100%{transform:rotate(-4deg) translateX(0)}50%{transform:rotate(4deg) translateX(2px)}}
@keyframes timePulse{0%,100%{box-shadow:0 0 10px rgba(150,0,255,.4)}50%{box-shadow:0 0 30px rgba(150,0,255,.8)}}
@keyframes portalRing{0%,100%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.05)}}
@keyframes nestBob{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes skyDay{
  0%{background:linear-gradient(180deg,#3A7BD5 0%,#87CEEB 50%,#B0D8F0 100%)}
  25%{background:linear-gradient(180deg,#1E90C8 0%,#5BB8E8 50%,#A8D4EE 100%)}
  50%{background:linear-gradient(180deg,#0A1A3A 0%,#1A3060 50%,#2A5090 100%)}
  75%{background:linear-gradient(180deg,#E8702A 0%,#FFB040 50%,#FFD870 100%)}
  100%{background:linear-gradient(180deg,#3A7BD5 0%,#87CEEB 50%,#B0D8F0 100%)}
}
@keyframes henCluck{0%,90%,100%{transform:translateY(0)}93%{transform:translateY(-8px)}96%{transform:translateY(0)}}
`

// ═══ HEN SVG ══════════════════════════════════════════════════════════════════
function HenSVG({ size = 50, hue = 0 }) {
  const legAStyle = {
    transformOrigin: '17px 36px',
    animation: 'legA 0.32s ease-in-out infinite',
    transformBox: 'fill-box',
  }
  const legBStyle = {
    transformOrigin: '25px 36px',
    animation: 'legB 0.32s ease-in-out infinite',
    transformBox: 'fill-box',
  }
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 50 43" style={{ filter: hue !== 0 ? `hue-rotate(${hue}deg)` : 'none', overflow:'visible' }}>
      {/* Tail */}
      <ellipse cx="5" cy="23" rx="7" ry="3.5" fill="#D49010" transform="rotate(-35 5 23)" />
      <ellipse cx="4" cy="27" rx="6" ry="3" fill="#C07808" transform="rotate(-15 4 27)" />
      {/* Body */}
      <ellipse cx="22" cy="27" rx="16" ry="11" fill="#F4C430" />
      {/* Wing */}
      <ellipse cx="18" cy="27" rx="10" ry="5.5" fill="#D4A010" transform="rotate(-12 18 27)" />
      {/* Neck */}
      <ellipse cx="34" cy="20" rx="7" ry="9" fill="#F4C430" />
      {/* Head */}
      <circle cx="39" cy="12" r="10" fill="#F4C430" />
      {/* Comb */}
      <path d="M33,4 C34.5,0 36,0 36,4 C37.5,0 39,0 39,4 C40.5,0 42,0 42,4" fill="#E04040" strokeWidth="0" />
      {/* Wattle */}
      <ellipse cx="44" cy="19" rx="3" ry="4" fill="#E04040" />
      {/* Eye */}
      <circle cx="43" cy="10" r="3" fill="#1a1a1a" />
      <circle cx="44.2" cy="8.8" r="1.2" fill="white" />
      {/* Beak */}
      <polygon points="49,12 49,16 55,14" fill="#FF8C00" />
      {/* Left leg */}
      <g style={legAStyle}>
        <line x1="17" y1="37" x2="12" y2="42" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="42" x2="8" y2="43" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="42" x2="11" y2="46" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Right leg */}
      <g style={legBStyle}>
        <line x1="25" y1="37" x2="30" y2="42" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="42" x2="34" y2="43" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="42" x2="31" y2="46" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ═══ ENTITY COMPONENTS ════════════════════════════════════════════════════════
function Hen({ index }) {
  const ltr = index % 2 === 0
  const dur = 10 + (index * 1.8 % 12)
  const delay = -(index * 2.7)
  const bottom = 6 + (index % 4) * 2.8
  const size = 44 + (index % 4) * 6
  const hue = [-10, 0, 15, 30, 45, -20][index % 6]
  return (
    <div style={{
      position: 'absolute',
      bottom: `${bottom}%`,
      animation: `${ltr ? 'walkLTR' : 'walkRTL'} ${dur}s ${delay}s linear infinite`,
      transform: ltr ? 'scaleX(1)' : 'scaleX(-1)',
      zIndex: 12,
      transformOrigin: 'center center',
    }}>
      <div style={{ animation: `henCluck ${4 + index % 5}s ${-index}s ease-in-out infinite` }}>
        <HenSVG size={size} hue={hue} />
      </div>
    </div>
  )
}

function Robot({ index }) {
  const ltr = index % 2 === 1
  const dur = 14 + (index * 2.3 % 10)
  const delay = -(index * 4.1)
  const bottom = 10 + (index % 3) * 4
  return (
    <div style={{
      position: 'absolute',
      bottom: `${bottom}%`,
      fontSize: '38px',
      lineHeight: 1,
      animation: `${ltr ? 'walkLTR' : 'walkRTL'} ${dur}s ${delay}s linear infinite`,
      zIndex: 13,
      filter: 'drop-shadow(0 2px 6px rgba(100,180,255,.4))',
    }}>
      <div style={{ animation: `${ltr ? 'roboBob' : 'roboBobR'} 0.45s ease-in-out infinite` }}>
        🤖
      </div>
    </div>
  )
}

// ═══ BUILDING SPRITES ═════════════════════════════════════════════════════════
function SmokePuff({ x, index }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      bottom: '96%',
      width: 10,
      height: 10,
      background: 'rgba(180,180,180,0.7)',
      borderRadius: '50%',
      animation: `smokeRise 2s ${-index * 0.6}s ease-out infinite`,
      pointerEvents: 'none',
    }} />
  )
}

function BuildingStall({ count, x }) {
  return (
    <div style={{ position: 'absolute', bottom: '18%', left: x, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SmokePuff x="35%" index={0} />
      <SmokePuff x="55%" index={1} />
      {/* Roof */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '40px solid transparent',
        borderRight: '40px solid transparent',
        borderBottom: '28px solid #C84040',
        marginBottom: -2,
        position: 'relative', zIndex: 2,
      }} />
      {/* Walls */}
      <div style={{
        width: 76, height: 58,
        background: 'linear-gradient(180deg, #C4956A, #A07040)',
        border: '2.5px solid #8B5E3C',
        borderRadius: '0 0 5px 5px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 6px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Door */}
        <div style={{ width: 18, height: 26, background: '#5C3D1E', borderRadius: '4px 4px 0 0', border: '2px solid #3D2B1F' }} />
        {/* Windows */}
        {[...Array(Math.min(count, 3))].map((_, i) => (
          <div key={i} style={{ width: 14, height: 14, background: '#FFE870', borderRadius: 2, border: '2px solid #8B5E3C', animation: `labBlink ${2 + i * .7}s ${-i * .4}s ease-in-out infinite` }} />
        ))}
      </div>
      {/* Count badge */}
      <div style={{ marginTop: 2, background: '#C84040', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.62rem', fontFamily: 'Fredoka One, cursive', fontWeight: 700 }}>
        ×{count}
      </div>
    </div>
  )
}

function BuildingFarm({ count, x }) {
  return (
    <div style={{ position: 'absolute', bottom: '18%', left: x, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Field strips */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[...Array(Math.min(count, 5))].map((_, i) => (
          <div key={i} style={{ width: 16, height: 32, background: `hsl(${95 + i * 10},55%,${40 + i * 4}%)`, borderRadius: '3px 3px 0 0', animation: `cropSway ${1.4 + i * .3}s ${-i * .5}s ease-in-out infinite`, transformOrigin: 'bottom center', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 3 }}>
            <span style={{ fontSize: '0.7rem' }}>🌾</span>
          </div>
        ))}
      </div>
      {/* Base */}
      <div style={{ width: Math.min(count, 5) * 19, height: 12, background: '#8B5E3C', borderRadius: '2px', border: '1px solid #5C3D1E' }} />
      <div style={{ marginTop: 2, background: '#4A8A2A', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.62rem', fontFamily: 'Fredoka One, cursive' }}>×{count}</div>
    </div>
  )
}

function BuildingLab({ count, x }) {
  return (
    <div style={{ position: 'absolute', bottom: '18%', left: x, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SmokePuff x="42%" index={2} />
      {/* Roof */}
      <div style={{ width: 70, height: 12, background: '#4A78B0', borderRadius: '6px 6px 0 0', border: '2px solid #2A5890' }} />
      {/* Walls */}
      <div style={{
        width: 70, height: 60,
        background: 'linear-gradient(180deg, #D0E0F5, #B0C8E8)',
        border: '2px solid #4A78B0',
        borderRadius: '0 0 4px 4px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 4, padding: 6,
        position: 'relative',
      }}>
        {[...Array(Math.min(count * 2, 6))].map((_, i) => (
          <div key={i} style={{
            width: '100%', aspectRatio: 1,
            background: i % 3 === 0 ? '#00FFFF' : i % 3 === 1 ? '#40C0FF' : '#80E080',
            borderRadius: 2,
            border: '1px solid #4A78B0',
            animation: `${i % 2 === 0 ? 'labBlink' : 'labBlink2'} ${1.8 + i * .4}s ${-i * .3}s infinite`,
          }} />
        ))}
      </div>
      <div style={{ marginTop: 2, background: '#4A78B0', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.62rem', fontFamily: 'Fredoka One, cursive' }}>×{count}</div>
    </div>
  )
}

function BuildingTimeMachine({ count, x }) {
  return (
    <div style={{ position: 'absolute', bottom: '18%', left: x, animation: 'timePulse 2s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 62, height: 70,
        background: 'linear-gradient(180deg, #9060C0, #6040A0)',
        borderRadius: 8, border: '2.5px solid #B090E0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        <div style={{ fontSize: '1.5rem' }}>⏱</div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'radial-gradient(circle, #E0B0FF, #8040C0)',
          border: '2px solid #D090FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.55rem', color: 'white', fontWeight: 800,
          animation: 'portalSpin 4s linear infinite',
        }}>◷◷◷</div>
      </div>
      <div style={{ marginTop: 2, background: '#9060C0', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.62rem', fontFamily: 'Fredoka One, cursive' }}>×{count}</div>
    </div>
  )
}

// ═══ SKY ELEMENTS ══════════════════════════════════════════════════════════════
function Cloud({ index }) {
  const dur = 30 + index * 8
  const delay = -(index * 7.3)
  const top = 5 + index * 9
  const scale = 0.7 + (index % 3) * 0.3
  return (
    <div style={{
      position: 'absolute', top: `${top}%`,
      animation: `cloudDrift ${dur}s ${delay}s linear infinite`,
      transform: `scale(${scale})`,
      transformOrigin: 'left center',
      opacity: 0.8,
      zIndex: 2,
    }}>
      <svg width="120" height="48" viewBox="0 0 120 48">
        <ellipse cx="60" cy="36" rx="55" ry="14" fill="white" opacity=".85" />
        <ellipse cx="38" cy="28" rx="28" ry="22" fill="white" opacity=".85" />
        <ellipse cx="72" cy="26" rx="24" ry="20" fill="white" opacity=".85" />
        <ellipse cx="52" cy="22" rx="18" ry="18" fill="white" opacity=".9" />
      </svg>
    </div>
  )
}

function Portal({ index }) {
  const left = 20 + index * 32
  return (
    <div style={{
      position: 'absolute', top: '22%', left: `${left}%`,
      width: 80, height: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'portalPulse 3s ease-in-out infinite',
      zIndex: 5,
    }}>
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        width: 80, height: 80, borderRadius: '50%',
        border: '4px solid rgba(100, 200, 255, 0.8)',
        animation: 'portalRing 6s linear infinite',
        boxShadow: '0 0 20px rgba(100,200,255,.6), inset 0 0 20px rgba(100,200,255,.3)',
      }} />
      {/* Inner swirl */}
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,200,255,0.9) 0%, rgba(0,80,200,0.8) 50%, rgba(0,0,80,0.6) 100%)',
        animation: 'portalSpin 2s linear infinite',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
      }}>🌀</div>
      <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', background: '#005090', color: '#80E0FF', borderRadius: 10, padding: '1px 8px', fontSize: '0.6rem', fontFamily: 'Fredoka One, cursive', whiteSpace: 'nowrap' }}>×{index + 1}</div>
    </div>
  )
}

function RocketFlying({ index }) {
  const dur = 8 + index * 3
  const delay = -(index * 5.7)
  const top = 8 + index * 12
  return (
    <div style={{
      position: 'absolute', top: `${top}%`,
      fontSize: '2rem', lineHeight: 1,
      animation: `rocketFly ${dur}s ${delay}s linear infinite`,
      zIndex: 6,
      filter: 'drop-shadow(0 0 10px rgba(255,150,50,.8))',
    }}>🚀</div>
  )
}

function GalaxyBackground({ visible }) {
  if (!visible) return null
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 60,
    size: 1 + Math.random() * 3,
    delay: -Math.random() * 4,
    dur: 1.5 + Math.random() * 3,
  })), [])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: '50%',
          background: `hsl(${200 + i * 7 % 160}, 80%, 80%)`,
          animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
      {/* Galaxy spiral */}
      <div style={{
        position: 'absolute', top: '5%', right: '8%',
        width: 90, height: 90,
        background: 'radial-gradient(ellipse at center, rgba(180,100,255,.5) 0%, rgba(50,0,150,.3) 50%, transparent 75%)',
        borderRadius: '50%',
        animation: 'galaxyRotate 20s linear infinite',
      }} />
    </div>
  )
}

function GodBeam({ visible }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute', top: 0, left: '45%',
      width: 80, height: '65%',
      background: 'linear-gradient(180deg, rgba(255,255,150,.7) 0%, rgba(255,220,50,.4) 50%, transparent 100%)',
      animation: 'godBeam 2.5s ease-in-out infinite, godGlow 2.5s ease-in-out infinite',
      pointerEvents: 'none',
      zIndex: 3,
      borderRadius: '0 0 50% 50%',
      filter: 'blur(3px)',
    }} />
  )
}

// ═══ NEST ══════════════════════════════════════════════════════════════════════
function Nest({ index }) {
  const left = 5 + (index * 9.5) % 88
  return (
    <div style={{
      position: 'absolute', bottom: '17%', left: `${left}%`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: 'nestBob 2s ease-in-out infinite',
      animationDelay: `${-index * 0.7}s`,
      zIndex: 9,
      fontSize: '1.4rem', lineHeight: 1,
    }}>🪺</div>
  )
}

// ═══ EGG PARTICLE ══════════════════════════════════════════════════════════════
function EggParticle({ x, y, id }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, bottom: `${y}%`,
      fontSize: '1rem', lineHeight: 1, zIndex: 20,
      animation: 'eggFloat 1.2s ease-out forwards',
      pointerEvents: 'none',
    }}>🥚</div>
  )
}

// ═══ MOUNTAINS ════════════════════════════════════════════════════════════════
function Mountains() {
  return (
    <div style={{ position: 'absolute', bottom: '24%', left: 0, right: 0, zIndex: 3 }}>
      <svg viewBox="0 0 800 80" preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
        <polygon points="0,80 120,10 240,80" fill="#A0B080" opacity=".7" />
        <polygon points="80,80 240,5 400,80" fill="#88A068" opacity=".7" />
        <polygon points="300,80 450,15 600,80" fill="#A0B080" opacity=".7" />
        <polygon points="480,80 640,8 800,80" fill="#88A068" opacity=".7" />
        <polygon points="680,80 800,20 850,80" fill="#9AAA70" opacity=".7" />
      </svg>
    </div>
  )
}

// ═══ MAIN SCENE COMPONENT ════════════════════════════════════════════════════
export default function Scene({ buildings, eggPerSec, onGoldenEggVisible }) {
  const [particles, setParticles] = useState([])
  const pIdRef = useRef(0)

  // Generate egg particles based on production rate
  useEffect(() => {
    if (eggPerSec <= 0) return
    const rate = Math.max(500, 3000 / Math.log10(eggPerSec + 2))
    const interval = setInterval(() => {
      const activeBldgs = buildings.filter(b => b.cnt > 0)
      if (!activeBldgs.length) return
      const b = activeBldgs[Math.floor(Math.random() * activeBldgs.length)]
      const bIdx = buildings.indexOf(b)
      pIdRef.current++
      setParticles(p => [...p.slice(-25), {
        id: pIdRef.current,
        x: 15 + (bIdx / buildings.length) * 70 + (Math.random() - .5) * 8,
        y: 20 + Math.random() * 10,
      }])
    }, rate)
    return () => clearInterval(interval)
  }, [eggPerSec, buildings])

  // Remove particles after animation
  useEffect(() => {
    if (!particles.length) return
    const timer = setTimeout(() => setParticles(p => p.slice(1)), 1300)
    return () => clearTimeout(timer)
  }, [particles])

  const bld = buildings

  // Entity counts capped for display
  const henCount  = Math.min(bld[0]?.cnt || 0, 22)
  const nestCount = Math.min(bld[1]?.cnt || 0, 10)
  const stallCount  = Math.min(bld[2]?.cnt || 0, 5)
  const farmCount   = Math.min(bld[3]?.cnt || 0, 4)
  const labCount    = Math.min(bld[4]?.cnt || 0, 4)
  const roboCount   = Math.min(bld[5]?.cnt || 0, 10)
  const portalCount = Math.min(bld[6]?.cnt || 0, 3)
  const timeCount   = Math.min(bld[7]?.cnt || 0, 3)
  const rocketCount = Math.min(bld[8]?.cnt || 0, 4)
  const hasGalaxy   = (bld[9]?.cnt || 0) > 0
  const hasGod      = (bld[10]?.cnt || 0) > 0

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden',
      animation: 'skyDay 120s linear infinite',
    }}>
      <style>{STYLES}</style>

      {/* Galaxy background */}
      <GalaxyBackground visible={hasGalaxy} />

      {/* God beam */}
      <GodBeam visible={hasGod} />

      {/* Clouds */}
      {[0,1,2,3,4].map(i => <Cloud key={i} index={i} />)}

      {/* Flying rockets */}
      {[...Array(rocketCount)].map((_, i) => <RocketFlying key={i} index={i} />)}

      {/* Portals */}
      {[...Array(portalCount)].map((_, i) => <Portal key={i} index={i} />)}

      {/* Mountains */}
      <Mountains />

      {/* ── Buildings row ── */}
      {/* Stalles */}
      {[...Array(stallCount)].map((_, i) => (
        <BuildingStall key={i} count={bld[2].cnt} x={`${8 + i * 16}%`} />
      ))}
      {/* Farms */}
      {[...Array(farmCount)].map((_, i) => (
        <BuildingFarm key={i} count={bld[3].cnt} x={`${24 + stallCount * 8 + i * 18}%`} />
      ))}
      {/* Labs */}
      {[...Array(labCount)].map((_, i) => (
        <BuildingLab key={i} count={bld[4].cnt} x={`${50 + i * 16}%`} />
      ))}
      {/* Time machines */}
      {[...Array(timeCount)].map((_, i) => (
        <BuildingTimeMachine key={i} count={bld[7].cnt} x={`${70 + i * 14}%`} />
      ))}

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '18%',
        background: 'linear-gradient(180deg, #6BA830 0%, #4A7A20 100%)',
        borderRadius: '30px 30px 0 0',
        zIndex: 8,
      }}>
        {/* Grass tufts */}
        <div style={{ position: 'absolute', top: -8, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', fontSize: '1rem' }}>
          {['🌿','🌱','🌻','🌱','🌿','🍃','🌱','🌻','🌿','🌱','🌿','🌱'].map((g,i) => (
            <span key={i}>{g}</span>
          ))}
        </div>
      </div>

      {/* Nests */}
      {[...Array(nestCount)].map((_, i) => <Nest key={i} index={i} />)}

      {/* Walking hens */}
      {[...Array(henCount)].map((_, i) => <Hen key={i} index={i} />)}

      {/* Walking robots */}
      {[...Array(roboCount)].map((_, i) => <Robot key={i} index={i} />)}

      {/* God hen indicator */}
      {hasGod && (
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
          fontSize: '3rem', zIndex: 15,
          animation: 'godGlow 2s ease-in-out infinite, henCluck 1.5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px gold)',
        }}>✨🐔✨</div>
      )}

      {/* Egg particles */}
      {particles.map(p => <EggParticle key={p.id} x={p.x} y={p.y} id={p.id} />)}

      {/* EPS indicator */}
      {eggPerSec > 0 && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(0,0,0,.45)', color: 'var(--yolk)',
          borderRadius: 8, padding: '3px 8px',
          fontSize: '0.7rem', fontFamily: 'Fredoka One, cursive',
          zIndex: 20,
        }}>
          🥚 {eggPerSec >= 1e6 ? (eggPerSec/1e6).toFixed(1)+'M' : eggPerSec >= 1e3 ? (eggPerSec/1e3).toFixed(1)+'K' : eggPerSec.toFixed(1)}/s
        </div>
      )}
    </div>
  )
}
