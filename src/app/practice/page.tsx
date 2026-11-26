import type { Metadata } from "next";
import { getOwner, getVerifiedLedger } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import PracticeView from "./components/PracticeView";

export async function generateMetadata(): Promise<Metadata> {
  const owner = await getOwner();
  return buildPageMetadata(
    "practice",
    "Practice",
    `${owner.leadStatement} ${owner.biography[0]}`,
  );
}

export default async function PracticePage() {
  const [owner, ledger] = await Promise.all([getOwner(), getVerifiedLedger()]);
  return <PracticeView owner={owner} ledger={ledger} />;
}
