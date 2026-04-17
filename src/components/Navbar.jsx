import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [modal, setModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const inGame = pathname.startsWith('/game/')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  if (inGame) return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:400,height:52,
      background:'var(--bg)',borderBottom:'1px solid var(--bdr)',
      display:'flex',alignItems:'center',padding:'0 28px',
    }}>
      <Link to="/" style={{textDecoration:'none',fontFamily:'var(--ui)',fontSize:'.7rem',fontWeight:600,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',display:'flex',alignItems:'center',gap:8}}>
        ← FlyOriginals
      </Link>
    </nav>
  )

  const links = ['About','Portfolio','Live','Kontakt']
  const T = { fontFamily:'var(--ui)',fontSize:'.65rem',fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--white-60)',textDecoration:'none',transition:'color .2s',cursor:'pointer' }

  return (
    <>
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:400,height:62,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 clamp(24px,5vw,72px)',
        background: scrolled ? 'rgba(14,0,4,.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bdr)' : '1px solid transparent',
        transition:'all .35s ease',
      }}>
        <a href="#hero" style={{textDecoration:'none'}}>
          <div style={{fontFamily:'var(--display)',fontSize:'1.35rem',fontWeight:400,color:'var(--white)',letterSpacing:'.06em',lineHeight:1}}>FlyOriginals</div>
          <div style={{fontFamily:'var(--ui)',fontSize:'.48rem',fontWeight:600,letterSpacing:'.32em',textTransform:'uppercase',color:'var(--gold)',marginTop:2}}>Film Studio</div>
        </a>

        <div style={{display:'flex',alignItems:'center',gap:38}}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={T}
              onMouseEnter={e=>e.target.style.color='var(--gold)'}
              onMouseLeave={e=>e.target.style.color='var(--white-60)'}
            >{l}</a>
          ))}
          {user
            ? <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontFamily:'var(--ui)',fontSize:'.62rem',letterSpacing:'.12em',color:'var(--gold)'}}>{profile?.username}</span>
                <button onClick={()=>supabase.auth.signOut()} style={{...T,background:'none',border:'none',padding:0}} onMouseEnter={e=>e.target.style.color='var(--gold)'} onMouseLeave={e=>e.target.style.color='var(--white-60)'}>Logout</button>
              </div>
            : <button onClick={()=>setModal(true)} className="btn" style={{padding:'7px 18px',fontSize:'.62rem'}}>Login</button>
          }
        </div>
      </nav>
      {modal && <AuthModal onClose={()=>setModal(false)} />}
    </>
  )
}
