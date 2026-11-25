import type { Metadata } from "next";
import { OWNER, PROJECTS } from "@/data/portfolio";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(
  "projects",
  "Projects",
  `Shipped web platforms by ${OWNER.fullName}: ${PROJECTS.map((p) => p.name).join(", ")}.`,
);

export default function ProjectsPage() {
  return null;
}
