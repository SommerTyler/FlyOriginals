export const BUILDINGS = [
  { id:'hen',      name:'Henne',          ico:'🐔', base:15,     bEps:.1,    tip:'Legt fleißig Eier.' },
  { id:'nest',     name:'Nest',           ico:'🪺', base:100,    bEps:.5,    tip:'Komfortabler Brutplatz.' },
  { id:'stall',    name:'Hühnerstall',    ico:'🏚', base:500,    bEps:4,     tip:'Viele Hühner, viele Eier.' },
  { id:'farm',     name:'Eierfarm',       ico:'🌾', base:3000,   bEps:20,    tip:'Professionelle Produktion.' },
  { id:'lab',      name:'Ei-Labor',       ico:'🔬', base:15000,  bEps:100,   tip:'Wissenschaftlich optimiert.' },
  { id:'robo',     name:'Robo-Huhn',      ico:'🤖', base:1e5,    bEps:500,   tip:'Unermüdliche Stahl-Henne.' },
  { id:'portal',   name:'Eier-Portal',    ico:'🌀', base:6e5,    bEps:2500,  tip:'Eier aus anderen Dimensionen.' },
  { id:'time',     name:'Zeitmaschine',   ico:'⏱',  base:4e6,    bEps:12000, tip:'Stehle Eier aus der Vergangenheit.' },
  { id:'rocket',   name:'Ei-Rakete',      ico:'🚀', base:2e7,    bEps:6e4,   tip:'Mondbasierte Eierproduktion.' },
  { id:'galaxy',   name:'Ei-Galaxie',     ico:'🌌', base:1e8,    bEps:3e5,   tip:'Galaktisches Ei-Imperium.' },
  { id:'god',      name:'Ei-Gottheit',    ico:'✨', base:1e9,    bEps:2e6,   tip:'Jenseits von Raum und Zeit.' },
  // New buildings
  { id:'quantum',  name:'Quanten-Henne',  ico:'⚛',  base:8e9,    bEps:1.2e7, tip:'Existiert in mehreren Zuständen gleichzeitig.' },
  { id:'singularity',name:'Ei-Singularität',ico:'🕳',base:7e10,  bEps:8e7,   tip:'Ein Schwarzes Loch aus reiner Eierenergie.' },
  { id:'bigbang',  name:'Ur-Ei',          ico:'💥', base:5e11,   bEps:6e8,   tip:'Das erste Ei aller Eier.' },
  { id:'omniversum',name:'Omni-Stall',    ico:'♾',  base:4e12,   bEps:5e9,   tip:'Eier aus allen möglichen Universen.' },
]

