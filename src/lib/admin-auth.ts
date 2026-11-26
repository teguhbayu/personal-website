import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAllowedOwnerEmail } from "@/lib/owner-email";

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type AdminSessionResult =
  | { status: "authenticated"; session: AuthSession }
  | { status: "unauthorized"; session: AuthSession }
  | { status: "unauthenticated" };

export function sanitizeCallbackUrl(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/dashboard") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export async function getAdminSession(): Promise<AdminSessionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { status: "unauthenticated" };
  }

  if (!isAllowedOwnerEmail(session.user.email)) {
    return { status: "unauthorized", session };
  }

  return { status: "authenticated", session };
}

export async function requireAdminSession(
  callbackPath = "/dashboard",
): Promise<AuthSession> {
  const result = await getAdminSession();

  if (result.status === "unauthenticated") {
    const safeCallback = sanitizeCallbackUrl(callbackPath);
    redirect(`/login?callbackURL=${encodeURIComponent(safeCallback)}`);
  }

  if (result.status === "unauthorized") {
    redirect("/login?error=unauthorized");
  }

  return result.session;
}
