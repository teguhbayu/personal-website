import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveSkillIcon } from "@/lib/skill-icons.server";
import StackAdminClient from "./components/StackAdminClient";

export default async function StackAdminPage() {
  await requireAdminSession("/dashboard/stack");

  const rows = await prisma.skillGroup.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      items: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const groups = rows.map((g) => ({
    id: g.id,
    index: g.index,
    domain: g.domain,
    summary: g.summary,
    order: g.order,
    items: g.items.map((item) => ({
      id: item.id,
      name: item.name,
      note: item.note,
      iconKey: item.iconKey ?? "",
      icon: resolveSkillIcon(item.iconKey),
      order: item.order,
      groupId: item.groupId,
    })),
  }));

  return <StackAdminClient groups={groups} />;
}
