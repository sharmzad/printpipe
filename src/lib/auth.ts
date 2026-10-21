import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const COOKIE = "pp_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  const options = { secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
  jar.set(COOKIE, token, { ...options, httpOnly: true });
  // Readable hint so static pages can show "Dashboard" instead of "Log in" without a server round trip.
  jar.set(SIGNED_IN_HINT, "1", options);
}

export const SIGNED_IN_HINT = "pp_in";

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(SIGNED_IN_HINT);
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return await db.user.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function newApiKey() {
  const key = `pp_live_${randomBytes(24).toString("base64url")}`;
  return { key, prefix: key.slice(0, 12), hash: sha256(key) };
}

export async function userFromApiKey(header: string | null) {
  const key = header?.match(/^Bearer\s+(pp_live_\S+)$/i)?.[1];
  if (!key) return null;
  const apiKey = await db.apiKey.findUnique({ where: { hash: sha256(key) }, include: { user: true } });
  if (!apiKey) return null;
  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return apiKey.user;
}

export function hashIp(ip: string) {
  return sha256(`${ip}:${process.env.AUTH_SECRET}`);
}
