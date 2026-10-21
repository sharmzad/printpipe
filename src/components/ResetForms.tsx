"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, resetPassword } from "@/lib/actions";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  if (state?.sent)
    return (
      <div className="rounded-3xl border border-line bg-card p-8 text-center">
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-2 text-sm text-muted">If an account exists for that email, we've sent a link to reset your password. It works for 1 hour.</p>
      </div>
    );
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-line bg-card p-8 shadow-sm">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input py-2.5" />
      </div>
      {state?.error && <p className="rounded-lg bg-accent-soft p-3 text-sm text-accent-dark">{state.error}</p>}
      <button className="btn-primary w-full py-3" disabled={pending}>Send reset link</button>
      <p className="text-center text-sm text-muted"><Link href="/login" className="underline">Back to log in</Link></p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-line bg-card p-8 shadow-sm">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input py-2.5" />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-accent-soft p-3 text-sm text-accent-dark">
          {state.error} <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>
        </p>
      )}
      <button className="btn-primary w-full py-3" disabled={pending}>Save new password</button>
    </form>
  );
}
