"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompletionAlertModal({
  detail,
  onPrimaryAction,
  onSecondaryAction,
  open,
  summary,
  streakMessage,
  title,
  primaryLabel,
  secondaryLabel,
  saveStatusMessage,
  tone = "focus",
}: {
  detail: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  open: boolean;
  summary: string;
  streakMessage: string | null;
  title: string;
  primaryLabel: string;
  secondaryLabel: string;
  saveStatusMessage: string | null;
  tone?: "focus" | "break";
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/58 p-4 backdrop-blur-[3px]">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 animate-completion-flash",
          tone === "focus"
            ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent_52%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_52%)]",
        )}
      />
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full max-w-lg animate-completion-modal rounded-[32px] border px-6 py-6 shadow-[0_30px_100px_-40px_rgba(15,23,42,0.75)]",
          tone === "focus"
            ? "border-emerald-300/30 bg-slate-950/96 text-slate-50"
            : "border-sky-300/30 bg-slate-950/96 text-slate-50",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-alert-title"
      >
        <div className="absolute inset-x-0 top-0 h-28 rounded-t-[32px] opacity-90 blur-3xl">
          <div
            className={cn(
              "h-full w-full",
              tone === "focus"
                ? "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.36),transparent_66%)]"
                : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.36),transparent_66%)]",
            )}
          />
        </div>
        <div className="relative flex items-center gap-3">
          <div
            className={cn(
              "relative inline-flex size-12 items-center justify-center rounded-2xl",
              tone === "focus" ? "bg-emerald-500/15 text-emerald-300" : "bg-sky-500/15 text-sky-300",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 rounded-2xl animate-completion-ring",
                tone === "focus" ? "border border-emerald-300/40" : "border border-sky-300/40",
              )}
            />
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold" id="completion-alert-title">
              {title}
            </h2>
          </div>
        </div>

        <div className="relative mt-5 space-y-3 text-sm leading-6">
          <p className="text-base font-medium">{summary}</p>
          <div
            className={cn(
              "inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase",
              tone === "focus"
                ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-200"
                : "border-sky-300/30 bg-sky-500/10 text-sky-200",
            )}
          >
            {detail}
          </div>
          {streakMessage ? (
            <p className="text-sm font-semibold text-amber-200">{streakMessage}</p>
          ) : null}
          {saveStatusMessage ? <p className="text-xs opacity-75">{saveStatusMessage}</p> : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onSecondaryAction} type="button" variant="secondary">
            {secondaryLabel}
          </Button>
          <Button onClick={onPrimaryAction} ref={confirmButtonRef} type="button">
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
