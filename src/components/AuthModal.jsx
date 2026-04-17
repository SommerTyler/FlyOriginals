import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ initialTab = 'login', onClose }) {
  const [tab, setTab] = useState(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else { setSuccess('Willkommen zurück! 🥚'); setTimeout(onClose, 1000) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    if (username.length < 3) { setError('Username mind. 3 Zeichen.'); setLoading(false); return }
    // Check username availability
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).single()
    if (existing) { setError('Username bereits vergeben.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username } }
    })
    setLoading(false)
    if (error) setError(error.message)
    else { setSuccess('Account erstellt! Willkommen 🎉'); setTimeout(onClose, 1500) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.3rem', color: 'var(--brown-d)' }}>
            🥚 GameHub Konto
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-l)' }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
          {['login','register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '8px', background: 'none', border: 'none',
                borderBottom: tab === t ? '3px solid var(--yolk-d)' : '3px solid transparent',
                marginBottom: '-2px',
                fontFamily: 'Fredoka One, cursive',
                fontSize: '0.9rem',
                color: tab === t ? 'var(--brown-d)' : 'var(--text-l)',
                cursor: 'pointer',
              }}
            >
              {t === 'login' ? '🔑 Login' : '✨ Registrieren'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="deine@email.de" />
            </div>
            <div className="form-group">
              <label className="form-label">Passwort</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <div className="form-error">⚠️ {error}</div>}
            {success && <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>✅ {success}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'Lädt…' : '🔑 Einloggen'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Hühnerbaron99" minLength={3} maxLength={20} />
            </div>
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="deine@email.de" />
            </div>
            <div className="form-group">
              <label className="form-label">Passwort</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="mind. 6 Zeichen" minLength={6} />
            </div>
            {error && <div className="form-error">⚠️ {error}</div>}
            {success && <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>✅ {success}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'Lädt…' : '🎉 Account erstellen'}
            </button>
          </form>
        )}

        <p style={{ fontSize: '0.72rem', color: 'var(--text-ll)', textAlign: 'center', marginTop: 16 }}>
          Ohne Konto spielst du lokal – dein Fortschritt wird nicht in der Rangliste gespeichert.
        </p>
      </div>
    </div>
  )
}
