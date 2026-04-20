import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [modal, setModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('')
  const { pathname } = useLocation()
  const inGame = pathname.startsWith('/game/')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // track active section via IntersectionObserver
  useEffect(() => {
    if (inGame) return
    const sections = ['about','portfolio','live','kontakt']
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveLink(e.target.id) })
    }, { threshold: 0.4 })
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [inGame])

  const addHover = () => document.body.classList.add('hovering')
  const remHover = () => document.body.classList.remove('hovering')

  if (inGame) return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:500,height:54,
      background:'rgba(6,0,1,.97)',borderBottom:'1px solid var(--bdr)',
      display:'flex',alignItems:'center',padding:'0 32px',
    }}>
      <Link to="/" onMouseEnter={addHover} onMouseLeave={remHover}
        style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10,
          fontFamily:'var(--f-mono)',fontSize:'.58rem',fontWeight:300,
          letterSpacing:'.22em',textTransform:'uppercase',color:'var(--gold2)',transition:'color .2s'}}>
        ← FlyOriginals
      </Link>
    </nav>
  )

  const links = [
    {label:'About',href:'#about'},
    {label:'Portfolio',href:'#portfolio'},
    {label:'Live',href:'#live'},
    {label:'Kontakt',href:'#kontakt'},
  ]

  return (
    <>
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:500,
        height:64,display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 clamp(24px,5vw,80px)',
        background: scrolled ? 'rgba(6,0,1,.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bdr)' : '1px solid transparent',
        transition:'all .5s cubic-bezier(.16,1,.3,1)',
      }}>
        <a href="#hero" onMouseEnter={addHover} onMouseLeave={remHover} style={{textDecoration:'none',cursor:'none'}}>
          <div style={{fontFamily:'var(--f-display)',fontSize:'1.28rem',fontWeight:400,color:'var(--cream)',letterSpacing:'.06em',lineHeight:1,transition:'color .25s'}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--gold2)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--cream)'}
          >FlyOriginals</div>
          <div style={{fontFamily:'var(--f-mono)',fontSize:'.44rem',fontWeight:300,letterSpacing:'.36em',textTransform:'uppercase',color:'var(--gold)',marginTop:3,opacity:.8}}>
            Film · Studio
          </div>
        </a>

        <div style={{display:'flex',alignItems:'center',gap:40}}>
          {links.map(l => (
            <a key={l.label} href={l.href}
              onMouseEnter={addHover} onMouseLeave={remHover}
              style={{
                textDecoration:'none',cursor:'none',
                fontFamily:'var(--f-mono)',fontSize:'.58rem',fontWeight:300,
                letterSpacing:'.2em',textTransform:'uppercase',
                color: activeLink === l.href.slice(1) ? 'var(--gold2)' : 'var(--cream30)',
                transition:'color .25s',position:'relative',paddingBottom:2,
              }}
              onMouseOver={e=>e.currentTarget.style.color='var(--gold2)'}
              onMouseOut={e=>e.currentTarget.style.color= activeLink===l.href.slice(1)?'var(--gold2)':'var(--cream30)'}
            >
              {l.label}
              <span style={{
                position:'absolute',bottom:-1,left:0,right:0,height:'1px',
                background:'var(--gold)',
                transform: activeLink===l.href.slice(1) ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin:'left',transition:'transform .3s',
              }}/>
            </a>
          ))}

          {user ? (
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <span style={{fontFamily:'var(--f-mono)',fontSize:'.54rem',letterSpacing:'.14em',color:'var(--gold)',opacity:.8}}>{profile?.username}</span>
              <button onMouseEnter={addHover} onMouseLeave={remHover}
                onClick={()=>supabase.auth.signOut()}
                style={{background:'none',border:'none',cursor:'none',fontFamily:'var(--f-mono)',fontSize:'.54rem',letterSpacing:'.18em',textTransform:'uppercase',color:'var(--cream30)',transition:'color .2s'}}
                onMouseOver={e=>e.target.style.color='var(--gold2)'}
                onMouseOut={e=>e.target.style.color='var(--cream30)'}
              >Logout</button>
            </div>
          ) : (
            <button onMouseEnter={addHover} onMouseLeave={remHover}
              onClick={()=>setModal(true)}
              style={{background:'none',border:'1px solid var(--bdr2)',cursor:'none',fontFamily:'var(--f-mono)',fontSize:'.54rem',fontWeight:300,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--gold2)',padding:'8px 18px',transition:'all .25s'}}
              onMouseOver={e=>{e.currentTarget.style.background='var(--gold)';e.currentTarget.style.color='var(--ink)';e.currentTarget.style.borderColor='var(--gold)'}}
              onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gold2)';e.currentTarget.style.borderColor='var(--bdr2)'}}
            >Login</button>
          )}
        </div>
      </nav>

      {modal && <AuthModal onClose={()=>setModal(false)} />}
    </>
  )
}
