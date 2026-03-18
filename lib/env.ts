import { z } from "zod";

const serverEnvSchema = z.object({
  APP_LOGIN_ID: z.string().min(1),
  APP_LOGIN_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_TIMEZONE: z.string().min(1).default("Asia/Seoul"),
});

export const serverEnv = serverEnvSchema.parse({
  APP_LOGIN_ID: process.env.APP_LOGIN_ID,
  APP_LOGIN_PASSWORD: process.env.APP_LOGIN_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  APP_TIMEZONE: process.env.APP_TIMEZONE ?? "Asia/Seoul",
});
