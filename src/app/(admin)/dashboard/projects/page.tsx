import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import ProjectsAdminClient from "./components/ProjectsAdminClient";

export default async function ProjectsAdminPage() {
  await requireAdminSession("/dashboard/projects");

  const rows = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const projects = rows.map((p) => ({
    id: p.id,
    index: p.index,
    name: p.name,
    subtitle: p.subtitle,
    description: p.description,
    image: p.image,
    href: p.href,
    host: p.host,
    stack: Array.isArray(p.stack) ? p.stack.map(String) : [],
    order: p.order,
  }));

  return <ProjectsAdminClient projects={projects} />;
}
