import "server-only";

import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LOGIN_PATH, SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { serverEnv } from "@/lib/env";
import { createSessionToken, verifySessionToken } from "@/lib/auth/token";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateAppCredentials(loginId: string, password: string) {
  return (
    safeCompare(loginId, serverEnv.APP_LOGIN_ID) &&
    safeCompare(password, serverEnv.APP_LOGIN_PASSWORD)
  );
}

export async function issueSessionCookie() {
  const cookieStore = await cookies();
  const now = Date.now();
  const token = createSessionToken({
    sub: "pomodoro-single-user",
    iat: now,
    exp: now + SESSION_TTL_SECONDS * 1000,
  });

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}

export async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  return session;
}
