import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import OverviewClient from "./components/OverviewClient";

export default async function DashboardPage() {
  await requireAdminSession("/dashboard");

  const [
    configCount,
    projectCount,
    skillGroupCount,
    skillItemCount,
    certCount,
    ledgerCount,
    socialCount,
    postCount,
  ] = await Promise.all([
    prisma.siteConfig.count(),
    prisma.project.count(),
    prisma.skillGroup.count(),
    prisma.skillItem.count(),
    prisma.certificate.count(),
    prisma.verifiedLedger.count(),
    prisma.socialLink.count(),
    prisma.blogPost.count(),
  ]);

  const metrics = [
    {
      label: "Site Config",
      count: configCount,
      note: "Key-value profile & copy entries",
      href: "/dashboard/config",
    },
    {
      label: "Projects",
      count: projectCount,
      note: "Shipped platforms & screenshots",
      href: "/dashboard/projects",
    },
    {
      label: "Tech Stack",
      count: skillItemCount,
      note: `Across ${skillGroupCount} engineering layers`,
      href: "/dashboard/stack",
    },
    {
      label: "Awards & Certs",
      count: certCount,
      note: "Competition & language records",
      href: "/dashboard/awards",
    },
    {
      label: "Verified Record",
      count: ledgerCount,
      note: "Practice milestones & scores",
      href: "/dashboard/ledger",
    },
    {
      label: "Social Links",
      count: socialCount,
      note: "Contact & footer profile links",
      href: "/dashboard/socials",
    },
    {
      label: "Blog Posts",
      count: postCount,
      note: "Published & draft articles",
      href: "/dashboard/posts",
    },
  ];

  const hasAnyData =
    configCount +
      projectCount +
      skillGroupCount +
      certCount +
      ledgerCount +
      socialCount >
    0;

  return <OverviewClient metrics={metrics} hasAnyData={hasAnyData} />;
}
