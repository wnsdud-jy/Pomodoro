import "server-only";

import { createServerClient } from "@supabase/ssr";

import { cookies } from "next/headers";

import { serverEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("Cookies can only be modified")
            ) {
              return;
            }

            throw error;
          }
        },
      },
      global: {
        headers: {
          "X-Client-Info": "pomodoro-mvp",
        },
      },
    },
  );
}
