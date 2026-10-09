import { ImageResponse } from "next/og";

export const alt = "GrowX - Auto follow for X (Twitter), at a human pace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #FF5A68 0%, #E11D2E 50%, #9F1239 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>GrowX</div>
        <div style={{ fontSize: 48, marginTop: 24, maxWidth: 900, lineHeight: 1.2 }}>
          Auto follow for X (Twitter), at a human pace.
        </div>
        <div style={{ fontSize: 30, marginTop: 40, opacity: 0.9 }}>Chrome extension · Free core features</div>
      </div>
    ),
    size,
  );
}
