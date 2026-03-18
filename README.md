# Poromoro

`/poromoro` 경로 아래에서만 동작하는 개인용 뽀모도로 타이머 MVP입니다. Next.js App Router, TypeScript, shadcn/ui 스타일 컴포넌트, Tailwind CSS, Supabase를 사용합니다.

## Features

- `/poromoro/login` 서버 검증 로그인
- 서명된 HttpOnly 쿠키 기반 인증
- `/poromoro/dashboard` 보호 라우트
- 한국어/영어 UI 전환
- 라이트/다크 테마 전환
- 집중, 짧은 휴식, 긴 휴식 모드
- 종료 시각 기반 정확한 타이머
- 태그 입력과 최근 기록 10개 조회
- 완료된 세션만 Supabase에 저장
- 로그인 후 현재 설정을 Supabase에 동기화

## Folder Structure

```text
app/
  layout.tsx
  page.tsx
  globals.css
  poromoro/
    layout.tsx
    loading.tsx
    error.tsx
    login/
      actions.ts
      page.tsx
      _components/login-form.tsx
    dashboard/
      actions.ts
      page.tsx
      _components/
        logout-button.tsx
        pomodoro-timer.tsx
        recent-sessions.tsx
        today-focus-card.tsx
    api/
      preferences/route.ts
      sessions/route.ts
components/
  ui/
lib/
  auth/
  i18n/
  preferences.ts
  supabase/
supabase/schema.sql
proxy.ts
```

## Install

```bash
npm install
```

현재 이 저장소에서 실제로 사용한 설치 기준은 다음입니다.

```bash
npm install --save-exact next react react-dom @supabase/supabase-js zod clsx tailwind-merge class-variance-authority lucide-react @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs server-only
npm install --save-dev --save-exact typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss postcss eslint eslint-config-next @eslint/eslintrc
```

## Environment Variables

`.env.local`을 만들고 아래 값을 채웁니다.

```bash
APP_LOGIN_ID=admin
APP_LOGIN_PASSWORD=change-me-please
SESSION_SECRET=replace-with-a-long-random-string-at-least-32-characters
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
APP_TIMEZONE=Asia/Seoul
```

## Supabase SQL

`[supabase/schema.sql](/home/wnsdud/dev/StudySprout/supabase/schema.sql)` 내용을 Supabase SQL Editor에서 실행하세요.

테이블은 `public.sessions`, `public.app_preferences`를 사용합니다.

## Run

```bash
npm run dev
```

필수 경로:

- `http://localhost:3000/poromoro/login`
- `http://localhost:3000/poromoro/dashboard`

## Vercel Deploy

Vercel 프로젝트 환경변수에 아래 값을 등록하세요.

- `APP_LOGIN_ID`
- `APP_LOGIN_PASSWORD`
- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_TIMEZONE`

빌드 명령은 기본값인 `next build`, 출력은 기본 Next.js 설정이면 충분합니다.

## Notes

- Next.js 16 기준 라우트 보호 파일은 `middleware.ts` 대신 `proxy.ts`를 사용했습니다.
- Supabase는 브라우저에서 직접 호출하지 않고 서버에서만 접근합니다.
- 로그인 검증과 세션 쿠키 발급은 모두 서버에서 처리합니다.

## Extension Ideas

- 완료 시 사운드 알림
- 날짜 범위 통계와 태그별 집계
- 사용자 정의 모드 시간 설정
- 주간 리포트와 연속 집중 streak
