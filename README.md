# B-Social Design Workspace

> ⚠️ **DESIGNER WORKSPACE** — Kun til UI/UX ændringer.
> Ingen backend, ingen database, ingen server-kode.

## Regler

- ✅ Du må redigere i `src/pages/` — sider og layout
- ✅ Du må redigere i `src/components/` — UI-komponenter
- ✅ Du må redigere i `src/index.css` — globale styles
- ❌ Du må **ikke** røre `src/lib/` — API og databaselogik
- ❌ Du må **ikke** røre `src/hooks/` — datahentning
- ❌ Du må **ikke** ændre `package.json` uden godkendelse

## Kom i gang

```bash
npm install
npm run dev
```

Siden åbner på `http://localhost:5173` med **mock-data** — ingen rigtig database.

## Workflow

1. Lav dine designændringer i en ny branch: `git checkout -b design/min-ændring`
2. Push og opret en Pull Request
3. Niclas godkender og merger til `main`
4. Cloudflare Pages deployer automatisk til preview-URL

## Live Preview

Efter deploy er siden tilgængelig på:
`https://b-social-design.pages.dev`
