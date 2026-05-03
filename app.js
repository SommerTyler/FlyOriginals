/* app.js — Cursor · Intro · Nav · About Animations */

/* ════════ CURSOR ════════ */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = -200, my = -200, rx = -200, ry = -200;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

/* ════════ INTRO → LAUNCH ════════ */
function launchSite() {
  const intro = document.getElementById('intro');
  intro.classList.add('fade-out');
  setTimeout(() => intro.style.display = 'none', 1000);

  setTimeout(() => document.getElementById('nav').classList.add('visible'), 300);
  setTimeout(() => document.querySelectorAll('.orb').forEach(o => o.classList.add('visible')), 400);

  const heroEls = document.querySelectorAll('#hero .reveal');
  heroEls.forEach((el, i) => setTimeout(() => el.classList.add('in'), 600 + i * 130));

  setTimeout(() => document.getElementById('hero-divider').classList.add('visible'), 900);
  setTimeout(() => {
    const si = document.getElementById('scroll-ind');
    si.style.transition = 'opacity 1s ease';
    si.style.opacity = '1';
  }, 1800);
}
setTimeout(launchSite, 2800);

/* ════════ NAV SCROLL ════════ */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
  if (window.scrollY > 50) document.getElementById('scroll-ind').style.opacity = '0';
});

/* ════════ ABOUT ANIMATIONS (ScrollTrigger) ════════ */
gsap.registerPlugin(ScrollTrigger);

/* Helper: reveal via gsap.to — Transitions feuern garantiert */
function revealEl(id, delay = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  gsap.to(el, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.8, delay, ease: 'power3.out' });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ── Eyebrow ── */
  ScrollTrigger.create({ trigger: '#about', start: 'top 80%',
    onEnter: () => revealEl('about-eyebrow') });

  /* ── Portrait ── */
  ScrollTrigger.create({ trigger: '#portrait-wrap', start: 'top 78%',
    onEnter: () => {
      document.getElementById('portrait-wrap').classList.add('in');
      const pi = document.getElementById('portrait-img');
      if (pi) { pi.style.transition = 'opacity 1.2s ease'; pi.classList.add('in'); }
    }
  });

  /* Portrait parallax */
  ScrollTrigger.create({ trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true,
    onUpdate: s => {
      const img = document.getElementById('portrait-img');
      if (img) img.style.transform = `scale(1.08) translateY(${s.progress * -30}px)`;
    }
  });

  /* ── Text content ── */
  ScrollTrigger.create({ trigger: '#about-headline', start: 'top 82%',
    onEnter: () => revealEl('about-headline', 0.1) });

  ['about-body-1','about-body-2'].forEach((id, i) => {
    ScrollTrigger.create({ trigger: '#' + id, start: 'top 84%',
      onEnter: () => revealEl(id, 0.1 + i * 0.15) });
  });

  /* ── Stats + counter ── */
  function animCounter(el, target, ms) {
    const numNode = el.querySelector('.count');
    if (!numNode) return;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      numNode.textContent = Math.round(e * target);
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  ScrollTrigger.create({ trigger: '#about-stats', start: 'top 84%',
    onEnter: () => {
      revealEl('about-stats');
      /* ← Zahlen hier anpassen */
      animCounter(document.getElementById('stat-0'), 12, 1800);
      animCounter(document.getElementById('stat-1'), 8,  1600);
      animCounter(document.getElementById('stat-2'), 3,  1400);
    }
  });

  /* ── Timeline ── */
  ScrollTrigger.create({ trigger: '#timeline-wrap', start: 'top 82%',
    onEnter: () => {
      revealEl('timeline-wrap');
      document.querySelectorAll('.tl-item').forEach((el, i) => {
        gsap.to(el, { opacity: 1, x: 0, duration: 0.6, delay: i * 0.18, ease: 'power3.out' });
      });
    }
  });

  /* ── Skills — Asteroid-Einflug ── */
  ScrollTrigger.create({ trigger: '#skills-cloud', start: 'top 88%',
    onEnter: () => {
      document.querySelectorAll('.skill-tag').forEach((tag, i) => {
        const xDir = (Math.random() - 0.5) * 60;
        const yDir = Math.random() * 30 + 10;
        gsap.set(tag, { x: xDir, y: yDir, opacity: 0 });
        gsap.to(tag, {
          x: 0, y: 0, opacity: 1,
          duration: 0.6, delay: 0.1 + i * 0.07,
          ease: 'power3.out'
        });
      });
    }
  });

  /* ── Services (Phase 1) ── */
  ScrollTrigger.create({ trigger: '#services', start: 'top 80%',
    onEnter: () => {
      const sl = document.querySelector('.services-label');
      if (sl) { sl.style.transition = 'opacity .7s ease, transform .7s ease'; sl.classList.add('in'); }
      document.querySelectorAll('.service-card').forEach((c, i) =>
        setTimeout(() => c.classList.add('in'), i * 100));
    }
  });

});
