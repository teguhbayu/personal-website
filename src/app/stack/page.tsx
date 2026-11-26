import type { Metadata } from "next";
import { getOwner, getSkillGroups } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { resolveSkillIcon } from "@/lib/skill-icons.server";
import type { ResolvedIcon } from "@/lib/icon-data";
import StackClient from "./components/StackClient";

export async function generateMetadata(): Promise<Metadata> {
  const [owner, skillGroups] = await Promise.all([
    getOwner(),
    getSkillGroups(),
  ]);
  const allTools = skillGroups
    .flatMap((g) => g.items.map((i) => i.name))
    .join(", ");
  return buildPageMetadata(
    "stack",
    "Technical Stack",
    `Production technologies used by ${owner.fullName}: ${allTools}.`,
  );
}

export default async function StackPage() {
  const skillGroups = await getSkillGroups();
  const iconMap: Record<string, ResolvedIcon | null> = {};

  for (const group of skillGroups) {
    for (const item of group.items) {
      if (!(item.id in iconMap)) {
        iconMap[item.id] = resolveSkillIcon(item.id);
      }
    }
  }

  return <StackClient skillGroups={skillGroups} iconMap={iconMap} />;
}
