import { Hourglass } from "lucide-react";

import { LogoutButton } from "@/app/poromoro/dashboard/_components/logout-button";
import { PreferencesToolbar } from "@/app/poromoro/_components/preferences-toolbar";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale, AppTheme } from "@/lib/preferences";

export function DashboardHeader({
  locale,
  theme,
  commonCopy,
}: {
  locale: AppLocale;
  theme: AppTheme;
  commonCopy: AppDictionary["common"];
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/60 bg-[rgba(246,242,233,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(5,10,18,0.82)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">
            <Hourglass aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950 dark:text-slate-50">
              {commonCopy.appName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <PreferencesToolbar
            copy={commonCopy}
            initialLocale={locale}
            initialTheme={theme}
            key={`${locale}-${theme}-dashboard-toolbar`}
            persistToDatabase
          />
          <LogoutButton compact label={commonCopy.logout} />
        </div>
      </div>
    </header>
  );
}
