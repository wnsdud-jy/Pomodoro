"use client";

import { Globe, MoonStar, SunMedium } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
  type AppLocale,
  type AppTheme,
} from "@/lib/preferences";

type PreferencesToolbarCopy = {
  themeLabel: string;
  languageLabel: string;
  light: string;
  dark: string;
  korean: string;
  english: string;
  toggleThemeAria: string;
  toggleLanguageAria: string;
  toggleSettingsAria: string;
  closeSettings: string;
  settingsTitle: string;
  settingsDescription: string;
};

type PreferencesToolbarProps = {
  initialLocale: AppLocale;
  initialTheme: AppTheme;
  copy: PreferencesToolbarCopy;
  persistToDatabase?: boolean;
};

function persistCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function persistLocalStorage(name: string, value: string) {
  try {
    window.localStorage.setItem(name, value);
  } catch {
    return;
  }
}

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

async function persistPreferencesRequest(payload: Partial<{ locale: AppLocale; theme: AppTheme }>) {
  const response = await fetch("/pomodoro/api/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
}

export function PreferencesToolbar({
  initialLocale,
  initialTheme,
  copy,
  persistToDatabase = false,
}: PreferencesToolbarProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<AppLocale>(initialLocale);
  const [theme, setTheme] = useState<AppTheme>(initialTheme);
  const initialPersistenceDoneRef = useRef(false);

  useEffect(() => {
    if (!persistToDatabase || initialPersistenceDoneRef.current) {
      return;
    }

    initialPersistenceDoneRef.current = true;
    void persistPreferencesRequest({ locale, theme }).catch((error) => {
      console.error("Failed to persist preferences", error);
    });
  }, [locale, persistToDatabase, theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    persistLocalStorage(LOCALE_STORAGE_KEY, locale);
    persistLocalStorage(THEME_STORAGE_KEY, theme);
  }, [locale, theme]);

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    persistCookie(THEME_COOKIE_NAME, nextTheme);
    applyTheme(nextTheme);
    if (persistToDatabase) {
      void persistPreferencesRequest({ theme: nextTheme })
        .catch((error) => {
          console.error("Failed to persist preferences", error);
        })
        .finally(() => {
          startTransition(() => {
            router.refresh();
          });
        });
    }
  }

  function handleLocaleToggle() {
    const nextLocale = locale === "ko" ? "en" : "ko";
    setLocale(nextLocale);
    persistCookie(LOCALE_COOKIE_NAME, nextLocale);
    document.documentElement.lang = nextLocale;
    if (persistToDatabase) {
      void persistPreferencesRequest({ locale: nextLocale })
        .catch((error) => {
          console.error("Failed to persist preferences", error);
        })
        .finally(() => {
          startTransition(() => {
            router.refresh();
          });
        });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label={copy.toggleThemeAria}
        onClick={handleThemeToggle}
        size="icon"
        type="button"
        variant="secondary"
      >
        {theme === "dark" ? (
          <SunMedium aria-hidden="true" className="size-4" />
        ) : (
          <MoonStar aria-hidden="true" className="size-4" />
        )}
      </Button>

      <Button
        aria-label={copy.toggleLanguageAria}
        className="min-w-16"
        onClick={handleLocaleToggle}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Globe aria-hidden="true" className="size-4" />
        {locale === "ko" ? "KO" : "EN"}
      </Button>
    </div>
  );
}
