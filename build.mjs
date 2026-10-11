// DustinMade static site builder — no dependencies.
// Reads src/data/*.json, writes a complete static site to dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const site = readJson('src/data/site.json');
const parts = readJson('src/data/parts.json');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = (n) => (typeof n === 'number' ? '$' + n.toFixed(n % 1 ? 2 : 0) : null);
const year = new Date().getFullYear();

// ---------- Logo ----------
let logoCount = 0;
function logo({ cls = 'logo', title = 'DustinMade' } = {}) {
  const id = 'dm' + ++logoCount;
  return `<svg class="${cls}" viewBox="0 0 900 420" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="${id}v" gradientUnits="userSpaceOnUse" x1="0" y1="146" x2="0" y2="190">
      <stop offset="0" stop-color="currentColor" stop-opacity="1"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}h" gradientUnits="userSpaceOnUse" x1="190" y1="0" x2="840" y2="0">
      <stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset=".25" stop-color="currentColor"/><stop offset=".75" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g class="logo-car" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85">
    <path class="car-line" pathLength="1" stroke="currentColor" stroke-width="5" d="M122 222 C118 186 120 178 150 172 C210 160 290 100 370 74 C400 62 440 52 490 50 C535 48 565 52 585 60 C600 66 615 86 628 104 C690 108 760 112 806 122"/>
    <path stroke="url(#${id}v)" stroke-width="5" d="M806 122 C834 128 848 150 846 188"/>
    <path stroke="currentColor" stroke-width="3" opacity=".7" d="M392 106 C414 86 452 74 498 72 C544 71 572 79 594 104 Z M500 73 L500 105"/>
    <path stroke="url(#${id}h)" stroke-width="2.5" opacity=".55" d="M196 150 C380 138 600 130 838 136"/>
    <path stroke="url(#${id}v)" stroke-width="5" d="M656 190 A46 46 0 0 1 744 190"/>
    <path stroke="url(#${id}v)" stroke-width="5" d="M236 194 C254 166 346 164 364 194"/>
  </g>
  <path d="M170 160 L188 152" stroke="#E63946" stroke-width="7" stroke-linecap="round"/>
  <text x="104" y="324" font-family="Yellowtail, cursive" font-size="168" fill="currentColor" transform="rotate(-2 104 260)">DustinMade</text>
</svg>`;
}

