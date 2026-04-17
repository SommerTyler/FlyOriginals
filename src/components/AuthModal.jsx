import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login')
  const [f, setF] = useState({ name:'', email:'', password:'' })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const upd = k => e => setF(p=>({...p,[k]:e.target.value}))

  async function submit(e) {
    e.preventDefault(); setErr(''); setOk(''); setLoading(true)
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email:f.email, password:f.password })
      if (error) setErr(error.message); else { setOk('Willkommen zurück!'); setTimeout(onClose, 800) }
    } else {
      if (f.name.length < 3) { setErr('Username mind. 3 Zeichen'); setLoading(false); return }
      const { data:ex } = await supabase.from('profiles').select('id').eq('username',f.name).single()
      if (ex) { setErr('Username bereits vergeben'); setLoading(false); return }
      const { error } = await supabase.auth.signUp({ email:f.email, password:f.password, options:{ data:{ username:f.name } } })
      if (error) setErr(error.message); else { setOk('Account erstellt!'); setTimeout(onClose, 1000) }
    }
    setLoading(false)
  }

  const inp = { display:'block', width:'100%', padding:'12px 0', background:'transparent', border:'none', borderBottom:'1px solid var(--bdr)', color:'var(--white)', fontFamily:'var(--ui)', fontSize:'.85rem', outline:'none', marginBottom:20, transition:'border-color .2s' }
  const lbl = { display:'block', fontFamily:'var(--ui)', fontSize:'.55rem', fontWeight:600, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gold)', marginBottom:6 }

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(6px)'}}>
      <div style={{background:'var(--bg2)',border:'1px solid var(--bdr)',padding:'40px 36px',width:'100%',maxWidth:400,animation:'up .22s ease',position:'relative'}}>
        <style>{`@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`}</style>
        <button onClick={onClose} style={{position:'absolute',top:16,right:18,background:'none',border:'none',color:'var(--white-60)',cursor:'pointer',fontSize:'1.1rem',lineHeight:1}}>✕</button>

        <div style={{fontFamily:'var(--display)',fontSize:'1.7rem',fontWeight:300,color:'var(--white)',marginBottom:4}}>
          {tab==='login' ? 'Willkommen zurück' : 'Account erstellen'}
        </div>
        <div style={{fontFamily:'var(--ui)',fontSize:'.52rem',letterSpacing:'.28em',textTransform:'uppercase',color:'var(--gold)',marginBottom:28}}>FlyOriginals</div>

        <div style={{display:'flex',borderBottom:'1px solid var(--bdr)',marginBottom:28}}>
          {['login','register'].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr('');setOk('')}} style={{flex:1,padding:'7px 0',background:'none',border:'none',borderBottom:tab===t?'2px solid var(--gold)':'2px solid transparent',marginBottom:-1,fontFamily:'var(--ui)',fontSize:'.6rem',fontWeight:600,letterSpacing:'.18em',textTransform:'uppercase',color:tab===t?'var(--gold)':'var(--white-60)',cursor:'pointer',transition:'color .2s'}}>
              {t==='login'?'Login':'Registrieren'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {tab==='register' && <>
            <label style={lbl}>Username</label>
            <input style={inp} type="text" required minLength={3} placeholder="DeinName" value={f.name} onChange={upd('name')} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--bdr)'} />
          </>}
          <label style={lbl}>E-Mail</label>
          <input style={inp} type="email" required placeholder="deine@email.de" value={f.email} onChange={upd('email')} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--bdr)'} />
          <label style={lbl}>Passwort</label>
          <input style={inp} type="password" required minLength={6} placeholder="••••••••" value={f.password} onChange={upd('password')} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--bdr)'} />
          {err && <div style={{color:'#ff6060',fontSize:'.72rem',marginBottom:12,fontFamily:'var(--ui)'}}>⚠ {err}</div>}
          {ok  && <div style={{color:'#70d870',fontSize:'.72rem',marginBottom:12,fontFamily:'var(--ui)'}}>✓ {ok}</div>}
          <button type="submit" className="btn btn-red" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:4}}>{loading?'Lädt…':tab==='login'?'Einloggen':'Account erstellen'}</button>
        </form>
      </div>
    </div>
  )
}
