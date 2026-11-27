"use server";

import { revalidatePath } from "next/cache";
import { CERTIFICATE_CATEGORY, POST_STATUS } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  CERTIFICATES,
  OWNER,
  PROJECTS,
  SKILL_GROUPS,
  SOCIALS,
  VERIFIED_LEDGER,
} from "@/data/portfolio";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function revalidateAll() {
  const paths = [
    "/",
    "/practice",
    "/projects",
    "/stack",
    "/awards",
    "/contact",
    "/blog",
    "/og/site.jpg",
    "/og/blog.jpg",
    "/dashboard",
    "/dashboard/config",
    "/dashboard/projects",
    "/dashboard/stack",
    "/dashboard/awards",
    "/dashboard/ledger",
    "/dashboard/socials",
    "/dashboard/posts",
  ];
  for (const p of paths) {
    revalidatePath(p);
  }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
    return "A record with that unique value already exists.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export async function seedPortfolioDefaults(): Promise<ActionResult> {
  await requireAdminSession("/dashboard");
  try {
    const configPairs: { key: string; value: string }[] = [
      { key: "owner.fullName", value: OWNER.fullName },
      { key: "owner.shortName", value: OWNER.shortName },
      { key: "owner.role", value: OWNER.role },
      { key: "owner.school", value: OWNER.school },
      { key: "owner.location", value: OWNER.location },
      { key: "owner.email", value: OWNER.email },
      { key: "owner.portrait", value: OWNER.portrait },
      { key: "owner.leadStatement", value: OWNER.leadStatement },
      { key: "owner.biography", value: OWNER.biography.join("\n\n") },
    ];

    for (const pair of configPairs) {
      await prisma.siteConfig.upsert({
        where: { key: pair.key },
        update: {},
        create: pair,
      });
    }

    if ((await prisma.verifiedLedger.count()) === 0) {
      await prisma.verifiedLedger.createMany({
        data: VERIFIED_LEDGER.map((row, idx) => ({
          label: row.label,
          value: row.value,
          scope: row.scope,
          order: idx,
        })),
      });
    }

    if ((await prisma.project.count()) === 0) {
      await prisma.project.createMany({
        data: PROJECTS.map((p, idx) => ({
          index: p.index,
          name: p.name,
          subtitle: p.subtitle,
          description: p.description,
          image: p.image,
          href: p.href,
          host: p.host,
          stack: p.stack,
          order: idx,
        })),
      });
    }

    if ((await prisma.skillGroup.count()) === 0) {
      for (let gi = 0; gi < SKILL_GROUPS.length; gi++) {
        const g = SKILL_GROUPS[gi];
        await prisma.skillGroup.create({
          data: {
            index: g.index,
            domain: g.domain,
            summary: g.summary,
            order: gi,
            items: {
              create: g.items.map((item, ii) => ({
                name: item.name,
                note: item.note,
                iconKey: item.id,
                order: ii,
              })),
            },
          },
        });
      }
    }

    if ((await prisma.certificate.count()) === 0) {
      await prisma.certificate.createMany({
        data: CERTIFICATES.map((c, idx) => ({
          name: c.name,
          category:
            c.category === "competition"
              ? CERTIFICATE_CATEGORY.COMPETITION
              : CERTIFICATE_CATEGORY.LANGUAGE,
          image: c.image,
          href: c.href ?? null,
          detail: c.detail,
          issuerScope: c.issuerScope,
          order: idx,
        })),
      });
    }

    if ((await prisma.socialLink.count()) === 0) {
      await prisma.socialLink.createMany({
        data: SOCIALS.map((s, idx) => ({
          label: s.label,
          handle: s.handle,
          href: s.href,
          order: idx,
        })),
      });
    }

    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to seed default portfolio data."),
    };
  }
}

export async function saveSiteConfigs(
  entries: { key: string; value: string }[],
): Promise<ActionResult> {
  await requireAdminSession("/dashboard/config");
  try {
    for (const entry of entries) {
      const cleanKey = entry.key.trim();
      if (!cleanKey) continue;
      await prisma.siteConfig.upsert({
        where: { key: cleanKey },
        update: { value: entry.value },
        create: { key: cleanKey, value: entry.value },
      });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save site configuration."),
    };
  }
}

