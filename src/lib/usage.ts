import "server-only";
import { db } from "./db";
import { anonymous, planFor } from "./plans";

export function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function monthlyUsage(userId: string) {
  return db.usage.count({ where: { userId, createdAt: { gte: startOfMonth() } } });
}

type Who = { user: { id: string; plan: string } | null; ipHash: string };

export async function checkAllowance({ user, ipHash }: Who, bytes: number) {
  if (user) {
    const plan = planFor(user.plan);
    if (bytes > plan.maxFileMb * 1024 * 1024)
      return { ok: false as const, status: 413, error: `Files are limited to ${plan.maxFileMb} MB on the ${plan.name} plan.` };
    const used = await monthlyUsage(user.id);
    if (used >= plan.monthlyConversions)
      return { ok: false as const, status: 402, error: `You've used all ${plan.monthlyConversions} conversions this month. Upgrade for more.` };
    return { ok: true as const };
  }
  if (bytes > anonymous.maxFileMb * 1024 * 1024)
    return { ok: false as const, status: 413, error: `Without an account files are limited to ${anonymous.maxFileMb} MB. Sign up free for more.` };
  const used = await db.usage.count({ where: { userId: null, ipHash, createdAt: { gte: startOfDay() } } });
  if (used >= anonymous.dailyConversions)
    return { ok: false as const, status: 402, error: `You've used today's ${anonymous.dailyConversions} free conversions. Create a free account to keep going.` };
  return { ok: true as const };
}

export async function recordUsage({ user, ipHash }: Who, tool: string, source: "web" | "api", bytesIn: number) {
  await db.usage.create({ data: { userId: user?.id ?? null, ipHash: user ? null : ipHash, tool, source, bytesIn } });
}
