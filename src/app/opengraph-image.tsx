import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const chips = ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST APIs"];

/**
 * Social share image, rendered on the server with Satori (flexbox subset
 * only). Generated at build time since it uses no request data.
 */
export default async function OpenGraphImage() {
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
          background:
            "linear-gradient(135deg, #08080c 0%, #12101f 55%, #0b1620 100%)",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative glows */}
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(139,92,246,0.45), transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -160,
            bottom: -200,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(34,211,238,0.35), transparent 65%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
              color: "#0a0a0f",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>
            {site.url.replace(/^https?:\/\//, "")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            {profile.name}
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#c4b5fd", fontWeight: 600 }}>
            {profile.title}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", maxWidth: 900, lineHeight: 1.35 }}>
            {profile.tagline}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.05)",
                fontSize: 24,
                color: "#e4e4e7",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
