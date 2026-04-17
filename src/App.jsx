import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import HubPage from './pages/HubPage'
import GamePage from './pages/GamePage'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF9EC' }}>
      <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '2rem', color: '#8B5E3C' }}>🥚 Lädt…</div>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, profile, fetchProfile }}>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/" element={<HubPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}
