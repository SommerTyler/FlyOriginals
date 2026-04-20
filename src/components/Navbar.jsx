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
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const { pathname } = useLocation()
  const inGame = pathname.startsWith('/game/')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 55)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

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
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, height: 52,
      background: 'rgba(5,0,1,.97)', borderBottom: '1px solid var(--bdr)',
      display: 'flex', alignItems: 'center', padding: '0 32px',
    }}>
      <Link to="/" onMouseEnter={H} onMouseLeave={L} style={{
        textDecoration: 'none', cursor: 'none', display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 600,
        letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold2)',
        transition: 'color .2s',
      }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--gold3)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--gold2)'}
      >← FlyOriginals</Link>
    </nav>
  )

  const LINKS = ['About', 'Portfolio', 'Live', 'Kontakt']

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(28px, 5.5vw, 80px)',
        background: scrolled ? 'rgba(5,0,1,.93)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bdr)' : '1px solid transparent',
        transition: 'all .5s cubic-bezier(.16,1,.3,1)',
      }}>

        {/* Logo */}
        <a href="#hero" onMouseEnter={H} onMouseLeave={L} style={{ textDecoration: 'none', cursor: 'none' }}>
          <div style={{
            fontFamily: 'var(--fd)', fontSize: '1.32rem', fontWeight: 400,
            color: 'var(--cream)', letterSpacing: '.05em', lineHeight: 1,
            transition: 'color .25s',
          }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--gold3)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--cream)'}
          >FlyOriginals</div>
          <div style={{
            fontFamily: 'var(--fu)', fontSize: '.45rem', fontWeight: 600,
            letterSpacing: '.38em', textTransform: 'uppercase',
            color: 'var(--gold)', marginTop: 3, opacity: .75,
          }}>Film · Studio</div>
        </a>

        {/* Center links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 38 }}>
          {LINKS.map(l => {
            const id = l.toLowerCase()
            const isActive = active === id
            return (
              <a key={l} href={`#${id}`} onMouseEnter={H} onMouseLeave={L} style={{
                textDecoration: 'none', cursor: 'none',
                fontFamily: 'var(--fu)', fontSize: '.6rem', fontWeight: isActive ? 600 : 500,
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: isActive ? 'var(--gold2)' : 'var(--c40)',
                transition: 'color .25s', position: 'relative', paddingBottom: 3,
              }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--gold2)'}
                onMouseOut={e => e.currentTarget.style.color = isActive ? 'var(--gold2)' : 'var(--c40)'}
              >
                {l}
                <span style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                  background: 'var(--gold)',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform .35s cubic-bezier(.16,1,.3,1)',
                }} />
              </a>
            )
          })}
        </div>

        {/* Right: auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              <span style={{
                fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 600,
                letterSpacing: '.12em', color: 'var(--gold)', opacity: .8,
              }}>{profile?.username}</span>
              <button onMouseEnter={H} onMouseLeave={L}
                onClick={() => supabase.auth.signOut()}
                style={{
                  background: 'none', border: 'none', cursor: 'none',
                  fontFamily: 'var(--fu)', fontSize: '.56rem', fontWeight: 500,
                  letterSpacing: '.16em', textTransform: 'uppercase',
                  color: 'var(--c40)', transition: 'color .2s',
                }}
                onMouseOver={e => e.target.style.color = 'var(--gold2)'}
                onMouseOut={e => e.target.style.color = 'var(--c40)'}
              >Logout</button>
            </>
          ) : (
            <button onMouseEnter={H} onMouseLeave={L}
              onClick={() => setModal(true)}
              style={{
                background: 'none', cursor: 'none', padding: '8px 18px',
                border: '1px solid var(--bdr2)', fontFamily: 'var(--fu)',
                fontSize: '.56rem', fontWeight: 600, letterSpacing: '.18em',
                textTransform: 'uppercase', color: 'var(--gold2)',
                transition: 'all .25s',
              }}
              onMouseOver={e => {
                const el = e.currentTarget
                el.style.background = 'var(--gold3)'
                el.style.color = 'var(--bg)'
                el.style.borderColor = 'var(--gold3)'
              }}
              onMouseOut={e => {
                const el = e.currentTarget
                el.style.background = 'none'
                el.style.color = 'var(--gold2)'
                el.style.borderColor = 'var(--bdr2)'
              }}
            >Login</button>
          )}
        </div>
      </nav>

      {modal && <AuthModal onClose={() => setModal(false)} />}
    </>
  )
}
