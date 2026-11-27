import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSlug = (url.searchParams.get("slug") ?? "").trim().toLowerCase();
  const targetPath = SAFE_SLUG_RE.test(rawSlug)
    ? `/blog/${encodeURIComponent(rawSlug)}`
    : "/blog";

  const dm = await draftMode();
  dm.disable();

  return NextResponse.redirect(new URL(targetPath, url.origin));
}
