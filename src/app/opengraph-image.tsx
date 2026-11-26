import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getOwner } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Teguh Bayu Pratama Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function resolvePortraitSrc(raw?: string): Promise<string | null> {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    try {
      const publicDir = path.resolve(process.cwd(), "public");
      const fullPath = path.resolve(publicDir, trimmed.slice(1));
      if (!fullPath.startsWith(publicDir)) return null;
      const buf = await readFile(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  }
  return null;
}

export default async function RootOpenGraphImage() {
  const owner = await getOwner();
  const portraitSrc = await resolvePortraitSrc(owner.portrait);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "linear-gradient(180deg, #7AB8F5 0%, #B8DCFA 56%, #DCEFFF 100%)",
          padding: 40,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 72,
            width: 240,
            height: 84,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.48)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 90,
            width: 280,
            height: 92,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.52)",
            display: "flex",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#F5F2EB",
            color: "#07142B",
            border: "2px solid rgba(7, 20, 43, 0.18)",
            borderRadius: 12,
            padding: "44px 52px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 9,
              backgroundColor: "#C81038",
              display: "flex",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 44,
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 18,
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#C81038",
                    display: "flex",
                  }}
                />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#C81038",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {owner.location}
                </span>
              </div>

              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                  color: "#07142B",
                  display: "flex",
                }}
              >
                {owner.fullName}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#2E4263",
                  display: "flex",
                }}
              >
                {owner.role} · {owner.school}
              </div>

              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.42,
                  color: "#2E4263",
                  maxWidth: 680,
                  display: "flex",
                }}
              >
                {owner.leadStatement}
              </div>
            </div>

            {portraitSrc && (
              <div
                style={{
                  width: 280,
                  height: 336,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  backgroundColor: "#E9E4D8",
                  border: "2px solid rgba(7, 20, 43, 0.16)",
                  borderRadius: 10,
                  overflow: "hidden",
                  paddingTop: 18,
                  flexShrink: 0,
                }}
              >
                <img
                  src={portraitSrc}
                  alt={owner.fullName}
                  width={260}
                  height={318}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom",
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid rgba(7, 20, 43, 0.16)",
              paddingTop: 20,
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 19,
                fontWeight: 600,
                color: "#2E4263",
              }}
            >
              {owner.email}
            </span>

            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#07142B",
              }}
            >
              teguhbayu.xyz
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