export async function upsertSiteConfigEntry(input: {
  id?: string;
  key: string;
  value: string;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/config");
  const key = input.key.trim();
  if (!key) {
    return { ok: false, error: "Configuration key is required." };
  }
  try {
    if (input.id) {
      await prisma.siteConfig.update({
        where: { id: input.id },
        data: { key, value: input.value },
      });
    } else {
      await prisma.siteConfig.upsert({
        where: { key },
        update: { value: input.value },
        create: { key, value: input.value },
      });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save configuration entry."),
    };
  }
}

export async function deleteSiteConfigEntry(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/config");
  try {
    await prisma.siteConfig.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete configuration entry."),
    };
  }
}

export async function saveProject(input: {
  id?: string;
  index: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  host: string;
  stack: string[];
  order: number;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/projects");
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Project name is required." };
  }
  const cleanStack = input.stack.map((s) => s.trim()).filter(Boolean);
  const data = {
    index: input.index.trim() || "01",
    name,
    subtitle: input.subtitle.trim(),
    description: input.description.trim(),
    image: input.image.trim(),
    href: input.href.trim(),
    host: input.host.trim(),
    stack: cleanStack,
    order: Number.isFinite(input.order) ? input.order : 0,
  };
  try {
    if (input.id) {
      await prisma.project.update({ where: { id: input.id }, data });
    } else {
      await prisma.project.create({ data });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: getErrorMessage(err, "Failed to save project.") };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/projects");
  try {
    await prisma.project.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete project."),
    };
  }
}

export async function saveCertificate(input: {
  id?: string;
  name: string;
  category: "COMPETITION" | "LANGUAGE";
  image: string;
  href: string;
  detail: string;
  issuerScope: string;
  order: number;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/awards");
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Certificate name is required." };
  }
  const data = {
    name,
    category:
      input.category === "LANGUAGE"
        ? CERTIFICATE_CATEGORY.LANGUAGE
        : CERTIFICATE_CATEGORY.COMPETITION,
    image: input.image.trim(),
    href: input.href.trim() || null,
    detail: input.detail.trim(),
    issuerScope: input.issuerScope.trim(),
    order: Number.isFinite(input.order) ? input.order : 0,
  };
  try {
    if (input.id) {
      await prisma.certificate.update({ where: { id: input.id }, data });
    } else {
      await prisma.certificate.create({ data });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save certificate."),
    };
  }
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/awards");
  try {
    await prisma.certificate.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete certificate."),
    };
  }
}

export async function saveSkillGroup(input: {
  id?: string;
  index: string;
  domain: string;
  summary: string;
  order: number;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/stack");
  const domain = input.domain.trim();
  if (!domain) {
    return { ok: false, error: "Group domain is required." };
  }
  const data = {
    index: input.index.trim() || "01",
    domain,
    summary: input.summary.trim(),
    order: Number.isFinite(input.order) ? input.order : 0,
  };
  try {
    if (input.id) {
      await prisma.skillGroup.update({ where: { id: input.id }, data });
    } else {
      await prisma.skillGroup.create({ data });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save skill group."),
    };
  }
}

export async function deleteSkillGroup(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/stack");
  try {
    await prisma.skillGroup.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete skill group."),
    };
  }
}

export async function saveSkillItem(input: {
  id?: string;
  name: string;
  note: string;
  iconKey: string;
  order: number;
  groupId: string;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/stack");
  const name = input.name.trim();
  if (!name || !input.groupId) {
    return { ok: false, error: "Skill name and group are required." };
  }
  const data = {
    name,
    note: input.note.trim(),
    iconKey: input.iconKey.trim() || null,
    order: Number.isFinite(input.order) ? input.order : 0,
    groupId: input.groupId,
  };
  try {
    if (input.id) {
      await prisma.skillItem.update({ where: { id: input.id }, data });
    } else {
      await prisma.skillItem.create({ data });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save skill item."),
    };
  }
}

export async function deleteSkillItem(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/stack");
  try {
    await prisma.skillItem.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete skill item."),
    };
  }
}

