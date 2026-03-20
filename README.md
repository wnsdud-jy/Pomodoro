# Pomodoro

Pomodoro is a single-user Pomodoro timer app built with Next.js. It provides authenticated access, configurable session flows, persisted focus history, and bilingual (Korean/English) support.

> [!NOTE]
> No logo or icon file was found in this repository, so the README uses text-only branding in the header.

## Highlights

- Single-user authentication using credentials in environment variables
- Session modes: `focus`, `short_break`, `long_break`
- End-time-based countdown logic for better accuracy during tab delays
- Optional automatic session transitions and optional automatic next-session start
- Session tagging and server-side persisted logs
- Focus/休? maybe remove Chinese. continue:
- Dashboard and focus-only full-screen timer view
- History filters, analytics cards, and CSV export
- Sound and browser notification options
- Korean / English UI language and light / dark theme preferences

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS and shadcn/ui components
- Supabase (PostgreSQL + server-side API via service role key)
- Zod validation for server payload safety

## Prerequisites

- Node.js 20+
- npm
- Supabase project and DB access

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- `http://localhost:3000/pomodoro/login` (entry point, root `/` redirects here)
- `http://localhost:3000/pomodoro/dashboard`

## Environment Variables

Define the following in `.env.local`:

```bash
APP_LOGIN_ID=admin
APP_LOGIN_PASSWORD=change-me-please
SESSION_SECRET=replace-with-a-long-random-string-at-least-32-chars
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
APP_TIMEZONE=Asia/Seoul
```

## Database Setup

Apply `supabase/schema.sql` in the Supabase SQL editor.  
The schema creates:

- `sessions`: completed timer records (`focus`, `short_break`, `long_break`) with start/end time, duration and tag
- `app_preferences`: singleton row for persisted locale/theme
- `settings`: singleton row for timer settings (minutes, auto-switch, notifications)

## Routes and Endpoints

### Public

- `GET /pomodoro/login`

### Protected

- `GET /pomodoro/dashboard`
- `GET /pomodoro/dashboard/focus`
- `GET /pomodoro/history`
- `GET /pomodoro/settings`

All paths under `/pomodoro` are guarded by a server-side auth check.

### Internal API

- `GET /pomodoro/api/settings`
- `POST /pomodoro/api/settings`
- `POST /pomodoro/api/sessions`
- `DELETE /pomodoro/api/sessions?id={id}`
- `GET /pomodoro/api/history/export`
- `POST /pomodoro/api/preferences`

## Project Structure

```text
app/
  page.tsx
  layout.tsx
  globals.css
  pomodoro/
    layout.tsx
    login/page.tsx
    dashboard/...
    history/...
    settings/...
    api/
      preferences/route.ts
      settings/route.ts
      sessions/route.ts
      history/export/route.ts
  (pomodoro)/pomodoro/...

components/
  layout/
  ui/

lib/
  auth/
  browser/
  i18n/
  pomodoro*.ts
  session-*.ts
  supabase/
  preferences/

supabase/schema.sql
```

## Behavior Notes

- Authentication uses `app`-scoped HttpOnly session cookies and HMAC/constant-time credential verification.
- Supabase queries are executed with the server-side service role key only.
- Notification sounds and browser Notification API are optional and reflect runtime permission state.

> [!IMPORTANT]
> Keep `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` server-only.

## Useful Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Deployment

- Recommended platform: Vercel
- Set all environment variables in deployment settings
- Ensure HTTPS in production for secure cookie behavior

## Troubleshooting

> [!TIP]
> If data fails to load on dashboard/history, first check `.env.local` values and confirm the Supabase tables are created.

