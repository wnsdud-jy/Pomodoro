"use client";

import { formatSeconds } from "@/lib/format";

export function buildTimerDocumentTitle({
  appName,
  modeLabel,
  remainingSeconds,
}: {
  appName: string;
  modeLabel: string;
  remainingSeconds: number;
}) {
  return `(${formatSeconds(remainingSeconds)}) ${modeLabel} - ${appName}`;
}

export function restoreDocumentTitle(title: string) {
  document.title = title;
}
