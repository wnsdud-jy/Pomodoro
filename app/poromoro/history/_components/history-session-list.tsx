import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import type { GroupedSessionDay } from "@/types/session";
import { HistoryEmptyState } from "@/app/poromoro/history/_components/history-empty-state";

const MODE_BADGE_CLASS_NAMES = {
  focus: "bg-teal-700 text-white",
  short_break:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  long_break:
    "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
} as const;

function SessionField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div>{value}</div>
    </div>
  );
}

export function HistorySessionList({
  days,
  locale,
  timeZone,
  copy,
  modeCopy,
  unlabeledTag,
  pendingDeleteId,
  deleteError,
  onRequestDelete,
}: {
  days: GroupedSessionDay[];
  locale: AppLocale;
  timeZone: string;
  copy: AppDictionary["history"]["list"];
  modeCopy: AppDictionary["modes"];
  unlabeledTag: string;
  pendingDeleteId: string | null;
  deleteError: string | null;
  onRequestDelete: (sessionId: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {deleteError ? (
          <div
            aria-live="polite"
            className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100"
            role="alert"
          >
            {deleteError}
          </div>
        ) : null}

        {days.length === 0 ? (
          <HistoryEmptyState
            description={copy.emptyDescription}
            title={copy.emptyTitle}
          />
        ) : (
          days.map((day) => (
            <section className="space-y-4" key={day.dateKey}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    {day.label}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {copy.daySummaryTemplate
                      .replace("{focus}", formatDurationLabel(day.focusSeconds, locale))
                      .replace("{count}", String(day.sessionCount))}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {day.sessions.map((session) => {
                  const isDeleting = pendingDeleteId === session.id;

                  return (
                    <div
                      key={session.id}
                      className="rounded-[24px] border border-slate-200/80 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/45"
                    >
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[140px_minmax(0,1fr)_120px_160px_160px_auto] xl:items-start">
                        <SessionField
                          label={copy.modeLabel}
                          value={
                            <Badge className={MODE_BADGE_CLASS_NAMES[session.mode]}>
                              {modeCopy[session.mode].label}
                            </Badge>
                          }
                        />
                        <SessionField
                          label={copy.tagLabel}
                          value={
                            <p className="break-words text-sm font-medium text-slate-900 dark:text-slate-100">
                              {session.tag || unlabeledTag}
                            </p>
                          }
                        />
                        <SessionField
                          label={copy.durationLabel}
                          value={
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              {formatDurationLabel(session.duration_seconds, locale)}
                            </p>
                          }
                        />
                        <SessionField
                          label={copy.startedAtLabel}
                          value={
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              {formatDateTime(session.started_at, timeZone, locale)}
                            </p>
                          }
                        />
                        <SessionField
                          label={copy.endedAtLabel}
                          value={
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              {formatDateTime(session.ended_at, timeZone, locale)}
                            </p>
                          }
                        />
                        <div className="flex justify-end xl:justify-start">
                          <Button
                            className="w-full text-rose-600 hover:text-rose-700 sm:w-auto dark:text-rose-200 dark:hover:text-rose-100"
                            disabled={isDeleting}
                            onClick={() => onRequestDelete(session.id)}
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                            {isDeleting ? copy.deleting : copy.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </CardContent>
    </Card>
  );
}
