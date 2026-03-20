import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_APP_LOCALE,
  DEFAULT_APP_THEME,
  LOCALE_COOKIE_NAME,
  THEME_COOKIE_NAME,
  normalizeAppLocale,
  normalizeAppTheme,
} from "@/lib/preferences";
import { getPersistedPreferences } from "@/lib/supabase/queries";

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;

  const hasLocaleCookie = typeof localeCookie === "string";
  const hasThemeCookie = typeof themeCookie === "string";

  if (hasLocaleCookie && hasThemeCookie) {
    return {
      locale: normalizeAppLocale(localeCookie),
      theme: normalizeAppTheme(themeCookie),
    };
  }

  let persistedPreferences = null;

  try {
    persistedPreferences = await getPersistedPreferences();
  } catch (error) {
    console.error("Failed to load persisted app preferences", error);
  }

  return {
    locale: hasLocaleCookie
      ? normalizeAppLocale(localeCookie)
      : persistedPreferences?.locale ?? DEFAULT_APP_LOCALE,
    theme: hasThemeCookie
      ? normalizeAppTheme(themeCookie)
      : persistedPreferences?.theme ?? DEFAULT_APP_THEME,
  };
}
