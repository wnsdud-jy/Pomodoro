import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DASHBOARD_PATH } from "@/lib/auth/constants";
import { getRequestPreferences } from "@/lib/preferences/server";

const GITHUB_REPOSITORY_URL = "https://github.com/wnsdud-jy/Pomodoro";

const NOT_FOUND_COPY = {
  ko: {
    title: "요청한 페이지가 존재하지 않아요",
    dashboard: "대시보드로 가기",
    github: "깃허브 가기",
  },
  en: {
    title: "The page you requested does not exist.",
    dashboard: "Go to Dashboard",
    github: "Go to GitHub",
  },
} as const;

export default async function NotFound() {
  const { locale } = await getRequestPreferences();
  const copy = NOT_FOUND_COPY[locale];

  return (
    <main
      className="relative isolate min-h-dvh overflow-hidden bg-background px-6 py-10"
      id="main-content"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_42%)]"
      />
      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl items-center justify-center">
        <div className="flex w-full flex-col items-center gap-8 text-center">
          <p
            aria-hidden="true"
            className="font-mono text-[clamp(5rem,18vw,8rem)] font-semibold tracking-[-0.08em] text-foreground tabular-nums"
          >
            404
          </p>

          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {copy.title}
          </h1>

          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button asChild size="lg">
              <Link href={DASHBOARD_PATH}>{copy.dashboard}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={GITHUB_REPOSITORY_URL}
                rel="noreferrer"
                target="_blank"
              >
                {copy.github}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
