# Pomodoro

Pomodoro는 개인 단일 사용자를 대상으로 한 뽀모도로 타이머 앱입니다.  
Next.js(App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase를 기반으로 만들었습니다.

> [!NOTE]
> 저장소에 로고/아이콘 파일이 없어 헤더는 텍스트 브랜딩으로 작성했습니다.

## 핵심 기능

- 단일 사용자 로그인
  - `.env`의 `APP_LOGIN_ID` / `APP_LOGIN_PASSWORD`를 통한 인증
  - 로그인 성공 시 HttpOnly 세션 쿠키 발급
  - 보호 라우트 접근 시 세션 검사
- 타이머 엔진
  - 모드: `focus` / `short_break` / `long_break`
  - 종료 시각 기반 카운트다운으로 탭 정지/지연에 강함
  - 세션 자동 전환, 다음 세션 자동 시작(옵션)
  - `today` 기준 요약과 최근 기록 미리보기
- 기록/통계
  - 기간 필터(전체/오늘/최근 7일/최근 30일)
  - 모드 필터 및 태그 검색
  - 특정 날짜 필터
  - 요약(오늘/이번 주/이번 달), 최근 추이(7일/30일), 요일 요약
  - 태그 랭킹
- 알림 및 UX
  - 브라우저 알림(Notification API) 토글
  - 알림음 토글
  - 문서 제목에 남은 시간과 현재 모드 반영
- 설정
  - 집중/짧은 휴식/긴 휴식 시간
  - 긴 휴식 주기(`long_break_every`)
  - 자동 전환/자동 시작
  - 소리·알림 선호도
  - 테마(라이트/다크), 언어(한국어/영어) 저장
- 데이터 내보내기
  - 필터 조건 기반 CSV 다운로드

## 프로젝트 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

- `http://localhost:3000`은 로그인 페이지(`/pomodoro/login`)로 리다이렉트됩니다.
- 기본 진입 페이지: `http://localhost:3000/pomodoro/login`
- 대시보드: `http://localhost:3000/pomodoro/dashboard`

## 환경 변수

`.env.local` 예시:

```bash
APP_LOGIN_ID=admin
APP_LOGIN_PASSWORD=change-me-please
SESSION_SECRET=replace-with-a-long-random-string-at-least-32-chars
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
APP_TIMEZONE=Asia/Seoul
```

## DB 스키마

`supabase/schema.sql`을 Supabase SQL Editor에서 실행하세요.

- `sessions`  
  - 완료 세션(`completed = true`) 저장
  - `mode`, `tag`, `duration_seconds`, `started_at`, `ended_at`
- `app_preferences`  
  - 단일행(`id = 'singleton'`)으로 `locale`, `theme` 저장
- `settings`  
  - 단일행(`id = 'singleton'`)으로 타이머 설정 저장

## 라우트 및 API

### 공개 라우트

- `GET /pomodoro/login`

### 보호 라우트(로그인 필요)

- `GET /pomodoro/dashboard`
- `GET /pomodoro/dashboard/focus`
- `GET /pomodoro/history`
- `GET /pomodoro/settings`

### 내부 API

- `GET /pomodoro/api/settings`
- `POST /pomodoro/api/settings`
- `POST /pomodoro/api/sessions`
- `DELETE /pomodoro/api/sessions?id={id}`
- `GET /pomodoro/api/history/export`
- `POST /pomodoro/api/preferences`

## 폴더 구조

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
      sessions/route.ts
      settings/route.ts
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

types/
  session.ts
  settings.ts

supabase/schema.sql
```

## 동작 노트

- 인증은 서버 측 세션 쿠키와 `crypto.timingSafeEqual` 기반 자격 증명 비교로 처리합니다.
- Supabase 호출은 서버 전용 클라이언트에서만 수행합니다.
- 알림 권한은 브라우저 상태에 따라 동작이 달라집니다.

> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY`와 `SESSION_SECRET`은 클라이언트로 노출되지 않도록 환경변수로만 관리합니다.

## 스크립트

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## 배포(Vercel)

- Vercel 환경변수에 동일한 값 등록
- `next build` 기반 배포
- 운영 환경 HTTPS 사용 권장(쿠키/세션 안정성)

## 트러블슈팅

> [!TIP]
> 대시보드/기록에서 데이터가 비어 있거나 에러가 나는 경우 `.env.local` 값, Supabase 스키마 적용 여부, `sessions`/`settings` 조회 권한을 먼저 확인하세요.
