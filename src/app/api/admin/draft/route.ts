import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSlug = (url.searchParams.get("slug") ?? "").trim().toLowerCase();
  const targetPath = SAFE_SLUG_RE.test(rawSlug)
    ? `/blog/${encodeURIComponent(rawSlug)}`
    : "/blog";

  const auth = await getAdminSession();
  if (auth.status !== "authenticated") {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackURL", `${url.pathname}${url.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const dm = await draftMode();
  dm.enable();

  return NextResponse.redirect(new URL(targetPath, url.origin));
}
