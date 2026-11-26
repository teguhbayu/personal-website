import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getBlogPostBySlug, getOwner } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Blog article preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function resolveOgImageSrc(raw?: string): Promise<string | null> {
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

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}...`;
}

export default async function BlogArticleOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, owner] = await Promise.all([
    getBlogPostBySlug(slug),
    getOwner(),
  ]);

  const isPublic =
    post && (post.visibility === "PUBLISHED" || post.visibility === "UNLISTED");

  if (!isPublic) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 16,
            backgroundColor: "#F5F2EB",
            color: "#07142B",
            padding: "56px 64px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 900, display: "flex" }}>
            Blog Article
          </div>
          <div style={{ fontSize: 22, color: "#2E4263", display: "flex" }}>
            {owner.fullName} · teguhbayu.xyz/blog
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const headerImgSrc = await resolveOgImageSrc(post.headerImage);
  const hasBg = Boolean(headerImgSrc);
  const titleText = truncateText(post.title, 86);
  const excerptText = truncateText(post.excerpt, 160);
  const titleSize =
    titleText.length > 56 ? 48 : titleText.length > 36 ? 58 : 68;

  const fgPrimary = hasBg ? "#F5F2EB" : "#07142B";
  const fgMuted = hasBg ? "#D4DFEE" : "#2E4263";
  const ruleColor = hasBg
    ? "rgba(245, 242, 235, 0.24)"
    : "rgba(7, 20, 43, 0.16)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: hasBg ? "#07142B" : "#F5F2EB",
          color: fgPrimary,
          padding: "52px 60px",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {headerImgSrc && (
          <img
            src={headerImgSrc}
            alt={post.title}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
            }}
          />
        )}

        {hasBg && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              backgroundImage:
                "linear-gradient(180deg, rgba(7, 20, 43, 0.12) 0%, rgba(7, 20, 43, 0.42) 45%, rgba(7, 20, 43, 0.92) 100%)",
              display: "flex",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: fgPrimary,
              maxWidth: 1040,
              display: "flex",
            }}
          >
            {titleText}
          </div>
          <div
            style={{
              fontSize: 25,
              lineHeight: 1.4,
              color: fgMuted,
              maxWidth: 960,
              display: "flex",
            }}
          >
            {excerptText}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${ruleColor}`,
            paddingTop: 20,
            fontSize: 20,
            color: fgMuted,
          }}
        >
          <span>By {post.authorName}</span>
          <span style={{ color: fgPrimary, fontWeight: 700 }}>
            teguhbayu.xyz/blog/{truncateText(post.slug, 38)}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
