import { History } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import type { SessionRow } from "@/types/session";

export function RecentSessions({
  sessions,
  locale,
  copy,
  modeCopy,
  unlabeledTag,
  historyHref,
  timeZone,
}: {
  sessions: SessionRow[];
  locale: AppLocale;
  copy: AppDictionary["dashboard"]["recentSessions"];
  modeCopy: AppDictionary["modes"];
  unlabeledTag: string;
  historyHref: string;
  timeZone: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <History aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400">
            {copy.empty}
          </div>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{modeCopy[session.mode].shortLabel}</Badge>
                    <p className="break-words text-sm font-medium text-slate-800 dark:text-slate-100">
                      {session.tag || unlabeledTag}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDurationLabel(session.duration_seconds, locale)}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-slate-500 dark:text-slate-400 sm:text-right">
                  {formatDateTime(session.ended_at, timeZone, locale)}
                </p>
              </div>
              {index < sessions.length - 1 ? <Separator className="mt-4" /> : null}
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.viewAllHint}</p>
        <Button asChild className="w-full sm:w-auto" variant="secondary">
          <Link href={historyHref}>{copy.viewAll}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
