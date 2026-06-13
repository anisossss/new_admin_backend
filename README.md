# Tunisia News Platform

A complete multi-site publishing platform: **one backend**, **one admin dashboard**, and **5 Tunisian news websites** — each with its own design identity. Write an article once in the admin, enhance it with Claude AI, and publish it to any combination of the 5 sites from a dropdown.

## Architecture

| Project | Path | Stack | URL |
|---|---|---|---|
| **API Backend** | `backend/` | Node.js · Express · MongoDB · Claude API | http://localhost:4000 |
| **Newsroom Hub** (admin) | `admin/` | Next.js 16 · Tailwind v4 · Tiptap | http://localhost:3000 |
| Carthage Courier — EN classic broadsheet | `sites/carthage-courier/` | Next.js 16 · Tailwind v4 | http://localhost:3001 |
| Tunis Wire — FR dark breaking-news | `sites/tunis-wire/` | Next.js 16 · Tailwind v4 | http://localhost:3002 |
| Médina Post — FR warm culture magazine | `sites/medina-post/` | Next.js 16 · Tailwind v4 | http://localhost:3003 |
| Jasmine Journal — EN airy minimalist | `sites/jasmine-journal/` | Next.js 16 · Tailwind v4 | http://localhost:3004 |
| Sahel Express — FR bold tabloid | `sites/sahel-express/` | Next.js 16 · Tailwind v4 | http://localhost:3005 |

All 5 sites read from the same backend, filtered by their site slug. Articles store rich HTML content, media, full SEO configuration (meta title/description, keywords, OG image, canonical, noIndex), and the list of websites they are published on.

## Prerequisites

- **Node.js 20+** (tested on v24)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) — [MongoDB Community](https://www.mongodb.com/try/download/community) or Docker: `docker run -d -p 27017:27017 mongo`
- An **Anthropic API key** (for the AI features) — https://platform.claude.com

## Setup

```bash
# 1. Backend
cd backend
npm install
# put your Anthropic key in backend/.env  →  ANTHROPIC_API_KEY=sk-ant-...
npm run seed        # creates the 5 websites + 12 demo articles (needs MongoDB up)
npm run dev         # http://localhost:4000

# 2. Admin (new terminal)
cd admin
npm install
npm run dev         # http://localhost:3000

# 3. Each news site (new terminals — run the ones you want)
cd sites/carthage-courier && npm install && npm run dev   # :3001
cd sites/tunis-wire       && npm install && npm run dev   # :3002
cd sites/medina-post      && npm install && npm run dev   # :3003
cd sites/jasmine-journal  && npm install && npm run dev   # :3004
cd sites/sahel-express    && npm install && npm run dev   # :3005
```

## Environment variables

### `backend/.env`
| Key | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | Mongo connection string |
| `ANTHROPIC_API_KEY` | Claude API key — powers generate / reformulate / SEO / titles |
| `CLAUDE_MODEL` | Model id (default `claude-opus-4-8`) |

### `sites/*/.env.local`
| Key | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (`http://localhost:4000`) |
| `NEXT_PUBLIC_SITE_SLUG` | The site's slug (matches the seeded Website) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site (used for canonical/sitemap/RSS) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Your AdSense client id (`ca-pub-XXXXXXXXXXXXXXXX`) — **leave empty until you have it**; styled placeholders render instead |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOP` / `_INARTICLE` / `_SIDEBAR` | Ad unit slot ids per placement |

### `admin/.env.local`
| Key | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (`http://localhost:4000`) |

## Enabling AdSense later

1. Get your site approved and create ad units in AdSense.
2. In each site's `.env.local`, set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...` and the slot ids for the placements that site uses.
3. Restart the site. The `adsbygoogle.js` script and real `<ins>` units replace the placeholders automatically. Each site keeps a deliberately light load: **max 2 ad placements per page**, with different placements per site (leaderboard, in-feed, in-article, sticky sidebar).

## Admin features (Newsroom Hub)

- **Dashboard** — totals, per-site article/view bars, recent articles, backend + AI health.
- **Articles** — search, filter by status/site, duplicate, delete.
- **Editor** — Tiptap rich text (headings, lists, quotes, alignment, links, **image upload**, YouTube embeds), cover image, category, tags, featured.
- **AI (Claude)** — *Générer un article* (topic, language FR/EN/AR, tone, length), *Reformuler* (selection or whole document: improve / shorten / expand / simplify / professional), *Suggérer des titres*, *Générer le SEO*.
- **SEO panel** — meta title/description with live counters, keywords, OG image, canonical, noIndex + Google SERP preview.
- **Multi-site publishing** — select any combination of the 5 websites from the dropdown (or *Tout sélectionner*) and publish to all of them at once. Draft / published / scheduled statuses.
- **Websites & Media** — manage the 5 sites' info; media library for uploads.

## SEO on the news sites

Every site ships per-article `generateMetadata` (meta title/description, canonical, Open Graph, Twitter cards), `NewsArticle` JSON-LD, `sitemap.xml`, `robots.txt`, and an RSS feed at `/feed.xml`.
