# Tunisia News Platform — Master Specification

One backend (Node.js/Express/MongoDB) + 1 admin dashboard (Next.js 16) + 5 Tunisian news websites (Next.js 16), each with a completely distinct design identity. The admin creates rich articles with AI assistance (Claude API) and publishes them to any combination of the 5 sites.

```
news_websites/
├── backend/                 # Express + MongoDB API  → http://localhost:4000
├── admin/                   # "Newsroom Hub" admin   → http://localhost:3000
└── sites/
    ├── carthage-courier/    # EN classic broadsheet  → http://localhost:3001
    ├── tunis-wire/          # FR dark breaking-news  → http://localhost:3002
    ├── medina-post/         # FR warm culture mag    → http://localhost:3003
    ├── jasmine-journal/     # EN airy minimalist     → http://localhost:3004
    └── sahel-express/       # FR bold tabloid        → http://localhost:3005
```

---

## RULES FOR ALL BUILD AGENTS (read carefully)

1. **Write files only. Do NOT run `npm install`, `npm run build`, or any dev server.** The orchestrator installs and builds afterward.
2. Use the **exact dependency versions** listed in this spec. Do not add other dependencies.
3. Every Next.js project is **TypeScript, App Router, Tailwind CSS v4** (CSS-first config — there is **no `tailwind.config.js`**).
4. **Next.js 16 breaking change:** in server components/route handlers, `params` and `searchParams` are **Promises**. Always `const { slug } = await params;`. Type pages as `{ params: Promise<{ slug: string }> }`.
5. Any component using hooks, Tiptap, event handlers, or browser APIs must start with `'use client';`.
6. **Every fetch to the backend must be wrapped in try/catch and return a safe fallback** (empty list / null) so `next build` succeeds even when the backend is offline.
7. tsconfig.json must set `"strict": false` (keep other create-next-app defaults). Use the `@/*` path alias mapped to project root.
8. Each project must include: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, `.gitignore` (node_modules, .next, .env*, !.env.example), `.env.local` AND `.env.example` (same keys; AdSense values left empty), `app/icon.svg` (simple branded mark), `README.md` (short: what it is, env vars, `npm run dev`).
9. Keep code idiomatic and clean. No dead code, no lorem-ipsum filler in UI chrome. French sites use French UI labels; English sites use English UI labels.
10. Images: use `next/image` for article/cover images. Plain `<img>` is acceptable inside rendered article HTML bodies.

### Shared Next.js config files (use verbatim, adjust port comments only)

**postcss.config.mjs**
```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

**next.config.ts**
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
```

**Tailwind v4 theming pattern** — fonts loaded with `next/font/google` in `app/layout.tsx` using the `variable` option, then mapped in `globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --color-paper: #faf6ee;       /* per-site palette tokens */
  --color-ink: #1a1a2e;
  --font-display: var(--font-display);
  --font-body: var(--font-body);
}
```

Then use utilities like `bg-paper text-ink font-display`. Define ALL brand colors as `@theme` tokens — never hardcode hex in JSX.

