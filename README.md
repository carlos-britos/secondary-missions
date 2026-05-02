# Secondary Missions

A gamified web app for real-life side quests. Create one-time or weekly missions with RPG-style rarity, track completions with photos and notes, unlock achievements, explore public missions from other players, and manage content through a moderation system.

## Features

- **Auth & Onboarding** -- Registration, login, profile setup (username, avatar, language), 4-step onboarding wizard, route guards (Auth/Guest/Onboarding/Admin), RPG-themed landing page
- **Create & Edit Missions** -- Drawer form with visual rarity selector, tag chips, one-time/weekly toggle, day picker, public switch, rarity-bordered mission cards
- **Dashboard** -- 4 tabs (One-time / Weekly / Completed / Failed), expiration countdown, completion count, filtering and sorting
- **Complete Missions** -- Completion modal with notes + optional photo upload to Supabase Storage, `mission_completions` table, atomic RPC
- **Achievements** -- 20 predefined + auto-generated per mission, gallery at `/achievements`, post-completion evaluation, toast notifications
- **Explore** -- `/explore` with filters (text, rarity, tags, type), read-only cards, "Adopt" button that clones a mission
- **Moderation** -- `/admin/moderation` queue, approve/reject public missions, in-app notifications
- **Settings** -- `/settings`: edit profile, change password, delete account
- **i18n** -- Full Spanish and English support via i18next

## Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| **Framework**  | React 19 + TypeScript (strict)                              |
| **Build**      | Vite 8                                                      |
| **State**      | Zustand (auth) + TanStack React Query (server state)        |
| **Forms**      | React Hook Form + Zod                                       |
| **Styling**    | SCSS Modules / BEM, dark RPG theme (Geist / Fraunces fonts) |
| **Animations** | Framer Motion                                               |
| **Backend**    | Supabase (Auth, PostgreSQL, Storage, RLS, RPCs)             |
| **i18n**       | i18next + browser language detection                        |
| **Icons**      | Lucide React                                                |
| **Testing**    | Vitest + Testing Library                                    |
| **Linting**    | ESLint + Prettier + Husky + lint-staged                     |
| **Deploy**     | Vercel                                                      |

## Prerequisites

- Node.js >= 22 (see `.nvmrc`)
- pnpm
- A [Supabase](https://supabase.com) project with Auth, Database, and Storage enabled

## Setup

```bash
git clone <repo-url> && cd secondary-missions
pnpm install
cp .env.example .env
# Fill in your Supabase credentials (see below)
pnpm dev
```

### Supabase database

Apply the migrations in order from `supabase/migrations/` to your Supabase project. If using the Supabase CLI:

```bash
supabase db push
```

## Environment Variables

| Variable                 | Description                   | Where to get it                                                               |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL          | [Supabase Dashboard](https://supabase.com/dashboard) > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Same location as above                                                        |

## Scripts

| Script           | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Start development server            |
| `pnpm build`     | TypeScript check + production build |
| `pnpm preview`   | Preview production build locally    |
| `pnpm typecheck` | Run TypeScript compiler (no emit)   |
| `pnpm lint`      | Run ESLint                          |
| `pnpm format`    | Format code with Prettier           |
| `pnpm test`      | Run tests in watch mode             |
| `pnpm test:run`  | Run tests once                      |

## Project Structure

```
src/
├── features/              # Feature-based modules
│   ├── achievements/      # Achievement system (gallery, cards, toasts)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── auth/              # Authentication & onboarding
│   │   ├── components/    # Landing, Login, Register, ProfileSetup, Onboarding
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/         # Zustand auth store
│   │   └── types/
│   ├── explore/           # Public mission explorer
│   │   ├── components/    # ExplorePage, ExploreCard, ExploreFilters, MissionDetail
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── missions/          # Core mission CRUD & dashboard
│   │   ├── components/    # Dashboard, MissionCard, CreateMissionDrawer, CompletionModal
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── moderation/        # Admin moderation queue
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── settings/          # User settings (profile, password, account deletion)
│       ├── components/
│       ├── hooks/
│       └── services/
├── shared/
│   ├── components/        # Route guards (Auth, Guest, Onboarding, Admin), AppLayout
│   │   └── ui/            # Reusable UI primitives (Button, Input, Modal, etc.)
│   ├── lib/
│   │   ├── i18n.ts        # i18next configuration
│   │   └── supabase/      # Supabase client, auth helpers, generated types
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
│       ├── tokens/        # Design tokens (colors, spacing, typography)
│       ├── base/
│       └── utilities/
├── styles/                # Global SCSS (abstracts, base reboot, component styles)
│   ├── abstracts/         # Variables, mixins, functions
│   ├── base/
│   ├── components/        # Global component styles (BEM)
│   └── utilities/
├── locales/               # i18n translation files
│   ├── es/                # Spanish (7 namespaces)
│   └── en/                # English (7 namespaces)
├── App.tsx                # Route definitions
└── main.tsx               # Entry point (QueryClient, AuthInitializer, i18n)

supabase/
├── config.toml
└── migrations/            # 7 SQL migrations (missions, completions, achievements, etc.)

tests/
├── setup.ts               # Vitest setup (jsdom)
├── unit/                  # Unit tests (auth store, profile service)
└── integration/           # Integration tests
```

## Deploy

The project is configured for Vercel deployment with SPA rewrites and security headers (see `vercel.json`).

### Auto-deploy

Connect the repository to Vercel. Each push to `main` triggers an automatic deployment.

```bash
git push origin main
```

Vercel runs the build, and if it passes, deploys it. On failure, the previous version stays live.

### Environment variables in Vercel

Configure env vars via CLI to avoid invisible newline issues:

```bash
vercel env add VITE_SUPABASE_URL production < <(echo -n "https://your-project.supabase.co")
vercel env add VITE_SUPABASE_ANON_KEY production < <(echo -n "your-anon-key")
```

### Manual deploy

```bash
vercel --prod
```

### Post-deploy verification

1. Open the production URL
2. Test auth flow (register + login)
3. Create a mission and complete it
4. Check achievements page
5. Verify data persists on reload
6. Test responsive layout on mobile

## License

MIT
