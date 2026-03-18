"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "pointer-events-auto w-full rounded-[24px] border px-5 py-4 shadow-[0_22px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl transition-[opacity,transform] duration-200",
  {
    variants: {
      variant: {
        default:
          "border-white/60 bg-white/95 text-slate-900 dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-50",
        success:
          "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-50",
        destructive:
          "border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    onDismiss?: () => void;
  };

export function ToastViewport({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[min(100vw-2rem,24rem)]"
    >
      {children}
    </div>
  );
}

export function Toast({
  children,
  className,
  onDismiss,
  variant,
  ...props
}: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }), className)} role="status" {...props}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        {onDismiss ? (
          <Button
            aria-label="Dismiss notification"
            className="-mr-2 -mt-1"
            onClick={onDismiss}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ToastTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm font-semibold", className)} {...props} />;
}

export function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-sm leading-6 opacity-90", className)} {...props} />
  );
}
