import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-display text-4xl">Welcome back</h1>
      <AuthForm mode="login" next={next} />
    </div>
  );
}
