import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import { getDictionary } from "@/lib/i18n/messages";
import { THEME_COOKIE_NAME } from "@/lib/preferences";
import { getRequestPreferences } from "@/lib/preferences/server";
import "./globals.css";

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
    default: "Poromoro",
    template: "%s | Poromoro",
  },
  description: "Single-user Pomodoro timer with protected routes and Supabase-backed history.",
};

const themeBootScript = `
(() => {
  const cookieMatch = document.cookie.match(/(?:^|; )${THEME_COOKIE_NAME}=([^;]+)/);
  if (!cookieMatch) return;
  const theme = decodeURIComponent(cookieMatch[1]);
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
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
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <a
          className="sr-only absolute left-4 top-4 z-50 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#main-content"
        >
          {dictionary.common.skipToContent}
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
