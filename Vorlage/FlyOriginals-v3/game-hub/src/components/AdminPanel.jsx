import { useState } from 'react'

const H = () => document.body.classList.add('hov')
const L = () => document.body.classList.remove('hov')

// ── Input components ──────────────────────────────────────
function Field({ label, value, onChange, multiline, placeholder }) {
  const base = {
    width: '100%', background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(184,144,48,.2)', color: 'var(--cream)',
    fontFamily: 'var(--fu)', fontSize: '.8rem', fontWeight: 400,
    padding: '9px 12px', outline: 'none', resize: 'vertical',
    transition: 'border-color .2s', cursor: 'text',
    borderRadius: 0,
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: 'var(--fu)', fontSize: '.48rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .75, marginBottom: 5 }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            rows={3} style={{ ...base, display: 'block' }}
            onFocus={e => e.target.style.borderColor = 'var(--gold2)'}
            onBlur={e => e.target.style.borderColor = 'rgba(184,144,48,.2)'} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ ...base, display: 'block' }}
            onFocus={e => e.target.style.borderColor = 'var(--gold2)'}
            onBlur={e => e.target.style.borderColor = 'rgba(184,144,48,.2)'} />
      }
    </div>
  )
}

function SaveBtn({ onClick, saved, saving }) {
  return (
    <button onMouseEnter={H} onMouseLeave={L} onClick={onClick}
      style={{
        padding: '9px 22px', background: saved ? 'var(--gold)' : 'var(--red2)',
        border: 'none', color: saved ? 'var(--bg)' : 'var(--cream)',
        fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 700,
        letterSpacing: '.16em', textTransform: 'uppercase', cursor: 'none',
        transition: 'all .25s', width: '100%', marginTop: 4,
      }}>
      {saving ? 'Speichert…' : saved ? '✓ Gespeichert' : 'Speichern'}
    </button>
  )
}

// ── Section editors ───────────────────────────────────────
function HeroEditor({ data, onSave }) {
  const [d, setD] = useState(data)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const upd = k => v => setD(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const ok = await onSave('hero', d)
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Field label="Eyebrow" value={d.eyebrow} onChange={upd('eyebrow')} />
      <Field label="Titel Zeile 1" value={d.title1} onChange={upd('title1')} />
      <Field label="Titel Zeile 2 (kursiv / gold)" value={d.title2} onChange={upd('title2')} />
      <Field label="Untertitel" value={d.subtitle} onChange={upd('subtitle')} multiline />
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

function AboutEditor({ data, onSave }) {
  const [d, setD] = useState(data)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const upd = k => v => setD(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const ok = await onSave('about', d)
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Field label="Eyebrow" value={d.eyebrow} onChange={upd('eyebrow')} />
      <Field label="Titel" value={d.title} onChange={upd('title')} />
      <Field label="Text Absatz 1" value={d.p1} onChange={upd('p1')} multiline />
      <Field label="Text Absatz 2" value={d.p2} onChange={upd('p2')} multiline />
      <Field label="Zitat (Bild)" value={d.quote} onChange={upd('quote')} />
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

function StatsEditor({ data, onSave }) {
  const [items, setItems] = useState(data.items)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const updItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it))

  async function save() {
    setSaving(true)
    const ok = await onSave('stats', { items })
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ borderBottom: '1px solid rgba(184,144,48,.12)', paddingBottom: 12, marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--fu)', fontSize: '.52rem', fontWeight: 700, letterSpacing: '.18em', color: 'var(--gold2)', marginBottom: 8, textTransform: 'uppercase' }}>Stat {i + 1}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <Field label="Zahl" value={it.n} onChange={v => updItem(i, 'n', v)} />
            <Field label="Suffix" value={it.s} onChange={v => updItem(i, 's', v)} placeholder="z.B. +" />
          </div>
          <Field label="Label (\\n für Zeilenumbruch)" value={it.label} onChange={v => updItem(i, 'label', v)} />
        </div>
      ))}
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

