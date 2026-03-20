"use client";

export type BrowserNotificationPermission = NotificationPermission | "unsupported";

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || typeof window.Notification === "undefined") {
    return "unsupported";
  }

  return window.Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (typeof window === "undefined" || typeof window.Notification === "undefined") {
    return "unsupported";
  }

  return window.Notification.requestPermission();
}

export function sendBrowserNotification({
  title,
  body,
  enabled,
}: {
  title: string;
  body: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return;
  }

  if (getBrowserNotificationPermission() !== "granted") {
    return;
  }

  new window.Notification(title, {
    body,
  });
}
