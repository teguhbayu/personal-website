import { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/data";
import { CHANNEL_ROUTES, SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const baseEntries: MetadataRoute.Sitemap = Object.entries(CHANNEL_ROUTES).map(
    ([id, route]) => ({
      url: route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`,
      lastModified: now,
      priority: id === "home" ? 1 : 0.8,
      changeFrequency: "monthly",
    }),
  );

  const posts = await getPublishedBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0]?.publishedAt ?? now,
      priority: 0.85,
      changeFrequency: "weekly",
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.editedAt ?? post.publishedAt,
      priority: 0.75,
      changeFrequency: "monthly" as const,
    })),
  ];

  return [...baseEntries, ...blogEntries];
}
