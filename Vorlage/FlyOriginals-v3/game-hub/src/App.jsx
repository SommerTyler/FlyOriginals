import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import HubPage from './pages/HubPage'
import GamePage from './pages/GamePage'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  const isAdmin = profile?.is_admin === true

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--fd)', fontStyle: 'italic', fontSize: '1.8rem', color: 'var(--cream)', opacity: .5 }}>FlyOriginals</div>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, fetchProfile }}>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/"           element={<HubPage />} />
          <Route path="/game/:id"   element={<GamePage />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}