function PortfolioEditor({ data, onSave }) {
  const [projects, setProjects] = useState(data.projects)
  const [eyebrow, setEyebrow] = useState(data.eyebrow)
  const [title, setTitle] = useState(data.title)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const updP = (i, k, v) => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [k]: v } : p))

  async function save() {
    setSaving(true)
    const ok = await onSave('portfolio', { eyebrow, title, projects })
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Field label="Eyebrow" value={eyebrow} onChange={setEyebrow} />
      <Field label="Titel" value={title} onChange={setTitle} />
      <div style={{ height: 1, background: 'rgba(184,144,48,.15)', margin: '12px 0 16px' }} />
      {projects.map((p, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(184,144,48,.12)', padding: '12px', marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--fu)', fontSize: '.5rem', fontWeight: 700, letterSpacing: '.2em', color: 'var(--gold2)', marginBottom: 10, textTransform: 'uppercase' }}>
            Projekt {p.n}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Typ" value={p.tag} onChange={v => updP(i, 'tag', v)} />
            <Field label="Jahr" value={p.yr} onChange={v => updP(i, 'yr', v)} />
          </div>
          <Field label="Titel" value={p.title} onChange={v => updP(i, 'title', v)} />
          <Field label="Beschreibung" value={p.desc} onChange={v => updP(i, 'desc', v)} multiline />
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--fu)', fontSize: '.48rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .75, marginBottom: 5 }}>Breite</label>
            <select value={p.span} onChange={e => updP(i, 'span', parseInt(e.target.value))}
              style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(184,144,48,.2)', color: 'var(--cream)', fontFamily: 'var(--fu)', fontSize: '.78rem', padding: '8px 10px', outline: 'none', cursor: 'none' }}>
              <option value={1}>Schmal (1 Spalte)</option>
              <option value={2}>Breit (2 Spalten)</option>
            </select>
          </div>
        </div>
      ))}
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

