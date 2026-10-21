import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { plans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Sign up free",
  description: `Create a free account and get ${plans.free.monthlyConversions} PDF conversions every month.`,
  alternates: { canonical: "/signup" },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center font-display text-4xl">Create your free account</h1>
      <p className="mt-3 mb-8 text-center text-muted">{plans.free.monthlyConversions} conversions a month, free forever. No card needed.</p>
      <AuthForm mode="signup" next={next} />
    </div>
  );
}
