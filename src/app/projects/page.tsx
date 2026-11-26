import type { Metadata } from "next";
import { getOwner, getProjects } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import ProjectsClient from "./components/ProjectsClient";

export async function generateMetadata(): Promise<Metadata> {
  const [owner, projects] = await Promise.all([getOwner(), getProjects()]);
  return buildPageMetadata(
    "projects",
    "Projects",
    `Shipped web platforms by ${owner.fullName}: ${projects.map((p) => p.name).join(", ")}.`,
  );
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}
