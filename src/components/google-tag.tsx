import Script from "next/script";
import { site } from "@/config/site";

/** Google tag (gtag.js) for Google Ads. Rendered only on the production deployment, so previews and local runs send nothing. */
export function GoogleTag() {
  if (process.env.VERCEL_ENV !== "production" || !/^[A-Z]{1,3}-[A-Z0-9]+$/.test(site.googleTagId)) return null;
  const id = site.googleTagId;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
