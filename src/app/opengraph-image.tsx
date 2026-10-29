import { ImageResponse } from "next/og";

export const alt = "GrowX: The Ultimate X (Twitter) Growth Tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const chips = ["Smart auto follow", "Post scheduler", "GrowX AI writer", "Analytics", "Unfollower tracker"];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #FF4B5C 0%, #E11D2E 50%, #9F1239 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>GrowX</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 980 }}>The Ultimate X (Twitter) Growth Tool</div>
          <div style={{ display: "flex", fontSize: 32, marginTop: 24, opacity: 0.9 }}>One Chrome extension to grow, post, engage and measure on X.</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {chips.map((c) => (
            <div key={c} style={{ display: "flex", fontSize: 24, fontWeight: 700, padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)" }}>
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
