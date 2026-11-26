"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteProject, saveProject } from "@/lib/admin-actions";
import ImageUploadField from "../../components/ImageUploadField";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

interface AdminProject {
  id: string;
  index: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  host: string;
  stack: string[];
  order: number;
}

interface ProjectsAdminClientProps {
  projects: AdminProject[];
}

const EMPTY_FORM = {
  id: undefined as string | undefined,
  index: "01",
  name: "",
  subtitle: "",
  description: "",
  image: "",
  href: "",
  host: "",
  stackText: "",
  order: 0,
};

export default function ProjectsAdminClient({
  projects,
}: ProjectsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProject | null>(null);

  const openCreate = () => {
    const nextIdx = String(projects.length + 1).padStart(2, "0");
    setForm({ ...EMPTY_FORM, index: nextIdx, order: projects.length });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (p: AdminProject) => {
    setForm({
      id: p.id,
      index: p.index,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      image: p.image,
      href: p.href,
      host: p.host,
      stackText: p.stack.join(", "),
      order: p.order,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const stack = form.stackText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await saveProject({
        id: form.id,
        index: form.index,
        name: form.name,
        subtitle: form.subtitle,
        description: form.description,
        image: form.image,
        href: form.href,
        host: form.host,
        stack,
        order: form.order,
      });
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
      const res = await deleteProject(deleteTarget.id);
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
            Shipped Projects List
          </h2>
          <p className="text-sm text-ink-muted">
            Manage display order, descriptions, tech stack tags, and project
            screenshots via Cloudinary.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>Add Project</span>
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

      {projects.length === 0 ? (
        <div className="border border-rule bg-sheet-alt rounded-sm p-8 text-center flex flex-col items-center gap-3">
          <p className="font-display font-bold text-lg text-ink">
            No projects in database yet
          </p>
          <p className="text-sm text-ink-muted max-w-md">
            Add your first project here or seed existing portfolio projects from
            the Overview page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => (
            <article
              key={project.id}
              className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm">
                  Project {project.index}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    aria-label={`Edit ${project.name}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(project)}
                    aria-label={`Delete ${project.name}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                  >
                    <FiTrash2 aria-hidden={true} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/9] w-full bg-sheet border-b border-rule overflow-hidden">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={`Screenshot of ${project.name}`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-xs text-ink-muted">
                    No screenshot uploaded
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col divide-y divide-rule">
                <div className="pb-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Platform Name
                  </p>
                  <p className="font-display font-bold text-lg text-ink mt-0.5">
                    {project.name}
                  </p>
                  <p className="text-sm text-ink-muted mt-0.5">
                    {project.subtitle}
                  </p>
                </div>

                <div className="py-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Live Host
                  </p>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline mt-0.5 break-all"
                  >
                    <span>{project.host || project.href}</span>
                    <FiExternalLink aria-hidden={true} className="shrink-0" />
                  </a>
                </div>

                <div className="py-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Description
                  </p>
                  <p className="text-sm text-ink-muted leading-relaxed mt-1 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted mb-2">
                    Stack ({project.stack.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 border border-rule bg-sheet font-mono text-[11px] text-ink rounded-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={form.id ? "Edit Project" : "Add Project"}
        subtitle="Images upload directly to Cloudinary under portfolio-website/projects/"
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
                htmlFor="proj-index"
                className="font-mono text-xs uppercase text-ink"
              >
                Index Label
              </label>
              <input
                id="proj-index"
                type="text"
                required
                value={form.index}
                onChange={(e) => setForm({ ...form, index: e.target.value })}
                placeholder="01"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="proj-order"
                className="font-mono text-xs uppercase text-ink"
              >
                Sort Order
              </label>
              <input
                id="proj-order"
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) || 0 })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="proj-name"
                className="font-mono text-xs uppercase text-ink"
              >
                Project Name
              </label>
              <input
                id="proj-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="proj-subtitle"
                className="font-mono text-xs uppercase text-ink"
              >
                Subtitle
              </label>
              <input
                id="proj-subtitle"
                type="text"
                required
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="proj-href"
                className="font-mono text-xs uppercase text-ink"
              >
                Live URL
              </label>
              <input
                id="proj-href"
                type="url"
                required
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="https://example.com"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="proj-host"
                className="font-mono text-xs uppercase text-ink"
              >
                Display Host
              </label>
              <input
                id="proj-host"
                type="text"
                required
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                placeholder="example.com"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
          </div>

          <ImageUploadField
            id="proj-image"
            label="Project Screenshot"
            folder="projects"
            value={form.image}
            onChange={(next) => setForm({ ...form, image: next })}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="proj-stack"
              className="font-mono text-xs uppercase text-ink"
            >
              Tech Stack (comma separated)
            </label>
            <input
              id="proj-stack"
              type="text"
              value={form.stackText}
              onChange={(e) => setForm({ ...form, stackText: e.target.value })}
              placeholder="Next.js, TypeScript, PostgreSQL, Prisma"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="proj-desc"
              className="font-mono text-xs uppercase text-ink"
            >
              Description
            </label>
            <textarea
              id="proj-desc"
              rows={4}
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="p-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
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
              {isPending ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project"
        description={`Delete "${deleteTarget?.name ?? ""}" permanently?`}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
