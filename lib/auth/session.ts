import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthSession = {
  supabase: SupabaseClient;
  user: User;
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    supabase,
    user,
  };
}

export async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  return session;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
