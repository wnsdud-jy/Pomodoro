import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { Toaster } from "@/components/ui/toaster";
import { getDictionary } from "@/lib/i18n/messages";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
} from "@/lib/preferences";
import { getRequestPreferences } from "@/lib/preferences/server";
import "./globals.css";

export const dynamic = "force-dynamic";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pomodoro",
    template: "%s | Pomodoro",
  },
  description: "Single-user Pomodoro timer with protected routes and Supabase-backed history.",
};

const preferenceBootScript = `
(() => {
  const readCookie = (name) => {
    const pair = document.cookie
      .split("; ")
      .find((value) => value.startsWith(name + "="));

    if (!pair) {
      return null;
    }

    return decodeURIComponent(pair.split("=").slice(1).join("="));
  };

  let storedTheme = null;
  let storedLocale = null;

  try {
    storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    storedLocale = window.localStorage.getItem("${LOCALE_STORAGE_KEY}");
  } catch (_error) {
    storedTheme = null;
    storedLocale = null;
  }

  const theme = storedTheme ?? readCookie("${THEME_COOKIE_NAME}");
  if (theme === "light" || theme === "dark") {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.cookie =
      "${THEME_COOKIE_NAME}=" +
      encodeURIComponent(theme) +
      "; Path=/; Max-Age=31536000; SameSite=Lax";
  }

  const locale = storedLocale ?? readCookie("${LOCALE_COOKIE_NAME}");
  if (locale === "ko" || locale === "en") {
    document.documentElement.lang = locale;
    document.cookie =
      "${LOCALE_COOKIE_NAME}=" +
      encodeURIComponent(locale) +
      "; Path=/; Max-Age=31536000; SameSite=Lax";
  }
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, theme } = await getRequestPreferences();
  const dictionary = getDictionary(locale);

  return (
    <html
      className={`${jakarta.variable} ${ibmMono.variable} ${theme === "dark" ? "dark" : ""}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: preferenceBootScript }} />
        <a
          className="sr-only absolute left-4 top-4 z-50 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#main-content"
        >
          {dictionary.common.skipToContent}
        </a>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
