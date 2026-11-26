import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin-auth";
import DashboardShell from "./components/DashboardShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  return (
    <DashboardShell
      userName={session.user.name}
      userEmail={session.user.email}
      userPFP={session.user.image}
    >
      {children}
    </DashboardShell>
  );
}
