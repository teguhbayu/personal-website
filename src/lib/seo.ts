import type { Metadata } from "next";
import { ChannelId, OWNER } from "@/data/portfolio";
import {
  getCertificates,
  getOwner,
  getProjects,
  getSkillGroups,
  getSocials,
} from "@/lib/data";
import { CHANNEL_ROUTES, pathnameToChannel } from "@/lib/routes";
import { buildOgImageMeta } from "@/lib/og-image";

export { CHANNEL_ROUTES, pathnameToChannel };

export const SITE_URL = "https://teguhbayu.xyz";

export function buildPageMetadata(
  channel: ChannelId,
  title: string,
  description: string,
): Metadata {
  const path = CHANNEL_ROUTES[channel];
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const ogImageUrl = `${SITE_URL}/og/site.jpg`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: OWNER.fullName,
      images: [buildOgImageMeta(ogImageUrl, `${OWNER.fullName} Portfolio`)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export async function buildJsonLd() {
  const [owner, projects, skillGroups, certificates, socials] =
    await Promise.all([
      getOwner(),
      getProjects(),
      getSkillGroups(),
      getCertificates(),
      getSocials(),
    ]);

  const skills = skillGroups.flatMap((g) => g.items.map((item) => item.name));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: owner.fullName,
        alternateName: owner.shortName,
        url: SITE_URL,
        image: `${SITE_URL}${owner.portrait}`,
        jobTitle: owner.role,
        email: `mailto:${owner.email}`,
        description: owner.biography.join(" "),
        affiliation: {
          "@type": "EducationalOrganization",
          name: owner.school,
        },
        homeLocation: {
          "@type": "Place",
          name: owner.location,
        },
        knowsAbout: skills,
        award: certificates.map(
          (c) => `${c.name} (${c.detail}, ${c.issuerScope})`,
        ),
        sameAs: socials.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: owner.fullName,
        description: `${owner.fullName}, ${owner.role} at ${owner.school}.`,
        author: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/projects#list`,
        name: `${owner.fullName} Shipped Projects`,
        itemListElement: projects.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "CreativeWork",
            name: p.name,
            description: p.description,
            url: p.href,
            image: `${SITE_URL}${p.image}`,
            keywords: p.stack.join(", "),
            author: { "@id": `${SITE_URL}/#person` },
          },
        })),
      },
    ],
  };
}
