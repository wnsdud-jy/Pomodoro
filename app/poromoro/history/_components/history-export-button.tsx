import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HistoryExportButton({
  href,
  label,
  disabled = false,
  className,
}: {
  href: string;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  if (disabled) {
    return (
      <Button className={className} disabled type="button" variant="secondary">
        <Download aria-hidden="true" className="size-4" />
        {label}
      </Button>
    );
  }

  return (
    <Button asChild className={cn("w-full sm:w-auto", className)} variant="secondary">
      <a href={href}>
        <Download aria-hidden="true" className="size-4" />
        {label}
      </a>
    </Button>
  );
}
