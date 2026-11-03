import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function databaseReady() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function converterReady() {
  const base = process.env.GOTENBERG_URL;
  if (!base) return false;
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const [database, converter] = await Promise.all([databaseReady(), converterReady()]);
  const ready = database && converter;
  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      services: { database, converter },
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
