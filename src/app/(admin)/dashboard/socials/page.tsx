import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import SocialsAdminClient from "./components/SocialsAdminClient";

export default async function SocialsAdminPage() {
  await requireAdminSession("/dashboard/socials");

  const rows = await prisma.socialLink.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const socials = rows.map((s) => ({
    id: s.id,
    label: s.label,
    handle: s.handle,
    href: s.href,
    order: s.order,
  }));

  return <SocialsAdminClient socials={socials} />;
}
