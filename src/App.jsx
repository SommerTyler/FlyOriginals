import { useEffect, useState } from 'react'
import { hasSupabaseConfig, supabase } from './lib/supabaseClient'

const LOADER_DURATION_MS = 2600

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
        <div className="loader-logo">FlyOriginals</div>
        <div className="loader-ring" />
      </div>
    )
  }

  return (
    <div className="page-shell">
      <header className="top-nav">
        <div className="brand">FlyOriginals</div>
        <nav>
          <a href="#ueber-uns">Über uns</a>
          <a href="#projekte">Projekte</a>
          <a href="#partner">Partner</a>
          <a href="#socials">Socials</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <p className="eyebrow">Landingpage</p>
          <h1>FlyOriginals</h1>
          <p>
            Kreative Projekte, starke Partnerschaften und Content mit
            Leidenschaft.
          </p>
        </section>

        <section id="ueber-uns" className="content-section">
          <h2>Über uns</h2>
          <p>
            FlyOriginals steht fuer kreative Ideen, authentische Inhalte und
            nachhaltige Markenentwicklung. Wir verbinden Community, Content und
            Design zu einem klaren Erlebnis.
          </p>
        </section>

        <section id="projekte" className="content-section">
          <h2>Projekte</h2>
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

        <section id="partner" className="content-section">
          <h2>Partner</h2>
          <p>
            Wir arbeiten mit starken Partnern aus Medien, Entertainment und
            Technologie zusammen.
          </p>
        </section>

        <section id="socials" className="content-section">
          <h2>Socials</h2>
          <div className="embed-grid">
            <div className="embed-card">
              <h3>YouTube</h3>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="FlyOriginals YouTube"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="embed-card">
              <h3>Twitch</h3>
              <iframe
                src="https://player.twitch.tv/?channel=twitch&parent=localhost"
                title="FlyOriginals Twitch"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
          <p className="helper-text">
            Wichtig: Fuer Twitch muss der `parent` Parameter spaeter auf deine
            echte Domain geaendert werden.
          </p>
        </section>

        <section id="kontakt" className="content-section">
          <h2>Kontaktformular</h2>
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

            <button type="submit" disabled={submitStatus.type === 'loading'}>
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
        <a href="#">Impressum</a>
        <a href="#">Datenschutz</a>
      </footer>
    </div>
  )
}

export default App
