import "server-only";
import { db } from "./db";
import { anonymous, planFor } from "./plans";

const RESERVATION_TTL_MS = 3 * 60 * 1000;

export function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function monthlyUsage(userId: string) {
  return db.usage.count({ where: { userId, status: "completed", createdAt: { gte: startOfMonth() } } });
}

type Who = { user: { id: string; plan: string } | null; ipHash: string };

function activeReservation(now: Date) {
  return { OR: [{ status: "completed" }, { status: "pending", expiresAt: { gt: now } }] };
}

export async function reserveUsage(
  { user, ipHash }: Who,
  tool: string,
  source: "web" | "api",
  bytesIn: number,
  requestId: string,
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MS);

  if (user) {
    const plan = planFor(user.plan);
    if (bytesIn > plan.maxFileMb * 1024 * 1024)
      return { ok: false as const, status: 413, error: `Files are limited to ${plan.maxFileMb} MB on the ${plan.name} plan.` };

    return db.$transaction(async (tx) => {
      const scope = `user:${user.id}:${startOfMonth().toISOString()}`;
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${scope}))::text`;
      const used = await tx.usage.count({
        where: { userId: user.id, createdAt: { gte: startOfMonth() }, ...activeReservation(now) },
      });
      if (used >= plan.monthlyConversions)
        return { ok: false as const, status: 402, error: `You've used all ${plan.monthlyConversions} conversions this month. Upgrade for more.` };
      await tx.usage.create({
        data: { userId: user.id, ipHash: null, tool, source, bytesIn, requestId, status: "pending", expiresAt },
      });
      return { ok: true as const };
    });
  }

  if (bytesIn > anonymous.maxFileMb * 1024 * 1024)
    return { ok: false as const, status: 413, error: `Without an account files are limited to ${anonymous.maxFileMb} MB. Sign up free for more.` };

  return db.$transaction(async (tx) => {
    const scope = `ip:${ipHash}:${startOfDay().toISOString()}`;
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${scope}))::text`;
    const used = await tx.usage.count({
      where: { userId: null, ipHash, createdAt: { gte: startOfDay() }, ...activeReservation(now) },
    });
    if (used >= anonymous.dailyConversions)
      return { ok: false as const, status: 402, error: `You've used today's ${anonymous.dailyConversions} free conversions. Create a free account to keep going.` };
    await tx.usage.create({
      data: { userId: null, ipHash, tool, source, bytesIn, requestId, status: "pending", expiresAt },
    });
    return { ok: true as const };
  });
}

export async function completeUsage(requestId: string) {
  await db.usage.update({
    where: { requestId },
    data: { status: "completed", completedAt: new Date(), expiresAt: null },
  });
}

export async function releaseUsage(requestId: string) {
  await db.usage.deleteMany({ where: { requestId, status: "pending" } });
}