export const UPGRADES = [
  // Klick
  { id:'c1', n:'Bessere Pickerei',   i:'✋', cost:50,    d:'Klick ×2',              done:false, show:s=>s.total>=5,      fx:s=>({...s,epc:s.epc*2}) },
  { id:'c2', n:'Kraftklick',         i:'💪', cost:500,   d:'Klick ×2',              done:false, show:s=>s.total>=100,    fx:s=>({...s,epc:s.epc*2}) },
  { id:'c3', n:'Hyper-Klick',        i:'⚡', cost:5000,  d:'Klick ×3',              done:false, show:s=>s.total>=2000,   fx:s=>({...s,epc:s.epc*3}) },
  { id:'c4', n:'Götter-Klick',       i:'👁', cost:5e5,   d:'Klick = 1s Produktion', done:false, show:s=>s.total>=1e5,    fx:s=>({...s,godEgg:true}) },
  { id:'c5', n:'Göttlicher Griff',   i:'🫳', cost:5e7,   d:'Klick ×10',             done:false, show:s=>s.total>=1e7,    fx:s=>({...s,epc:s.epc*10}) },
  // Henne
  { id:'h1', n:'Bio-Futter',         i:'🌿', cost:200,   d:'Hennen ×2',             done:false, show:s=>s.bld[0]>=1,     fx:s=>bm(s,0,2) },
  { id:'h2', n:'Glückliche Hühner',  i:'😊', cost:2000,  d:'Hennen ×2',             done:false, show:s=>s.bld[0]>=5,     fx:s=>bm(s,0,2) },
  { id:'h3', n:'Freilandhaltung',    i:'🌄', cost:20000, d:'Hennen ×2',             done:false, show:s=>s.bld[0]>=10,    fx:s=>bm(s,0,2) },
  { id:'h4', n:'Premium-Mais',       i:'🌽', cost:2e5,   d:'Hennen ×3',             done:false, show:s=>s.bld[0]>=25,    fx:s=>bm(s,0,3) },
  // Nest
  { id:'n1', n:'Weiches Stroh',      i:'🛏', cost:1000,  d:'Nester ×2',             done:false, show:s=>s.bld[1]>=1,     fx:s=>bm(s,1,2) },
  { id:'n2', n:'Seidenkissen',       i:'🪶', cost:8000,  d:'Nester ×2',             done:false, show:s=>s.bld[1]>=5,     fx:s=>bm(s,1,2) },
  // Stall
  { id:'s1', n:'Heizung',            i:'🔥', cost:5000,  d:'Stall ×2',              done:false, show:s=>s.bld[2]>=1,     fx:s=>bm(s,2,2) },
  { id:'s2', n:'Solar-Stall',        i:'☀', cost:50000, d:'Stall ×2',              done:false, show:s=>s.bld[2]>=5,     fx:s=>bm(s,2,2) },
  // Farm
  { id:'f1', n:'Bewässerung',        i:'💧', cost:25000, d:'Farm ×2',               done:false, show:s=>s.bld[3]>=1,     fx:s=>bm(s,3,2) },
  { id:'f2', n:'KI-Ernte',           i:'🤖', cost:2e5,   d:'Farm ×2',               done:false, show:s=>s.bld[3]>=5,     fx:s=>bm(s,3,2) },
  // Lab
  { id:'l1', n:'Genomforschung',     i:'🧬', cost:1e5,   d:'Labor ×2',              done:false, show:s=>s.bld[4]>=1,     fx:s=>bm(s,4,2) },
  { id:'l2', n:'Quanten-Brut',       i:'⚛', cost:1e6,   d:'Labor ×2',              done:false, show:s=>s.bld[4]>=5,     fx:s=>bm(s,4,2) },
  // Global
  { id:'g1', n:'Goldeier-Technik',   i:'🥇', cost:10000, d:'Alle Gebäude ×1.5',     done:false, show:s=>s.total>=5000,   fx:s=>am(s,1.5) },
  { id:'g2', n:'Quantenhuhn',        i:'⚛', cost:1e5,   d:'Alle Gebäude ×2',       done:false, show:s=>s.total>=5e4,    fx:s=>am(s,2) },
  { id:'g3', n:'KI-Hühner',          i:'🧠', cost:1e6,   d:'Alle Gebäude ×3',       done:false, show:s=>s.total>=5e5,    fx:s=>am(s,3) },
  { id:'g4', n:'Ei-Singularität',    i:'🌟', cost:1e7,   d:'Alle Gebäude ×5',       done:false, show:s=>s.total>=5e6,    fx:s=>am(s,5) },
  { id:'g5', n:'Kosmische Energie',  i:'🌌', cost:1e9,   d:'Alle Gebäude ×10',      done:false, show:s=>s.total>=5e8,    fx:s=>am(s,10) },
  { id:'g6', n:'Göttlicher Willen',  i:'✨', cost:1e12,  d:'Alle Gebäude ×25',      done:false, show:s=>s.total>=5e11,   fx:s=>am(s,25) },
]

function bm(state, idx, factor) {
  const m = [...state.bldMult]; m[idx] *= factor
  return { ...state, bldMult: m }
}
function am(state, factor) {
  return { ...state, bldMult: state.bldMult.map(m => m * factor) }
}

