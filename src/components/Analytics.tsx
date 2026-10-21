"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const CONSENT_KEY = "pp_consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Send an analytics / Google Ads event. Safe to call when tracking is off.
export function track(event: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", event, params);
}

// Google Ads conversion for a named action, using the label from your Ads account.
export function trackAdsConversion(label: string | undefined, params: Record<string, unknown> = {}) {
  if (ADS_ID && label) window.gtag?.("event", "conversion", { send_to: `${ADS_ID}/${label}`, ...params });
}

function setConsent(granted: boolean) {
  const v = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
}

export default function Analytics() {
  const [ask, setAsk] = useState(false);
  const enabled = Boolean(GA_ID || ADS_ID);

  useEffect(() => {
    if (!enabled) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(CONSENT_KEY);
    } catch {}
    if (saved) setConsent(saved === "granted");
    else setAsk(true);
  }, [enabled]);

  if (!enabled) return null;

  const choose = (granted: boolean) => {
    try {
      localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
    } catch {}
    setConsent(granted);
    setAsk(false);
  };

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID || ADS_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('js',new Date());
${GA_ID ? `gtag('config','${GA_ID}');` : ""}
${ADS_ID ? `gtag('config','${ADS_ID}');` : ""}`}
      </Script>
      {ask && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-card p-4 shadow-lg sm:flex sm:items-center sm:gap-4">
          <p className="text-sm text-muted">
            We use cookies to measure traffic and improve our ads. <a href="/privacy" className="underline">Privacy policy</a>
          </p>
          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
            <button className="btn-ghost" onClick={() => choose(false)}>Decline</button>
            <button className="btn-ink" onClick={() => choose(true)}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
