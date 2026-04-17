import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GAMES = [
  {
    id: 'egg-clicker',
    title: 'Hühnerei Clicker',
    emoji: '🥚',
    desc: 'Klick Eier, baue eine Hühner-Farm und werde zum Eier-Gott!',
    tags: ['Idle', 'Clicker'],
    ready: true,
    color: '#F4C430',
    bg: 'linear-gradient(135deg, #FFF6C0, #FFE57A)',
  },
  {
    id: 'cookie-farm',
    title: 'Keks-Farm',
    emoji: '🍪',
    desc: 'Backe unendlich viele Kekse. Kommt bald!',
    tags: ['Idle', 'Bald'],
    ready: false,
    color: '#C4956A',
    bg: 'linear-gradient(135deg, #F5EDD0, #E8C88A)',
  },
  {
    id: 'space-miner',
    title: 'Space Miner',
    emoji: '🚀',
    desc: 'Baue ein galaktisches Bergbau-Imperium. In Entwicklung!',
    tags: ['Strategie', 'Bald'],
    ready: false,
    color: '#4A78B0',
    bg: 'linear-gradient(135deg, #D0E4F5, #A0C4E8)',
  },
  {
    id: 'dragon-hatch',
    title: 'Drachen-Brut',
    emoji: '🐉',
    desc: 'Schlüpf und züchte mythische Drachen. In Planung!',
    tags: ['RPG', 'Bald'],
    ready: false,
    color: '#8050A0',
    bg: 'linear-gradient(135deg, #EAD8F5, #D0B0E8)',
  },
]

const fmt = n => {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' Bio.'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' Mrd.'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' Mio.'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Math.floor(n).toLocaleString('de')
}

export default function HubPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [globalEggs, setGlobalEggs] = useState(0)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from('leaderboard')
      .select('score, score_label, profiles(username)')
      .eq('game_id', 'egg-clicker')
      .order('score', { ascending: false })
      .limit(10)
    if (data) {
      setLeaderboard(data)
      setGlobalEggs(data.reduce((s, r) => s + (r.score || 0), 0))
    }
  }

  return (
    <div style={{ flex: 1, padding: '32px 24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        marginBottom: 40,
        padding: '32px 20px',
        background: 'var(--brown-d)',
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎮</div>
        <h1 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '2.4rem', color: 'var(--yolk)', marginBottom: 8 }}>
          GameHub
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
          Deine Sammlung von Browser-Games. Spielfortschritt wird in der Cloud gespeichert!
        </p>
        {globalEggs > 0 && (
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(244,196,48,0.15)', border: '1px solid rgba(244,196,48,0.3)',
            padding: '6px 16px', borderRadius: 20 }}>
            <span style={{ color: 'var(--yolk)', fontWeight: 800, fontSize: '0.85rem' }}>
              🥚 Global: {fmt(globalEggs)} Eier von allen Spielern produziert!
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>

        {/* Game Cards */}
        <div>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.2rem', color: 'var(--brown)', marginBottom: 16 }}>
            🕹 Spiele
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {GAMES.map(game => (
              <div key={game.id} className="card" style={{
                background: game.bg,
                border: `2px solid ${game.color}40`,
                borderRadius: 16,
                padding: 0,
                overflow: 'hidden',
                transition: 'transform 0.15s, box-shadow 0.15s',
                ...(game.ready ? { cursor: 'pointer' } : { opacity: 0.75 }),
              }}
                onMouseEnter={e => game.ready && (e.currentTarget.style.transform = 'translateY(-4px)', e.currentTarget.style.boxShadow = `0 8px 30px ${game.color}40`)}
                onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '')}
              >
                <div style={{ padding: '20px 18px 0' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: 8, lineHeight: 1 }}>{game.emoji}</div>
                  <h3 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', color: 'var(--brown-d)', marginBottom: 4 }}>
                    {game.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-l)', lineHeight: 1.4, marginBottom: 12 }}>
                    {game.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                    {game.tags.map(t => (
                      <span key={t} className="tag" style={{
                        background: `${game.color}25`,
                        color: 'var(--brown-d)',
                        border: `1px solid ${game.color}60`,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '0 18px 18px' }}>
                  {game.ready ? (
                    <Link to={`/game/${game.id}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                        ▶ Spielen
                      </button>
                    </Link>
                  ) : (
                    <button className="btn btn-secondary" disabled style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', opacity: .6, cursor: 'not-allowed' }}>
                      🔒 Bald verfügbar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.2rem', color: 'var(--brown)', marginBottom: 16 }}>
            🏆 Rangliste – Egg Clicker
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {leaderboard.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-l)', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥚</div>
                Noch keine Einträge.<br />Sei der Erste!
              </div>
            ) : (
              leaderboard.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i === 0 ? 'var(--yolk-l)' : i === 1 ? '#F5F0E0' : i === 2 ? '#F0EDE8' : 'transparent',
                }}>
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--yolk-d)' : i === 1 ? '#B0B0B0' : i === 2 ? '#C47020' : 'var(--cream-d)',
                    color: i < 3 ? 'white' : 'var(--text-l)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Fredoka One, cursive',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brown-d)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.profiles?.username || 'Anonym'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-l)' }}>
                      {entry.score_label || fmt(entry.score) + ' Eier'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-ll)', textAlign: 'center', marginTop: 8 }}>
            Aktualisiert beim Speichern im Spiel
          </p>
        </div>

      </div>
    </div>
  )
}
