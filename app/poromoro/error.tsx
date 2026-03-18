"use client";

import { useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/messages";
import {
  DEFAULT_APP_LOCALE,
  normalizeAppLocale,
  type AppLocale,
} from "@/lib/preferences";

export default function PoromoroError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore<AppLocale>(
    () => () => undefined,
    () => normalizeAppLocale(document.documentElement.lang),
    () => DEFAULT_APP_LOCALE,
  );
  const copy = getDictionary(locale).error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid flex-1 place-items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()}>{copy.retry}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
