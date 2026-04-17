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
    else { setSuccess('Willkommen zurück!'); setTimeout(onClose, 900) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    if (username.length < 3) { setError('Username mind. 3 Zeichen.'); setLoading(false); return }
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).single()
    if (existing) { setError('Username bereits vergeben.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    setLoading(false)
    if (error) setError(error.message)
    else { setSuccess('Account erstellt!'); setTimeout(onClose, 1200) }
  }

  const inp = {
    padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
    color: 'var(--white)', fontFamily: 'var(--ff-body)', fontSize: '0.88rem', outline: 'none',
    width: '100%', transition: 'border-color 0.2s',
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--crimson-mid)', border: '1px solid var(--border)',
        padding: '36px 32px', width: '100%', maxWidth: 400,
        animation: 'slideUp 0.25s ease',
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--white)' }}>
              {tab === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
            </div>
            <div style={{ fontFamily: 'var(--ff-label)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--gold)', marginTop: 4, textTransform: 'uppercase' }}>
              FlyOriginals
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-dim)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }} style={{
              flex: 1, padding: '8px 0', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'var(--ff-label)', fontSize: '0.7rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: tab === t ? 'var(--gold)' : 'var(--white-dim)', cursor: 'pointer', transition: 'color 0.2s',
            }}>
              {t === 'login' ? 'Login' : 'Registrieren'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input style={inp} type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <input style={inp} type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            {error && <div style={{ color: '#FF6060', fontSize: '0.75rem', fontFamily: 'var(--ff-label)' }}>⚠ {error}</div>}
            {success && <div style={{ color: var_gold_safe(), fontSize: '0.75rem', fontFamily: 'var(--ff-label)' }}>✓ {success}</div>}
            <button type="submit" className="btn-cta btn-cta-solid" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
              {loading ? 'Lädt…' : 'Einloggen'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input style={inp} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={20}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <input style={inp} type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <input style={inp} type="password" placeholder="Passwort (mind. 6 Zeichen)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            {error && <div style={{ color: '#FF6060', fontSize: '0.75rem', fontFamily: 'var(--ff-label)' }}>⚠ {error}</div>}
            {success && <div style={{ color: '#70D870', fontSize: '0.75rem', fontFamily: 'var(--ff-label)' }}>✓ {success}</div>}
            <button type="submit" className="btn-cta btn-cta-solid" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
              {loading ? 'Lädt…' : 'Account erstellen'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function var_gold_safe() { return '#70D870' }
