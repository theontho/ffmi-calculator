import Script from "next/script";

const beaconToken = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;

export function PrivacyAnalytics() {
  if (!beaconToken) return null;

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: beaconToken })}
      strategy="afterInteractive"
    />
  );
}
