import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import PostsAdminClient from "./components/PostsAdminClient";

export default async function PostsAdminPage() {
  await requireAdminSession("/dashboard/posts");

  const rows = await prisma.blogPost.findMany({
    orderBy: { created_at: "desc" },
    include: {
      written_by: {
        select: { name: true },
      },
    },
  });

  const posts = rows.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    headerImage: post.headerImage,
    body: post.body,
    visibility: post.visibility as
      | "DRAFT"
      | "PUBLISHED"
      | "UNLISTED"
      | "PRIVATE",
    authorName: post.written_by.name,
    createdAt: post.created_at.toISOString(),
    publishedAt: post.published_at ? post.published_at.toISOString() : null,
  }));

  return <PostsAdminClient posts={posts} />;
}
