import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import AwardsAdminClient from "./components/AwardsAdminClient";

export default async function AwardsAdminPage() {
  await requireAdminSession("/dashboard/awards");

  const rows = await prisma.certificate.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const certificates = rows.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category as "COMPETITION" | "LANGUAGE",
    image: c.image,
    href: c.href ?? "",
    detail: c.detail,
    issuerScope: c.issuerScope,
    order: c.order,
  }));

  return <AwardsAdminClient certificates={certificates} />;
}
