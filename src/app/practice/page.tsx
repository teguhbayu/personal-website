import type { Metadata } from "next";
import { OWNER } from "@/data/portfolio";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(
  "practice",
  "Practice",
  `${OWNER.leadStatement} ${OWNER.biography[0]}`,
);

export default function PracticePage() {
  return null;
}
