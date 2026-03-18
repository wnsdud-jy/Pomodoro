import { formatDurationLabel } from "@/lib/format";
import type { AppLocale } from "@/lib/preferences";
import type { WeekdayFocusRow } from "@/types/session";

export function HistoryWeekdaySummary({
  rows,
  locale,
}: {
  rows: WeekdayFocusRow[];
  locale: AppLocale;
}) {
  const maxSeconds = Math.max(...rows.map((row) => row.totalSeconds), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = row.totalSeconds > 0 ? Math.max(10, (row.totalSeconds / maxSeconds) * 100) : 0;

        return (
          <div className="space-y-2" key={row.weekday}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <p className="w-12 shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {row.label}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {row.focusCount}
                </p>
              </div>
              <p className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
                {formatDurationLabel(row.totalSeconds, locale)}
              </p>
            </div>
            <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
