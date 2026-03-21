import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  APP_TIMEZONE: z.string().min(1).default("Asia/Seoul"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerEnv: ServerEnv | undefined;

function getServerEnv() {
  if (!cachedServerEnv) {
    cachedServerEnv = serverEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      APP_TIMEZONE: process.env.APP_TIMEZONE ?? "Asia/Seoul",
    });
  }

  return cachedServerEnv;
}

export function hasSupabaseAuthEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const serverEnv = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return getServerEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return getServerEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get APP_TIMEZONE() {
    return getServerEnv().APP_TIMEZONE;
  },
};
