import type { Metadata } from "next";
import { OWNER } from "@/data/portfolio";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(
  "contact",
  "Contact",
  `Contact ${OWNER.fullName} (${OWNER.email}) for freelance web development, AWS cloud architecture, and software engineering collaboration.`,
);

export default function ContactPage() {
  return null;
}
