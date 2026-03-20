import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env";

let supabaseAdminClient: SupabaseClient | undefined;

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            "X-Client-Info": "pomodoro-mvp",
          },
        },
      },
    );
  }

  return supabaseAdminClient;
}

