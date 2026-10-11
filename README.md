# DustinMade website

Static site for DustinMade: 3D-printed reproductions of discontinued classic-car parts.

No dependencies. `npm run build` turns the data files into a complete site in `dist/`.

## Cloudflare settings

In Cloudflare → Workers & Pages → your project → Settings → Build:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |

Every push to `main` redeploys the site.

## Where things live

| File | What it controls |
|---|---|
| `src/data/site.json` | Site name, tagline, contact email, form endpoints |
| `src/data/parts.json` | Every part listing (one page is generated per part) |
| `src/static/styles.css` | Colors, fonts, layout (tokens at the top) |
| `src/static/main.js` | Header, menu, scroll reveals, catalog filter, file/print toggle |
| `build.mjs` | Page templates and the build script |

## Adding a part

Copy an entry in `src/data/parts.json`, give it a unique `slug`, fill in the fields and remove `"sample": true`.
Put photos in `src/static/images/` and set `"image": "/images/your-photo.jpg"`.
Prices are numbers (`"filePrice": 9`) or `null` for "Price coming soon".

## Still to connect

- **Checkout:** buy buttons currently say "Checkout coming soon".
- **Request form:** set `requestFormEndpoint` in `site.json` to a form service URL (e.g. Formspree) to turn the form on.
- **Email:** set `email` in `site.json`.
