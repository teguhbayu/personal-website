import type { Metadata } from "next";
import { getOwner } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const owner = await getOwner();
  return buildPageMetadata(
    "home",
    owner.fullName,
    `${owner.fullName}, ${owner.role} at ${owner.school} in ${owner.location}. 1st Place National LKS Cloud Computing and TOEIC 935/990.`,
  );
}

export default function Home() {
  return null;
}