**Site package.json template** (admin differs — see Admin section). Replace `<name>` and `<port>`:
```json
{
  "name": "<name>",
  "private": true,
  "scripts": {
    "dev": "next dev -p <port>",
    "build": "next build",
    "start": "next start -p <port>"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 1. BACKEND (`backend/`) — Express + MongoDB, port 4000

ES modules (`"type": "module"`). Structure:

```
backend/
├── package.json
├── .env  /  .env.example
├── .gitignore                 (node_modules, .env, uploads/*)
├── uploads/.gitkeep
└── src/
    ├── server.js              # entry: dotenv, connect mongo, mount routes, static /uploads
    ├── db.js                  # mongoose connect with retry + console status
    ├── models/Website.js
    ├── models/Article.js
    ├── routes/websites.js
    ├── routes/articles.js     # admin CRUD
    ├── routes/public.js       # per-site public read API
    ├── routes/ai.js           # Claude endpoints
    ├── routes/upload.js       # multer upload + media library
    ├── routes/stats.js
    ├── services/claude.js     # Anthropic SDK wrapper (code given below)
    └── seed.js                # npm run seed
```

**package.json**
```json
{
  "name": "tunisia-news-backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.88.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "mongoose": "^8.9.0",
    "multer": "^2.0.0",
    "slugify": "^1.6.6"
  }
}
```

**.env / .env.example**
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/tunisia_news
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-opus-4-8
```

`server.js`: `cors()` open for dev, `express.json({ limit: "10mb" })`, serve `/uploads` statically, `GET /api/health` → `{ ok: true, mongo: <connected boolean>, aiConfigured: <boolean> }`. If Mongo is unreachable, log a clear warning but keep the server running (AI + health still work).

### Models

**Website**
```js
{
  name: String (required),
  slug: { type: String, required, unique, lowercase },
  url: String,                    // e.g. http://localhost:3001
  description: String,
  language: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
  themeColor: String,             // brand hex for admin UI chips
  active: { type: Boolean, default: true }
}  // timestamps: true
```

**Article**
```js
{
  title: { type: String, required },
  slug: { type: String, required, unique, lowercase },
  excerpt: String,
  content: String,                // HTML from Tiptap
  coverImage: { url: String, alt: String },
  category: { type: String, default: "Actualités" },
  tags: [String],
  author: { name: { type: String, default: "Rédaction" } },
  websites: [{ type: ObjectId, ref: "Website" }],
  status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft" },
  publishedAt: Date,
  scheduledFor: Date,
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false }
  }
}  // timestamps: true
```

Slug auto-generation: pre-validate hook — if no slug, `slugify(title, { lower: true, strict: true })`; on duplicate key, append `-2`, `-3`, …

### Routes (all JSON; errors → `res.status(4xx|500).json({ error: "message" })`)

**Admin CRUD — `/api/websites`**
- `GET /api/websites` → `Website[]` (sorted by name)
- `GET /api/websites/:id`
- `POST /api/websites`, `PUT /api/websites/:id`, `DELETE /api/websites/:id`

**Admin CRUD — `/api/articles`**
- `GET /api/articles?status=&website=<websiteId>&category=&search=&page=1&limit=20` → `{ articles, total, page, pages }` — `search` is a case-insensitive regex on title; populate `websites` with `name slug themeColor`; sort `-updatedAt`.
- `GET /api/articles/:id` (populated)
- `POST /api/articles` — body may include `websites` as array of website **ids**; if `status==="published"` and no `publishedAt`, set it to now.
- `PUT /api/articles/:id` — same publishedAt rule on transition to published.
- `DELETE /api/articles/:id`
- `POST /api/articles/:id/duplicate` → copy with `title: "<title> (copie)"`, fresh slug, `status: "draft"`, `views: 0`.

**Public per-site — `/api/public/:siteSlug/...`** (only `status: "published"` AND article.websites contains that site)
- `GET /api/public/:siteSlug/articles?page=1&limit=12&category=&featured=true&exclude=<slug>` → `{ articles, total, page, pages }` sorted `-publishedAt`. Omit `content` field in list responses (use `.select("-content")`).
- `GET /api/public/:siteSlug/articles/:articleSlug` → full article; `$inc: { views: 1 }`. 404 JSON if not found/not published on that site.
- `GET /api/public/:siteSlug/categories` → `string[]` distinct categories of that site's published articles.

**Uploads — `/api/upload`** (multer diskStorage → `uploads/`, filename `Date.now()-<slug-of-original>`, 8 MB limit, images only by mimetype)
- `POST /api/upload` (field name `file`) → `{ url: "http://localhost:4000/uploads/<filename>", filename }` — build absolute URL from `req.protocol`/`req.get("host")`.
- `GET /api/media` → `[{ filename, url, size, createdAt }]` (read uploads dir, newest first)
- `DELETE /api/media/:filename` (sanitize with `path.basename`)

**Stats — `GET /api/stats`** →
```json
{
  "totals": { "articles": 0, "published": 0, "drafts": 0, "websites": 5, "views": 0 },
  "perWebsite": [{ "name": "", "slug": "", "themeColor": "", "articles": 0, "views": 0 }],
  "recent": [ /* 8 latest articles, populated websites, no content */ ]
}
```

### AI routes — `/api/ai/*` (services/claude.js)

Use this wrapper exactly (model IDs and SDK usage are authoritative):

```js
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error("ANTHROPIC_API_KEY is not configured. Add it to backend/.env");
    err.status = 503;
    throw err;
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function firstText(message) {
  const block = message.content.find((b) => b.type === "text");
  return block ? block.text : "";
}

// Long output → stream + finalMessage (avoids HTTP timeouts)
export async function generateStructured({ system, prompt, schema, maxTokens = 64000 }) {
  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: { type: "json_schema", schema } },
  });
  const message = await stream.finalMessage();
  return JSON.parse(firstText(message));
}

export async function generateText({ system, prompt, maxTokens = 16000 }) {
  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const message = await stream.finalMessage();
  return firstText(message);
}
```

Notes: do NOT pass `temperature`/`top_p`/`top_k` (removed on this model — 400). JSON schemas must set `additionalProperties: false` and list every property in `required`. Wrap each route in try/catch → `res.status(err.status || 500).json({ error: err.message })`.

- **`POST /api/ai/generate`** body `{ topic, language ("fr"|"en"|"ar"), tone ("neutre"|"formel"|"dynamique"|"analytique"), length ("court"|"moyen"|"long"), instructions? }` → returns
  `{ title, excerpt, contentHtml, category, tags: string[] }`.
  System prompt: senior Tunisian news journalist; write in the requested language; produce clean semantic HTML using ONLY `<p> <h2> <h3> <ul> <ol> <li> <blockquote> <strong> <em>`; no inline styles; no `<h1>`; length mapping court≈300 words / moyen≈600 / long≈1000+; factual tone, Tunisian/Maghreb context awareness; category one of: Politique, Économie, Société, Sport, Culture, Tech, International, Santé.
- **`POST /api/ai/reformulate`** body `{ text, mode ("ameliorer"|"raccourcir"|"developper"|"simplifier"|"professionnel"), language }` → `{ text }`. `text` may be HTML — preserve the same HTML tag structure, rewrite the prose. Plain-text generation (no schema).
- **`POST /api/ai/seo`** body `{ title, content (HTML or text), language }` → `{ metaTitle (≤60 chars), metaDescription (≤155 chars), keywords: string[] (5-8), slug (kebab-case ascii) }`. Structured, `maxTokens: 4000`. Strip HTML tags from content server-side before sending; truncate content to ~6000 chars.
- **`POST /api/ai/titles`** body `{ topic?, content?, language }` → `{ titles: string[] }` (5 alternative headlines, varied angles). Structured, `maxTokens: 4000`.

### Seed (`npm run seed`)

Drops & re-creates the 5 websites:

| name | slug | url | language | themeColor |
|---|---|---|---|---|
| Carthage Courier | carthage-courier | http://localhost:3001 | en | #a41623 |
| Tunis Wire | tunis-wire | http://localhost:3002 | fr | #d4ff3f |
| Médina Post | medina-post | http://localhost:3003 | fr | #c0573b |
| Jasmine Journal | jasmine-journal | http://localhost:3004 | en | #1f7a5c |
| Sahel Express | sahel-express | http://localhost:3005 | fr | #ffd400 |

Then creates **12 realistic published articles** (Tunisian topics: economy/olive-oil exports, tech startups in Tunis, CAN football, Carthage festival, Sidi Bou Saïd tourism, medina restoration, date harvest in Tozeur, renewable energy, education reform, Bardo museum, handball, jasmine harvest…). Each article: realistic 5–8 paragraph HTML content with h2/h3 sections, excerpt, category, tags, `coverImage.url = "https://picsum.photos/seed/<slug>/1200/675"`, filled `seo` block, staggered `publishedAt` over the last 14 days, 2–3 marked `featured: true`. Distribute across sites — several articles published to multiple sites at once (to demonstrate multi-site publishing), every site ends up with ≥5 articles. FR articles in French, EN articles in English. Log a summary table and exit.

---

## 2. SHARED FRONTEND CONTRACT (the 5 news sites)

### Env (`.env.local` and `.env.example` — identical keys; example has empty AdSense values)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_SLUG=<site-slug>
NEXT_PUBLIC_SITE_URL=http://localhost:<port>
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_TOP=
NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
```

### Data layer — `lib/api.ts`
```ts
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE = process.env.NEXT_PUBLIC_SITE_SLUG || "<site-slug>";

export interface Article { /* mirror backend shape: _id, title, slug, excerpt, content?, coverImage, category, tags, author, status, publishedAt, featured, views, seo */ }

