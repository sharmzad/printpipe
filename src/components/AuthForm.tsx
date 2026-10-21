"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/lib/actions";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-line bg-card p-8 shadow-sm">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input py-2.5" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"} className="input py-2.5" />
      </div>
      {state?.error && <p className="rounded-lg bg-accent-soft p-3 text-sm text-accent-dark">{state.error}</p>}
      <button className="btn-primary w-full py-3" disabled={pending}>{mode === "login" ? "Log in" : "Create free account"}</button>
      <p className="text-center text-sm text-muted">
        {mode === "login"
          ? <>No account? <Link href={`/signup${qs}`} className="font-semibold text-ink underline">Sign up free</Link></>
          : <>Already have an account? <Link href={`/login${qs}`} className="font-semibold text-ink underline">Log in</Link></>}
      </p>
    </form>
  );
}
