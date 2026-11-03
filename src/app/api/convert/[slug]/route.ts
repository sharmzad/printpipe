import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { currentUser, hashIp, userFromApiKey } from "@/lib/auth";
import { buildGotenbergForm, callGotenberg, InputError } from "@/lib/gotenberg";
import { planFor } from "@/lib/plans";
import { getTool } from "@/lib/tools";
import { completeUsage, releaseUsage, reserveUsage } from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 120;

function requestIdFor(req: NextRequest) {
  const supplied = req.headers.get("x-request-id");
  return supplied && /^[A-Za-z0-9._:-]{1,100}$/.test(supplied) ? supplied : randomUUID();
}

function fail(status: number, error: string, requestId: string) {
  return NextResponse.json({ error, requestId }, { status, headers: { "x-request-id": requestId } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const requestId = requestIdFor(req);
  const tool = getTool((await params).slug);
  if (!tool) return fail(404, "Unknown tool.", requestId);

  const authHeader = req.headers.get("authorization");
  const source = req.nextUrl.pathname.startsWith("/api/v1/") ? "api" : "web";
  let user;
  if (source === "api") {
    if (!authHeader) return fail(401, "Send your API key as a Bearer token.", requestId);
    user = await userFromApiKey(authHeader);
    if (!user) return fail(401, "Invalid API key.", requestId);
    if (!planFor(user.plan).api) return fail(403, "API access is included in the Pro and Business plans.", requestId);
  } else {
    user = await currentUser();
  }

  // Railway's edge sets X-Real-IP; the last X-Forwarded-For hop is the fallback (earlier hops can be spoofed).
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
  const who = { user, ipHash: hashIp(ip) };

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Send the request as multipart/form-data.", requestId);
  }

  let built;
  try {
    built = await buildGotenbergForm(tool, form);
  } catch (e) {
    if (e instanceof InputError) return fail(400, e.message, requestId);
    throw e;
  }

  const allowance = await reserveUsage(who, tool.slug, source, built.bytes, requestId);
  if (!allowance.ok) return fail(allowance.status, allowance.error, requestId);

  let res: Response;
  try {
    res = await callGotenberg(tool, built.form, requestId);
  } catch (e) {
    await releaseUsage(requestId).catch(() => undefined);
    console.error(`[${requestId}] gotenberg request failed`, e);
    return fail(503, "The conversion took too long or the service is busy. Please try again.", requestId);
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    await releaseUsage(requestId).catch(() => undefined);
    console.warn(`[${requestId}] gotenberg ${tool.route} -> ${res.status}: ${detail}`);
    if (res.status === 400) return fail(400, "We couldn't process that input. Check the file and options, then try again.", requestId);
    return fail(502, "The conversion failed. Please try again.", requestId);
  }

  await completeUsage(requestId).catch((e) => console.error(`[${requestId}] failed to complete usage reservation`, e));

  const headers = new Headers();
  for (const h of ["content-type", "content-disposition"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("cache-control", "no-store");
  headers.set("x-request-id", requestId);
  return new Response(res.body, { status: 200, headers });
}
