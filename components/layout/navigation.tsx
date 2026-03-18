"use client";

import { History, LayoutDashboard, Settings2, X } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DASHBOARD_PATH, HISTORY_PATH, SETTINGS_PATH } from "@/lib/auth/constants";
import type { AppDictionary } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: DASHBOARD_PATH,
    labelKey: "dashboardNav",
    icon: LayoutDashboard,
  },
  {
    href: HISTORY_PATH,
    labelKey: "historyNav",
    icon: History,
  },
  {
    href: SETTINGS_PATH,
    labelKey: "settingsNav",
    icon: Settings2,
  },
] as const;

function isActivePath(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function HeaderNavigation({
  commonCopy,
  currentPath,
}: {
  commonCopy: AppDictionary["common"];
  currentPath: string;
}) {
  return (
    <nav
      aria-label={commonCopy.navigationLabel}
      className="hidden lg:flex lg:items-center lg:gap-2"
    >
      {navItems.map((item) => {
        const isActive = isActivePath(currentPath, item.href);
        const Icon = item.icon;
        const label = commonCopy[item.labelKey];

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            className={cn(
              buttonVariants({
                size: isActive ? "sm" : "icon",
                variant: "secondary",
              }),
              isActive ? "h-10 rounded-full px-4" : "size-10",
              isActive
                ? "bg-cyan-500/12 text-slate-950 ring-cyan-400/30 shadow-[0_12px_28px_-20px_rgba(8,145,178,0.28)] hover:bg-cyan-500/16 dark:bg-cyan-400/14 dark:text-white dark:ring-cyan-300/20 dark:shadow-[0_12px_28px_-18px_rgba(6,182,212,0.55)] dark:hover:bg-cyan-400/18"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white",
            )}
            href={item.href}
            key={item.href}
            title={label}
          >
            <Icon aria-hidden="true" className="size-4" />
            {isActive ? (
              <span className="text-sm font-semibold">{label}</span>
            ) : (
              <span className="sr-only">{label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function DrawerNavigation({
  commonCopy,
  currentPath,
  onNavigate,
}: {
  commonCopy: AppDictionary["common"];
  currentPath: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label={commonCopy.navigationLabel} className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = isActivePath(currentPath, item.href);
        const Icon = item.icon;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              buttonVariants({
                size: "default",
                variant: isActive ? "secondary" : "ghost",
              }),
              "h-12 justify-start rounded-2xl px-4",
              isActive
                ? "bg-cyan-400/12 text-white ring-1 ring-cyan-300/20"
                : "text-slate-300 hover:bg-white/7 hover:text-white",
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" className="size-4" />
            {commonCopy[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigationDrawer({
  commonCopy,
  currentPath,
  onClose,
  open,
}: {
  commonCopy: AppDictionary["common"];
  currentPath: string;
  onClose: () => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[60] flex lg:hidden"
      role="dialog"
    >
      <div className="max-h-screen w-[min(88vw,22rem)] overscroll-contain border-r border-white/10 bg-[rgba(6,14,30,0.92)] p-4 shadow-[20px_0_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            {commonCopy.navigationLabel}
          </p>
          <Button
            aria-label={commonCopy.closeSettings}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <Card className="border-white/10 bg-white/5 p-3 shadow-none">
          <DrawerNavigation
            commonCopy={commonCopy}
            currentPath={currentPath}
            onNavigate={onClose}
          />
        </Card>
      </div>
      <button
        aria-label={commonCopy.closeSettings}
        className="flex-1 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
    </div>
  );
}
