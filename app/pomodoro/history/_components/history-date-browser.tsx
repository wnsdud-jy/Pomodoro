import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HistoryDateBrowser({
  clearLabel,
  description,
  label,
  onChange,
  onClear,
  selectedDate,
}: {
  clearLabel: string;
  description: string;
  label: string;
  onChange: (value: string) => void;
  onClear: () => void;
  selectedDate: string;
}) {
  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
      <Label
        className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
        htmlFor="history-date-filter"
      >
        <CalendarDays aria-hidden="true" className="size-4 text-slate-400" />
        {label}
      </Label>
      <Input
        className="bg-white/75 dark:bg-slate-950/70"
        id="history-date-filter"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={selectedDate}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <Button
          disabled={selectedDate.length === 0}
          onClick={onClear}
          type="button"
          variant="ghost"
        >
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}
