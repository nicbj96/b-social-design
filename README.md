# B-Social Pages — Wired Playground

> **Note:** This is the **wired playground** for B-Social — Cloudflare Pages
> deployment with React / Vite / TypeScript wiring and Supabase for real auth,
> database and realtime experiments. Use this repo when you want to test
> end-to-end data flows.
>
> For the **static playground** (plain HTML/CSS mockups, no database, no
> build step — fast visual / UX iteration) see
> [`nikaquantcom-byte/b-social-design`](https://github.com/nikaquantcom-byte/b-social-design).

Cloudflare Pages deployment for [b-social.net](https://b-social.net)

## Playground split

| This repo (wired) | `nikaquantcom-byte/b-social-design` (static) |
| --- | --- |
| React + Vite + TypeScript | Plain HTML + CSS |
| Supabase (auth, DB, realtime) | No database |
| Cloudflare Pages deploy | Open `index.html` and go |
| Real end-to-end integration | Fast visual iteration |
| `npm install`, `.env`, migrations | No build step |

Both repos are playgrounds — they just exercise different parts of the stack.
Break things freely in either without worrying about production.

## Projekt Struktur

```
b-social-pages/
|-- public/                  # Deploy directory (upload til Cloudflare Pages)
|   |-- css/                 # Stylesheets
|   |-- js/                  # JavaScript filer
|   |-- icons/               # PWA ikoner (alle stoerrelser)
|   |-- _headers             # Cloudflare Pages custom headers
|   |-- _redirects           # Cloudflare Pages redirects (SPA fallback)
|   |-- index.html           # Hoved HTML fil (SPA entry point)
|   |-- manifest.json        # PWA manifest
|   |-- sw.js                # Service Worker
|-- .gitignore
|-- README.md
```

## Deployment

Dette projekt deployes til Cloudflare Pages.

**Build output directory:** `public/`

**Domaener:**
- b-social.net
- www.b-social.net
- b-social.pages.dev

## Vigtige Cloudflare Pages Filer

- `_headers` - Custom HTTP headers (security, caching)
- `_redirects` - SPA fallback routing
- `manifest.json` - PWA konfiguration
- `sw.js` - Service Worker til offline support

## Naeste Skridt

- [ ] Kopier eksisterende index.html indhold fra live deployment
- [ ] Tilfoej ikonfiler til /icons/
- [ ] Tilfoej CSS filer til /css/
- [ ] Tilfoej JS filer til /js/
- [ ] Forbind repo til Cloudflare Pages via Git integration
