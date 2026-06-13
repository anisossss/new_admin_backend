# Tunisia News Backend

Express + MongoDB + Claude AI API powering the Newsroom Hub admin and the 5 Tunisian news websites. Runs on **http://localhost:4000** (ES modules).

## Environment

Copy `.env.example` to `.env` (already provided):

| Variable | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string (default `mongodb://127.0.0.1:27017/tunisia_news`) |
| `ANTHROPIC_API_KEY` | Claude API key — AI routes return `503` until it is set |
| `CLAUDE_MODEL` | Claude model id (default `claude-opus-4-8`) |

## Run

```bash
npm install
npm run seed   # creates the 5 websites + 12 published articles
npm run dev    # http://localhost:4000 (auto-reload)
```

The server boots and serves `GET /api/health` even when MongoDB is down (database-backed routes return `503` until it reconnects).

## Routes

- `GET /api/health` — `{ ok, mongo, aiConfigured }`
- `GET|POST /api/websites`, `GET|PUT|DELETE /api/websites/:id`
- `GET|POST /api/articles`, `GET|PUT|DELETE /api/articles/:id`, `POST /api/articles/:id/duplicate`
- `GET /api/public/:siteSlug/articles`, `GET /api/public/:siteSlug/articles/:articleSlug`, `GET /api/public/:siteSlug/categories`
- `POST /api/upload`, `GET /api/media`, `DELETE /api/media/:filename`
- `GET /api/stats`
- `POST /api/ai/generate`, `POST /api/ai/reformulate`, `POST /api/ai/seo`, `POST /api/ai/titles`
