"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { signInWithPassword } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";

const loginSchema = z.object({
  email: z.string().trim().email(),
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
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: dictionary.auth.requiredCredentials,
    };
  }

  try {
    await signInWithPassword(parsed.data.email, parsed.data.password);
  } catch {
    return {
      error: dictionary.auth.invalidCredentials,
    };
  }

  redirect("/pomodoro/dashboard");
}
