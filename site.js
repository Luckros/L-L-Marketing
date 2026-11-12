// L&L Studio — el poco script que necesita el sitio. Todo el contenido se ve igual sin él.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Aparición de cada parte de una sección cuando entra en pantalla (una sola vez).
(() => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  // red de seguridad: nada queda oculto si el observer no llega a dispararse
  addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// Color por capítulo: la barra toma el campo de color de la sección que tiene debajo.
(() => {
  const colours = {
    paper: ['#f3f6fc', '#0a1a4f'],
    blue: ['#1a3bc6', '#f3f6fc'],
    navy: ['#0a1a4f', '#f3f6fc'],
    cyan: ['#38c4e6', '#0a1a4f'],
  };
  // el footer queda fijo detrás del contenido, así que solo cuentan los capítulos de <main>;
  // si ninguno está bajo la barra, lo que se ve es el footer (marino)
  const chapters = [...document.querySelectorAll('main [data-chapter]')];
  const bar = document.querySelector('.bar');
  if (!chapters.length || !bar) return;
  const root = document.documentElement.style;
  let current = '', queued = false;
  const update = () => {
    queued = false;
    const y = bar.offsetHeight;
    const under = chapters.find((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    const name = under ? under.dataset.chapter : 'navy';
    if (name === current) return;
    current = name;
    const [bg, ink] = colours[name] || colours.paper;
    root.setProperty('--bar-bg', bg);
    root.setProperty('--bar-ink', ink);
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();

// Videos en loop: se reproducen solo cuando están en pantalla. Con movimiento reducido no arrancan solos.
(() => {
  const loops = document.querySelectorAll('video[data-loop]');
  loops.forEach((v) => { v.muted = true; v.playsInline = true; });
  if (reduced) { loops.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; }); return; }
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const v = entry.target;
      if (entry.isIntersecting && !v.hasAttribute('data-off')) v.play().catch(() => {});
      else v.pause();
    }
  }, { threshold: 0.2 });
  loops.forEach((v) => io.observe(v));
})();

// La misma toma, tres ediciones: el selector cambia de versión y su explicación.
(() => {
  const box = document.querySelector('[data-edits]');
  if (!box) return;
  const buttons = box.querySelectorAll('.switch button');
  const videos = box.querySelectorAll('.edits-screen video');
  const notes = box.querySelectorAll('.edit-note[data-v]');
  const show = (n) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === n)));
    notes.forEach((p) => { p.hidden = p.dataset.v !== n; });
    videos.forEach((v) => {
      const on = v.dataset.v === n;
      v.classList.toggle('is-on', on);
      v.toggleAttribute('data-off', !on);
      if (on) { v.currentTime = 0; if (!reduced) v.play().catch(() => {}); } else v.pause();
    });
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.v)));
  show('3');
})();

// El menú del celular se cierra al elegir un destino.
document.querySelectorAll('.menu a').forEach((a) => a.addEventListener('click', () => a.closest('details').open = false));
