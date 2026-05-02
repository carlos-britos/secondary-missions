# Secondary Missions

App web gamificada de misiones secundarias (side quests RPG) para la vida real. Tablero personal con misiones unicas y semanales, logros, galeria publica y moderacion.

## Stack

- React 19 + TypeScript strict + Vite 8
- Zustand (auth) + TanStack React Query (server state)
- React Hook Form + Zod (validacion)
- SCSS Modules / BEM, dark RPG theme (Geist / Fraunces)
- Framer Motion (animaciones)
- Supabase (Auth, PostgreSQL, Storage, RLS, RPCs)
- i18next (es/en)
- Vitest + Testing Library

## Estructura

- `src/features/` -- modulos por feature (auth, missions, achievements, explore, moderation, settings). Cada uno tiene components/, hooks/, services/, types/.
- `src/shared/` -- guards de ruta, layout, UI primitives, supabase client, i18n config, design tokens.
- `src/styles/` -- SCSS global: abstracts (variables, mixins, functions), base reboot, component styles BEM.
- `src/locales/` -- traducciones es/en en 7 namespaces.
- `supabase/migrations/` -- 7 migraciones SQL.
- `tests/` -- unit tests con vitest + jsdom.

## Comandos

- `pnpm dev` -- desarrollo
- `pnpm build` -- typecheck + build produccion
- `pnpm test:run` -- tests una vez
- `pnpm test` -- tests en watch
- `pnpm lint` -- eslint
- `pnpm typecheck` -- solo chequeo de tipos
- `pnpm format` -- prettier

## Convenciones

- Feature-based architecture: cada feature es autocontenida con su barrel export (`index.ts`).
- Estilos: SCSS Modules para componentes de feature, BEM global para UI primitives.
- State: Zustand solo para auth (client state), React Query para todo lo que viene del server.
- Forms: React Hook Form + Zod schemas para validacion.
- Supabase: client tipado con `database.types.ts`, auth helpers en `shared/lib/supabase/auth.ts`.
- i18n: 7 namespaces (common, auth, missions, achievements, explore, moderation, settings).
- Tests junto a la implementacion en `tests/unit/`.
- Path aliases: `@features/*`, `@shared/*`, `@/*`.
- Prettier: sin punto y coma, comillas simples, trailing comma es5, 100 chars.
- Pre-commit: husky + lint-staged (eslint --fix + prettier).
