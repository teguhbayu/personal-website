import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import PostEditorClient, {
  type PostVisibility,
} from "../components/PostEditorClient";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminSession(`/dashboard/posts/${id}`);

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      written_by: {
        select: { name: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <PostEditorClient
      initialPost={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        headerImage: post.headerImage,
        body: post.body,
        visibility: post.visibility as PostVisibility,
        authorName: post.written_by.name,
        createdAt: post.created_at.toISOString(),
        editedAt: post.edited_at ? post.edited_at.toISOString() : null,
        publishedAt: post.published_at ? post.published_at.toISOString() : null,
      }}
    />
  );
}
