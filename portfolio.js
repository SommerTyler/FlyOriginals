/* portfolio.js — Phase 3: Reel · Filter · Grid · Lightbox */

/* ════════════════════════════════════
   PROJEKT-DATEN
   → Hier eigene Projekte eintragen!
   cat: "film" | "foto" | "game" | "eigen"
════════════════════════════════════ */
const PROJECTS = [
  {
    id: 1,
    title: 'Showreel 2024',
    cat: 'film',
    catLabel: 'Videoproduktion',
    desc: 'Zusammenschnitt der besten Aufnahmen aus dem Jahr 2024 — Imagefilme, Kurzfilme und Eventproduktionen.',
    img: '',           // ← z.B. 'assets/projects/reel.jpg'
    video: '',         // ← YouTube-Embed-URL oder leer lassen
    tags: ['Schnitt', 'Color Grading', 'Musik'],
  },
  {
    id: 2,
    title: 'Stadtportrait Leipzig',
    cat: 'foto',
    catLabel: 'Fotografie',
    desc: 'Urbane Architekturfotografie — Licht, Schatten und Struktur im Stadtbild.',
    img: '',
    video: '',
    tags: ['Portrait', 'Architektur', 'Nacht'],
  },
  {
    id: 3,
    title: 'Minecraft City Rebuild',
    cat: 'game',
    catLabel: 'Game Recreation',
    desc: 'Detailgetreuer Nachbau einer realen Innenstadt in Minecraft — Block für Block.',
    img: '',
    video: '',
    tags: ['Minecraft', 'Architektur', 'Zeitraffer'],
  },
  {
    id: 4,
    title: 'Kurzfilm: "Drift"',
    cat: 'eigen',
    catLabel: 'Eigenprojekt',
    desc: 'Ein atmosphärischer Kurzfilm über Isolation und Aufbruch — vollständig in Eigenregie produziert.',
    img: '',
    video: '',
    tags: ['Kurzfilm', 'Regie', 'Eigenproduktion'],
  },
  {
    id: 5,
    title: 'Imagefilm Musterfirma',
    cat: 'film',
    catLabel: 'Videoproduktion',
    desc: 'Imagefilm für ein mittelständisches Unternehmen — von Konzept bis Postproduktion.',
    img: '',
    video: '',
    tags: ['Imagefilm', 'Auftragsarbeit', 'Interview'],
  },
  {
    id: 6,
    title: 'Event-Dokumentation',
    cat: 'foto',
    catLabel: 'Fotografie',
    desc: 'Atmosphärische Eventfotografie — Momente festhalten, bevor sie vergehen.',
    img: '',
    video: '',
    tags: ['Event', 'Reportage', 'Stimmung'],
  },
];

/* ════════ REEL VIDEO (optional) ════════
   YouTube-Embed-ID eintragen, z.B. 'dQw4w9WgXcQ'
   Leer lassen = Placeholder anzeigen
════════════════════════════════════════ */
const REEL_YOUTUBE_ID = '';

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildReel();
  buildGrid();
  initFilters();
  initLightbox();
  initPortfolioScrollReveal();
});

/* ── Reel ── */
function buildReel() {
  const inner = document.getElementById('reel-inner');
  if (!inner) return;
  if (REEL_YOUTUBE_ID) {
    inner.innerHTML = `<iframe
      src="https://www.youtube-nocookie.com/embed/${REEL_YOUTUBE_ID}?autoplay=0&rel=0&modestbranding=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
  }
  // else placeholder bleibt sichtbar
}

/* ── Grid aufbauen ── */
function buildGrid() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = PROJECTS.map(p => `
    <div class="project-card" data-cat="${p.cat}" data-id="${p.id}">
      <div class="project-thumb">
        <div class="project-thumb-pattern"></div>
        ${p.img ? `<img class="project-img" src="${p.img}" alt="${p.title}" loading="lazy">` : ''}
      </div>
      <div class="project-overlay">
        <div class="project-cat">${p.catLabel}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.desc}</div>
      </div>
      <div class="project-arrow">
        <svg viewBox="0 0 14 14" fill="none" stroke-width="1.5">
          <path d="M2 12L12 2M12 2H5M12 2v7"/>
        </svg>
      </div>
    </div>
  `).join('');

  // Klick → Lightbox
  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      openLightbox(PROJECTS.find(p => p.id === id));
    });
  });
}

/* ── Filter ── */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          requestAnimationFrame(() => { card.style.animation = ''; });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ── Lightbox ── */
function initLightbox() {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(p) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lb-cat').textContent   = p.catLabel;
  document.getElementById('lb-title').textContent = p.title;
  document.getElementById('lb-desc').textContent  = p.desc;
  document.getElementById('lb-tags').innerHTML    =
    p.tags.map(t => `<span class="lightbox-tag">${t}</span>`).join('');

  const media = document.getElementById('lb-media');
  if (p.video) {
    media.innerHTML = `<iframe src="${p.video}" allowfullscreen></iframe>`;
  } else if (p.img) {
    media.innerHTML = `<img src="${p.img}" alt="${p.title}">`;
  } else {
    media.innerHTML = `<div class="lightbox-media-placeholder">
      <span style="font-size:32px;opacity:.3">☽</span>
      <span>Medien folgen bald</span>
    </div>`;
  }

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.getElementById('lb-media').innerHTML = '';
  }, 400);
}

/* ── Scroll Reveal für Portfolio — via gsap.to() ── */
function initPortfolioScrollReveal() {
  ScrollTrigger.create({ trigger: '#portfolio', start: 'top 82%',
    onEnter: () => {
      gsap.to('.portfolio-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      gsap.to('.portfolio-title',   { opacity: 1, y: 0, duration: 0.7, delay: 0.1, ease: 'power3.out' });
    }
  });

  ScrollTrigger.create({ trigger: '.reel-stage', start: 'top 82%',
    onEnter: () => {
      gsap.to('.reel-stage', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
    }
  });

  ScrollTrigger.create({ trigger: '.portfolio-filters', start: 'top 85%',
    onEnter: () => {
      gsap.to('.portfolio-filters', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    }
  });

  ScrollTrigger.create({ trigger: '.projects-grid', start: 'top 85%',
    onEnter: () => {
      gsap.to('.projects-grid', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }
  });
}