function LiveEditor({ data, onSave }) {
  const [d, setD] = useState(data)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const upd = k => v => setD(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const ok = await onSave('live', d)
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Field label="Eyebrow" value={d.eyebrow} onChange={upd('eyebrow')} />
      <Field label="Titel" value={d.title} onChange={upd('title')} />
      <Field label="Untertitel (kursiv)" value={d.subtitle} onChange={upd('subtitle')} />
      <Field label="Text" value={d.text} onChange={upd('text')} multiline />
      <Field label="Twitch Handle" value={d.twitch} onChange={upd('twitch')} placeholder="twitch.tv/..." />
      <Field label="YouTube Handle" value={d.youtube} onChange={upd('youtube')} placeholder="youtube.com/@..." />
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

function ContactEditor({ data, onSave }) {
  const [d, setD] = useState(data)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const upd = k => v => setD(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const ok = await onSave('contact', d)
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Field label="Eyebrow" value={d.eyebrow} onChange={upd('eyebrow')} />
      <Field label="Titel Zeile 1" value={d.title} onChange={upd('title')} />
      <Field label="Titel Zeile 2 (kursiv)" value={d.subtitle} onChange={upd('subtitle')} />
      <Field label="Text" value={d.text} onChange={upd('text')} multiline />
      <div style={{ height: 1, background: 'rgba(184,144,48,.15)', margin: '12px 0' }} />
      <Field label="E-Mail" value={d.email} onChange={upd('email')} />
      <Field label="Twitch" value={d.twitch} onChange={upd('twitch')} />
      <Field label="YouTube" value={d.youtube} onChange={upd('youtube')} />
      <Field label="Instagram" value={d.instagram} onChange={upd('instagram')} />
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

function SocialsEditor({ data, onSave }) {
  const [d, setD] = useState(data)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const upd = k => v => setD(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const ok = await onSave('socials', d)
    setSaving(false); setSaved(ok)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Field label="Twitch URL" value={d.twitch} onChange={upd('twitch')} placeholder="https://twitch.tv/..." />
      <Field label="YouTube URL" value={d.youtube} onChange={upd('youtube')} placeholder="https://youtube.com/..." />
      <Field label="Instagram URL" value={d.instagram} onChange={upd('instagram')} placeholder="https://instagram.com/..." />
      <Field label="TikTok URL" value={d.tiktok} onChange={upd('tiktok')} placeholder="https://tiktok.com/..." />
      <SaveBtn onClick={save} saved={saved} saving={saving} />
    </div>
  )
}

// ── Main AdminPanel ───────────────────────────────────────
const SECTIONS = [
  { id: 'hero',      label: '🎬 Hero' },
  { id: 'stats',     label: '📊 Statistiken' },
  { id: 'about',     label: '🎭 Über uns' },
  { id: 'portfolio', label: '🗂 Portfolio' },
  { id: 'live',      label: '📡 Livestream' },
  { id: 'contact',   label: '✉️ Kontakt' },
  { id: 'socials',   label: '🔗 Social Links' },
]

export default function AdminPanel({ content, saveSection, onClose }) {
  const [open, setOpen] = useState('hero')

  const EDITORS = {
    hero:      <HeroEditor      data={content.hero}      onSave={saveSection} />,
    stats:     <StatsEditor     data={content.stats}     onSave={saveSection} />,
    about:     <AboutEditor     data={content.about}     onSave={saveSection} />,
    portfolio: <PortfolioEditor data={content.portfolio} onSave={saveSection} />,
    live:      <LiveEditor      data={content.live}      onSave={saveSection} />,
    contact:   <ContactEditor   data={content.contact}   onSave={saveSection} />,
    socials:   <SocialsEditor   data={content.socials}   onSave={saveSection} />,
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        zIndex: 8000, backdropFilter: 'blur(4px)',
        animation: 'fadeIn .25s ease',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--bg2)', borderLeft: '1px solid var(--bdr)',
        zIndex: 8001, display: 'flex', flexDirection: 'column',
        animation: 'panelIn .35s cubic-bezier(.16,1,.3,1)',
        overflowY: 'auto',
      }}>
        <style>{`
          @keyframes panelIn{from{transform:translateX(100%)}to{transform:none}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        `}</style>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--bdr)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg3)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 1,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--cream)', marginBottom: 2 }}>
              Admin Panel
            </div>
            <div style={{ fontFamily: 'var(--fu)', fontSize: '.48rem', fontWeight: 600, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .7 }}>
              FlyOriginals CMS
            </div>
          </div>
          <button onClick={onClose} onMouseEnter={H} onMouseLeave={L}
            style={{ background: 'none', border: '1px solid var(--bdr)', color: 'var(--c40)', cursor: 'none', padding: '6px 12px', fontFamily: 'var(--fu)', fontSize: '.58rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', transition: 'all .2s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--bdr)'; e.currentTarget.style.color = 'var(--c40)' }}
          >✕ Schließen</button>
        </div>

        {/* Notice */}
        <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: 'rgba(184,144,48,.08)', border: '1px solid var(--bdr)', fontFamily: 'var(--fu)', fontSize: '.68rem', fontWeight: 400, color: 'var(--gold2)', lineHeight: 1.5 }}>
          ✏️ Änderungen werden live auf der Website gespeichert. Seite neu laden um Vorschau zu sehen.
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '16px 0 0', borderTop: '1px solid var(--bdr)', borderBottom: '1px solid var(--bdr)' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onMouseEnter={H} onMouseLeave={L}
              onClick={() => setOpen(open === s.id ? null : s.id)}
              style={{
                padding: '13px 24px', background: open === s.id ? 'rgba(184,144,48,.08)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--bdr)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--fu)', fontSize: '.68rem', fontWeight: 600,
                letterSpacing: '.1em', textTransform: 'uppercase',
                color: open === s.id ? 'var(--gold2)' : 'var(--c60)',
                cursor: 'none', transition: 'all .2s', textAlign: 'left',
              }}>
              {s.label}
              <span style={{ fontSize: '.7rem', opacity: .5, transition: 'transform .25s', transform: open === s.id ? 'rotate(90deg)' : 'none' }}>›</span>
            </button>
          ))}
        </div>

        {/* Active editor */}
        {open && (
          <div style={{ padding: '20px 24px', flex: 1 }}>
            <div style={{ fontFamily: 'var(--fu)', fontSize: '.52rem', fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gold)', opacity: .6, marginBottom: 16, borderBottom: '1px solid var(--bdr)', paddingBottom: 10 }}>
              {SECTIONS.find(s => s.id === open)?.label} bearbeiten
            </div>
            {EDITORS[open]}
          </div>
        )}
      </div>
    </>
  )
}
