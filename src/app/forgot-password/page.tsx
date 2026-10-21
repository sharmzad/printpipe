import type { Metadata } from "next";
import { ForgotForm } from "@/components/ResetForms";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-display text-4xl">Forgot your password?</h1>
      <ForgotForm />
    </div>
  );
}
