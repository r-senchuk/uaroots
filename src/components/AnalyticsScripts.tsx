"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const validMeasurementId = measurementId && /^G-[A-Z0-9]{6,}$/.test(measurementId);
const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

export function AnalyticsScripts() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const syncConsent = () => setConsented(window.__uarouteAnalyticsConsent === true);
    syncConsent();
    window.addEventListener("uaroute:analytics-consent", syncConsent);
    return () => window.removeEventListener("uaroute:analytics-consent", syncConsent);
  }, []);

  if (!analyticsEnabled || !validMeasurementId || !consented) return null;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('consent', 'update', { analytics_storage: 'granted' });
gtag('config', '${measurementId}', {
  anonymize_ip: true,
  send_page_view: false,
  page_location: window.__uarouteAnalyticsPageLocation || 'https://uaroute.com/',
  page_referrer: ''
});
window.__uarouteAnalyticsProviderReady = true;
window.dispatchEvent(new Event('uaroute:analytics-provider-ready'));`}
      </Script>
      <Script
        id="ga4-library"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
