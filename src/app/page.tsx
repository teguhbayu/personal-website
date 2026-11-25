import type { Metadata } from "next";
import { OWNER } from "@/data/portfolio";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(
  "home",
  OWNER.fullName,
  `${OWNER.fullName}, ${OWNER.role} at ${OWNER.school} in ${OWNER.location}. 1st Place National LKS Cloud Computing and TOEIC 935/990.`,
);

export default function Home() {
  return null;
}
