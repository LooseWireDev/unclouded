<p align="center">
  <img src=".github/assets/unclouded-icon.svg" alt="Unclouded" width="80" />
</p>

<h1 align="center">Unclouded</h1>

<p align="center">
  <strong>Find privacy-respecting alternatives to every app you use.</strong>
</p>

<p align="center">
  <a href="https://github.com/LooseWireDev/unclouded/blob/main/LICENSE"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" /></a>
  <a href="https://github.com/LooseWireDev/unclouded/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/LooseWireDev/unclouded?style=flat" /></a>
</p>

<p align="center">
  <a href="#what-is-unclouded">What Is It</a> •
  <a href="#features">Features</a> •
  <a href="#why-unclouded">Why Unclouded</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#development">Development</a> •
  <a href="#support">Support</a>
</p>

---

## What Is Unclouded?

Unclouded is a privacy-focused app discovery and comparison platform. Look up any proprietary app — WhatsApp, Google Maps, Chrome — and find open source, privacy-respecting alternatives you can install right now.

The app database is the core product. Everything else — the comparison tools, the blog, the Obtainium integration — is a view into it.

## Why Unclouded?

| Alternative | Problem |
|-------------|---------|
| AlternativeTo | Ad-heavy, not privacy-focused, includes proprietary suggestions |
| PRISM Break | Static list, no search, rarely updated |
| switching.software | Minimal info, no comparison tools |
| F-Droid | App store, not a comparison tool |
| **Unclouded** | **Searchable database, side-by-side comparison, Obtainium integration, always current** |

## Features

- **Alternative finder** — Look up any proprietary app and see every privacy-respecting replacement, with relationship types (direct alternative, fork, partial replacement).
- **Side-by-side comparison** — Compare 2-3 apps on features, platforms, sources, and tags. Shareable URLs.
- **App discovery browser** — Browse by category, filter by tags (encrypted, offline-capable, no-GMS, self-hostable), find apps you didn't know existed.
- **Obtainium integration** — One-click "Add to Obtainium" buttons. Bulk export configs for multiple apps at once.
- **Semantic search** — Find apps by describing what you need, not just by name.
- **Always current** — Database populated from F-Droid, IzzyOnDroid, and crowdsourced Obtainium configs. Thousands of apps, deduplicated and tagged.
- **Blog** — Degoogling guides, app comparisons, and migration walkthroughs that link directly into the tools.

## How It Works

```
┌──────────────────────────────────────────────────────┐
│                    Data Sources                       │
│  F-Droid · IzzyOnDroid · Obtainium Configs · GitHub  │
└──────────────┬───────────────────────────────────────┘
               │ fetch, parse, deduplicate
               ▼
┌──────────────────────────────────────────────────────┐
│                   Turso Database                      │
│  apps · sources · tags · alternatives · embeddings   │
└──────────────┬───────────────────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌───────────┐
│  Web App    │  │  API      │
│  SSR + SPA  │  │  /api/*   │
│  (you)      │  │  (mobile) │
└─────────────┘  └───────────┘
```

1. **Seed pipeline** pulls app data from F-Droid, IzzyOnDroid, and Obtainium crowdsourced configs
2. **Deduplication** by package name — one app entry, multiple install sources
3. **Tagging** — categories, features, compatibility, platforms mapped from source metadata
4. **Embeddings** — vector search for semantic similarity ("apps like Signal but with disappearing messages")
5. **Web app** serves it all with SSR for SEO and SPA navigation for the interactive tools

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start |
| UI | React + TanStack Router + TanStack Query |
| Database | Turso (libSQL) + Drizzle ORM |
| Vector search | Turso native (DiskANN) |
| Hosting | Cloudflare Workers |
| Package manager | pnpm |

## Development

```bash
# Clone
git clone https://github.com/LooseWireDev/unclouded.git
cd unclouded

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your Turso credentials

# Run database migrations
pnpm db:migrate

# Initialize vector tables
pnpm db:init-vectors

# Start dev server
pnpm dev
```

### Project Structure

```
unclouded/
├── src/
│   └── routes/
│       ├── __root.tsx          # Root layout
│       ├── index.tsx           # Landing page
│       ├── apps.tsx            # App listing
│       ├── apps.$slug.tsx      # App detail (SSR)
│       ├── compare.tsx         # Comparison tool
│       ├── discover.tsx        # Discovery browser
│       ├── search.tsx          # Search interface
│       ├── blog/               # Blog routes
│       └── api/                # API server routes
├── db/
│   ├── schema.ts               # Drizzle schema
│   ├── client.ts               # Turso/Drizzle client
│   ├── queries.ts              # Shared query functions
│   └── seed/                   # Data ingestion pipeline
├── content/
│   └── blog/                   # MDX blog posts
├── vite.config.ts
├── drizzle.config.ts
├── wrangler.jsonc
└── package.json
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm deploy` | Build + deploy to Cloudflare Workers |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations against Turso |
| `pnpm db:push` | Push schema changes directly (dev only) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:init-vectors` | Create vector tables |

## Roadmap

- **v1 (Web)** — Alternative finder, app discovery, Obtainium config generation, blog
- **v2 (Mobile)** — Android/iOS app that scans installed apps and maps them to privacy alternatives
- **v3 (Community)** — User submissions, accounts, saved configs, voting

## Support

Unclouded is built and maintained by [Loose Wire LLC](https://loosewire.dev).

<p>
  <a href="https://github.com/sponsors/LooseWireDev"><img alt="Sponsor on GitHub" src="https://img.shields.io/badge/sponsor-GitHub%20Sponsors-ea4aaa?logo=githubsponsors&logoColor=white" /></a>
  <a href="https://ko-fi.com/loosewire"><img alt="Support on Ko-fi" src="https://img.shields.io/badge/support-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white" /></a>
</p>

- **Bug reports** — [GitHub Issues](https://github.com/LooseWireDev/unclouded/issues)

## License

[AGPL-3.0](LICENSE) — You can use, modify, and distribute Unclouded. If you distribute a modified version, you must share your changes under the same license.
