# Pomodoro

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Pomodoro is a Pomodoro timer built with Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, and Supabase. It is designed for a single authenticated owner today, while the database layer is now user-scoped and ready for RLS-based access control.

## Overview

- Supabase Auth email/password sign-in
- Protected dashboard, history, and settings pages
- Focus, short break, and long break timer modes
- Session history with filters, analytics, and CSV export
- Per-user preferences for locale, theme, and timer settings
- Public demo routes that do not expose authenticated data

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui
- Supabase Auth + Postgres + Row Level Security
- Zod

## Requirements

- Node.js 20+
- npm
- A Supabase project

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is intended for browser use. Do not use a service-role key in normal application flows.

Timezone is no longer configured through environment variables. Each user selects their own timezone in `Settings`, and that saved value is used for dashboard timestamps, history grouping, and CSV export dates.

### 3. Create the Auth user

This app now signs in through Supabase Auth, not the old `.env` credential pair.

1. Open Supabase Dashboard.
2. Go to `Authentication` -> `Users`.
3. Click `Add user`.
4. Enter the email and password you want to use for `/pomodoro/login`.
5. Enable auto-confirm if you want password login to work immediately without email verification.

### 4. Apply the database SQL

Choose the path that matches your database state.

#### Fresh database

If the Pomodoro tables do not exist yet, run:

- `supabase/schema.sql`

This creates the current per-user tables:

- `sessions`
- `app_preferences`
- `settings`

The `settings` table now also stores each user's selected timezone.

#### Existing database with legacy tables

If you already have the old schema, do not run `supabase/schema.sql` first.

1. Create the single Supabase Auth user.
2. Run `supabase/migrations/20260321_supabase_auth_rls.sql`.

That migration:

- adds `user_id` ownership to legacy rows
- converts singleton preferences and settings rows into per-user rows
- backfills existing data to the single Auth user
- recreates indexes
- installs RLS policies

Important: the migration assumes there is exactly one row in `auth.users` for the legacy backfill.

### 5. Run the app

```bash
cp .env.example .env.local
npm run dev
```

Open:

- `http://localhost:3000/` -> shows 404 page
- `http://localhost:3000/pomodoro/login`

## Route Map

### Public routes

- `GET /pomodoro/login`
- `GET /pomodoro/demo`
- `GET /pomodoro/demo/focus`
- `GET /pomodoro/demo/history`
- `GET /pomodoro/demo/settings`

### Protected routes

- `GET /pomodoro/dashboard`
- `GET /pomodoro/dashboard/focus`
- `GET /pomodoro/history`
- `GET /pomodoro/settings`

Protected pages are gated in `proxy.ts` and checked again on the server with the authenticated Supabase user.

### Internal API routes

- `GET /pomodoro/api/settings`
- `POST /pomodoro/api/settings`
- `POST /pomodoro/api/sessions`
- `PATCH /pomodoro/api/sessions`
- `DELETE /pomodoro/api/sessions?id={id}`
- `POST /pomodoro/api/preferences`
- `GET /pomodoro/api/history/export`

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  pomodoro/
    login/
    demo/
    api/
  (pomodoro)/pomodoro/
    dashboard/
    history/
    settings/

components/
  layout/
  ui/

lib/
  auth/
  i18n/
  preferences/
  supabase/

supabase/
  schema.sql
  migrations/
```

## Auth and Data Access

- Auth uses Supabase SSR clients and cookie-based session refresh.
- Server components and route handlers resolve the current user with `auth.getUser()`.
- Normal reads and writes are scoped by `user_id`.
- The request path no longer depends on the service-role key.

## Commands

- `npm run dev` - start the development server
- `npm run build` - run the production build
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Validation

Before opening a PR, run:

```bash
npm run lint
npm run build
```

## Troubleshooting

### `column "user_id" does not exist`

You are probably applying `supabase/schema.sql` to a legacy database. Create the Auth user first, then use `supabase/migrations/20260321_supabase_auth_rls.sql`.

### Login fails

Check the following:

- the Supabase Auth user exists
- the email and password match the created user
- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### Protected pages show empty data

Check the following:

- the migration finished successfully
- legacy rows were backfilled to the Auth user
- the logged-in user is the same user that owns the data
