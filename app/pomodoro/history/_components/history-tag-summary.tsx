import { Tags } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import type { TagFocusSummaryRow } from "@/types/session";
import { HistoryEmptyState } from "@/app/pomodoro/history/_components/history-empty-state";

export function HistoryTagSummary({
  rows,
  locale,
  copy,
}: {
  rows: TagFocusSummaryRow[];
  locale: AppLocale;
  copy: AppDictionary["history"]["tagSummary"];
}) {
  const highestDuration = rows[0]?.totalSeconds ?? 0;

  return (
    <Card className="border-white/60 bg-white/75 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader className="space-y-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
          <Tags aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <HistoryEmptyState description={copy.emptyDescription} title={copy.emptyTitle} />
        ) : (
          rows.map((row, index) => {
            const barWidth =
              highestDuration > 0
                ? `${Math.max(12, (row.totalSeconds / highestDuration) * 100)}%`
                : "0%";

            return (
              <div
                key={row.tag}
                className="space-y-2 rounded-[22px] border border-white/60 bg-white/65 p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-950/45"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {copy.rankTemplate.replace("{rank}", String(index + 1))}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {row.tag}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {copy.sessionsTemplate.replace("{count}", String(row.sessionCount))}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {formatDurationLabel(row.totalSeconds, locale)}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: barWidth }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
