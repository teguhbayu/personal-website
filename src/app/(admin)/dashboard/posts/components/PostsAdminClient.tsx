"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { sileo } from "sileo";
import { deleteBlogPost } from "@/lib/admin-actions";
import ConfirmDialog from "../../components/ConfirmDialog";

type PostVisibility = "DRAFT" | "PUBLISHED" | "UNLISTED" | "PRIVATE";

interface AdminPost {
  id: string;
  slug: string;
  title: string;
  headerImage: string;
  body: string;
  visibility: PostVisibility;
  authorName: string;
  createdAt: string;
  publishedAt: string | null;
}

interface PostsAdminClientProps {
  posts: AdminPost[];
}

export default function PostsAdminClient({ posts }: PostsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const deletedTitle = deleteTarget.title;
    setPageError(null);
    startTransition(async () => {
      const res = await deleteBlogPost(deleteTarget.id);
      if (!res.ok) {
        setPageError(res.error);
        sileo.error({ title: "Delete failed", description: res.error });
      } else {
        sileo.success({ title: "Post deleted", description: deletedTitle });
      }
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <>
      <section className="border border-rule bg-sheet-alt rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-ink uppercase">
            Blog Posts Management
          </h2>
          <p className="text-sm text-ink-muted">
            Create, edit, and publish articles in a dedicated full-page MDX
            editor with Cloudinary image uploads.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>New Post</span>
        </Link>
      </section>

      {pageError && (
        <div
          role="alert"
          className="p-4 border border-accent-strong bg-sheet-alt text-sm text-ink rounded-sm"
        >
          {pageError}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="border border-rule bg-sheet-alt rounded-sm p-8 text-center text-sm text-ink-muted">
          No blog posts yet. Click &quot;New Post&quot; to create your first
          draft.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-1 font-mono text-xs font-medium uppercase rounded-sm ${
                    post.visibility === "PUBLISHED"
                      ? "bg-accent-strong text-white"
                      : "border border-rule bg-sheet-alt text-ink"
                  }`}
                >
                  {post.visibility}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    aria-label={`Edit ${post.title}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(post)}
                    aria-label={`Delete ${post.title}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                  >
                    <FiTrash2 aria-hidden={true} className="text-sm" />
                  </button>
                </div>
              </div>

              <Link
                href={`/dashboard/posts/${post.id}`}
                className="relative aspect-[16/9] w-full bg-sheet border-b border-rule overflow-hidden block"
              >
                {post.headerImage ? (
                  <img
                    src={post.headerImage}
                    alt={`Header for ${post.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-xs text-ink-muted">
                    No header image
                  </div>
                )}
              </Link>

              <div className="p-5 flex-1 flex flex-col divide-y divide-rule">
                <div className="pb-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Title &amp; Slug
                  </p>
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="font-display font-bold text-lg text-ink hover:text-accent transition-colors mt-0.5 block"
                  >
                    {post.title}
                  </Link>
                  <a
                    href={
                      post.visibility === "DRAFT" ||
                      post.visibility === "PRIVATE"
                        ? `/api/admin/draft?slug=${encodeURIComponent(post.slug)}`
                        : `/blog/${post.slug}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-mono text-xs text-accent hover:underline mt-0.5"
                  >
                    /blog/{post.slug}
                  </a>
                </div>

                <div className="py-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Excerpt
                  </p>
                  <p className="text-sm text-ink-muted mt-1 line-clamp-3 whitespace-pre-wrap">
                    {post.body || "Empty body"}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between gap-2 font-mono text-[11px] text-ink-muted">
                  <span>Author: {post.authorName}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Blog Post"
        description={`Delete "${deleteTarget?.title ?? ""}" permanently?`}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
