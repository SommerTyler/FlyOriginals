import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login')
  const [f, setF] = useState({ name:'', email:'', password:'' })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  const addHov = () => document.body.classList.add('hovering')
  const remHov = () => document.body.classList.remove('hovering')

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
      const { error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { username: f.name } } })
      if (error) setErr(error.message)
      else { setOk('Account erstellt.'); setTimeout(onClose, 1100) }
    }
    setLoading(false)
  }

  const inp = {
    display:'block',width:'100%',padding:'14px 0',background:'transparent',
    border:'none',borderBottom:'1px solid var(--bdr)',color:'var(--cream)',
    fontFamily:'var(--f-sans)',fontSize:'.88rem',fontWeight:300,outline:'none',
    transition:'border-color .25s',caretColor:'var(--gold2)',cursor:'none',
  }

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,.82)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:24,
      backdropFilter:'blur(10px)',animation:'fIn .2s ease',
    }}>
      <style>{`@keyframes fIn{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{
        background:'var(--ink2)',border:'1px solid var(--bdr)',
        padding:'44px 40px',width:'100%',maxWidth:420,position:'relative',
        animation:'mUp .28s cubic-bezier(.16,1,.3,1)',
      }}>
        <style>{`@keyframes mUp{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}`}</style>

        <button onClick={onClose} onMouseEnter={addHov} onMouseLeave={remHov}
          style={{position:'absolute',top:18,right:20,background:'none',border:'none',
          color:'var(--cream30)',cursor:'none',fontSize:'1rem',lineHeight:1,
          transition:'color .2s'}}
          onMouseOver={e=>e.target.style.color='var(--cream)'}
          onMouseOut={e=>e.target.style.color='var(--cream30)'}
        >✕</button>

        <div style={{marginBottom:30}}>
          <div style={{fontFamily:'var(--f-display)',fontSize:'1.65rem',fontWeight:400,fontStyle:'italic',color:'var(--cream)',lineHeight:1.1,marginBottom:5}}>
            {tab==='login' ? 'Willkommen zurück.' : 'Account erstellen.'}
          </div>
          <div style={{fontFamily:'var(--f-mono)',fontSize:'.5rem',letterSpacing:'.32em',textTransform:'uppercase',color:'var(--gold)',opacity:.8}}>FlyOriginals</div>
        </div>

        <div style={{display:'flex',borderBottom:'1px solid var(--bdr)',marginBottom:32}}>
          {['login','register'].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr('');setOk('')}}
              onMouseEnter={addHov} onMouseLeave={remHov}
              style={{flex:1,padding:'8px 0',background:'none',border:'none',cursor:'none',
                borderBottom:tab===t?'1px solid var(--gold)':'1px solid transparent',
                marginBottom:-1,fontFamily:'var(--f-mono)',fontSize:'.56rem',
                letterSpacing:'.2em',textTransform:'uppercase',
                color:tab===t?'var(--gold2)':'var(--cream30)',transition:'color .2s'}}
            >{t==='login'?'Login':'Registrieren'}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:22}}>
          {tab==='register' && <div>
            <label style={{display:'block',fontFamily:'var(--f-mono)',fontSize:'.5rem',fontWeight:300,letterSpacing:'.26em',textTransform:'uppercase',color:'var(--gold)',marginBottom:7,opacity:.8}}>Username</label>
            <input style={inp} type="text" required minLength={3} placeholder="DeinName" value={f.name} onChange={upd('name')}
              onFocus={e=>e.target.style.borderColor='var(--gold2)'} onBlur={e=>e.target.style.borderColor='var(--bdr)'} onMouseEnter={addHov} onMouseLeave={remHov} />
          </div>}
          <div>
            <label style={{display:'block',fontFamily:'var(--f-mono)',fontSize:'.5rem',fontWeight:300,letterSpacing:'.26em',textTransform:'uppercase',color:'var(--gold)',marginBottom:7,opacity:.8}}>E-Mail</label>
            <input style={inp} type="email" required placeholder="deine@email.de" value={f.email} onChange={upd('email')}
              onFocus={e=>e.target.style.borderColor='var(--gold2)'} onBlur={e=>e.target.style.borderColor='var(--bdr)'} onMouseEnter={addHov} onMouseLeave={remHov} />
          </div>
          <div>
            <label style={{display:'block',fontFamily:'var(--f-mono)',fontSize:'.5rem',fontWeight:300,letterSpacing:'.26em',textTransform:'uppercase',color:'var(--gold)',marginBottom:7,opacity:.8}}>Passwort</label>
            <input style={inp} type="password" required minLength={6} placeholder="••••••••" value={f.password} onChange={upd('password')}
              onFocus={e=>e.target.style.borderColor='var(--gold2)'} onBlur={e=>e.target.style.borderColor='var(--bdr)'} onMouseEnter={addHov} onMouseLeave={remHov} />
          </div>
          {err && <div style={{fontFamily:'var(--f-mono)',fontSize:'.6rem',color:'#e06060',letterSpacing:'.1em'}}>// {err}</div>}
          {ok  && <div style={{fontFamily:'var(--f-mono)',fontSize:'.6rem',color:'var(--gold2)',letterSpacing:'.1em'}}>✓ {ok}</div>}
          <button type="submit" disabled={loading}
            onMouseEnter={addHov} onMouseLeave={remHov}
            style={{
              padding:'14px 28px',background:'var(--crimson2)',border:'none',
              color:'var(--cream)',fontFamily:'var(--f-mono)',fontSize:'.58rem',
              fontWeight:300,letterSpacing:'.2em',textTransform:'uppercase',
              cursor:'none',transition:'background .25s',marginTop:4,
            }}
            onMouseOver={e=>e.currentTarget.style.background='var(--crimson)'}
            onMouseOut={e=>e.currentTarget.style.background='var(--crimson2)'}
          >{loading?'Lädt…':tab==='login'?'Einloggen →':'Account erstellen →'}</button>
        </form>
      </div>
    </div>
  )
}
