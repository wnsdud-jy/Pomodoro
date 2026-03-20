# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js App Router entrypoints. The main authenticated product lives under `app/pomodoro`, with route-local UI in `_components/` folders and API handlers in `app/pomodoro/api/*/route.ts`. `app/(pomodoro)/pomodoro` holds alternate route-group pages. Shared UI primitives live in `components/ui` (shadcn/ui), shared layout chrome lives in `components/layout`, and reusable logic lives in `lib/` (`auth`, `browser`, `i18n`, `preferences`, `supabase`). Database schema lives in `supabase/schema.sql`; shared types live in `types/`.

## Build, Test, and Development Commands
Use `npm install` once, then copy envs with `cp .env.example .env.local`.

- `npm run dev` starts the local dev server.
- `npm run build` creates the production build and catches route/runtime issues.
- `npm run start` serves the built app locally.
- `npm run lint` runs ESLint with `--max-warnings=0`.

Run `npm run lint` and `npm run build` before opening a PR.

## Coding Style & Naming Conventions
This repo uses strict TypeScript, React 19, Next.js 16, and ESLint via `eslint-config-next`. Follow the existing 2-space indentation and double-quoted import/style. Use `PascalCase` for exported React components, `camelCase` for functions and helpers, and kebab-case filenames such as `login-form.tsx` or `history-trend-chart.tsx`. Keep route-specific UI in `_components`, prefer the `@/*` path alias, and mark server/client boundaries explicitly with `"use server"` and `"use client"`.

## Testing Guidelines
There is no dedicated automated test suite yet. For now, treat `npm run lint` and `npm run build` as the minimum validation gate, then manually smoke-test `login`, `dashboard`, `history`, and `settings`. If you add tests, use `*.test.ts` or `*.test.tsx` naming and keep them close to the code they cover.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:`, `docs:`, and `chore:`. Keep commits focused and imperative. PRs should include a short summary, linked issue if applicable, notes for any `.env` or `supabase/schema.sql` changes, and screenshots for UI updates.

## Security & Configuration Tips
Never commit real secrets. Keep `SESSION_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` server-only, and apply `supabase/schema.sql` before testing data-backed features locally.