export const ACHIEVEMENTS = [
  { id:'e1', ico:'🥚', n:'Erstes Ei',         d:'1 Ei gelegt',             ck:s=>s.total>=1,         pg:s=>[s.total,1] },
  { id:'e2', ico:'🪺', n:'Kleines Nest',       d:'100 Eier',                ck:s=>s.total>=100,       pg:s=>[s.total,100] },
  { id:'e3', ico:'🐔', n:'Fleißige Henne',     d:'1.000 Eier',              ck:s=>s.total>=1000,      pg:s=>[s.total,1000] },
  { id:'e4', ico:'🌾', n:'Eierbauer',           d:'10.000 Eier',             ck:s=>s.total>=10000,     pg:s=>[s.total,10000] },
  { id:'e5', ico:'🏆', n:'Eier-Profi',          d:'100.000 Eier',            ck:s=>s.total>=1e5,       pg:s=>[s.total,1e5] },
  { id:'e6', ico:'💰', n:'Eier-Millionär',      d:'1 Mio. Eier',             ck:s=>s.total>=1e6,       pg:s=>[s.total,1e6] },
  { id:'e7', ico:'👑', n:'Eier-Milliardär',     d:'1 Mrd. Eier',             ck:s=>s.total>=1e9,       pg:s=>[s.total,1e9] },
  { id:'e8', ico:'🌌', n:'Eier-Gott',           d:'1 Bio. Eier',             ck:s=>s.total>=1e12,      pg:s=>[s.total,1e12] },
  { id:'e9', ico:'♾',  n:'Eier-Universum',      d:'1 Quad. Eier',            ck:s=>s.total>=1e15,      pg:s=>[s.total,1e15] },
  { id:'c1', ico:'👆', n:'Erster Klick',        d:'1× geklickt',             ck:s=>s.clicks>=1,        pg:s=>[s.clicks,1] },
  { id:'c2', ico:'👋', n:'Klick-Fan',           d:'100× geklickt',           ck:s=>s.clicks>=100,      pg:s=>[s.clicks,100] },
  { id:'c3', ico:'💥', n:'Klick-König',         d:'1.000× geklickt',         ck:s=>s.clicks>=1000,     pg:s=>[s.clicks,1000] },
  { id:'c4', ico:'🖱', n:'Klick-Legende',       d:'10.000× geklickt',        ck:s=>s.clicks>=10000,    pg:s=>[s.clicks,10000] },
  { id:'c5', ico:'⚡', n:'Klick-Gottheit',      d:'100.000× geklickt',       ck:s=>s.clicks>=1e5,      pg:s=>[s.clicks,1e5] },
  { id:'b1', ico:'🐓', n:'Erste Henne',         d:'Erste Henne gekauft',     ck:s=>s.bld[0]>=1,        pg:s=>[s.bld[0],1] },
  { id:'b2', ico:'🏘', n:'Kleines Reich',       d:'10 Gebäude total',        ck:s=>totB(s)>=10,        pg:s=>[totB(s),10] },
  { id:'b3', ico:'🌆', n:'Großes Reich',        d:'50 Gebäude',              ck:s=>totB(s)>=50,        pg:s=>[totB(s),50] },
  { id:'b4', ico:'🌍', n:'Ei-Imperium',         d:'100 Gebäude',             ck:s=>totB(s)>=100,       pg:s=>[totB(s),100] },
  { id:'b5', ico:'🌌', n:'Ei-Universum',        d:'500 Gebäude',             ck:s=>totB(s)>=500,       pg:s=>[totB(s),500] },
  { id:'p1', ico:'⏰', n:'Erste Sekunde',       d:'1 Ei/Sek',                ck:s=>s.eps>=1,           pg:s=>[s.eps,1] },
  { id:'p2', ico:'🏭', n:'Ei-Fabrik',           d:'100 Eier/Sek',            ck:s=>s.eps>=100,         pg:s=>[s.eps,100] },
  { id:'p3', ico:'⚙',  n:'Industrie',           d:'10.000 Eier/Sek',         ck:s=>s.eps>=1e4,         pg:s=>[s.eps,1e4] },
  { id:'p4', ico:'🚀', n:'Hyperproduktion',     d:'1 Mio. Eier/Sek',         ck:s=>s.eps>=1e6,         pg:s=>[s.eps,1e6] },
  { id:'p5', ico:'🌟', n:'Ei-Singularität',     d:'1 Mrd. Eier/Sek',         ck:s=>s.eps>=1e9,         pg:s=>[s.eps,1e9] },
  { id:'g1', ico:'🌟', n:'Goldenes Ei',         d:'1 goldenes Ei',           ck:s=>s.golden>=1,        pg:s=>[s.golden,1] },
  { id:'g2', ico:'💛', n:'Goldfieber',           d:'5 goldene Eier',          ck:s=>s.golden>=5,        pg:s=>[s.golden,5] },
  { id:'g3', ico:'🏅', n:'Goldmeister',          d:'20 goldene Eier',         ck:s=>s.golden>=20,       pg:s=>[s.golden,20] },
  { id:'pr1',ico:'⭐', n:'Erste Prestige',       d:'1× Prestige durchgeführt',ck:s=>s.prestige>=1,      pg:s=>[s.prestige,1] },
  { id:'pr2',ico:'🌠', n:'Prestige-Meister',     d:'5× Prestige',             ck:s=>s.prestige>=5,      pg:s=>[s.prestige,5] },
  { id:'pr3',ico:'✨', n:'Prestige-Legende',     d:'10× Prestige',            ck:s=>s.prestige>=10,     pg:s=>[s.prestige,10] },
]

