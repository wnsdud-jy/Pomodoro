"use client";

import { Hourglass, Menu } from "lucide-react";

import { PreferencesToolbar } from "@/app/pomodoro/_components/preferences-toolbar";
import { LogoutButton } from "@/app/pomodoro/dashboard/_components/logout-button";
import { HeaderNavigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale, AppTheme } from "@/lib/preferences";

export function AppHeader({
  commonCopy,
  currentPath,
  locale,
  theme,
  onOpenMenu,
}: {
  commonCopy: AppDictionary["common"];
  currentPath: string;
  locale: AppLocale;
  theme: AppTheme;
  onOpenMenu: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200/80 bg-white/82 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(6,14,30,0.74)] dark:shadow-[0_20px_80px_-40px_rgba(37,99,235,0.42)]">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              aria-label={commonCopy.navigationLabel}
              className="lg:hidden"
              onClick={onOpenMenu}
              size="icon"
              type="button"
              variant="secondary"
            >
              <Menu aria-hidden="true" className="size-4" />
            </Button>

            <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-400/20 dark:text-cyan-300 dark:ring-cyan-400/15">
              <Hourglass aria-hidden="true" className="size-5" />
            </div>

            <p className="truncate text-base font-semibold text-slate-900 md:text-lg dark:text-white">
              {commonCopy.appName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <HeaderNavigation commonCopy={commonCopy} currentPath={currentPath} />
            <PreferencesToolbar
              copy={commonCopy}
              initialLocale={locale}
              initialTheme={theme}
              key={`${locale}-${theme}-layout-toolbar`}
              persistToDatabase
            />
            <LogoutButton compact label={commonCopy.logout} />
          </div>
        </div>
      </div>
    </header>
  );
}
