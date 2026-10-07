"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { analyticsConfiguration } from "@/config/analytics";

const config = analyticsConfiguration();

export function AnalyticsScripts() {
  const [consented, setConsented] = useState(false);
  useEffect(() => {
    const sync = () => setConsented(window.__uarouteAnalyticsConsent === true);
    sync();
    window.addEventListener("uaroute:analytics-consent", sync);
    return () => window.removeEventListener("uaroute:analytics-consent", sync);
  }, []);

  if (!config.enabled || !consented) return null;

  function ready() {
    if (window.__uarouteAnalyticsConsent !== true) return;
    window.__uarouteAnalyticsProviderReady = true;
    window.dispatchEvent(new Event("uaroute:analytics-provider-ready"));
  }

  if (config.provider === "gtm") {
    return <>
      <Script id="uaroute-gtm-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js',
  uaroute_page_location: window.__uarouteAnalyticsPageLocation || 'https://uaroute.com/',
  uaroute_page_referrer: '' });`}
      </Script>
      <Script id="uaroute-gtm" strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${config.containerId}`}
        onLoad={ready} onError={() => { window.__uarouteAnalyticsProviderReady = false; }} />
    </>;
  }

  return <>
    <Script id="ga4-init" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('js', new Date());
gtag('config', '${config.measurementId}', {
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  page_location: window.__uarouteAnalyticsPageLocation || 'https://uaroute.com/',
  page_referrer: ''
});`}
    </Script>
    <Script id="ga4-library" strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`}
      onLoad={ready} onError={() => { window.__uarouteAnalyticsProviderReady = false; }} />
  </>;
}
