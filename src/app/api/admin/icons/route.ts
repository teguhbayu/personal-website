import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getTotalSkillIconCount,
  resolveSkillIcon,
  searchSkillIcons,
} from "@/lib/skill-icons.server";

export async function GET(request: NextRequest) {
  const auth = await getAdminSession();
  if (auth.status === "unauthenticated") {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }
  if (auth.status === "unauthorized") {
    return NextResponse.json(
      { error: "Account not authorized." },
      { status: 403 },
    );
  }

  const { searchParams } = request.nextUrl;
  const keyParam = searchParams.get("key");
  if (keyParam !== null) {
    return NextResponse.json({
      icon: resolveSkillIcon(keyParam),
    });
  }

  const query = searchParams.get("q") ?? "";
  const limitParam = Number(searchParams.get("limit") ?? 24);
  const limit = Number.isFinite(limitParam) ? limitParam : 24;

  return NextResponse.json({
    icons: searchSkillIcons(query, limit),
    total: getTotalSkillIconCount(),
  });
}
