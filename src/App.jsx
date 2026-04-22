import { useEffect, useState } from 'react'
import { hasSupabaseConfig, supabase } from './lib/supabaseClient'

const LOADER_DURATION_MS = 2600
const STATS = [
  { value: '24+', label: 'Kreative Projekte' },
  { value: '12', label: 'Langfristige Partner' },
  { value: '150+', label: 'Produzierte Inhalte' },
  { value: '100%', label: 'Leidenschaft' },
]

function App() {
  const [showLoader, setShowLoader] = useState(true)
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitStatus, setSubmitStatus] = useState({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLoader(false)
    }, LOADER_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitStatus({ type: 'loading', message: 'Nachricht wird gesendet...' })

    if (!hasSupabaseConfig || !supabase) {
      setSubmitStatus({
        type: 'error',
        message:
          'Supabase ist noch nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.',
      })
      return
    }

    const { error } = await supabase.from('contact_requests').insert({
      name: formState.name,
      email: formState.email,
      message: formState.message,
      created_at: new Date().toISOString(),
    })

    if (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Senden fehlgeschlagen. Bitte versuche es erneut.',
      })
      return
    }

    setFormState({ name: '', email: '', message: '' })
    setSubmitStatus({
      type: 'success',
      message: 'Danke! Deine Nachricht wurde erfolgreich gesendet.',
    })
  }

  if (showLoader) {
    return (
      <div className="loader-screen" role="status" aria-label="Ladeansicht">
        <p className="loader-logo">FlyOriginals</p>
        <div className="loader-bow" />
      </div>
    )
  }

  return (
    <div className="page">
      <header className="top-nav">
        <a className="brand" href="#hero">
          FlyOriginals
        </a>
        <nav className="nav-links">
          <a href="#ueber-uns">Story</a>
          <a href="#projekte">Projekte</a>
          <a href="#werte">Werte</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
      </header>

      <main>
        <section id="hero" className="hero-section">
          <p className="hero-eyebrow">Born Fly. Stay Original.</p>
          <h1>FlyOriginals</h1>
          <p className="hero-tagline">
            Kreative Projekte, starke Partnerschaften und Content mit klarer
            Handschrift.
          </p>
          <div className="hero-actions">
            <a href="#projekte" className="btn btn-large">
              Projekte ansehen
            </a>
            <a href="#ueber-uns" className="btn btn-outline btn-large">
              Unsere Story
            </a>
          </div>
        </section>

        <section id="ueber-uns" className="content-section section-parchment">
          <div className="section-inner two-col">
            <div>
              <p className="section-label">- Ueber uns</p>
              <h2>Mehr als nur Content.</h2>
              <p>
                FlyOriginals steht fuer kreative Ideen, authentische Inhalte
                und nachhaltige Markenentwicklung. Wir verbinden Community,
                Storytelling und Design zu einem klaren Erlebnis.
              </p>
            </div>
            <div className="about-highlight">
              <span className="roman">XII</span>
              <span>Jahre kreative Entwicklung</span>
            </div>
          </div>
        </section>

        <section id="projekte" className="content-section">
          <div className="section-inner">
            <p className="section-label">- Projekte</p>
            <h2>Ausgewaehlte Arbeiten</h2>
          </div>
          <div className="cards-grid">
            <article className="card">
              <h3>Branding Kampagnen</h3>
              <p>
                Kreative Konzepte fuer digitale Kampagnen mit hohem
                Wiedererkennungswert.
              </p>
            </article>
            <article className="card">
              <h3>Livestream Produktion</h3>
              <p>
                Technische und kreative Umsetzung von Streams fuer YouTube und
                Twitch.
              </p>
            </article>
            <article className="card">
              <h3>Community Aktivierungen</h3>
              <p>
                Interaktive Formate, Events und Aktionen, die Zielgruppen
                langfristig binden.
              </p>
            </article>
          </div>
        </section>

        <section id="stats" className="stats-section">
          <div className="stats-grid">
            {STATS.map((item) => (
              <article key={item.label} className="stat-card">
                <span className="stat-value">{item.value}</span>
                <span className="stat-label">{item.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="werte" className="content-section section-parchment">
          <div className="section-inner">
            <p className="section-label">- Werte</p>
            <h2>Was uns ausmacht</h2>
          </div>
          <div className="values-grid">
            <article className="value-item">
              <h3>Originalitaet</h3>
              <p>Keine Schablone. Jede Umsetzung traegt eine eigene DNA.</p>
            </article>
            <article className="value-item">
              <h3>Qualitaet</h3>
              <p>Saubere Konzepte, klares Design und verlassliche Lieferung.</p>
            </article>
            <article className="value-item">
              <h3>Community</h3>
              <p>Wir entwickeln Formate, die langfristig Verbindung schaffen.</p>
            </article>
          </div>
        </section>

        <section id="socials" className="content-section">
          <div className="section-inner">
            <p className="section-label">- Socials</p>
            <h2>Live &amp; On Demand</h2>
          </div>
          <div className="cards-grid">
            <article className="card">
              <h3>YouTube</h3>
              <p>Highlights, Videos und Formate rund um FlyOriginals.</p>
              <a className="text-link" href="https://www.youtube.com" target="_blank" rel="noreferrer">
                Kanal oeffnen
              </a>
            </article>
            <article className="card">
              <h3>Twitch</h3>
              <p>Livestreams, Echtzeit-Interaktion und Community-Momente.</p>
              <a className="text-link" href="https://www.twitch.tv" target="_blank" rel="noreferrer">
                Stream ansehen
              </a>
            </article>
            <article className="card">
              <h3>Instagram</h3>
              <p>Blicke hinter die Kulissen, Reels und visuelle Updates.</p>
              <a className="text-link" href="https://www.instagram.com" target="_blank" rel="noreferrer">
                Profil ansehen
              </a>
            </article>
          </div>
        </section>

        <section id="kontakt" className="content-section cta-section">
          <div className="section-inner">
            <p className="section-label">- Kontakt</p>
            <h2>Bereit fuer das naechste Projekt?</h2>
            <p>
              Erzaehl uns von deiner Idee. Wir melden uns schnell und konkret
              bei dir.
            </p>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formState.name}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="message">Nachricht</label>
            <textarea
              id="message"
              name="message"
              value={formState.message}
              onChange={handleInputChange}
              rows="5"
              required
            />

            <button type="submit" className="btn" disabled={submitStatus.type === 'loading'}>
              {submitStatus.type === 'loading' ? 'Senden...' : 'Absenden'}
            </button>
            {submitStatus.message && (
              <p
                className={`form-feedback ${
                  submitStatus.type === 'error' ? 'error' : 'success'
                }`}
              >
                {submitStatus.message}
              </p>
            )}
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <span>FlyOriginals</span>
        <a href="#">Impressum</a>
        <a href="#">Datenschutz</a>
      </footer>
    </div>
  )
}

export default App