export async function saveLedgerEntry(input: {
  id?: string;
  label: string;
  value: string;
  scope: string;
  order: number;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/ledger");
  const label = input.label.trim();
  const value = input.value.trim();
  if (!label || !value) {
    return { ok: false, error: "Label and value are required." };
  }
  const data = {
    label,
    value,
    scope: input.scope.trim(),
    order: Number.isFinite(input.order) ? input.order : 0,
  };
  try {
    if (input.id) {
      await prisma.verifiedLedger.update({ where: { id: input.id }, data });
    } else {
      await prisma.verifiedLedger.create({ data });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save record entry."),
    };
  }
}

export async function deleteLedgerEntry(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/ledger");
  try {
    await prisma.verifiedLedger.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete record entry."),
    };
  }
}

export async function saveSocialLink(input: {
  id?: string;
  label: string;
  handle: string;
  href: string;
  order: number;
}): Promise<ActionResult> {
  await requireAdminSession("/dashboard/socials");
  const label = input.label.trim();
  if (!label || !input.href.trim()) {
    return { ok: false, error: "Label and URL are required." };
  }
  const data = {
    label,
    handle: input.handle.trim(),
    href: input.href.trim(),
    order: Number.isFinite(input.order) ? input.order : 0,
  };
  try {
    if (input.id) {
      await prisma.socialLink.update({ where: { id: input.id }, data });
    } else {
      await prisma.socialLink.create({ data });
    }
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save social link."),
    };
  }
}

export async function deleteSocialLink(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/socials");
  try {
    await prisma.socialLink.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete social link."),
    };
  }
}

export async function saveBlogPost(input: {
  id?: string;
  slug: string;
  title: string;
  headerImage: string;
  body: string;
  visibility: "DRAFT" | "PUBLISHED" | "UNLISTED" | "PRIVATE";
}): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireAdminSession("/dashboard/posts");
  const title = input.title.trim();
  const slug = slugify(input.slug || title);
  if (!title || !slug) {
    return { ok: false, error: "Post title and slug are required." };
  }

  const allowedStatuses: Record<string, POST_STATUS> = {
    DRAFT: POST_STATUS.DRAFT,
    PUBLISHED: POST_STATUS.PUBLISHED,
    UNLISTED: POST_STATUS.UNLISTED,
    PRIVATE: POST_STATUS.PRIVATE,
  };
  const visibility = allowedStatuses[input.visibility] ?? POST_STATUS.DRAFT;
  const now = new Date();

  try {
    let savedId: string;
    let previousSlug: string | null = null;
    if (input.id) {
      const existing = await prisma.blogPost.findUnique({
        where: { id: input.id },
        select: { published_at: true, slug: true },
      });
      previousSlug = existing?.slug ?? null;
      const updated = await prisma.blogPost.update({
        where: { id: input.id },
        data: {
          slug,
          title,
          headerImage: input.headerImage.trim(),
          body: input.body,
          visibility,
          edited_at: now,
          published_at:
            visibility === POST_STATUS.PUBLISHED
              ? existing?.published_at ?? now
              : existing?.published_at ?? null,
        },
        select: { id: true },
      });
      savedId = updated.id;
    } else {
      const created = await prisma.blogPost.create({
        data: {
          slug,
          title,
          headerImage: input.headerImage.trim(),
          body: input.body,
          visibility,
          written_by_id: session.user.id,
          published_at: visibility === POST_STATUS.PUBLISHED ? now : null,
        },
        select: { id: true },
      });
      savedId = created.id;
    }
    revalidateAll();
    revalidatePath(`/dashboard/posts/${savedId}`);
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/og/blog/${slug}/card.jpg`);
    if (previousSlug && previousSlug !== slug) {
      revalidatePath(`/blog/${previousSlug}`);
      revalidatePath(`/og/blog/${previousSlug}/card.jpg`);
    }
    return { ok: true, data: { id: savedId, slug } };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to save blog post."),
    };
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  await requireAdminSession("/dashboard/posts");
  try {
    const deleted = await prisma.blogPost.delete({
      where: { id },
      select: { slug: true },
    });
    revalidateAll();
    revalidatePath(`/dashboard/posts/${id}`);
    revalidatePath(`/blog/${deleted.slug}`);
    revalidatePath(`/og/blog/${deleted.slug}/card.jpg`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: getErrorMessage(err, "Failed to delete blog post."),
    };
  }
}