function totB(s) { return s.bld.reduce((a,b) => a+b, 0) }

export function calcEPS(state) {
  return BUILDINGS.reduce((sum, b, i) => sum + b.bEps * state.bldMult[i] * state.bld[i], 0)
}

export function buildingCost(idx, count) {
  return Math.ceil(BUILDINGS[idx].base * Math.pow(1.15, count))
}

// Prestige threshold: 1 trillion eggs
export const PRESTIGE_THRESHOLD = 1e12

// Prestige bonus: each prestige gives +10% to all production permanently
export function prestigeMultiplier(prestigeCount) {
  return 1 + prestigeCount * 0.1
}

export const NEWS = [
  'EILMELDUNG: Lokaler Bauer findet goldenes Ei — Nachbarn neidisch!',
  'Studie belegt: Hühner bevorzugen Jazz gegenüber Heavy Metal.',
  'Das Ei war zuerst da — Hühner streiken gegen Diskriminierung.',
  'Neuer Weltrekord: 1 Trillion Eier in 24 Stunden gelegt.',
  'KI-Huhn legt 500 Mio. Eier pro Sekunde — Gewerkschaft besorgt.',
  'Zeitreisende Hühner aus 2087 in Hühnerstall entdeckt.',
  'Eier-Futures auf Allzeithoch — Analysten ratlos.',
  'Mysteriöses Portal: Eier aus Paralleluniversum entdeckt.',
  'Hühnergott erscheint als perfektes Spiegelei.',
  'Quanten-Henne kollabiert Wellenfunktion — Hühnerhof bricht zusammen.',
  'Galaktisches Ei-Imperium expandiert auf den Mars.',
  'Hühner übernehmen Wall Street: Eier-Aktie +400%.',
  'Ur-Ei entdeckt: Scientist sagen, es war vor dem Urknall da.',
  'Omni-Stall spannt Multiversum — Philosophen streiten sich.',
  'Letzte Meldung: Hühner erklären Weltherrschaft — Eier für alle!',
]
