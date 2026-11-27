import type { ReactElement } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

const MAX_WHATSAPP_BYTES = 260_000;

export function optimizeCloudinaryUrl(url: string, transform: string): string {
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1 || !url.includes("res.cloudinary.com")) {
    return url;
  }
  const prefix = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  if (/^(?:[a-z]{1,3}_[^/]+,)*[a-z]{1,3}_[^/]+\//i.test(rest)) {
    return url;
  }
  return `${prefix}${transform}/${rest}`;
}

export async function resolveOgImageSrc(
  raw?: string,
  cloudinaryTransform?: string,
): Promise<string | null> {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return cloudinaryTransform
      ? optimizeCloudinaryUrl(trimmed, cloudinaryTransform)
      : trimmed;
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

export async function renderOgJpegResponse(
  element: ReactElement,
): Promise<Response> {
  const pngResponse = new ImageResponse(element, OG_SIZE);
  const pngBuffer = Buffer.from(await pngResponse.arrayBuffer());

  let jpegBuffer = await sharp(pngBuffer)
    .flatten({ background: "#07142B" })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer();

  if (jpegBuffer.byteLength > MAX_WHATSAPP_BYTES) {
    jpegBuffer = await sharp(pngBuffer)
      .flatten({ background: "#07142B" })
      .jpeg({ quality: 68, progressive: true, mozjpeg: true })
      .toBuffer();
  }

  if (jpegBuffer.byteLength > MAX_WHATSAPP_BYTES) {
    jpegBuffer = await sharp(pngBuffer)
      .flatten({ background: "#07142B" })
      .jpeg({ quality: 54, progressive: true, mozjpeg: true })
      .toBuffer();
  }

  return new Response(new Uint8Array(jpegBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpegBuffer.byteLength),
      "Cache-Control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export function buildOgImageMeta(url: string, alt: string) {
  return {
    url,
    secureUrl: url,
    type: "image/jpeg",
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt,
  };
}
