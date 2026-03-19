# Requirements

## System Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18.17+ | Required by Next.js 14+ |
| npm | 9+ | Comes with Node.js |
| Docker Desktop | Latest | Required for local Supabase |
| Supabase CLI | Latest | `npm install -g supabase` |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API (secret) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for local dev |

## Installation

```bash
# Install dependencies
npm install

# Start local Supabase (Docker must be running)
npx supabase start

# Apply database migrations and seed
npx supabase db reset

# Generate TypeScript types from schema
npx supabase gen types typescript --local > src/types/database.ts

# Start the development server
npm run dev
```

App runs at `http://localhost:3000/fr` (French) or `http://localhost:3000/ar` (Arabic).

## Tech Stack

- **Next.js 16** — App Router, TypeScript, Tailwind CSS
- **Supabase** — PostgreSQL, Auth, Storage, Realtime
- **next-intl** — French + Arabic (RTL) internationalization
- **Monaco Editor** — In-browser code editor
- **Pyodide** — In-browser Python execution (WASM)
- **react-pdf** — In-browser PDF rendering
- **Vitest** — Unit and component tests

## Running Tests

```bash
# Run all tests
npm run test:run

# Watch mode
npm test
```
