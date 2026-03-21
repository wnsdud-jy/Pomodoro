# Pomodoro

Pomodoro는 뽀모도로 타이머 앱입니다. Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase를 기반으로 만들었고, 현재는 한 명의 인증된 사용자가 사용하는 흐름에 맞춰져 있습니다. 다만 데이터베이스 구조는 이미 `user_id` 기준으로 정리되어 있어서 RLS 기반 사용자 격리 구조를 그대로 확장할 수 있습니다.

## 개요

- Supabase Auth 이메일/비밀번호 로그인
- 대시보드, 기록, 설정 보호 페이지
- `focus`, `short_break`, `long_break` 타이머 모드
- 필터, 통계, CSV 내보내기가 있는 기록 화면
- 사용자별 언어, 테마, 타이머 설정 저장
- 인증 데이터를 노출하지 않는 공개 데모 라우트

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui
- Supabase Auth + Postgres + Row Level Security
- Zod

## 요구 사항

- Node.js 20+
- npm
- Supabase 프로젝트

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 `.env.local`로 복사한 뒤 값을 채우세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY`는 브라우저에서 사용하는 공개 키입니다. 일반 앱 요청 경로에는 서비스 롤 키를 사용하지 않습니다.

이제 시간대는 환경 변수가 아니라 사용자별 `Settings` 화면에서 설정합니다. 저장된 시간대는 대시보드 시간, 기록 묶음, CSV 내보내기 날짜 기준에 사용됩니다.

### 3. Auth 사용자 만들기

이제 `/pomodoro/login`은 예전 `.env` 자격 증명이 아니라 Supabase Auth 계정으로 로그인합니다.

1. Supabase Dashboard를 엽니다.
2. `Authentication` -> `Users`로 이동합니다.
3. `Add user`를 클릭합니다.
4. `/pomodoro/login`에 사용할 이메일과 비밀번호를 입력합니다.
5. 이메일 확인 없이 바로 로그인하려면 auto-confirm를 켭니다.

### 4. 데이터베이스 SQL 적용

현재 DB 상태에 따라 경로가 다릅니다.

#### 새 데이터베이스

Pomodoro 테이블이 아직 없다면 아래 파일만 실행하세요.

- `supabase/schema.sql`

이 파일은 현재 기준의 사용자별 테이블을 만듭니다.

- `sessions`
- `app_preferences`
- `settings`

`settings` 테이블에는 사용자별 시간대도 함께 저장됩니다.

#### 기존 데이터베이스 업그레이드

예전 스키마가 이미 있다면 `supabase/schema.sql`을 먼저 실행하면 안 됩니다.

1. Supabase Auth 사용자 1명을 만듭니다.
2. `supabase/migrations/20260321_supabase_auth_rls.sql`을 실행합니다.

이 마이그레이션은 다음 작업을 수행합니다.

- 기존 데이터에 `user_id`를 추가
- 단일행이던 preferences/settings를 사용자별 행으로 전환
- 기존 데이터를 하나의 Auth 사용자에게 백필
- 인덱스 재생성
- RLS 정책 적용

중요: 이 마이그레이션은 `auth.users`에 정확히 1명의 사용자가 있다고 가정합니다.

### 5. 앱 실행

```bash
cp .env.example .env.local
npm run dev
```

열어볼 주소:

- `http://localhost:3000/` -> `/pomodoro/login`으로 리다이렉트
- `http://localhost:3000/pomodoro/login`

## 라우트 구성

### 공개 라우트

- `GET /pomodoro/login`
- `GET /pomodoro/demo`
- `GET /pomodoro/demo/focus`
- `GET /pomodoro/demo/history`
- `GET /pomodoro/demo/settings`

### 보호 라우트

- `GET /pomodoro/dashboard`
- `GET /pomodoro/dashboard/focus`
- `GET /pomodoro/history`
- `GET /pomodoro/settings`

보호 페이지는 `proxy.ts`에서 1차로 막고, 서버 컴포넌트와 라우트 핸들러에서 인증된 Supabase 사용자로 다시 확인합니다.

### 내부 API 라우트

- `GET /pomodoro/api/settings`
- `POST /pomodoro/api/settings`
- `POST /pomodoro/api/sessions`
- `PATCH /pomodoro/api/sessions`
- `DELETE /pomodoro/api/sessions?id={id}`
- `POST /pomodoro/api/preferences`
- `GET /pomodoro/api/history/export`

## 프로젝트 구조

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

## 인증과 데이터 접근 방식

- 인증은 Supabase SSR 클라이언트와 쿠키 기반 세션 갱신으로 처리합니다.
- 서버 컴포넌트와 API 라우트는 `auth.getUser()`로 현재 사용자를 확인합니다.
- 일반 데이터 조회와 저장은 `user_id` 기준으로 제한됩니다.
- 일반 앱 요청 경로는 서비스 롤 키에 의존하지 않습니다.

## 명령어

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드 실행
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 실행

## 검증

PR 전에 아래 명령을 실행하세요.

```bash
npm run lint
npm run build
```

## 트러블슈팅

### `column "user_id" does not exist`

기존 DB에 `supabase/schema.sql`을 직접 적용한 경우일 가능성이 높습니다. Auth 사용자를 먼저 만든 뒤 `supabase/migrations/20260321_supabase_auth_rls.sql`을 사용하세요.

### 로그인 실패

아래를 확인하세요.

- Supabase Auth 사용자가 실제로 만들어졌는지
- 입력한 이메일과 비밀번호가 그 사용자와 일치하는지
- `NEXT_PUBLIC_SUPABASE_URL` 값이 올바른지
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값이 올바른지

### 보호 페이지에 데이터가 보이지 않음

아래를 확인하세요.

- 마이그레이션이 정상 완료됐는지
- 기존 데이터가 Auth 사용자에게 백필됐는지
- 현재 로그인한 사용자가 실제 데이터 소유자인지
