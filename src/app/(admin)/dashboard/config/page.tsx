import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { OWNER } from "@/data/portfolio";
import ConfigClient from "./components/ConfigClient";

export default async function ConfigPage() {
  await requireAdminSession("/dashboard/config");

  const rows = await prisma.siteConfig.findMany({
    orderBy: { key: "asc" },
  });

  const map = new Map(rows.map((r) => [r.key, r.value]));

  const initialOwner = {
    fullName: map.get("owner.fullName") ?? OWNER.fullName,
    shortName: map.get("owner.shortName") ?? OWNER.shortName,
    role: map.get("owner.role") ?? OWNER.role,
    school: map.get("owner.school") ?? OWNER.school,
    location: map.get("owner.location") ?? OWNER.location,
    email: map.get("owner.email") ?? OWNER.email,
    portrait: map.get("owner.portrait") ?? OWNER.portrait,
    leadStatement: map.get("owner.leadStatement") ?? OWNER.leadStatement,
    biography: map.get("owner.biography") ?? OWNER.biography.join("\n\n"),
  };

  const reservedKeys = new Set([
    "owner.fullName",
    "owner.shortName",
    "owner.role",
    "owner.school",
    "owner.location",
    "owner.email",
    "owner.portrait",
    "owner.leadStatement",
    "owner.biography",
  ]);

  const customEntries = rows
    .filter((r) => !reservedKeys.has(r.key))
    .map((r) => ({
      id: r.id,
      key: r.key,
      value: r.value,
    }));

  return (
    <ConfigClient initialOwner={initialOwner} customEntries={customEntries} />
  );
}
