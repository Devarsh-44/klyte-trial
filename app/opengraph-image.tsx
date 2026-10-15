import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { FLAVORS, POSITIONING } from "@/lib/data";

export const alt = "Klyte. Hydration, recharged.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card, built from the same fonts and can colours as the page. */
export default async function OpengraphImage() {
  const fonts = join(process.cwd(), "node_modules/@fontsource");
  const [anton, titan] = await Promise.all([
    readFile(join(fonts, "anton/files/anton-latin-400-normal.woff")),
    readFile(join(fonts, "titan-one/files/titan-one-latin-400-normal.woff")),
  ]);
  const [melon] = FLAVORS;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "72px 88px",
          background: `radial-gradient(60% 80% at 78% 50%, ${melon.glow}55, #0B0B0C 70%)`,
          color: "#F4F1EA",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(120% 120% at 30% 0%, #7A0035 0%, #E6006E 55%, #FFD6E6 100%)",
                fontFamily: "Titan One",
                fontSize: 38,
                color: "#fff",
              }}
            >
              k
            </div>
            <div style={{ fontFamily: "Titan One", fontSize: 48 }}>klyte</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 48,
              fontFamily: "Anton",
              fontSize: 128,
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            <span>Hydration,</span>
            <span style={{ display: "flex" }}>
              recharged<span style={{ color: melon.hex }}>.</span>
            </span>
          </div>
          <div style={{ marginTop: 32, fontSize: 30, color: "rgba(244,241,234,0.65)" }}>
            {`${POSITIONING.category}. Zero caffeine, no added sugar.`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "flex-end" }}>
          {FLAVORS.map((f, i) => (
            <div
              key={f.id}
              style={{
                width: 120,
                height: 360,
                borderRadius: "22px / 14px",
                background: `linear-gradient(180deg, ${f.can.top} 0%, ${f.can.top} 42%, ${f.can.mid} 62%, ${f.can.bottom} 100%)`,
                transform: `rotate(${i ? 8 : -8}deg)`,
                boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Titan One", data: titan, weight: 400, style: "normal" },
      ],
    },
  );
}
