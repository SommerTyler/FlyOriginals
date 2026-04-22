-- ════════════════════════════════════════════════════════════
-- FlyOriginals – Schema Update v2
-- Führe dies im Supabase SQL Editor aus (nach schema.sql)
-- ════════════════════════════════════════════════════════════

-- 1. Admin flag auf profiles
alter table profiles add column if not exists is_admin boolean default false;

-- 2. Site content (CMS)
create table if not exists site_content (
  key         text primary key,
  value       jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- RLS
alter table site_content enable row level security;
-- Jeder kann lesen
create policy "content_select" on site_content for select using (true);
-- Nur Admins dürfen schreiben
create policy "content_insert" on site_content for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
create policy "content_update" on site_content for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 3. Default content einfügen
insert into site_content (key, value) values
('hero', '{
  "title1": "Wir erzählen",
  "title2": "deine Geschichte.",
  "subtitle": "FlyOriginals ist ein unabhängiges Filmstudio für Kurzfilme, Branded Content und Livestreaming — Produktionen, die im Gedächtnis bleiben.",
  "eyebrow": "Film Studio · Live · Content"
}'),
('about', '{
  "eyebrow": "Über FlyOriginals",
  "title": "Cineastisches Storytelling.",
  "p1": "FlyOriginals steht für unabhängige Filmproduktion mit einem unverwechselbaren Gespür für Atmosphäre, Rhythmus und visuelle Identität.",
  "p2": "Vom ersten Konzept bis zum finalen Schnitt begleiten wir jedes Projekt mit dem Anspruch, dass jeder Frame eine Aussage macht.",
  "quote": "Jeder Frame hat eine Aussage."
}'),
('portfolio', '{
  "eyebrow": "Ausgewählte Arbeiten",
  "title": "Portfolio.",
  "projects": [
    {"n":"01","tag":"Kurzfilm","yr":"2025","title":"Neon District","desc":"Experimentelle Sci-Fi-Produktion. Gedreht auf Super-8, color-graded in DaVinci Resolve.","span":1},
    {"n":"02","tag":"Branded Content","yr":"2024","title":"Summer Campaign","desc":"Vollständige Video-Kampagne für ein lokales Lifestyle-Label — Konzept bis Schnitt.","span":2},
    {"n":"03","tag":"Fotografie","yr":"2023","title":"Urban Portraits","desc":"Porträt-Serie für Musiker aus der lokalen Kreativszene.","span":2},
    {"n":"04","tag":"Livestream","yr":"2024","title":"Live Sessions","desc":"Monatliche Live-Produktionen. 2.000+ gleichzeitige Zuschauer.","span":1},
    {"n":"05","tag":"YouTube","yr":"2024","title":"The Long Way","desc":"Mini-Dokumentation über eine 30-tägige Solofahrt durch Osteuropa.","span":1},
    {"n":"06","tag":"Kurzfilm","yr":"2024","title":"Into the Dark","desc":"Atmosphärischer Noir über Vertrauen und Verrat in einer Stadt ohne Licht.","span":1}
  ]
}'),
('live', '{
  "eyebrow": "Livestream",
  "title": "Live dabei.",
  "subtitle": "Immer präsent.",
  "text": "Regelmäßige Live-Sessions auf Twitch und YouTube. Von Gaming-Streams bis zu vollständig produzierten Live-Filmevents.",
  "twitch": "twitch.tv/flyoriginals",
  "youtube": "youtube.com/@flyoriginals"
}'),
('contact', '{
  "eyebrow": "Kontakt aufnehmen",
  "title": "Lass uns",
  "subtitle": "zusammenarbeiten.",
  "text": "Hast du ein Projekt, eine Idee oder eine Kooperation? Schreib uns — wir antworten innerhalb von 24 Stunden.",
  "email": "hello@flyoriginals.de",
  "twitch": "twitch.tv/flyoriginals",
  "youtube": "youtube.com/@flyoriginals",
  "instagram": "@flyoriginals"
}'),
('socials', '{
  "twitch": "https://twitch.tv/flyoriginals",
  "youtube": "https://youtube.com/@flyoriginals",
  "instagram": "https://instagram.com/flyoriginals",
  "tiktok": "https://tiktok.com/@flyoriginals"
}'),
('stats', '{
  "items": [
    {"n":"50","s":"+","label":"Abgeschlossene\nProjekte"},
    {"n":"5","s":"","label":"Jahre\nErfahrung"},
    {"n":"120","s":"K","label":"Social Media\nReichweite"},
    {"n":"12","s":"","label":"Zufriedene\nKunden"}
  ]
}')
on conflict (key) do nothing;

-- 4. Ersten Admin setzen (ersetze mit deiner echten User-ID aus Supabase Auth)
-- update profiles set is_admin = true where id = 'DEINE-USER-UUID-HIER';
-- Oder nach dem ersten Login:
-- update profiles set is_admin = true where username = 'dein_username';
