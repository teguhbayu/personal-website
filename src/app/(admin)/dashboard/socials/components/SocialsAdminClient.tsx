"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteSocialLink, saveSocialLink } from "@/lib/admin-actions";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

interface AdminSocialLink {
  id: string;
  label: string;
  handle: string;
  href: string;
  order: number;
}

interface SocialsAdminClientProps {
  socials: AdminSocialLink[];
}

const EMPTY_FORM = {
  id: undefined as string | undefined,
  label: "",
  handle: "",
  href: "",
  order: 0,
};

export default function SocialsAdminClient({
  socials,
}: SocialsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSocialLink | null>(
    null,
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, order: socials.length });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (s: AdminSocialLink) => {
    setForm({ ...s });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const res = await saveSocialLink(form);
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
      const res = await deleteSocialLink(deleteTarget.id);
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
            Social &amp; Profile Links
          </h2>
          <p className="text-sm text-ink-muted">
            Manage external profiles displayed on the Contact channel and
            portfolio footer.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>Add Profile</span>
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

      {socials.length === 0 ? (
        <div className="border border-rule bg-sheet-alt rounded-sm p-8 text-center text-sm text-ink-muted">
          No social links yet. Add one above or seed defaults from the Overview
          page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socials.map((s, idx) => (
            <article
              key={s.id}
              className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm">
                  Profile {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    aria-label={`Edit ${s.label}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(s)}
                    aria-label={`Delete ${s.label}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                  >
                    <FiTrash2 aria-hidden={true} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col divide-y divide-rule">
                <div className="pb-3 flex items-baseline justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-ink-muted">
                      Platform
                    </p>
                    <p className="font-display font-bold text-lg text-ink mt-0.5">
                      {s.label}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-ink-muted">
                    {s.handle}
                  </span>
                </div>
                <div className="pt-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    URL
                  </p>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline mt-0.5 break-all"
                  >
                    <span>{s.href}</span>
                    <FiExternalLink aria-hidden={true} className="shrink-0" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={form.id ? "Edit Social Profile" : "Add Social Profile"}
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
                htmlFor="soc-label"
                className="font-mono text-xs uppercase text-ink"
              >
                Label
              </label>
              <input
                id="soc-label"
                type="text"
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="GitHub"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="soc-order"
                className="font-mono text-xs uppercase text-ink"
              >
                Order
              </label>
              <input
                id="soc-order"
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
                htmlFor="soc-handle"
                className="font-mono text-xs uppercase text-ink"
              >
                Handle
              </label>
              <input
                id="soc-handle"
                type="text"
                required
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="@teguhbayu"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="soc-href"
                className="font-mono text-xs uppercase text-ink"
              >
                Profile URL
              </label>
              <input
                id="soc-href"
                type="url"
                required
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="https://github.com/teguhbayu"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>
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
              {isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Social Profile"
        description={`Delete "${deleteTarget?.label ?? ""}" from your profile links?`}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
