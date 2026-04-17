import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const loc = useLocation()
  const inGame = loc.pathname.startsWith('/game/')

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <nav style={{
        background: 'var(--brown-d)',
        color: 'white',
        padding: '0 18px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>🥚</span>
          <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.25rem', color: 'var(--yolk)', letterSpacing: '.5px' }}>
            GameHub
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {inGame && (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--yolk-l)', borderColor: 'rgba(255,255,255,.2)' }}>
                ← Hub
              </button>
            </Link>
          )}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'var(--yolk-d)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <span>👤</span>
                <span>{profile?.username || '…'}</span>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--yolk-l)', borderColor: 'rgba(255,255,255,.2)' }}
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 7 }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', color: 'var(--yolk-l)', borderColor: 'rgba(255,255,255,.2)' }}
                onClick={() => { setAuthTab('login'); setShowAuth(true) }}
              >
                Login
              </button>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                onClick={() => { setAuthTab('register'); setShowAuth(true) }}
              >
                Registrieren
              </button>
            </div>
          )}
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          initialTab={authTab}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  )
}
