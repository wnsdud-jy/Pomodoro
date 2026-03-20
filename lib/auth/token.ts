import { createHmac, timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";

export type AuthSessionPayload = {
  sub: "pomodoro-single-user";
  iat: number;
  exp: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  return createHmac("sha256", serverEnv.SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSessionToken(payload: AuthSessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature, ...rest] = token.split(".");

  if (!encodedPayload || !signature || rest.length > 0) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as AuthSessionPayload;

    if (
      parsed.sub !== "pomodoro-single-user" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

