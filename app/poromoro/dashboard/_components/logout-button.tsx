import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/poromoro/dashboard/actions";

export function LogoutButton({
  compact = false,
  label,
}: {
  compact?: boolean;
  label: string;
}) {
  return (
    <form action={logoutAction}>
      {compact ? (
        <Button
          aria-label={label}
          className="rounded-full"
          size="icon"
          type="submit"
          variant="secondary"
        >
          <LogOut aria-hidden="true" className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      ) : (
        <Button className="w-full sm:w-auto" type="submit" variant="secondary">
          <LogOut aria-hidden="true" className="size-4" />
          {label}
        </Button>
      )}
    </form>
  );
}
