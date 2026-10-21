"use client";

import { useActionState } from "react";
import { createApiKey } from "@/lib/actions";

export default function ApiKeyCreate() {
  const [state, action, pending] = useActionState(createApiKey, undefined);
  return (
    <div>
      <form action={action} className="flex gap-2">
        <input name="name" placeholder="Key name, e.g. Production" className="input" maxLength={60} />
        <button className="btn-ink shrink-0" disabled={pending}>Create key</button>
      </form>
      {state?.error && <p className="mt-3 text-sm text-accent-dark">{state.error}</p>}
      {state?.key && (
        <div className="mt-4 rounded-xl border border-accent bg-accent-soft p-4 text-sm">
          <p className="font-semibold">Copy your key now. You won't be able to see it again.</p>
          <code className="mt-2 block break-all rounded-lg bg-white p-3 font-mono">{state.key}</code>
        </div>
      )}
    </div>
  );
}
