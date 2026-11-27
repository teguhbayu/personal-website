import {
  CERTIFICATES,
  CertificateItem,
  OWNER,
  PROJECTS,
  ProjectItem,
  SKILL_GROUPS,
  SkillGroup,
  SOCIALS,
  SocialLink,
  VERIFIED_LEDGER,
} from "@/data/portfolio";
import { prisma } from "@/lib/prisma";

export type OwnerData = typeof OWNER;
export type LedgerEntry = (typeof VERIFIED_LEDGER)[number];

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  headerImage: string;
  excerpt: string;
  readingMinutes: number;
  authorName: string;
  publishedAt: string;
  editedAt: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  body: string;
  visibility: "DRAFT" | "PUBLISHED" | "UNLISTED" | "PRIVATE";
}

export interface PaginatedBlogPosts {
  posts: BlogPostSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^:::[a-zA-Z0-9_-]*\s*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(md: string, maxLength = 175): string {
  const plain = stripMarkdown(md);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

function estimateReadingMinutes(md: string): number {
  const words = stripMarkdown(md).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export async function getOwner(): Promise<OwnerData> {
  try {
    const rows = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            "owner.fullName",
            "owner.shortName",
            "owner.role",
            "owner.school",
            "owner.location",
            "owner.email",
            "owner.portrait",
            "owner.leadStatement",
            "owner.biography",
          ],
        },
      },
    });

    if (rows.length === 0) return OWNER;
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const bioRaw = map.get("owner.biography");
    const biography = bioRaw
      ? bioRaw
          .split(/\r?\n\s*\r?\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : OWNER.biography;

    return {
      fullName: map.get("owner.fullName") || OWNER.fullName,
      shortName: map.get("owner.shortName") || OWNER.shortName,
      role: map.get("owner.role") || OWNER.role,
      school: map.get("owner.school") || OWNER.school,
      location: map.get("owner.location") || OWNER.location,
      email: map.get("owner.email") || OWNER.email,
      portrait: map.get("owner.portrait") || OWNER.portrait,
      leadStatement: map.get("owner.leadStatement") || OWNER.leadStatement,
      biography: biography.length > 0 ? biography : OWNER.biography,
    };
  } catch {
    return OWNER;
  }
}

export async function getVerifiedLedger(): Promise<LedgerEntry[]> {
  try {
    const rows = await prisma.verifiedLedger.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return VERIFIED_LEDGER;
    return rows.map((r) => ({
      label: r.label,
      value: r.value,
      scope: r.scope,
    }));
  } catch {
    return VERIFIED_LEDGER;
  }
}

export async function getProjects(): Promise<ProjectItem[]> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return PROJECTS;
    return rows.map((p) => ({
      id: p.id,
      index: p.index,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      image: p.image,
      href: p.href,
      host: p.host,
      stack: Array.isArray(p.stack)
        ? p.stack.map((item) => String(item))
        : [],
    }));
  } catch {
    return PROJECTS;
  }
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  try {
    const rows = await prisma.skillGroup.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        items: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });
    if (rows.length === 0) return SKILL_GROUPS;
    return rows.map((g) => ({
      id: g.id,
      index: g.index,
      domain: g.domain,
      summary: g.summary,
      items: g.items.map((item) => ({
        id: item.iconKey || item.id,
        name: item.name,
        note: item.note,
      })),
    }));
  } catch {
    return SKILL_GROUPS;
  }
}

export async function getCertificates(): Promise<CertificateItem[]> {
  try {
    const rows = await prisma.certificate.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return CERTIFICATES;
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category === "COMPETITION" ? "competition" : "language",
      image: c.image,
      href: c.href ?? undefined,
      detail: c.detail,
      issuerScope: c.issuerScope,
    }));
  } catch {
    return CERTIFICATES;
  }
}

export async function getSocials(): Promise<SocialLink[]> {
  try {
    const rows = await prisma.socialLink.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return SOCIALS;
    return rows.map((s) => ({
      id: s.id,
      label: s.label,
      handle: s.handle,
      href: s.href,
    }));
  } catch {
    return SOCIALS;
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { visibility: "PUBLISHED" },
      orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
      include: {
        written_by: {
          select: { name: true },
        },
      },
    });

    return rows.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      headerImage: post.headerImage,
      excerpt: extractExcerpt(post.body),
      readingMinutes: estimateReadingMinutes(post.body),
      authorName: post.written_by.name,
      publishedAt: (post.published_at ?? post.created_at).toISOString(),
      editedAt: post.edited_at ? post.edited_at.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export async function getPaginatedBlogPosts(options?: {
  page?: number;
  pageSize?: number;
  query?: string;
}): Promise<PaginatedBlogPosts> {
  const pageSize = Math.min(24, Math.max(1, options?.pageSize ?? 6));
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));
  const query = (options?.query ?? "").trim();

  const where = {
    visibility: "PUBLISHED" as const,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { slug: { contains: query } },
            { body: { contains: query } },
          ],
        }
      : {}),
  };

  try {
    const totalCount = await prisma.blogPost.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const page = Math.min(requestedPage, totalPages);

    const rows = await prisma.blogPost.findMany({
      where,
      orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        written_by: {
          select: { name: true },
        },
      },
    });

    return {
      posts: rows.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        headerImage: post.headerImage,
        excerpt: extractExcerpt(post.body),
        readingMinutes: estimateReadingMinutes(post.body),
        authorName: post.written_by.name,
        publishedAt: (post.published_at ?? post.created_at).toISOString(),
        editedAt: post.edited_at ? post.edited_at.toISOString() : null,
      })),
      totalCount,
      page,
      pageSize,
      totalPages,
      query,
    };
  } catch {
    return {
      posts: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 1,
      query,
    };
  }
}

export async function getPublicBlogSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { visibility: { in: ["PUBLISHED", "UNLISTED"] } },
      select: { slug: true },
    });
    return rows.map((row) => row.slug);
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPostDetail | null> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        written_by: {
          select: { name: true },
        },
      },
    });
    if (!post) return null;

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      headerImage: post.headerImage,
      body: post.body,
      excerpt: extractExcerpt(post.body),
      readingMinutes: estimateReadingMinutes(post.body),
      visibility: post.visibility as BlogPostDetail["visibility"],
      authorName: post.written_by.name,
      publishedAt: (post.published_at ?? post.created_at).toISOString(),
      editedAt: post.edited_at ? post.edited_at.toISOString() : null,
    };
  } catch {
    return null;
  }
}
