"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiExternalLink,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { sileo } from "sileo";
import { deleteBlogPost, saveBlogPost } from "@/lib/admin-actions";
import ImageUploadField from "../../components/ImageUploadField";
import ConfirmDialog from "../../components/ConfirmDialog";
import BlogMdxEditor from "./BlogMdxEditor";

export type PostVisibility = "DRAFT" | "PUBLISHED" | "UNLISTED" | "PRIVATE";

export interface EditableBlogPost {
  id: string;
  slug: string;
  title: string;
  headerImage: string;
  body: string;
  visibility: PostVisibility;
  authorName: string;
  createdAt: string;
  editedAt: string | null;
  publishedAt: string | null;
}

interface PostEditorClientProps {
  initialPost?: EditableBlogPost;
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function PostEditorClient({
  initialPost,
}: PostEditorClientProps) {
  const router = useRouter();
  const isEditing = Boolean(initialPost?.id);
  const [isPending, startTransition] = useTransition();
  const [slugLocked, setSlugLocked] = useState(isEditing);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    id: initialPost?.id,
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    headerImage: initialPost?.headerImage ?? "",
    body: initialPost?.body ?? "",
    visibility: (initialPost?.visibility ?? "DRAFT") as PostVisibility,
  });

  const wordCount = useMemo(() => {
    const trimmed = form.body.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [form.body]);

  const submitPost = useCallback(() => {
    setFormError(null);
    if (!form.title.trim()) {
      const msg = "Post title is required.";
      setFormError(msg);
      sileo.warning({ title: "Missing title", description: msg });
      return;
    }
    const resolvedSlug = form.slug.trim() || toSlug(form.title);
    if (!resolvedSlug) {
      const msg = "Post slug is required.";
      setFormError(msg);
      sileo.warning({ title: "Missing slug", description: msg });
      return;
    }
    if (!form.body.trim()) {
      const msg = "Post body content is required.";
      setFormError(msg);
      sileo.warning({ title: "Missing content", description: msg });
      return;
    }

    const title = form.title.trim();
    startTransition(async () => {
      const res = await saveBlogPost({
        id: form.id,
        title: form.title,
        slug: resolvedSlug,
        headerImage: form.headerImage,
        body: form.body,
        visibility: form.visibility,
      });
      if (!res.ok) {
        setFormError(res.error);
        sileo.error({ title: "Save failed", description: res.error });
        return;
      }

      const savedId = res.data?.id ?? form.id;
      const savedSlug = res.data?.slug ?? resolvedSlug;
      setForm((prev) => ({ ...prev, id: savedId, slug: savedSlug }));
      setSlugLocked(true);

      sileo.success({
        title: isEditing ? "Post saved" : "Post created",
        description: title,
      });

      if (!isEditing && savedId) {
        router.replace(`/dashboard/posts/${savedId}`);
      } else {
        router.refresh();
      }
    });
  }, [form, isEditing, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isPending) {
          submitPost();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPending, submitPost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPost();
  };

  const handleConfirmDelete = () => {
    if (!form.id) return;
    const deletedTitle = form.title.trim() || "Post";
    startTransition(async () => {
      const res = await deleteBlogPost(form.id!);
      if (!res.ok) {
        setFormError(res.error);
        sileo.error({ title: "Delete failed", description: res.error });
        setDeleteOpen(false);
        return;
      }
      setDeleteOpen(false);
      sileo.success({ title: "Post deleted", description: deletedTitle });
      router.push("/dashboard/posts");
      router.refresh();
    });
  };

  const previewSlug = form.slug.trim();

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <section className="border border-rule bg-sheet-alt rounded-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard/posts"
              className="min-h-[42px] px-3.5 inline-flex items-center gap-2 border border-rule bg-sheet text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors shrink-0"
            >
              <FiArrowLeft aria-hidden={true} className="text-sm" />
              <span>All Posts</span>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-ink uppercase truncate">
                  {isEditing ? "Edit Blog Post" : "New Blog Post"}
                </h2>
                <span
                  className={`px-2 py-0.5 font-mono text-[11px] uppercase rounded-sm shrink-0 ${
                    form.visibility === "PUBLISHED"
                      ? "bg-accent-strong text-white"
                      : "border border-rule bg-sheet text-ink-muted"
                  }`}
                >
                  {form.visibility}
                </span>
              </div>
              {initialPost && (
                <p className="font-mono text-[11px] text-ink-muted truncate">
                  Created{" "}
                  {new Date(initialPost.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {initialPost.editedAt
                    ? ` | Last edited ${new Date(
                        initialPost.editedAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}`
                    : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEditing && previewSlug && (
              <a
                href={
                  form.visibility === "DRAFT" || form.visibility === "PRIVATE"
                    ? `/api/admin/draft?slug=${encodeURIComponent(previewSlug)}`
                    : `/blog/${previewSlug}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] px-3.5 inline-flex items-center gap-2 border border-rule bg-sheet text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors"
              >
                <span>
                  {form.visibility === "DRAFT" || form.visibility === "PRIVATE"
                    ? "Preview Draft"
                    : "Open Post"}
                </span>
                <FiExternalLink aria-hidden={true} className="text-xs" />
              </a>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={isPending}
                className="min-h-[42px] px-3.5 inline-flex items-center gap-2 border border-accent-strong/40 bg-accent-strong/10 text-accent font-mono text-xs uppercase rounded-sm hover:bg-accent-strong hover:text-white transition-colors disabled:opacity-60"
              >
                <FiTrash2 aria-hidden={true} className="text-sm" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="min-h-[42px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <FiSave aria-hidden={true} className="text-sm" />
              <span>
                {isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Post"}
              </span>
            </button>
          </div>
        </section>

        {formError && (
          <div
            role="alert"
            className="p-4 border border-accent-strong bg-sheet-alt text-sm text-ink rounded-sm"
          >
            {formError}
          </div>
        )}

        <section className="border border-rule bg-sheet-alt rounded-sm p-5 sm:p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 flex flex-col gap-1.5">
              <label
                htmlFor="post-title"
                className="font-mono text-xs uppercase text-ink"
              >
                Title
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: nextTitle,
                    slug: slugLocked ? prev.slug : toSlug(nextTitle),
                  }));
                }}
                placeholder="Building resilient cloud infrastructure on AWS"
                className="min-h-[46px] px-3.5 bg-sheet border border-rule text-base font-medium text-ink rounded-sm"
              />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-1.5">
              <label
                htmlFor="post-slug"
                className="font-mono text-xs uppercase text-ink"
              >
                Slug
              </label>
              <input
                id="post-slug"
                type="text"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                placeholder="building-aws-cloud-architecture"
                className="min-h-[46px] px-3.5 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label
                htmlFor="post-visibility"
                className="font-mono text-xs uppercase text-ink"
              >
                Visibility
              </label>
              <select
                id="post-visibility"
                value={form.visibility}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    visibility: e.target.value as PostVisibility,
                  }))
                }
                className="min-h-[46px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="UNLISTED">Unlisted</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          <ImageUploadField
            id="post-header-image"
            label="Header Image"
            folder="blog"
            defaultAspect="16:9"
            value={form.headerImage}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, headerImage: next }))
            }
          />
        </section>

        <section className="border border-rule bg-sheet-alt rounded-sm p-5 sm:p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase text-ink font-medium">
                Article Body (MDX)
              </span>
              <span className="px-2 py-0.5 border border-rule bg-sheet font-mono text-[11px] text-ink-muted rounded-sm">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>
            <span className="font-mono text-[11px] text-ink-muted">
              Ctrl/Cmd+S to save | Set image Title for captions, Center button
              for centered blocks, or Source mode for raw HTML
            </span>
          </div>

          <BlogMdxEditor
            key={initialPost?.id ?? "new-post"}
            markdown={form.body}
            onChange={(next) => setForm((prev) => ({ ...prev, body: next }))}
          />
        </section>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Blog Post"
        description={`Delete "${form.title || "this post"}" permanently?`}
        pending={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
