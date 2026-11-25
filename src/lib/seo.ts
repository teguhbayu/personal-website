import type { Metadata } from "next";
import {
  CERTIFICATES,
  ChannelId,
  OWNER,
  PROJECTS,
  SKILL_GROUPS,
  SOCIALS,
} from "@/data/portfolio";

export const SITE_URL = "https://teguhbayu.xyz";

export const CHANNEL_ROUTES: Record<ChannelId, string> = {
  home: "/",
  practice: "/practice",
  projects: "/projects",
  stack: "/stack",
  awards: "/awards",
  contact: "/contact",
};

export function pathnameToChannel(
  pathname: string | null,
): Exclude<ChannelId, "home"> | null {
  if (!pathname) return null;
  const clean = pathname.replace(/\/+$/, "") || "/";
  switch (clean) {
    case "/practice":
      return "practice";
    case "/projects":
      return "projects";
    case "/stack":
      return "stack";
    case "/awards":
      return "awards";
    case "/contact":
      return "contact";
    default:
      return null;
  }
}

export function buildPageMetadata(
  channel: ChannelId,
  title: string,
  description: string,
): Metadata {
  const path = CHANNEL_ROUTES[channel];
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
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
      images: [
        {
          url: `${SITE_URL}${OWNER.portrait}`,
          alt: `${OWNER.fullName} portrait`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}${OWNER.portrait}`],
    },
  };
}

export function buildJsonLd() {
  const skills = SKILL_GROUPS.flatMap((g) => g.items.map((item) => item.name));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: OWNER.fullName,
        alternateName: OWNER.shortName,
        url: SITE_URL,
        image: `${SITE_URL}${OWNER.portrait}`,
        jobTitle: OWNER.role,
        email: `mailto:${OWNER.email}`,
        description: OWNER.biography.join(" "),
        affiliation: {
          "@type": "EducationalOrganization",
          name: OWNER.school,
        },
        homeLocation: {
          "@type": "Place",
          name: OWNER.location,
        },
        knowsAbout: skills,
        award: CERTIFICATES.map(
          (c) => `${c.name} (${c.detail}, ${c.issuerScope})`,
        ),
        sameAs: SOCIALS.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: OWNER.fullName,
        description: `${OWNER.fullName}, ${OWNER.role} at ${OWNER.school}.`,
        author: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/projects#list`,
        name: `${OWNER.fullName} Shipped Projects`,
        itemListElement: PROJECTS.map((p, idx) => ({
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
