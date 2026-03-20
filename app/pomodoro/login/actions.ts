"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";
import { issueSessionCookie, validateAppCredentials } from "@/lib/auth/session";

const loginSchema = z.object({
  loginId: z.string().trim().min(1),
  password: z.string().min(1),
});

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  const parsed = loginSchema.safeParse({
    loginId: formData.get("loginId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: dictionary.auth.requiredCredentials,
    };
  }

  const isValid = validateAppCredentials(
    parsed.data.loginId,
    parsed.data.password,
  );

  if (!isValid) {
    return {
      error: dictionary.auth.invalidCredentials,
    };
  }

  await issueSessionCookie();
  redirect("/pomodoro/dashboard");
}
