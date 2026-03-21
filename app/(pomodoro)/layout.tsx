import { AppLayout } from "@/components/layout/layout";
import { requireAuthSession } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";

export const dynamic = "force-dynamic";

export default async function PomodoroAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthSession();
  const { locale, theme } = await getRequestPreferences();
  const dictionary = getDictionary(locale);

  return (
    <AppLayout commonCopy={dictionary.common} locale={locale} theme={theme}>
      {children}
    </AppLayout>
  );
}
