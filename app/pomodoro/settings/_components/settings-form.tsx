"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Bell, RotateCcw, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  type BrowserNotificationPermission,
} from "@/lib/browser/notifications";
import {
  DEFAULT_POMODORO_SETTINGS_VALUES,
  POMODORO_SETTINGS_LIMITS,
} from "@/lib/pomodoro-settings";
import { parsePomodoroSettingsInput } from "@/lib/settings-validation";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { PomodoroSettingsValues } from "@/types/settings";

type NumericFieldKey =
  | "focus_minutes"
  | "short_break_minutes"
  | "long_break_minutes"
  | "long_break_every";

type FormValues = {
  focus_minutes: string;
  short_break_minutes: string;
  long_break_minutes: string;
  long_break_every: string;
  auto_advance: boolean;
  auto_start_next: boolean;
  sound_enabled: boolean;
  notifications_enabled: boolean;
};

type FieldErrors = Partial<Record<NumericFieldKey, string>>;

function buildFormValues(values: PomodoroSettingsValues): FormValues {
  return {
    focus_minutes: String(values.focus_minutes),
    short_break_minutes: String(values.short_break_minutes),
    long_break_minutes: String(values.long_break_minutes),
    long_break_every: String(values.long_break_every),
    auto_advance: values.auto_advance,
    auto_start_next: values.auto_start_next,
    sound_enabled: values.sound_enabled,
    notifications_enabled: values.notifications_enabled,
  };
}

