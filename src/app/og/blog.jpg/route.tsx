import { getOwner, getPublishedBlogPosts } from "@/lib/data";
import { renderOgJpegResponse } from "@/lib/og-image";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const [owner, posts] = await Promise.all([
    getOwner(),
    getPublishedBlogPosts(),
  ]);

  const articleLabel =
    posts.length === 1
      ? "1 PUBLISHED ARTICLE"
      : `${posts.length} PUBLISHED ARTICLES`;

  return renderOgJpegResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F5F2EB",
        color: "#07142B",
        padding: "56px 64px",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          backgroundColor: "#C81038",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid rgba(7, 20, 43, 0.16)",
          paddingBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 22,
              height: 22,
              backgroundColor: "#C81038",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#07142B",
            }}
          >
            {owner.fullName}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            backgroundColor: "#E9E4D8",
            border: "2px solid rgba(7, 20, 43, 0.16)",
            borderRadius: 6,
            fontSize: 18,
            fontWeight: 700,
            color: "#C81038",
            letterSpacing: "0.06em",
          }}
        >
          {articleLabel}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 12,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#C81038",
            letterSpacing: "0.1em",
          }}
        >
          WRITING &amp; ENGINEERING NOTES
        </span>
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: "#07142B",
            display: "flex",
          }}
        >
          Blog Archive
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1.4,
            color: "#2E4263",
            maxWidth: 920,
            display: "flex",
          }}
        >
          Notes on full-stack web engineering, AWS cloud architecture, and
          production software systems.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "2px solid rgba(7, 20, 43, 0.16)",
          paddingTop: 24,
          fontSize: 22,
          color: "#2E4263",
        }}
      >
        <span>{owner.role}</span>
        <span style={{ color: "#07142B", fontWeight: 700 }}>
          teguhbayu.xyz/blog
        </span>
      </div>
    </div>,
  );
}
