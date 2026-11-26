"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteBlogPost, saveBlogPost } from "@/lib/admin-actions";
import ImageUploadField from "../../components/ImageUploadField";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import BlogMdxEditor from "./BlogMdxEditor";

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

const EMPTY_FORM = {
  id: undefined as string | undefined,
  slug: "",
  title: "",
  headerImage: "",
  body: "",
  visibility: "DRAFT" as PostVisibility,
};

export default function PostsAdminClient({ posts }: PostsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editorNonce, setEditorNonce] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditorNonce((n) => n + 1);
    setModalOpen(true);
  };

  const openEdit = (post: AdminPost) => {
    setForm({
      id: post.id,
      slug: post.slug,
      title: post.title,
      headerImage: post.headerImage,
      body: post.body,
      visibility: post.visibility,
    });
    setFormError(null);
    setEditorNonce((n) => n + 1);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.body.trim()) {
      setFormError("Post body content is required.");
      return;
    }
    startTransition(async () => {
      const res = await saveBlogPost(form);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setModalOpen(false);
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setPageError(null);
    startTransition(async () => {
      const res = await deleteBlogPost(deleteTarget.id);
      if (!res.ok) setPageError(res.error);
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
            Create, edit, and publish articles with header imagery uploaded to
            Cloudinary under portfolio-website/blog/.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>New Post</span>
        </button>
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
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    aria-label={`Edit ${post.title}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </button>
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

              <div className="relative aspect-[16/9] w-full bg-sheet border-b border-rule overflow-hidden">
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
              </div>

              <div className="p-5 flex-1 flex flex-col divide-y divide-rule">
                <div className="pb-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Title &amp; Slug
                  </p>
                  <p className="font-display font-bold text-lg text-ink mt-0.5">
                    {post.title}
                  </p>
                  <a
                    href={`/blog/${post.slug}`}
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

      <FormModal
        open={modalOpen}
        title={form.id ? "Edit Blog Post" : "New Blog Post"}
        subtitle="Header and inline MDX images upload to Cloudinary under portfolio-website/blog/"
        maxWidthClass="max-w-4xl"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <p role="alert" className="font-mono text-xs text-accent">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
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
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="building-aws-cloud-architecture"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
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
                setForm({
                  ...form,
                  visibility: e.target.value as PostVisibility,
                })
              }
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <ImageUploadField
            id="post-header-image"
            label="Header Image"
            folder="blog"
            value={form.headerImage}
            onChange={(next) => setForm({ ...form, headerImage: next })}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase text-ink">
                Body Content (MDX Editor)
              </span>
              <span className="font-mono text-[11px] text-ink-muted">
                Inline images open custom crop before uploading
              </span>
            </div>
            <BlogMdxEditor
              key={`${form.id ?? "new"}-${editorNonce}`}
              markdown={form.body}
              onChange={(next) =>
                setForm((prev) => ({ ...prev, body: next }))
              }
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 bg-accent-strong text-white text-xs font-mono uppercase rounded-sm disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Post"}
            </button>
          </div>
        </form>
      </FormModal>

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
