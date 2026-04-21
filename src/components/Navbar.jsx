import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import AuthModal from './AuthModal'

const H = () => document.body.classList.add('hov')
const L = () => document.body.classList.remove('hov')

export default function Navbar() {
  const { user, profile } = useAuth()
  const [modal, setModal] = useState(false)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const inGame = pathname.startsWith('/game/')

  useEffect(() => {
    if (inGame) return
    const ids = ['about', 'portfolio', 'live', 'kontakt']
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.35 }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [inGame])

  if (inGame) return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, height: 54,
      background: 'rgba(5,0,1,.96)', borderBottom: '1px solid var(--bdr)',
      display: 'flex', alignItems: 'center', padding: '0 32px',
    }}>
      <Link to="/" onMouseEnter={H} onMouseLeave={L} style={{
        textDecoration: 'none', cursor: 'none', fontFamily: 'var(--fu)',
        fontSize: '.58rem', fontWeight: 600, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'var(--gold2)', transition: 'color .2s',
      }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--gold3)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--gold2)'}
      >← FlyOriginals</Link>
    </nav>
  )

  const LINKS = ['About', 'Portfolio', 'Live', 'Kontakt']

  return (
    <>
      {/* ── Mobile menu overlay ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,0,1,.97)',
          zIndex: 600, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 36,
          animation: 'fadeIn .22s ease',
        }}>
          <button onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', top: 20, right: 20, background: 'none',
            border: 'none', color: 'var(--c40)', fontSize: '1.4rem', cursor: 'pointer',
          }}>✕</button>
          {LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              style={{ fontFamily: 'var(--fd)', fontStyle: 'italic', fontSize: '2.4rem', fontWeight: 400, color: 'var(--cream)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseOver={e => e.target.style.color = 'var(--gold3)'}
              onMouseOut={e => e.target.style.color = 'var(--cream)'}
            >{l}</a>
          ))}
        </div>
      )}

      {/* ── Navbar — fully transparent, floats over torn paper ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(28px, 5.5vw, 80px)',
        background: 'transparent',
        backdropFilter: 'none',
        border: 'none',
        transition: 'all .4s ease',
      }}>

        {/* Logo */}
        <a href="#hero" onMouseEnter={H} onMouseLeave={L}
          style={{ textDecoration: 'none', cursor: 'none' }}>
          <div style={{
            fontFamily: 'var(--fd)', fontSize: '1.32rem', fontWeight: 400,
            color: 'var(--bg)', letterSpacing: '.05em', lineHeight: 1,
            transition: 'color .25s',
            textShadow: '0 1px 8px rgba(0,0,0,.18)',
          }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--gold-d, #7a621e)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--bg)'}
          >FlyOriginals</div>
          <div style={{
            fontFamily: 'var(--fu)', fontSize: '.45rem', fontWeight: 600,
            letterSpacing: '.38em', textTransform: 'uppercase',
            color: 'var(--gold-d, #7a621e)', marginTop: 3, opacity: .85,
          }}>Film · Studio</div>
        </a>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 38 }}
          className="nav-desktop">
          {LINKS.map(l => {
            const id = l.toLowerCase()
            const isActive = active === id
            return (
              <a key={l} href={`#${id}`} onMouseEnter={H} onMouseLeave={L} style={{
                textDecoration: 'none', cursor: 'none',
                fontFamily: 'var(--fu)', fontSize: '.6rem', fontWeight: isActive ? 600 : 500,
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: isActive ? 'var(--gold-d, #7a621e)' : 'rgba(20,0,6,.65)',
                transition: 'color .25s', position: 'relative', paddingBottom: 3,
                textShadow: '0 1px 4px rgba(255,255,255,.15)',
              }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--gold-d, #7a621e)'}
                onMouseOut={e => e.currentTarget.style.color = isActive ? 'var(--gold-d, #7a621e)' : 'rgba(20,0,6,.65)'}
              >
                {l}
                <span style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                  background: 'var(--gold-d, #7a621e)',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform .32s cubic-bezier(.16,1,.3,1)',
                }} />
              </a>
            )
          })}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600, letterSpacing: '.12em', color: 'var(--gold-d, #7a621e)' }}>
                {profile?.username}
              </span>
              <button onMouseEnter={H} onMouseLeave={L}
                onClick={() => supabase.auth.signOut()}
                style={{ background: 'none', border: 'none', cursor: 'none', fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(20,0,6,.5)', transition: 'color .2s' }}
                onMouseOver={e => e.target.style.color = 'var(--gold-d, #7a621e)'}
                onMouseOut={e => e.target.style.color = 'rgba(20,0,6,.5)'}
              >Logout</button>
            </div>
          ) : (
            <button onMouseEnter={H} onMouseLeave={L} onClick={() => setModal(true)}
              style={{ background: 'none', cursor: 'none', padding: '7px 16px', border: '1px solid rgba(20,0,6,.25)', fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(20,0,6,.7)', transition: 'all .22s' }}
              onMouseOver={e => { const el = e.currentTarget; el.style.background = 'rgba(20,0,6,.08)'; el.style.borderColor = 'rgba(20,0,6,.45)' }}
              onMouseOut={e => { const el = e.currentTarget; el.style.background = 'none'; el.style.borderColor = 'rgba(20,0,6,.25)' }}
            >Login</button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(true)} style={{
          display: 'none', background: 'none', border: '1px solid rgba(20,0,6,.25)',
          color: 'rgba(20,0,6,.7)', padding: '6px 13px', cursor: 'pointer',
          fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 600, letterSpacing: '.1em',
        }} className="nav-mobile">☰</button>
      </nav>

      {/* Responsive toggle */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: block !important; }
        }
      `}</style>

      {modal && <AuthModal onClose={() => setModal(false)} />}
    </>
  )
}
