import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, sanitizeCallbackUrl } from "@/lib/admin-auth";
import LoginClient from "./components/LoginClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: {
    index: false,
    follow: false,
  },
};

interface LoginPageProps {
  searchParams: Promise<{
    callbackURL?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackURL = sanitizeCallbackUrl(params.callbackURL);
  const authResult = await getAdminSession();

  if (authResult.status === "authenticated") {
    redirect(callbackURL);
  }

  const unauthorizedEmail =
    authResult.status === "unauthorized" ? authResult.session.user.email : null;

  const isOwnerRejection =
    params.error === "unauthorized" ||
    params.error === "unable_to_create_user" ||
    params.error === "unable_to_create_session";

  const initialError =
    isOwnerRejection && !unauthorizedEmail
      ? "Sign-in is restricted to the configured owner email address."
      : params.error && !isOwnerRejection
        ? "Sign-in failed. Please try again."
        : null;

  return (
    <LoginClient
      callbackURL={callbackURL}
      unauthorizedEmail={unauthorizedEmail}
      initialError={initialError}
    />
  );
}
