import { NextRequest, NextResponse } from "next/server";
import { currentUser, hashIp, userFromApiKey } from "@/lib/auth";
import { buildGotenbergForm, callGotenberg, InputError } from "@/lib/gotenberg";
import { planFor } from "@/lib/plans";
import { getTool } from "@/lib/tools";
import { checkAllowance, recordUsage } from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 120;

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const tool = getTool((await params).slug);
  if (!tool) return fail(404, "Unknown tool.");

  const authHeader = req.headers.get("authorization");
  const source = authHeader ? "api" : "web";
  let user;
  if (authHeader) {
    user = await userFromApiKey(authHeader);
    if (!user) return fail(401, "Invalid API key.");
    if (!planFor(user.plan).api) return fail(403, "API access is included in the Pro and Business plans.");
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
    return fail(400, "Send the request as multipart/form-data.");
  }

  let built;
  try {
    built = await buildGotenbergForm(tool, form);
  } catch (e) {
    if (e instanceof InputError) return fail(400, e.message);
    throw e;
  }

  const allowance = await checkAllowance(who, built.bytes);
  if (!allowance.ok) return fail(allowance.status, allowance.error);

  let res: Response;
  try {
    res = await callGotenberg(tool, built.form);
  } catch (e) {
    console.error("gotenberg request failed", e);
    return fail(503, "The conversion took too long or the service is busy. Please try again.");
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    console.warn(`gotenberg ${tool.route} -> ${res.status}: ${detail}`);
    if (res.status === 400) return fail(400, `We couldn't process this file: ${detail}`);
    return fail(502, "The conversion failed. Please try again.");
  }

  await recordUsage(who, tool.slug, source, built.bytes);

  const headers = new Headers();
  for (const h of ["content-type", "content-disposition"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("cache-control", "no-store");
  return new Response(res.body, { status: 200, headers });
}
