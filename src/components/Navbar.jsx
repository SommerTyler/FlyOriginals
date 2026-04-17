import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()
  const isHome = loc.pathname === '/'
  const inGame = loc.pathname.startsWith('/game/')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function logout() { await supabase.auth.signOut() }

  const navLinks = [
    { label: 'About',     href: '#about' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Live',      href: '#live' },
    { label: 'Kontakt',   href: '#contact' },
  ]

  if (inGame) return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      background: 'var(--crimson)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ textDecoration: 'none', fontFamily: 'var(--ff-label)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase' }}>
        ← FlyOriginals
      </Link>
    </nav>
  )

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: scrolled ? 'rgba(20,0,6,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        padding: '0 clamp(20px,4vw,60px)',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        {/* Logo */}
        <a href="#hero" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.45rem', fontWeight: 400, color: 'var(--white)', letterSpacing: '0.04em' }}>
            FlyOriginals
          </span>
          <span style={{ fontFamily: 'var(--ff-label)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 1 }}>
            Film Studio
          </span>
        </a>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} style={{
              fontFamily: 'var(--ff-label)', fontSize: '0.72rem', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--white-dim)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--white-dim)'}
            >{l.label}</a>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--ff-label)', fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                {profile?.username}
              </span>
              <button onClick={logout} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--white-dim)', fontFamily: 'var(--ff-label)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--white-dim)'; }}
              >Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="btn-cta" style={{ padding: '8px 20px', fontSize: '0.65rem' }}>
              Login
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal initialTab="login" onClose={() => setShowAuth(false)} />}
    </>
  )
}
