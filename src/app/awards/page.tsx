import type { Metadata } from "next";
import { getCertificates, getOwner } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import AwardsClient from "./components/AwardsClient";

export async function generateMetadata(): Promise<Metadata> {
  const [owner, certificates] = await Promise.all([
    getOwner(),
    getCertificates(),
  ]);
  return buildPageMetadata(
    "awards",
    "Awards & Certificates",
    `Verified competition wins and language certificates earned by ${owner.fullName}: ${certificates.map((c) => `${c.name} (${c.detail})`).join(", ")}.`,
  );
}

export default async function AwardsPage() {
  const certificates = await getCertificates();
  return <AwardsClient certificates={certificates} />;
}
