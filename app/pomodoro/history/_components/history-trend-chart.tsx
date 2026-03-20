import { formatDurationLabel } from "@/lib/format";
import type { AppLocale } from "@/lib/preferences";
import type { FocusTrendPoint } from "@/types/session";

export function HistoryTrendChart({
  points,
  locale,
}: {
  points: FocusTrendPoint[];
  locale: AppLocale;
}) {
  const maxSeconds = Math.max(...points.map((point) => point.totalSeconds), 1);
  const dense = points.length > 10;

  return (
    <div className="space-y-4">
      <div
        className="grid items-end gap-2"
        style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
      >
        {points.map((point, index) => {
          const height = point.totalSeconds > 0 ? Math.max(10, (point.totalSeconds / maxSeconds) * 100) : 4;
          const showLabel = !dense || index % 5 === 0 || index === points.length - 1;

          return (
            <div className="flex min-w-0 flex-col items-center gap-2" key={point.dateKey}>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {point.totalSeconds > 0 ? formatDurationLabel(point.totalSeconds, locale) : "0"}
              </div>
              <div className="flex h-32 w-full items-end rounded-[18px] bg-slate-100/90 p-1.5 dark:bg-white/5">
                <div
                  aria-label={`${point.label} ${formatDurationLabel(point.totalSeconds, locale)}`}
                  className="w-full rounded-[14px] bg-gradient-to-t from-teal-500 via-cyan-400 to-sky-400 shadow-[0_12px_32px_-24px_rgba(6,182,212,0.8)]"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="min-h-[1.25rem] text-center text-[11px] text-slate-500 dark:text-slate-400">
                {showLabel ? point.label : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
