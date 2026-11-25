import type { Metadata } from "next";
import { CERTIFICATES, OWNER } from "@/data/portfolio";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(
  "awards",
  "Awards & Certificates",
  `Verified competition wins and language certificates earned by ${OWNER.fullName}: ${CERTIFICATES.map((c) => `${c.name} (${c.detail})`).join(", ")}.`,
);

export default function AwardsPage() {
  return null;
}
