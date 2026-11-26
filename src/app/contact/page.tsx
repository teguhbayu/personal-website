import type { Metadata } from "next";
import { getOwner, getSocials } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import ContactClient from "./components/ContactClient";

export async function generateMetadata(): Promise<Metadata> {
  const owner = await getOwner();
  return buildPageMetadata(
    "contact",
    "Contact",
    `Contact ${owner.fullName} (${owner.email}) for freelance web development, AWS cloud architecture, and software engineering collaboration.`,
  );
}

export default async function ContactPage() {
  const [owner, socials] = await Promise.all([getOwner(), getSocials()]);
  return <ContactClient email={owner.email} socials={socials} />;
}
