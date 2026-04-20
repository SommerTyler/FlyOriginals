import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Default fallback content (used if Supabase not connected)
const DEFAULTS = {
  hero: {
    title1: 'Wir erzählen',
    title2: 'deine Geschichte.',
    subtitle: 'FlyOriginals ist ein unabhängiges Filmstudio für Kurzfilme, Branded Content und Livestreaming — Produktionen, die im Gedächtnis bleiben.',
    eyebrow: 'Film Studio · Live · Content',
  },
  about: {
    eyebrow: 'Über FlyOriginals',
    title: 'Cineastisches Storytelling.',
    p1: 'FlyOriginals steht für unabhängige Filmproduktion mit einem unverwechselbaren Gespür für Atmosphäre, Rhythmus und visuelle Identität.',
    p2: 'Vom ersten Konzept bis zum finalen Schnitt begleiten wir jedes Projekt mit dem Anspruch, dass jeder Frame eine Aussage macht.',
    quote: 'Jeder Frame hat eine Aussage.',
  },
  portfolio: {
    eyebrow: 'Ausgewählte Arbeiten',
    title: 'Portfolio.',
    projects: [
      { n:'01', tag:'Kurzfilm', yr:'2025', title:'Neon District', desc:'Experimentelle Sci-Fi-Produktion. Gedreht auf Super-8, color-graded in DaVinci Resolve.', span:1 },
      { n:'02', tag:'Branded Content', yr:'2024', title:'Summer Campaign', desc:'Vollständige Video-Kampagne für ein lokales Lifestyle-Label — Konzept bis Schnitt.', span:2 },
      { n:'03', tag:'Fotografie', yr:'2023', title:'Urban Portraits', desc:'Porträt-Serie für Musiker aus der lokalen Kreativszene.', span:2 },
      { n:'04', tag:'Livestream', yr:'2024', title:'Live Sessions', desc:'Monatliche Live-Produktionen. 2.000+ gleichzeitige Zuschauer.', span:1 },
      { n:'05', tag:'YouTube', yr:'2024', title:'The Long Way', desc:'Mini-Dokumentation über eine 30-tägige Solofahrt durch Osteuropa.', span:1 },
      { n:'06', tag:'Kurzfilm', yr:'2024', title:'Into the Dark', desc:'Atmosphärischer Noir über Vertrauen und Verrat.', span:1 },
    ],
  },
  live: {
    eyebrow: 'Livestream',
    title: 'Live dabei.',
    subtitle: 'Immer präsent.',
    text: 'Regelmäßige Live-Sessions auf Twitch und YouTube.',
    twitch: 'twitch.tv/flyoriginals',
    youtube: 'youtube.com/@flyoriginals',
  },
  contact: {
    eyebrow: 'Kontakt aufnehmen',
    title: 'Lass uns',
    subtitle: 'zusammenarbeiten.',
    text: 'Schreib uns — wir antworten innerhalb von 24 Stunden.',
    email: 'hello@flyoriginals.de',
    twitch: 'twitch.tv/flyoriginals',
    youtube: 'youtube.com/@flyoriginals',
    instagram: '@flyoriginals',
  },
  socials: {
    twitch: 'https://twitch.tv/flyoriginals',
    youtube: 'https://youtube.com/@flyoriginals',
    instagram: 'https://instagram.com/flyoriginals',
    tiktok: 'https://tiktok.com/@flyoriginals',
  },
  stats: {
    items: [
      { n:'50', s:'+', label:'Abgeschlossene\nProjekte' },
      { n:'5',  s:'',  label:'Jahre\nErfahrung' },
      { n:'120',s:'K', label:'Social Media\nReichweite' },
      { n:'12', s:'',  label:'Zufriedene\nKunden' },
    ],
  },
}

export function useContent() {
  const [content, setContent] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('site_content').select('key,value')
        if (error || !data?.length) { setLoading(false); return }
        const merged = { ...DEFAULTS }
        data.forEach(row => { merged[row.key] = { ...DEFAULTS[row.key], ...row.value } })
        setContent(merged)
      } catch {
        // fallback to defaults silently
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveSection = useCallback(async (key, value) => {
    try {
      await supabase.from('site_content').upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      setContent(prev => ({ ...prev, [key]: { ...prev[key], ...value } }))
      return true
    } catch {
      return false
    }
  }, [])

  return { content, loading, saveSection }
}
