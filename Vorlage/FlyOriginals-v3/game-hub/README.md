# 🥚 GameHub

Ein Browser-Game-Hub mit Supabase-Backend, deployt auf Render via GitHub.

## 🏗 Tech Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Backend/Auth/DB**: Supabase
- **Hosting**: Render (Static Site)
- **Source**: GitHub

---

## 🚀 Setup (Lokal)

```bash
# 1. Repo klonen
git clone https://github.com/DEIN_USER/game-hub.git
cd game-hub

# 2. Abhängigkeiten installieren
npm install

# 3. Env-Variablen setzen
cp .env.example .env
# .env öffnen und Supabase-Werte eintragen

# 4. Dev-Server starten
npm run dev
```

---

## 🗄 Supabase Setup

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Öffne den **SQL Editor** und führe `supabase/schema.sql` vollständig aus
3. Kopiere aus **Project Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### Supabase Auth aktivieren
- Authentication → Providers → Email: aktivieren
- Authentication → Email Templates: nach Belieben anpassen
- (Optional) Authentication → URL Configuration → Site URL: deine Render-URL eintragen

---

## ☁️ Deployment auf Render

### Methode: render.yaml (empfohlen)

1. Push das Repo zu GitHub
2. Gehe zu [render.com](https://render.com) → **New → Blueprint**
3. Verbinde dein GitHub-Repo — Render erkennt `render.yaml` automatisch
4. Setze die Umgebungsvariablen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy starten → fertig!

### Methode: Manuell

1. Render → **New → Static Site**
2. GitHub-Repo verbinden
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Environment Variables setzen (siehe oben)

---

## 🎮 Neues Spiel hinzufügen

1. Erstelle `src/games/MeinSpiel/index.jsx`
2. Füge Eintrag in `src/pages/GamePage.jsx` → `GAME_MAP` ein
3. Füge Karte in `src/pages/HubPage.jsx` → `GAMES` Array ein
4. Optional: Eigene Supabase-Tabellen in `supabase/schema.sql`

---

## 📁 Projektstruktur

```
game-hub/
├── public/
├── src/
│   ├── components/      # Navbar, AuthModal
│   ├── lib/             # Supabase client
│   ├── pages/           # HubPage, GamePage
│   └── games/
│       └── EggClicker/  # Scene, gameData, index
├── supabase/
│   └── schema.sql       # DB-Schema + RLS Policies
├── render.yaml          # Render deployment config
└── .env.example
```

---

## 🔑 Umgebungsvariablen

| Variable | Beschreibung |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon/Public Key |

> ⚠️ Niemals den Service Role Key im Frontend verwenden!
