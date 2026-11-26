import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import LedgerAdminClient from "./components/LedgerAdminClient";

export default async function LedgerAdminPage() {
  await requireAdminSession("/dashboard/ledger");

  const rows = await prisma.verifiedLedger.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const entries = rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    scope: row.scope,
    order: row.order,
  }));

  return <LedgerAdminClient entries={entries} />;
}
