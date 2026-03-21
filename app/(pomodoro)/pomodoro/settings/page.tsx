import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/app/pomodoro/settings/_components/settings-form";
import { requireAuthSession } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";
import { createDefaultPomodoroSettings } from "@/lib/pomodoro-settings";
import { getPomodoroSettings } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await requireAuthSession();
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  let settingsWarning: string | null = null;
  let settings = createDefaultPomodoroSettings();

  try {
    settings = await getPomodoroSettings(session.supabase, session.user.id);
  } catch (error) {
    console.error("Failed to load pomodoro settings", error);
    settingsWarning = dictionary.settingsPage.loadWarning;
  }

  return (
    <div className="flex flex-1 flex-col gap-5 sm:gap-6">
      {settingsWarning ? (
        <Card className="border-amber-200 bg-amber-50/90 dark:border-amber-400/30 dark:bg-amber-500/10">
          <CardContent className="space-y-2 p-5 text-sm leading-6 text-amber-900 dark:text-amber-100">
            <p>{settingsWarning}</p>
          </CardContent>
        </Card>
      ) : null}

      <SettingsForm
        copy={dictionary.settingsPage.form}
        initialValues={{
          focus_minutes: settings.focus_minutes,
          short_break_minutes: settings.short_break_minutes,
          long_break_minutes: settings.long_break_minutes,
          long_break_every: settings.long_break_every,
          timezone: settings.timezone,
          auto_advance: settings.auto_advance,
          auto_start_next: settings.auto_start_next,
          sound_enabled: settings.sound_enabled,
          notifications_enabled: settings.notifications_enabled,
        }}
      />
    </div>
  );
}