function SettingsSwitchRow({
  checked,
  description,
  disabled = false,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{label}</p>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}

function getFieldErrorMessage(
  key: NumericFieldKey,
  copy: AppDictionary["settingsPage"]["form"],
) {
  switch (key) {
    case "focus_minutes":
      return copy.focusMinutesError;
    case "short_break_minutes":
      return copy.shortBreakMinutesError;
    case "long_break_minutes":
      return copy.longBreakMinutesError;
    default:
      return copy.longBreakEveryError;
  }
}

export function SettingsForm({
  copy,
  initialValues,
}: {
  copy: AppDictionary["settingsPage"]["form"];
  initialValues: PomodoroSettingsValues;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [permission, setPermission] = useState<BrowserNotificationPermission>("unsupported");
  const [values, setValues] = useState<FormValues>(buildFormValues(initialValues));
  const [savedValues, setSavedValues] = useState<FormValues>(buildFormValues(initialValues));

  useEffect(() => {
    const nextValues = buildFormValues(initialValues);
    setValues(nextValues);
    setSavedValues(nextValues);
  }, [initialValues]);

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const permissionHint = useMemo(() => {
    if (permission === "granted") {
      return copy.permissionHintGranted;
    }

    if (permission === "denied") {
      return copy.permissionHintDenied;
    }

    if (permission === "unsupported") {
      return copy.permissionHintUnsupported;
    }

    return copy.permissionHintDefault;
  }, [copy, permission]);

  const currentSummary = useMemo(
    () => ({
      durations: copy.summaryDurationsTemplate
        .replace("{focus}", String(initialValues.focus_minutes))
        .replace("{short}", String(initialValues.short_break_minutes))
        .replace("{long}", String(initialValues.long_break_minutes)),
      cadence: copy.summaryCadenceTemplate.replace(
        "{count}",
        String(initialValues.long_break_every),
      ),
      automation: initialValues.auto_advance
        ? initialValues.auto_start_next
          ? copy.summaryAutomationFull
          : copy.summaryAutomationSwitchOnly
        : copy.summaryAutomationManual,
      alerts:
        initialValues.sound_enabled || initialValues.notifications_enabled
          ? copy.summaryAlertsOn
          : copy.summaryAlertsOff,
    }),
    [copy, initialValues],
  );
  const isDirty = useMemo(
    () => JSON.stringify(parsePayload(values)) !== JSON.stringify(parsePayload(savedValues)),
    [savedValues, values],
  );

  function parsePayload(currentValues: FormValues) {
    return {
      focus_minutes: Number(currentValues.focus_minutes),
      short_break_minutes: Number(currentValues.short_break_minutes),
      long_break_minutes: Number(currentValues.long_break_minutes),
      long_break_every: Number(currentValues.long_break_every),
      auto_advance: currentValues.auto_advance,
      auto_start_next: currentValues.auto_advance ? currentValues.auto_start_next : false,
      sound_enabled: currentValues.sound_enabled,
      notifications_enabled: currentValues.notifications_enabled,
    };
  }

  function validateValues(nextValues: FormValues) {
    const parsed = parsePomodoroSettingsInput(parsePayload(nextValues));

    if (parsed.success) {
      return {};
    }

    const nextErrors: FieldErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];

      if (
        key === "focus_minutes" ||
        key === "short_break_minutes" ||
        key === "long_break_minutes" ||
        key === "long_break_every"
      ) {
        nextErrors[key] = getFieldErrorMessage(key, copy);
      }
    }

    return nextErrors;
  }

  function updateNumberField(key: NumericFieldKey, value: string) {
    const nextValues = {
      ...values,
      [key]: value,
    };

    setValues(nextValues);
    setFieldErrors(validateValues(nextValues));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formRef.current?.reportValidity()) {
      return;
    }

    const nextErrors = validateValues(values);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast({
        title: copy.validationTitle,
        description: copy.validationDescription,
        variant: "destructive",
      });
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/pomodoro/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsePayload(values)),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: copy.saveSuccessTitle,
        description: copy.saveSuccessDescription,
        variant: "success",
      });
      setSavedValues(values);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast({
        title: copy.saveErrorTitle,
        description: copy.saveErrorDescription,
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  async function handleRequestPermission() {
    const nextPermission = await requestBrowserNotificationPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      setValues((current) => ({
        ...current,
        notifications_enabled: true,
      }));
    }
  }

  function handleRestoreDefaults() {
    const nextValues = buildFormValues(DEFAULT_POMODORO_SETTINGS_VALUES);
    setValues(nextValues);
    setFieldErrors({});
    toast({
      title: copy.restoreDefaultsTitle,
      description: copy.restoreDefaultsDescription,
      variant: "default",
    });
  }

  return (
    <form className="space-y-6 pb-28" onSubmit={handleSubmit} ref={formRef}>
      <Card>
        <CardHeader className="space-y-3">
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>{copy.summaryTitle}</CardTitle>
            <CardDescription>{copy.summaryDescription}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label={copy.summaryDurationsLabel} value={currentSummary.durations} />
          <SummaryTile label={copy.summaryCadenceLabel} value={currentSummary.cadence} />
          <SummaryTile label={copy.summaryAutomationLabel} value={currentSummary.automation} />
          <SummaryTile label={copy.summaryAlertsLabel} value={currentSummary.alerts} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>{copy.durationsTitle}</CardTitle>
          <CardDescription>{copy.durationsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="focus_minutes">{copy.focusMinutesLabel}</Label>
            <Input
              aria-invalid={fieldErrors.focus_minutes ? true : undefined}
              autoComplete="off"
              id="focus_minutes"
              inputMode="numeric"
              max={POMODORO_SETTINGS_LIMITS.focus_minutes.max}
              min={POMODORO_SETTINGS_LIMITS.focus_minutes.min}
              name="focus_minutes"
              onChange={(event) => updateNumberField("focus_minutes", event.target.value)}
              required
              type="number"
              value={values.focus_minutes}
            />
            {fieldErrors.focus_minutes ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">
                {fieldErrors.focus_minutes}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_break_minutes">{copy.shortBreakMinutesLabel}</Label>
            <Input
              aria-invalid={fieldErrors.short_break_minutes ? true : undefined}
              autoComplete="off"
              id="short_break_minutes"
              inputMode="numeric"
              max={POMODORO_SETTINGS_LIMITS.short_break_minutes.max}
              min={POMODORO_SETTINGS_LIMITS.short_break_minutes.min}
              name="short_break_minutes"
              onChange={(event) =>
                updateNumberField("short_break_minutes", event.target.value)
              }
              required
              type="number"
              value={values.short_break_minutes}
            />
            {fieldErrors.short_break_minutes ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">
                {fieldErrors.short_break_minutes}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="long_break_minutes">{copy.longBreakMinutesLabel}</Label>
            <Input
              aria-invalid={fieldErrors.long_break_minutes ? true : undefined}
              autoComplete="off"
              id="long_break_minutes"
              inputMode="numeric"
              max={POMODORO_SETTINGS_LIMITS.long_break_minutes.max}
              min={POMODORO_SETTINGS_LIMITS.long_break_minutes.min}
              name="long_break_minutes"
              onChange={(event) =>
                updateNumberField("long_break_minutes", event.target.value)
              }
              required
              type="number"
              value={values.long_break_minutes}
            />
            {fieldErrors.long_break_minutes ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">
                {fieldErrors.long_break_minutes}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="long_break_every">{copy.longBreakEveryLabel}</Label>
            <Input
              aria-invalid={fieldErrors.long_break_every ? true : undefined}
              autoComplete="off"
              id="long_break_every"
              inputMode="numeric"
              max={POMODORO_SETTINGS_LIMITS.long_break_every.max}
              min={POMODORO_SETTINGS_LIMITS.long_break_every.min}
              name="long_break_every"
              onChange={(event) => updateNumberField("long_break_every", event.target.value)}
              required
              type="number"
              value={values.long_break_every}
            />
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {copy.longBreakEveryHelp}
            </p>
            {fieldErrors.long_break_every ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">
                {fieldErrors.long_break_every}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>{copy.automationTitle}</CardTitle>
          <CardDescription>{copy.automationDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSwitchRow
            checked={values.auto_advance}
            description={copy.autoAdvanceHelp}
            label={copy.autoAdvanceLabel}
            onCheckedChange={(checked) =>
              setValues((current) => ({
                ...current,
                auto_advance: checked,
                auto_start_next: checked ? current.auto_start_next : false,
              }))
            }
          />
          <SettingsSwitchRow
            checked={values.auto_start_next}
            description={copy.autoStartNextHelp}
            disabled={!values.auto_advance}
            label={copy.autoStartNextLabel}
            onCheckedChange={(checked) =>
              setValues((current) => ({
                ...current,
                auto_start_next: checked,
              }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>{copy.alertsTitle}</CardTitle>
          <CardDescription>{copy.alertsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
                <Bell aria-hidden="true" className="size-4" />
                {copy.notificationPermissionLabel}
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                {copy.notificationPermissionStates[permission]}
              </p>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {permissionHint}
              </p>
            </div>
            <Button
              className="w-full md:w-auto"
              onClick={() => void handleRequestPermission()}
              type="button"
              variant="secondary"
            >
              {copy.requestPermission}
            </Button>
          </div>

          <SettingsSwitchRow
            checked={values.notifications_enabled}
            description={copy.notificationsEnabledHelp}
            label={copy.notificationsEnabledLabel}
            onCheckedChange={(checked) =>
              setValues((current) => ({
                ...current,
                notifications_enabled: checked,
              }))
            }
          />
          <SettingsSwitchRow
            checked={values.sound_enabled}
            description={copy.soundEnabledHelp}
            label={copy.soundEnabledLabel}
            onCheckedChange={(checked) =>
              setValues((current) => ({
                ...current,
                sound_enabled: checked,
              }))
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleRestoreDefaults} type="button" variant="ghost">
          <RotateCcw aria-hidden="true" className="size-4" />
          {copy.restoreDefaults}
        </Button>
      </div>

      {isDirty ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
          <Button
            className="pointer-events-auto h-12 rounded-full px-5 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)]"
            disabled={pending}
            size="lg"
            type="submit"
          >
            <Save aria-hidden="true" className="size-4" />
            {pending ? copy.saving : copy.save}
          </Button>
        </div>
      ) : null}

      <div aria-live="polite" className="sr-only">
        {pending ? copy.saving : ""}
      </div>
    </form>
  );
}