export async function getArticles(opts: { page?: number; limit?: number; category?: string; featured?: boolean; exclude?: string } = {}) {
  try {
    const qs = new URLSearchParams(/* defined opts only */);
    const res = await fetch(`${API}/api/public/${SITE}/articles?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    return (await res.json()) as { articles: Article[]; total: number; page: number; pages: number };
  } catch {
    return { articles: [], total: 0, page: 1, pages: 0 };
  }
}
export async function getArticle(slug: string): Promise<Article | null> { /* same pattern, revalidate 60, null fallback */ }
export async function getCategories(): Promise<string[]> { /* [] fallback */ }
```

### Pages (App Router)
- `/` — home. Hero/lead story (first featured or newest) + article grid + category navigation. Must render a graceful designed empty-state when backend returns no articles ("Le journal arrive bientôt…" / "Fresh ink coming soon…").
- `/article/[slug]` — full article. `export async function generateMetadata({ params })` (await params!) building: title (`seo.metaTitle || title`), description (`seo.metaDescription || excerpt`), `alternates.canonical` (`seo.canonicalUrl ||` site url + path), openGraph (type "article", images: `seo.ogImage || coverImage.url`, publishedTime, tags), twitter `summary_large_image`, `robots: { index: !seo.noIndex }`. Body renders cover image, category badge, formatted date (locale matching site language), author, the HTML via `dangerouslySetInnerHTML`, tags, plus a **JSON-LD `NewsArticle`** `<script type="application/ld+json">`. Bottom: "related articles" (same category, exclude current, limit 3) + one in-article AdSlot placement per the site's ad plan. `notFound()` from `next/navigation` when null → custom branded `app/not-found.tsx`.
- `/category/[name]` — filtered list (decodeURIComponent the param; await params), with pagination via `?page=` searchParam.
- `app/sitemap.ts` — site url + all article urls (`lastModified: publishedAt`), try/catch → minimal sitemap.
- `app/robots.ts` — allow all, point to sitemap.
- `app/feed.xml/route.ts` — RSS 2.0 of latest 20 articles (escape XML entities), `Content-Type: application/rss+xml`.
- Typography for article bodies: hand-rolled CSS in globals.css under a `.article-body` class (style p, h2, h3, ul, ol, blockquote, a, img — generous line-height, styled per site identity). Do NOT use @tailwindcss/typography.

### AdSense — `components/AdSlot.tsx` (client component, identical logic on all sites, styled per site)

```tsx
'use client';
import { useEffect } from "react";

declare global { interface Window { adsbygoogle: unknown[] } }

export default function AdSlot({ slot, className = "", label }: { slot?: string; className?: string; label: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => {
    if (client && slot) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    }
  }, [client, slot]);

  if (!client || !slot) {
    return (
      <div className={`ad-placeholder ${className}`} aria-hidden="true">
        <span>{label}</span> {/* "Publicité" (FR) / "Advertisement" (EN) — styled subtly per site */}
      </div>
    );
  }
  return (
    <ins className={`adsbygoogle block ${className}`} style={{ display: "block" }}
      data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
  );
}
```

In `app/layout.tsx`, only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set, add:
```tsx
<Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} crossOrigin="anonymous" strategy="afterInteractive" />
```

**Ad load discipline: max 2 placements on home, max 2 on article pages.** Placeholder boxes must look intentional (dashed hairline border in a muted brand tone, small uppercase label), never garish. Each site uses a DIFFERENT placement mix (defined in its design brief).

### Per-site metadata
`app/layout.tsx` exports `metadata` with `metadataBase: new URL(siteUrl)`, default title + `title.template` (`"%s — <Site Name>"`), description, openGraph siteName, and sets `<html lang="fr"|"en">`.

---

## 3. THE 5 SITE DESIGN IDENTITIES

Every site must feel like a different publication built by a different studio. No shared components beyond the AdSlot logic. Fonts via `next/font/google` (never Inter/Roboto/Arial). All colors as `@theme` tokens. Each brief below is binding.

### 3.1 Carthage Courier (`sites/carthage-courier`, port 3001, EN)
**Classic broadsheet — "the 140-year-old paper of record."**
- Palette: paper `#faf6ee`, ink `#1c1b1a`, carmine `#a41623`, navy `#16324f`, hairline `#d8d0c0`.
- Type: `Playfair_Display` (masthead/headlines, tight tracking) + `Source_Serif_4` (body) + small-caps sans labels (`IBM_Plex_Sans` for kickers/bylines only).
- Layout: centered masthead with date line + double rules above/below; horizontal category rule-nav; front page = true newspaper grid — oversized lead story (huge serif headline, deck paragraph) flanked by secondary column with hairline dividers between briefs; numbered "Most read" rail. Footer with column rules.
- Details: drop cap on article first paragraph (CSS `::first-letter`), italic serif deck/excerpts, dotted hairlines, ALL-CAPS letterspaced kickers in carmine.
- Ads: leaderboard AdSlot under the masthead (home, TOP) + one in-article (after content, INARTICLE).

### 3.2 Tunis Wire (`sites/tunis-wire`, port 3002, FR)
**Dark breaking-news terminal — "the wire that never sleeps."**
- Palette: void `#0b0f14`, panel `#121821`, signal lime `#d4ff3f`, alert red `#ff4d4d`, text `#e8edf2`, dim `#8a97a5`.
- Type: `Syne` (display — bold, techy) + `Archivo` (body/UI).
- Layout: slim top bar with live clock placeholder + animated "EN DIRECT" pulsing dot; CSS marquee ticker of latest headlines under the header; dense card grid with lime hover borders; left-borderized list rows for secondary stories; monospace-feel timestamps (relative "il y a 2 h" computed server-side from publishedAt).
- Details: subtle scanline/noise overlay on hero, lime selection color, category chips as bordered tags, uppercase nav.
- Ads: sticky sidebar AdSlot on article pages (SIDEBAR) + one in-feed card mid-grid on home (TOP).

### 3.3 Médina Post (`sites/medina-post`, port 3003, FR)
**Warm cultural magazine — "ochre walls, hand-set type."**
- Palette: sable `#efe3d0`, terre `#c0573b`, olive `#6b6b3a`, encre `#3b2e25`, crème `#f8f1e5`.
- Type: `Fraunces` (display, optical sizing, soft swashy feel) + `Nunito_Sans` (body).
- Layout: editorial asymmetry — oversized hero image with overlapping title card (negative margin), alternating image-left/image-right feature rows, a horizontally-scrolling "Chroniques" strip, generous rounded-2xl images.
- Details: CSS-only zellige-inspired geometric divider (repeating-linear-gradient diamonds in terre/olive), arched image masks (`border-radius: 50% 50% 0 0` on hero accents), pull-quote styling in article body.
- Ads: native-styled in-feed slot between feature rows (TOP) + end-of-article slot (INARTICLE) framed like an editorial card.

### 3.4 Jasmine Journal (`sites/jasmine-journal`, port 3004, EN)
**Airy refined minimalism — "white space and one green thread."**
- Palette: white `#fdfdfb`, mist `#f1f4f0`, jasmine green `#1f7a5c`, gold `#b08d3e`, charcoal `#22272a`.
- Type: `Cormorant_Garamond` (display, light, large sizes) + `Mulish` (body).
- Layout: centered column (max-w ~ 65ch), enormous breathing room, single lead story with full-bleed image then a strict 3-col grid of minimal cards (image, kicker, title — nothing else), 1px `#e3e8e2` hairlines, slow fade-in on load (CSS keyframes with stagger).
- Details: tiny jasmine-flower SVG dingbat as section divider, underline-on-hover link animation (background-size trick), letterspaced uppercase micro-labels in green.
- Ads: one discreet banner below the lead story (TOP) + end-of-article (INARTICLE). Placeholders nearly invisible: faint hairline frame + tiny label.

### 3.5 Sahel Express (`sites/sahel-express`, port 3005, FR)
**Bold tabloid energy — "loud, fast, yellow."**
- Palette: jaune `#ffd400`, noir `#111111`, rouge `#e0312d`, blanc `#ffffff`, gris `#f2f2f2`.
- Type: `Anton` (display — condensed, ALL CAPS headlines) + `Public_Sans` (body).
- Layout: thick black header with yellow logo block; red "FLASH" breaking strip; mosaic grid with intentionally varied card sizes (CSS grid spans), headlines in huge condensed caps tight-leading; diagonal yellow accent stripes (skewed pseudo-elements); chunky black category tabs.
- Details: numbered TOP 5 list with giant outlined numerals, hard offset shadows (`box-shadow: 6px 6px 0 #111`), zero border-radius everywhere, hover = translate -2px with bigger offset shadow.
- Ads: leaderboard under FLASH strip (TOP) + in-feed inside mosaic (INARTICLE used on article page bottom). Placeholders styled as black-bordered boxes with yellow corner tag.

---

## 4. ADMIN — "Newsroom Hub" (`admin/`, port 3000, Next.js 16)

Professional editorial console. **Design:** off-white `#f7f5f2` workspace, deep ink sidebar `#191c1f`, terracotta accent `#d9622b`, success green `#3d8b6a`, amber `#e0a51c` for drafts. Type: `Manrope` (UI) + `Spline_Sans_Mono` (slugs/meta counters). Refined, dense-but-calm, rounded-xl cards, soft shadows, crisp focus rings. French UI labels (the user is francophone) with universally readable icons.

**package.json** — site template plus these extra `dependencies`:
```json
"@tiptap/extension-image": "^3.0.0",
"@tiptap/extension-text-align": "^3.0.0",
"@tiptap/extension-youtube": "^3.0.0",
"@tiptap/extensions": "^3.0.0",
"@tiptap/pm": "^3.0.0",
"@tiptap/react": "^3.0.0",
"@tiptap/starter-kit": "^3.0.0",
"lucide-react": "0.460.0"
```
Scripts use `-p 3000`. Env: `NEXT_PUBLIC_API_URL=http://localhost:4000` (.env.local + .env.example).

### Structure
```
app/layout.tsx               # sidebar shell (client nav highlighting) + toast provider
app/page.tsx                 # Dashboard
app/articles/page.tsx        # Article list
app/articles/new/page.tsx    # Editor (create)
app/articles/[id]/page.tsx   # Editor (edit) — await params
app/websites/page.tsx        # The 5 sites
app/media/page.tsx           # Media library
components/Sidebar.tsx, Toast.tsx, ConfirmDialog.tsx, StatusBadge.tsx, SiteChips.tsx,
components/editor/RichEditor.tsx, EditorToolbar.tsx, AiPanel.tsx, SeoPanel.tsx, PublishPanel.tsx, CoverImagePicker.tsx
lib/api.ts                   # typed fetch client for ALL backend endpoints (client-side fetching with useEffect/useState; no server actions)
lib/types.ts
```
All pages are client components (`'use client'`) fetching via `lib/api.ts`; show skeleton loaders while fetching and a friendly connection-error panel (with retry button) when the backend is down.

### Dashboard (`/`)
Stat cards (articles, publiés, brouillons, vues totales) with icon + delta styling; per-website bar (horizontal bars colored by `themeColor`, count + views); "Articles récents" table (title, sites chips, status badge, updated date, edit link); backend/AI health indicator (from `/api/health`: Mongo + clé Claude configurée).

### Articles list (`/articles`)
Toolbar: search input (debounced), status filter (Tous/Publié/Brouillon), website filter (dropdown of sites), "Nouvel article" primary button. Table rows: cover thumbnail, title + slug mono, category chip, **site chips** (colored dots per website), status badge, views, updatedAt, row actions (Éditer / Dupliquer / Supprimer with ConfirmDialog). Pagination. Empty state with illustration-by-CSS.

### Editor (`/articles/new` and `/articles/[id]`)
Two-column workspace: **left = content, right = settings rail** (sticky, collapsible sections).

Left column:
- Title textarea (auto-grow, big serif-feel), slug field (mono, auto-generated from title, editable, "regenerate" button).
- Excerpt textarea with char counter.
- **RichEditor (Tiptap v3)** — exact setup:
```tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder, CharacterCount } from '@tiptap/extensions';

const editor = useEditor({
  immediatelyRender: false,                  // REQUIRED for Next.js SSR
  extensions: [
    StarterKit.configure({ link: { openOnClick: false } }),  // v3: link & underline are IN StarterKit
    Image,
    Youtube.configure({ width: 640, height: 360 }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Écrivez votre article…' }),
    CharacterCount,
  ],
  content: value,
  onUpdate: ({ editor }) => onChange(editor.getHTML()),
});
```
  Toolbar (lucide icons, active-state styling, tooltips): paragraph/H2/H3 select, bold, italic, underline, strike, highlight, bullet/ordered list, blockquote, align left/center/right, link (prompt dialog), **image upload** (file input → `POST /api/upload` → `editor.chain().focus().setImage({ src })`), YouTube embed (URL prompt), undo/redo. Footer: word + char count. Style `.tiptap` content area in globals.css (editor typography incl. embedded images/iframes).
- **AiPanel** (collapsible card above editor, sparkles icon, terracotta accent):
  - *Générer un article* : dialog with topic textarea, language select (Français/English/العربية), tone select, length select, optional instructions → `POST /api/ai/generate` → fills title, excerpt, editor content, category, tags (with a confirm-overwrite warning if fields are non-empty). Loading state with animated dots; errors as toast.
  - *Reformuler* : mode dropdown (Améliorer/Raccourcir/Développer/Simplifier/Ton professionnel). Applies to **selection if any, else whole document**: get selection text via `editor.state.doc.textBetween(from, to)` (else `editor.getHTML()`), call `/api/ai/reformulate`, replace selection (`insertContentAt`) or `setContent`.
  - *Suggérer des titres* : calls `/api/ai/titles` with current content/topic → 5 clickable suggestions, click sets title.
- Each AI action disabled with explanatory tooltip when `/api/health` reports `aiConfigured: false`.

Right rail sections:
1. **PublishPanel** — status select (Brouillon/Publié/Programmé + datetime input when Programmé), **websites multi-select dropdown**: checkbox list of the 5 sites with their colored dot + name, "Tout sélectionner" toggle, selected shown as removable chips. Primary button "Publier" / "Enregistrer" (label adapts to status), secondary "Enregistrer comme brouillon". Featured toggle. Category select (the 8 categories) with free-text option. Tags input (enter-to-add chips).
2. **CoverImagePicker** — drop zone / file input → `/api/upload`, preview with replace/remove, alt text input.
3. **SeoPanel** — metaTitle input with live counter (colored green ≤60), metaDescription textarea (counter ≤155), keywords chips input, ogImage url input ("utiliser l'image de couverture" shortcut button), canonical url, noIndex toggle, **"Générer le SEO avec l'IA"** button (`/api/ai/seo` → fills fields), and a **Google SERP preview** (rendered snippet: blue title, green url with slug, gray description).

Save = POST/PUT then toast + redirect to `/articles` (stay on page for autosave-style "Enregistrer" without redirect on edit). Unsaved-changes guard (beforeunload).

### Websites (`/websites`)
Card per site: themeColor swatch header, name, slug, language badge, url (open-in-new-tab link), article count (from stats), active toggle (PUT), edit dialog (name/description/url). No create/delete UI (the 5 are seeded) — but show hint to run `npm run seed`.

### Media (`/media`)
Grid of uploaded images (from `/api/media`), click-to-copy URL, delete with confirm, upload button & drag-drop zone.

---

## 5. ROOT FILES (orchestrator writes these — agents skip)
- `README.md` — overview, prerequisites (Node 20+, MongoDB), setup order, env var table, AdSense instructions, port map.

## 6. ACCEPTANCE CHECKLIST (auditors verify)
- [ ] All fetch URLs match backend routes exactly (`/api/public/<slug>/articles`, etc.); env var names match this spec exactly.
- [ ] Ports: backend 4000; admin 3000; sites 3001–3005 in package.json scripts AND seeded website urls AND NEXT_PUBLIC_SITE_URL.
- [ ] Every dynamic page awaits `params`/`searchParams` (Next 16).
- [ ] No `tailwind.config.*` files; every project has `@import "tailwindcss"` + `@theme inline` tokens; postcss.config.mjs exact.
- [ ] `'use client'` present where hooks are used; Tiptap has `immediatelyRender: false`; no `@tiptap/extension-link`/`-underline`/`-placeholder`/`-character-count` packages (v3 moved them).
- [ ] AdSlot: renders placeholder when env empty; `<ins class="adsbygoogle">` + script only when client id set; ≤2 ads per page; sites differ in placement.
- [ ] Article pages: generateMetadata, canonical, OG/Twitter, JSON-LD NewsArticle, robots noIndex respect; sitemap.ts, robots.ts, feed.xml on all 5 sites.
- [ ] Backend: model fields, slug uniqueness handling, view increment, publishedAt rule, multer limits, AI endpoints use `claude-opus-4-8` default + adaptive thinking + structured outputs, no temperature.
- [ ] All 7 projects have package.json with EXACT versions from spec, .env files, .gitignore, README.
