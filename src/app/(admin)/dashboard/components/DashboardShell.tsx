"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiAward,
  FiBarChart2,
  FiCheckSquare,
  FiExternalLink,
  FiFileText,
  FiFolder,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiRefreshCw,
  FiSettings,
  FiShare2,
  FiShield,
  FiX,
} from "react-icons/fi";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    subtitle: "Portfolio content summary and quick actions",
    icon: FiBarChart2,
  },
  {
    href: "/dashboard/config",
    label: "Site Config",
    subtitle: "Key-value copy, profile details, and biography",
    icon: FiSettings,
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    subtitle: "Shipped web platforms and project screenshots",
    icon: FiFolder,
  },
  {
    href: "/dashboard/stack",
    label: "Tech Stack",
    subtitle: "Engineering layers and core technology items",
    icon: FiLayers,
  },
  {
    href: "/dashboard/awards",
    label: "Awards & Certs",
    subtitle: "Competitions, language scores, and certificate scans",
    icon: FiAward,
  },
  {
    href: "/dashboard/ledger",
    label: "Verified Record",
    subtitle: "Practice highlights and verified milestones",
    icon: FiCheckSquare,
  },
  {
    href: "/dashboard/socials",
    label: "Social Links",
    subtitle: "Public profile links and handles",
    icon: FiShare2,
  },
  {
    href: "/dashboard/posts",
    label: "Blog Posts",
    subtitle: "Articles, drafts, and header imagery",
    icon: FiFileText,
  },
];

const PUBLIC_LINKS = [
  { href: "/", label: "Portfolio Home" },
  { href: "/blog", label: "Public Blog" },
  { href: "/projects", label: "Public Projects" },
  { href: "/awards", label: "Public Awards" },
];

interface DashboardShellProps {
  userName: string;
  userEmail: string;
  userPFP?: string | null;
  children: React.ReactNode;
}

export default function DashboardShell({
  userName,
  userEmail,
  userPFP,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const activeNav =
    NAV_ITEMS.find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href),
    ) ?? NAV_ITEMS[0];

  const ActiveIcon = activeNav.icon;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sheet-alt text-ink">
      <div className="p-4 border-b border-rule flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-h-[44px]"
          >
            <div className="min-w-0">
              <p className="font-display font-extrabold text-base tracking-tight text-ink leading-tight uppercase truncate">
                teguhbayu
              </p>
              <p className="font-mono text-[11px] text-ink-muted uppercase truncate">
                Admin Panel
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-rule bg-sheet text-ink rounded-sm"
          >
            <FiX aria-hidden={true} className="text-base" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6">
        <nav aria-label="Dashboard sections" className="flex flex-col gap-1.5">
          <p className="px-2 pb-1 font-mono text-[11px] text-ink-muted uppercase tracking-wider">
            Main Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`min-h-[44px] px-3 py-2 rounded-sm border text-xs font-mono uppercase tracking-wide flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-accent-strong text-white border-accent-strong font-medium"
                    : "bg-transparent border-transparent text-ink hover:bg-sheet hover:border-rule"
                }`}
              >
                <Icon aria-hidden={true} className="text-sm shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1.5">
          <p className="px-2 pb-1 font-mono text-[11px] text-ink-muted uppercase tracking-wider">
            Public Links
          </p>
          {PUBLIC_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2 rounded-sm border border-rule bg-sheet text-ink text-xs font-mono uppercase tracking-wide flex items-center justify-between gap-2 hover:border-accent-strong transition-colors"
            >
              <span className="truncate">{link.label}</span>
              <FiExternalLink
                aria-hidden={true}
                className="text-xs text-ink-muted shrink-0"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-rule bg-sheet-alt">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="min-h-[46px] w-full px-4 inline-flex items-center justify-center gap-2.5 border border-accent-strong bg-accent-strong/10 text-accent hover:bg-accent-strong hover:text-white font-mono text-xs font-medium uppercase tracking-wide rounded-sm transition-colors disabled:opacity-60"
        >
          <FiLogOut aria-hidden={true} className="text-sm" />
          <span>{signingOut ? "Signing Out..." : "Sign Out Session"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-sheet text-ink flex">
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-rule sticky top-0 h-[100dvh]">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "var(--scrim)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full border-r border-rule">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-rule bg-sheet px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
            >
              <FiMenu aria-hidden={true} className="text-base" />
            </button>
            <div className="hidden sm:flex w-10 h-10 rounded-sm border border-rule bg-sheet-alt items-center justify-center text-accent shrink-0">
              <ActiveIcon aria-hidden={true} className="text-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-ink uppercase truncate">
                {activeNav.label}
              </h1>
              <p className="font-mono text-[11px] text-ink-muted uppercase truncate">
                {activeNav.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="min-h-[44px] pe-3.5 border border-rule bg-sheet-alt rounded-sm hidden md:flex items-center gap-2.5">
              {userPFP && (
                <Image
                  src={userPFP}
                  alt={userName}
                  className="aspect-square h-full"
                  width={50}
                  height={50}
                />
              )}
              <div className="leading-tight">
                <p className="font-mono text-[11px] font-medium text-ink truncate max-w-[180px]">
                  {userName}
                </p>
                <p className="font-mono text-[10px] text-ink-muted truncate max-w-[180px]">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
