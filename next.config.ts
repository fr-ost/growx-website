import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Hosts the Google tag (gtag.js, Google Ads) loads from and reports to, per Google's CSP guide.
const google = {
  script: "https://www.googletagmanager.com https://*.googletagmanager.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://www.google.com",
  img: "https://*.googletagmanager.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.google.com.bd https://td.doubleclick.net",
  connect: "https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.google.com.bd https://td.doubleclick.net",
  frame: "https://td.doubleclick.net https://www.googletagmanager.com",
};

// Production-only CSP (dev needs eval for HMR). Inline scripts are required by
// Next.js hydration unless nonces are used, which would make every page dynamic.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${google.script}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${google.img}`,
  "font-src 'self' data:",
  `connect-src 'self' ${google.connect}`,
  `frame-src ${google.frame}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const headers = process.env.NODE_ENV === "production" ? [...securityHeaders, { key: "Content-Security-Policy", value: csp }] : securityHeaders;
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
