"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { plans, type PlanId } from "@/lib/plans";
import { track, trackAdsConversion } from "./Analytics";

// Fires sign-up and purchase events after the redirects that follow them.
export default function ConversionEvents() {
  const params = useSearchParams();
  useEffect(() => {
    // gtag loads after hydration; wait a moment so the events are not lost.
    const timer = setTimeout(() => {
      if (params.get("welcome") === "1") {
        track("sign_up", { method: "email" });
        trackAdsConversion(process.env.NEXT_PUBLIC_ADS_SIGNUP_LABEL);
      }
      if (params.get("checkout") === "success") {
        const plan = plans[(params.get("plan") as PlanId) ?? "pro"] ?? plans.pro;
        track("purchase", { value: plan.price, currency: "USD", items: [{ item_name: plan.name }] });
        trackAdsConversion(process.env.NEXT_PUBLIC_ADS_PURCHASE_LABEL, { value: plan.price, currency: "USD" });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [params]);
  return null;
}
