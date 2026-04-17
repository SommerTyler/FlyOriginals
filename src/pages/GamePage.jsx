import { useParams, Link } from 'react-router-dom'
import EggClicker from '../games/EggClicker'

const GAME_MAP = {
  'egg-clicker': EggClicker,
}

export default function GamePage() {
  const { gameId } = useParams()
  const GameComponent = GAME_MAP[gameId]

  if (!GameComponent) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>❓</div>
      <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.5rem', color: 'var(--brown)' }}>
        Spiel nicht gefunden
      </div>
      <Link to="/"><button className="btn btn-primary">← Zurück zum Hub</button></Link>
    </div>
  )

  return <GameComponent />
}
