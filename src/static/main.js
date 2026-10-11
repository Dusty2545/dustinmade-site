// DustinMade — small progressive enhancements. The site works without this file.
document.documentElement.classList.add('js');

// Header: transparent over the hero, solid after scrolling.
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('is-solid', window.scrollY > 80);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu.
const toggle = document.querySelector('.menu-toggle');
const navEl = document.getElementById('site-nav');
if (toggle && navEl) {
  toggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Scroll reveals, staggered.
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
      e.target.style.transitionDelay = Math.min(siblings.indexOf(e.target), 6) * 60 + 'ms';
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in-view'));
}

// Catalog filter.
const filter = document.querySelector('[data-filter]');
if (filter) {
  const cards = [...document.querySelectorAll('[data-grid] .part-card')];
  const count = document.querySelector('[data-count]');
  const empty = document.querySelector('[data-empty]');
  const apply = () => {
    const q = filter.q.value.trim().toLowerCase();
    const make = filter.make.value;
    const cat = filter.category.value;
    let shown = 0;
    cards.forEach((c) => {
      const ok = (!q || c.dataset.search.includes(q)) && (!make || c.dataset.make === make) && (!cat || c.dataset.category === cat);
      c.hidden = !ok;
      if (ok) { shown++; c.classList.add('in-view'); }
    });
    count.textContent = shown + (shown === 1 ? ' part' : ' parts');
    empty.hidden = shown !== 0;
  };
  filter.addEventListener('input', apply);
  filter.addEventListener('submit', (e) => e.preventDefault());
}

// Part page: file vs. print toggle.
document.querySelectorAll('[data-offer]').forEach((offer) => {
  const options = offer.querySelectorAll('[data-offer-option]');
  options.forEach((btn) => {
    btn.addEventListener('click', () => {
      options.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      offer.querySelectorAll('[data-offer-panel]').forEach((p) => { p.hidden = p.dataset.offerPanel !== btn.dataset.offerOption; });
    });
  });
});
