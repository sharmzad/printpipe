import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/ResetForms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-display text-4xl">Choose a new password</h1>
      {token ? <ResetForm token={token} /> : (
        <p className="text-center text-muted">This link is incomplete. <Link href="/forgot-password" className="underline">Request a new one</Link>.</p>
      )}
    </div>
  );
}