// ---------- Layout ----------
const nav = [
  ['Shop Parts', '/parts/'],
  ['How It Works', '/how-it-works/'],
];
function layout({ title, description = site.description, path = '/', body, bodyClass = '' }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
  const links = nav.map(([label, href]) => `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0A0C0F">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&family=Yellowtail&display=swap">
<link rel="stylesheet" href="/styles.css">
<script src="/main.js" defer></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${site.name} home">${logo({ cls: 'logo logo-header' })}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      ${links}
      <a class="btn btn-accent btn-sm" href="/request/">Request a part</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="/" aria-label="${site.name} home">${logo({ cls: 'logo logo-footer' })}</a>
      <p>${esc(site.tagline)}</p>
    </div>
    <nav class="footer-col" aria-label="Shop">
      <h2>Shop</h2>
      <a href="/parts/">All parts</a>
      <a href="/request/">Request a part</a>
    </nav>
    <nav class="footer-col" aria-label="Learn">
      <h2>Learn</h2>
      <a href="/how-it-works/">How it works</a>
      <a href="/how-it-works/#licensing">File licensing</a>
      <a href="/how-it-works/#materials">Materials</a>
    </nav>
    <div class="footer-col">
      <h2>Contact</h2>
      ${site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : '<span class="muted">Email coming soon</span>'}
    </div>
  </div>
  <div class="container footer-legal">
    <span>© ${year} ${site.name}</span>
    <span class="muted">Not affiliated with any vehicle manufacturer. Make and model names are used only to describe fitment.</span>
  </div>
</footer>
</body>
</html>`;
}

// ---------- Components ----------
const badgeLabels = { 'print-ready': 'Print-ready', 'fit-tested': 'Fit-tested', new: 'New' };
const badges = (p) =>
  (p.badges || []).map((b) => `<span class="badge badge-${b}">${badgeLabels[b] || esc(b)}</span>`).join('');

function priceLine(p) {
  const f = money(p.filePrice), pr = money(p.printPrice);
  if (!f && !pr) return 'Price coming soon';
  return [f && `File ${f}`, pr && `Print from ${pr}`].filter(Boolean).join(' · ');
}

function media(p, cls = 'card-media') {
  return p.image
    ? `<div class="${cls}"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></div>`
    : `<div class="${cls} media-empty" aria-hidden="true"><svg viewBox="0 0 120 60" width="120" height="60"><path d="M6 52 C18 46 30 26 44 18 C56 10 76 10 86 18 C94 24 104 30 114 42" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Photo coming soon</span></div>`;
}

function card(p) {
  return `<article class="part-card reveal" data-make="${esc(slugify(p.make))}" data-category="${esc(slugify(p.category))}" data-search="${esc([p.name, p.make, p.model, p.years, p.oem, p.category].join(' ').toLowerCase())}">
  <a href="/parts/${esc(p.slug)}/" class="part-card-link">
    <div class="part-card-top">
      ${media(p)}
      <div class="card-badges">${badges(p)}</div>
      <span class="price-pill">${esc(priceLine(p))}</span>
    </div>
    <div class="part-card-body">
      ${p.discontinued ? `<span class="eyebrow eyebrow-red">Discontinued ${esc(p.discontinued)}</span>` : ''}
      <h3>${esc(p.name)}</h3>
      <p class="fit">${esc([p.years, p.make, p.model].filter(Boolean).join(' '))}</p>
      ${p.oem ? `<p class="spec">${esc(p.oem)}</p>` : ''}
    </div>
  </a>
</article>`;
}

// ---------- Pages ----------
function home() {
  const featured = parts.filter((p) => p.featured).slice(0, 8);
  return layout({
    path: '/',
    bodyClass: 'page-home',
    body: `
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">3D-printed classic car parts</span>
      <span class="taillight" aria-hidden="true"></span>
      <h1>Discontinued parts.<br>Back on the road.</h1>
      <p class="lead">Precise reproductions of hard-to-find parts. Download the file and print it yourself, or have it printed, finished and shipped.</p>
      <div class="actions">
        <a class="btn btn-primary" href="/parts/">Find parts for my car</a>
        <a class="btn btn-secondary" href="/how-it-works/">How it works</a>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">${logo({ cls: 'logo logo-hero' })}</div>
  </div>
</section>

<section class="container chips-section" aria-label="Choose your path">
  <div class="chips">
    <a class="chip" href="/parts/">I have a printer</a>
    <a class="chip" href="/parts/">Print it for me</a>
    <a class="chip" href="/parts/">Find parts for my car</a>
    <a class="chip" href="/request/">Request a part</a>
  </div>
</section>

<section class="container section">
  <div class="section-head">
    <span class="eyebrow">How it works</span>
    <h2>Three steps from missing to mounted</h2>
  </div>
  <ol class="steps">
    <li class="step reveal"><span class="step-num">01</span><h3>Find your part</h3><p>Search by make, model or part number. Every listing shows exactly which cars it fits.</p></li>
    <li class="step reveal"><span class="step-num">02</span><h3>Choose file or print</h3><p>Download a print-ready file with tested settings, or order the finished part made to order.</p></li>
    <li class="step reveal"><span class="step-num">03</span><h3>Install and drive</h3><p>Fit it, finish it and keep your classic on the road without the junkyard hunt.</p></li>
  </ol>
</section>

<section class="container section">
  <div class="section-head section-head-row">
    <div><span class="eyebrow">Back from extinction</span><h2>Featured parts</h2></div>
    <a class="text-link" href="/parts/">View all parts →</a>
  </div>
  <div class="part-grid">${featured.map(card).join('')}</div>
</section>

<section class="request-band">
  <div class="container request-inner reveal">
    <div>
      <h2>Can't find your part?</h2>
      <p>Tell us what you need. The most-requested parts get modeled first.</p>
    </div>
    <a class="btn btn-accent" href="/request/">Request a part</a>
  </div>
</section>`,
  });
}

function catalog() {
  const makes = [...new Set(parts.map((p) => p.make))].sort();
  const cats = [...new Set(parts.map((p) => p.category))].sort();
  const opts = (arr) => arr.map((v) => `<option value="${esc(slugify(v))}">${esc(v)}</option>`).join('');
  return layout({
    title: 'Shop Parts',
    path: '/parts/',
    description: 'Browse 3D-printable reproductions of discontinued classic-car parts by make, model and category.',
    body: `
<section class="container page-head">
  <span class="eyebrow">Shop parts</span>
  <h1>Parts catalog</h1>
  <p class="lead">Every part lists fitment, material and print settings.</p>
</section>
<section class="container">
  <form class="toolbar" role="search" data-filter>
    <label class="field"><span>Search</span><input type="search" name="q" placeholder="Part name, model or OEM number"></label>
    <label class="field"><span>Make</span><select name="make"><option value="">All makes</option>${opts(makes)}</select></label>
    <label class="field"><span>Category</span><select name="category"><option value="">All categories</option>${opts(cats)}</select></label>
  </form>
  <p class="result-count" aria-live="polite" data-count>${parts.length} parts</p>
  <div class="part-grid" data-grid>${parts.map(card).join('')}</div>
  <div class="empty" data-empty hidden>
    <h2>No parts for that yet.</h2>
    <p>Tell us what you need and we'll model it.</p>
    <a class="btn btn-accent" href="/request/">Request a part</a>
  </div>
</section>`,
  });
}

function partPage(p) {
  const f = money(p.filePrice), pr = money(p.printPrice);
  const specRows = Object.entries(p.specs || {}).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('');
  return layout({
    title: p.name,
    path: '/parts/',
    description: `${p.name} — fits ${[p.years, p.make, p.model].filter(Boolean).join(' ')}. ${p.summary || ''}`,
    body: `
<div class="container">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/parts/">Shop</a><span>›</span><span>${esc(p.make)}</span><span>›</span><span aria-current="page">${esc(p.name)}</span></nav>
  ${p.sample ? '<p class="notice">This is a sample listing. Replace it in <code>src/data/parts.json</code>.</p>' : ''}
  <div class="product">
    <div class="product-media">${media(p, 'product-image')}</div>
    <div class="product-info">
      ${p.discontinued ? `<span class="eyebrow eyebrow-red">Discontinued ${esc(p.discontinued)}</span>` : ''}
      <h1>${esc(p.name)}</h1>
      <p class="fit-lg">Fits ${esc([p.years, p.make, p.model].filter(Boolean).join(' '))}</p>
      <div class="card-badges static">${badges(p)}</div>
      ${p.oem ? `<p class="spec">OEM ${esc(p.oem)}</p>` : ''}
      <div class="offer" data-offer>
        <div class="segmented" role="radiogroup" aria-label="Choose how to buy">
          <button type="button" role="radio" aria-checked="true" data-offer-option="file">Digital file</button>
          <button type="button" role="radio" aria-checked="false" data-offer-option="print">Printed by DustinMade</button>
        </div>
        <div class="offer-panel" data-offer-panel="file">
          <p class="price">${f || 'Price coming soon'}</p>
          <p class="muted">Print-ready file with recommended settings. Personal use; see the file license.</p>
        </div>
        <div class="offer-panel" data-offer-panel="print" hidden>
          <p class="price">${pr ? 'From ' + pr : 'Price coming soon'}</p>
          <p class="muted">Made to order in ${esc((p.materials || []).join(' or ') || 'the recommended material')}, finished and shipped.</p>
        </div>
        <button class="btn btn-primary btn-block" type="button" disabled>Checkout coming soon</button>
      </div>
    </div>
  </div>

  <div class="product-details">
    <section class="detail reveal">
      <h2>Dustin's Notes</h2>
      <p>${esc(p.notes)}</p>
    </section>
    <section class="detail reveal">
      <h2>Quick facts</h2>
      <table class="spec-table"><tbody>
        <tr><th scope="row">Make</th><td>${esc(p.make)}</td></tr>
        <tr><th scope="row">Model</th><td>${esc(p.model)}</td></tr>
        <tr><th scope="row">Years</th><td>${esc(p.years)}</td></tr>
        <tr><th scope="row">Category</th><td>${esc(p.category)}</td></tr>
        ${specRows}
      </tbody></table>
    </section>
    <section class="detail reveal">
      <h2>Confirmed fitment</h2>
      <ul class="fit-list">${(p.fitment || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </section>
    <section class="detail reveal">
      <h2>Use and license</h2>
      <p class="muted">Files are licensed for personal use and printing parts for your own vehicles; they may not be resold or redistributed. Printed parts are not intended for safety-critical systems such as brakes, steering, seat belts or fuel delivery.</p>
    </section>
  </div>
</div>`,
  });
}

function requestPage() {
  const form = site.requestFormEndpoint
    ? `<form class="form" action="${esc(site.requestFormEndpoint)}" method="POST">
    <div class="form-row">
      <label class="field"><span>Year</span><input name="year" inputmode="numeric" required></label>
      <label class="field"><span>Make</span><input name="make" required></label>
      <label class="field"><span>Model</span><input name="model" required></label>
    </div>
    <label class="field"><span>Part name or OEM number</span><input name="part" required></label>
    <label class="field"><span>Details and measurements (optional)</span><textarea name="details" rows="5"></textarea></label>
    <label class="field"><span>Your email</span><input type="email" name="email" autocomplete="email" required></label>
    <button class="btn btn-accent" type="submit">Send request</button>
  </form>`
    : `<div class="notice">Part requests open soon.${site.email ? ` Until then, email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> with your car and the part you need.` : ''}</div>`;
  return layout({
    title: 'Request a Part',
    path: '/request/',
    description: 'Tell DustinMade which discontinued part you need for your classic car.',
    body: `
<section class="container narrow page-head">
  <span class="eyebrow">Request a part</span>
  <h1>What are you missing?</h1>
  <p class="lead">Tell us the car and the part. Photos and measurements help, and the most-requested parts get modeled first.</p>
</section>
<section class="container narrow">${form}</section>`,
  });
}

function howItWorks() {
  return layout({
    title: 'How It Works',
    path: '/how-it-works/',
    description: 'Files vs. printed parts, materials, licensing and safety at DustinMade.',
    body: `
<section class="container narrow page-head">
  <span class="eyebrow">How it works</span>
  <h1>Two ways to get your part</h1>
</section>
<section class="container narrow prose">
  <div class="two-up">
    <div class="panel reveal"><h2>Digital file</h2><p>A print-ready model with the settings we tested: material, layer height, infill, orientation and supports. Print it yourself or take it to a local print shop.</p></div>
    <div class="panel reveal"><h2>Printed by DustinMade</h2><p>We print, finish and check the part, then ship it. Made to order, so lead times vary by part and material.</p></div>
  </div>
  <h2 id="materials">Materials</h2>
  <p>Each part lists a recommended material. As a rule of thumb, PETG suits interior parts, ASA suits parts exposed to sun and weather, and nylon suits clips and parts that need to flex.</p>
  <h2 id="licensing">File licensing</h2>
  <p>Files are licensed for personal use: print parts for your own vehicles. Please don't resell or share the files.</p>
  <h2 id="safety">Safety</h2>
  <p>Printed parts are not intended for safety-critical systems such as brakes, steering, seat belts or fuel delivery.</p>
</section>`,
  });
}

function notFound() {
  return layout({
    title: 'Page not found',
    body: `<section class="container narrow page-head"><span class="eyebrow">404</span><h1>This page is discontinued.</h1><p class="lead">Try the <a class="text-link" href="/parts/">parts catalog</a> or <a class="text-link" href="/request/">request a part</a>.</p></section>`,
  });
}

// ---------- Write ----------
function write(rel, html) {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
if (existsSync(join(root, 'src/static'))) cpSync(join(root, 'src/static'), out, { recursive: true });
write('index.html', home());
write('parts/index.html', catalog());
for (const p of parts) write(`parts/${p.slug}/index.html`, partPage(p));
write('request/index.html', requestPage());
write('how-it-works/index.html', howItWorks());
write('404.html', notFound());
console.log(`Built ${4 + parts.length + 1} pages to dist/`);
