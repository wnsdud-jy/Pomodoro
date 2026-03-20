import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.8)] transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-50 dark:placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };
