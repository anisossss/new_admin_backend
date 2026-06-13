# Newsroom Hub — Admin

Console éditoriale de la plateforme Tunisia News (Next.js 16, port 3000). Rédaction d'articles riches (Tiptap v3), assistance IA (génération, reformulation, titres, SEO via le backend), publication multi-sites vers les 5 journaux, gestion des médias et des sites.

## Variables d'environnement

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` (API Express) |

## Démarrage

```bash
npm install
npm run dev   # http://localhost:3000
```

Le backend doit tourner sur le port 4000 (`cd ../backend && npm run dev`). Lancez `npm run seed` dans `backend/` pour créer les 5 sites.
