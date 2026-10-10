import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Production-only CSP (dev needs eval for HMR). Inline scripts are required by
// Next.js hydration unless nonces are used, which would make every page dynamic.
const csp = [
  "default-src 'self'",
  // Paddle.js (card checkout overlay). Hosts follow Paddle's CSP guidance; verify in the sandbox.
  "script-src 'self' 'unsafe-inline' https://cdn.paddle.com",
  "style-src 'self' 'unsafe-inline' https://cdn.paddle.com",
  "img-src 'self' data: blob: https://*.paddle.com",
  "font-src 'self' data: https://*.paddle.com",
  "connect-src 'self' https://*.paddle.com",
  "frame-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com",
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
