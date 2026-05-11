# B-Social Design

Design and concept app for Cloudflare Pages project `b-social-design`.

This repository is not the production deployment source for `b-social.net`.
Production traffic for `b-social.net` and `www.b-social.net` is served by the
standalone Cloudflare Worker `b-social-pages`.

## Projekt Struktur

```
b-social-design/
|-- public/
|-- source/
|   |-- src/
|   |-- public/
|   |-- vite.config.ts
|-- supabase/
|-- .github/
|-- README.md
```

## Deployment

Dette projekt deployes til Cloudflare Pages-projektet `b-social-design`.

**Build output directory:** `source/dist/public`

**Domaener:**
- b-social-design.pages.dev

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
