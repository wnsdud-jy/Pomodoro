import type { Metadata } from "next";
import { ArrowUpRight, Github } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PreferencesToolbar } from "@/app/pomodoro/_components/preferences-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/app/pomodoro/login/_components/login-form";
import { getAuthSession } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";

export const metadata: Metadata = {
  title: "Login",
};

const GITHUB_REPOSITORY_URL = "https://github.com/wnsdud-jy/Pomodoro";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/pomodoro/dashboard");
  }

  const { locale, theme } = await getRequestPreferences();
  const dictionary = getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex justify-end">
        <PreferencesToolbar
          copy={dictionary.common}
          initialLocale={locale}
          initialTheme={theme}
          key={`${locale}-${theme}-login-toolbar`}
        />
      </div>

      <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="order-2 space-y-4 lg:order-1">
          <div className="space-y-4">
            <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-slate-50">
              {dictionary.login.title}{" "}
              <span className="text-teal-700 dark:text-teal-300">
                {dictionary.login.accent}
              </span>
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600 md:text-lg dark:text-slate-300">
              {dictionary.login.description}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {dictionary.login.durations.focus}
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold text-slate-950 dark:text-slate-50">
                25:00
              </p>
            </div>
            <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {dictionary.login.durations.shortBreak}
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold text-slate-950 dark:text-slate-50">
                05:00
              </p>
            </div>
            <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {dictionary.login.durations.longBreak}
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold text-slate-950 dark:text-slate-50">
                15:00
              </p>
            </div>
          </div>
        </section>

        <Card className="order-1 mx-auto w-full max-w-md lg:order-2">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl">{dictionary.login.cardTitle}</CardTitle>
            <CardDescription>{dictionary.login.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm copy={dictionary.login.form} />
            <div className="space-y-3">
              <div
                aria-hidden="true"
                className="h-px w-full bg-slate-200/80 dark:bg-white/10"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="w-full" variant="secondary">
                  <a
                    href={GITHUB_REPOSITORY_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Github aria-hidden="true" className="size-4" />
                    GitHub 바로가기
                  </a>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/pomodoro/demo">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                    데모 바로가기
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
