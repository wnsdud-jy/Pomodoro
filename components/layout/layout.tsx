"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/header";
import { MobileNavigationDrawer } from "@/components/layout/navigation";
import { DASHBOARD_FOCUS_PATH } from "@/lib/auth/constants";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale, AppTheme } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export function AppLayout({
  children,
  commonCopy,
  locale,
  theme,
}: {
  children: React.ReactNode;
  commonCopy: AppDictionary["common"];
  locale: AppLocale;
  theme: AppTheme;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isFocusRoute = pathname === DASHBOARD_FOCUS_PATH;

  return (
      <main
        className={cn(
          "relative isolate min-h-screen overflow-x-hidden",
          isFocusRoute ? "px-0 pb-0 md:px-0 md:pb-0" : "px-3 pb-5 sm:px-4 md:px-6 md:pb-6",
        )}
      id="main-content"
      style={{
        paddingTop: isFocusRoute
          ? "0px"
          : "max(1rem, env(safe-area-inset-top))",
        paddingBottom: isFocusRoute
          ? "0px"
          : "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      {isFocusRoute ? null : (
        <AppHeader
          commonCopy={commonCopy}
          currentPath={pathname}
          locale={locale}
          onOpenMenu={() => setMobileMenuOpen(true)}
          theme={theme}
        />
      )}

        <div
          className={cn(
            "mx-auto w-full",
            isFocusRoute ? "max-w-none pt-0" : "max-w-7xl pt-20 sm:pt-24 md:pt-28",
          )}
        >
        <div className={cn("mx-auto w-full", isFocusRoute ? "max-w-none" : "max-w-5xl")}>
          {children}
        </div>
      </div>

      {isFocusRoute ? null : (
        <MobileNavigationDrawer
          commonCopy={commonCopy}
          currentPath={pathname}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
        />
      )}
    </main>
  );
}
