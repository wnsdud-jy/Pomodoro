import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export function HistoryEmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-6 dark:border-white/10 dark:bg-slate-950/40",
        className,
      )}
    >
      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-300">
        <Inbox aria-hidden="true" className="size-5" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
