"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginActionState } from "@/app/pomodoro/login/actions";
import type { AppDictionary } from "@/lib/i18n/messages";

const initialState: LoginActionState = {
  error: null,
};

function LoginSubmitButton({
  submitLabel,
  submittingLabel,
}: {
  submitLabel: string;
  submittingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? submittingLabel : submitLabel}
    </Button>
  );
}

export function LoginForm({
  copy,
}: {
  copy: AppDictionary["login"]["form"];
}) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) {
      emailRef.current?.focus();
    }
  }, [state.error]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{copy.emailLabel}</Label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder={copy.emailPlaceholder}
          ref={emailRef}
          spellCheck={false}
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{copy.passwordLabel}</Label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          placeholder={copy.passwordPlaceholder}
          required
          type="password"
        />
      </div>
      {state.error ? (
        <p
          aria-live="polite"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <LoginSubmitButton
        submitLabel={copy.submit}
        submittingLabel={copy.submitting}
      />
    </form>
  );
}
