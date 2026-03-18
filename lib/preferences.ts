export const LOCALE_COOKIE_NAME = "poromoro_locale";
export const THEME_COOKIE_NAME = "poromoro_theme";

export const APP_LOCALES = ["ko", "en"] as const;
export const APP_THEMES = ["light", "dark"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];
export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_APP_LOCALE: AppLocale = "ko";
export const DEFAULT_APP_THEME: AppTheme = "light";

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  return APP_LOCALES.includes(value as AppLocale)
    ? (value as AppLocale)
    : DEFAULT_APP_LOCALE;
}

export function normalizeAppTheme(value: string | null | undefined): AppTheme {
  return APP_THEMES.includes(value as AppTheme)
    ? (value as AppTheme)
    : DEFAULT_APP_THEME;
}

