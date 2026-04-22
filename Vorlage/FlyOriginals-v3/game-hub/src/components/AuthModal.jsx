import { useState } from 'react'
import { supabase } from '../lib/supabase'

const H = () => document.body.classList.add('hov')
const L = () => document.body.classList.remove('hov')

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault(); setErr(''); setOk(''); setLoading(true)
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
      if (error) setErr(error.message)
      else { setOk('Willkommen zurück.'); setTimeout(onClose, 900) }
    } else {
      if (f.name.length < 3) { setErr('Username mind. 3 Zeichen.'); setLoading(false); return }
      const { data: ex } = await supabase.from('profiles').select('id').eq('username', f.name).single()
      if (ex) { setErr('Username bereits vergeben.'); setLoading(false); return }
      const { error } = await supabase.auth.signUp({
        email: f.email, password: f.password, options: { data: { username: f.name } },
      })
      if (error) setErr(error.message)
      else { setOk('Account erstellt.'); setTimeout(onClose, 1100) }
    }
    setLoading(false)
  }

  const inp = {
    display: 'block', width: '100%', padding: '13px 0',
    background: 'transparent', border: 'none', borderBottom: '1px solid var(--bdr)',
    color: 'var(--cream)', fontFamily: 'var(--fu)', fontSize: '.86rem', fontWeight: 400,
    outline: 'none', caretColor: 'var(--gold2)', cursor: 'none',
    transition: 'border-color .25s, color .25s',
  }
  const lbl = {
    display: 'block', fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 600,
    letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .8, marginBottom: 8,
  }

  return (
    <div onMouseDown={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backdropFilter: 'blur(12px)',
      animation: 'fadeIn .22s ease',
    }}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--bdr)',
        padding: '44px 40px', width: '100%', maxWidth: 420, position: 'relative',
        animation: 'modalIn .3s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Close */}
        <button onClick={onClose} onMouseEnter={H} onMouseLeave={L} style={{
          position: 'absolute', top: 18, right: 20, background: 'none', border: 'none',
          color: 'var(--c40)', cursor: 'none', fontSize: '1rem', lineHeight: 1, transition: 'color .2s',
        }}
          onMouseOver={e => e.target.style.color = 'var(--cream)'}
          onMouseOut={e => e.target.style.color = 'var(--c40)'}
        >✕</button>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--fd)', fontSize: '1.7rem', fontWeight: 400,
            fontStyle: 'italic', color: 'var(--cream)', lineHeight: 1.1, marginBottom: 5,
          }}>
            {tab === 'login' ? 'Willkommen zurück.' : 'Account erstellen.'}
          </div>
          <div style={{ fontFamily: 'var(--fu)', fontSize: '.48rem', fontWeight: 600, letterSpacing: '.34em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .75 }}>
            FlyOriginals
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bdr)', marginBottom: 32 }}>
          {[['login', 'Login'], ['register', 'Registrieren']].map(([t, l]) => (
            <button key={t} onClick={() => { setTab(t); setErr(''); setOk('') }}
              onMouseEnter={H} onMouseLeave={L} style={{
                flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'none',
                borderBottom: tab === t ? '1px solid var(--gold)' : '1px solid transparent',
                marginBottom: -1, fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 600,
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: tab === t ? 'var(--gold2)' : 'var(--c40)', transition: 'color .2s',
              }}>{l}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {tab === 'register' && (
            <div>
              <label style={lbl}>Username</label>
              <input style={inp} type="text" required minLength={3} placeholder="DeinName"
                value={f.name} onChange={upd('name')}
                onFocus={e => e.target.style.borderColor = 'var(--gold2)'}
                onBlur={e => e.target.style.borderColor = 'var(--bdr)'}
                onMouseEnter={H} onMouseLeave={L} />
            </div>
          )}
          <div>
            <label style={lbl}>E-Mail</label>
            <input style={inp} type="email" required placeholder="deine@email.de"
              value={f.email} onChange={upd('email')}
              onFocus={e => e.target.style.borderColor = 'var(--gold2)'}
              onBlur={e => e.target.style.borderColor = 'var(--bdr)'}
              onMouseEnter={H} onMouseLeave={L} />
          </div>
          <div>
            <label style={lbl}>Passwort</label>
            <input style={inp} type="password" required minLength={6} placeholder="••••••••"
              value={f.password} onChange={upd('password')}
              onFocus={e => e.target.style.borderColor = 'var(--gold2)'}
              onBlur={e => e.target.style.borderColor = 'var(--bdr)'}
              onMouseEnter={H} onMouseLeave={L} />
          </div>

          {err && <p style={{ fontFamily: 'var(--fu)', fontSize: '.62rem', color: '#e06060', letterSpacing: '.06em' }}>⚠ {err}</p>}
          {ok  && <p style={{ fontFamily: 'var(--fu)', fontSize: '.62rem', color: 'var(--gold2)', letterSpacing: '.06em' }}>✓ {ok}</p>}

          <button type="submit" disabled={loading} onMouseEnter={H} onMouseLeave={L}
            style={{
              padding: '14px 0', background: 'var(--red2)', border: '1px solid var(--red2)',
              color: 'var(--cream)', fontFamily: 'var(--fu)', fontSize: '.6rem', fontWeight: 600,
              letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'none',
              transition: 'background .25s, border-color .25s', marginTop: 4,
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--red3)'; e.currentTarget.style.borderColor = 'var(--red3)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--red2)'; e.currentTarget.style.borderColor = 'var(--red2)' }}
          >{loading ? 'Lädt…' : tab === 'login' ? 'Einloggen →' : 'Account erstellen →'}</button>
        </form>
      </div>
    </div>
  )
}
