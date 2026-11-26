"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa6";
import { authClient } from "@/lib/auth-client";

interface LoginClientProps {
  callbackURL: string;
  unauthorizedEmail: string | null;
  initialError: string | null;
}

export default function LoginClient({
  callbackURL,
  unauthorizedEmail,
  initialError,
}: LoginClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL: "/login",
      });
      if (result?.error) {
        setError(result.error.message || "Unable to start Google sign-in.");
        setLoading(false);
      }
    } catch {
      setError("Unable to reach the authentication server. Try again.");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.replace(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
      router.refresh();
    } catch {
      setError("Could not sign out. Clear your cookies and try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-sheet text-ink flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md border border-rule bg-sheet-alt rounded-md p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-rule pb-4">
          <div className="inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-block w-3 h-3 bg-accent-strong"
            />
            <span className="font-mono text-xs uppercase text-accent font-medium">
              Admin Access
            </span>
          </div>
          <Link
            href="/"
            className="min-h-[44px] px-3 inline-flex items-center font-mono text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Back to Site
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
            Sign in to Dashboard
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Authentication is required to access routes under{" "}
            <span className="font-mono text-ink">/dashboard</span>.
          </p>
        </div>

        {unauthorizedEmail && (
          <div
            role="alert"
            className="p-4 border border-accent-strong bg-sheet rounded-sm flex flex-col gap-3"
          >
            <p className="text-sm font-medium text-ink">
              Account not authorized
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              You are signed in as{" "}
              <span className="font-mono text-ink">{unauthorizedEmail}</span>,
              which does not match the configured owner email address.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="min-h-[44px] px-4 inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink text-xs font-mono rounded-sm hover:border-accent-strong transition-colors disabled:opacity-60"
            >
              {signingOut ? "Signing out..." : "Sign Out and Switch Account"}
            </button>
          </div>
        )}

        {error && !unauthorizedEmail && (
          <div
            role="alert"
            className="p-3.5 border border-accent-strong bg-sheet text-sm text-ink rounded-sm"
          >
            {error}
          </div>
        )}

        {!unauthorizedEmail && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="min-h-[48px] w-full px-5 inline-flex items-center justify-center gap-3 bg-accent-strong text-white text-sm font-semibold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <FaGoogle aria-hidden="true" className="text-base" />
            <span>
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </span>
          </button>
        )}
      </div>
    </main>
  );
}
