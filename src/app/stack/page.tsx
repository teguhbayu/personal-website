import type { Metadata } from "next";
import { OWNER, SKILL_GROUPS } from "@/data/portfolio";
import { buildPageMetadata } from "@/lib/seo";

const allTools = SKILL_GROUPS.flatMap((g) => g.items.map((i) => i.name)).join(
  ", ",
);

export const metadata: Metadata = buildPageMetadata(
  "stack",
  "Technical Stack",
  `Production technologies used by ${OWNER.fullName}: ${allTools}.`,
);

export default function StackPage() {
  return null;
}
