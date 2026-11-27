"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { sileo } from "sileo";
import { deleteCertificate, saveCertificate } from "@/lib/admin-actions";
import ImageUploadField from "../../components/ImageUploadField";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

interface AdminCertificate {
  id: string;
  name: string;
  category: "COMPETITION" | "LANGUAGE";
  image: string;
  href: string;
  detail: string;
  issuerScope: string;
  order: number;
}

interface AwardsAdminClientProps {
  certificates: AdminCertificate[];
}

const EMPTY_FORM = {
  id: undefined as string | undefined,
  name: "",
  category: "COMPETITION" as "COMPETITION" | "LANGUAGE",
  image: "",
  href: "",
  detail: "",
  issuerScope: "",
  order: 0,
};

export default function AwardsAdminClient({
  certificates,
}: AwardsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCertificate | null>(
    null,
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, order: certificates.length });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (c: AdminCertificate) => {
    setForm({ ...c });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const isEdit = Boolean(form.id);
    const certName = form.name.trim();
    startTransition(async () => {
      const res = await saveCertificate(form);
      if (!res.ok) {
        setFormError(res.error);
        sileo.error({ title: "Save failed", description: res.error });
        return;
      }
      setModalOpen(false);
      sileo.success({
        title: isEdit ? "Certificate updated" : "Certificate added",
        description: certName,
      });
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const deletedName = deleteTarget.name;
    setPageError(null);
    startTransition(async () => {
      const res = await deleteCertificate(deleteTarget.id);
      if (!res.ok) {
        setPageError(res.error);
        sileo.error({ title: "Delete failed", description: res.error });
      } else {
        sileo.success({
          title: "Certificate deleted",
          description: deletedName,
        });
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
            Awards &amp; Certificates
          </h2>
          <p className="text-sm text-ink-muted">
            Manage competition wins, language scores, verification URLs, and
            certificate scans uploaded to Cloudinary.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>Add Certificate</span>
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

      {certificates.length === 0 ? (
        <div className="border border-rule bg-sheet-alt rounded-sm p-8 text-center text-sm text-ink-muted">
          No certificates stored yet. Add one above or seed defaults from the
          Overview page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <article
              key={cert.id}
              className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm">
                  {cert.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(cert)}
                    aria-label={`Edit ${cert.name}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cert)}
                    aria-label={`Delete ${cert.name}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                  >
                    <FiTrash2 aria-hidden={true} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/10] w-full bg-sheet border-b border-rule overflow-hidden">
                {cert.image ? (
                  <img
                    src={cert.image}
                    alt={`Scan for ${cert.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-xs text-ink-muted">
                    No certificate scan uploaded
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col divide-y divide-rule">
                <div className="pb-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Certificate Name
                  </p>
                  <p className="font-display font-bold text-lg text-ink mt-0.5">
                    {cert.name}
                  </p>
                </div>

                <div className="py-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-ink-muted">
                      Achievement
                    </p>
                    <p className="font-mono text-xs text-accent font-medium mt-0.5">
                      {cert.detail}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase text-ink-muted">
                      Scope
                    </p>
                    <p className="font-mono text-xs text-ink mt-0.5">
                      {cert.issuerScope}
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Verification Link
                  </p>
                  {cert.href ? (
                    <a
                      href={cert.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline mt-0.5 break-all"
                    >
                      <span>Open External Record</span>
                      <FiExternalLink aria-hidden={true} className="shrink-0" />
                    </a>
                  ) : (
                    <p className="font-mono text-xs text-ink-muted mt-0.5">
                      Not linked
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={form.id ? "Edit Certificate" : "Add Certificate"}
        subtitle="Certificate scans upload to Cloudinary under portfolio-website/certs/"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <p role="alert" className="font-mono text-xs text-accent">
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cert-name"
              className="font-mono text-xs uppercase text-ink"
            >
              Certificate Name
            </label>
            <input
              id="cert-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cert-category"
                className="font-mono text-xs uppercase text-ink"
              >
                Category
              </label>
              <select
                id="cert-category"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as "COMPETITION" | "LANGUAGE",
                  })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              >
                <option value="COMPETITION">Competition</option>
                <option value="LANGUAGE">Language</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cert-detail"
                className="font-mono text-xs uppercase text-ink"
              >
                Placement / Score
              </label>
              <input
                id="cert-detail"
                type="text"
                required
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                placeholder="1st Place"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cert-order"
                className="font-mono text-xs uppercase text-ink"
              >
                Sort Order
              </label>
              <input
                id="cert-order"
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
                htmlFor="cert-scope"
                className="font-mono text-xs uppercase text-ink"
              >
                Issuer Scope
              </label>
              <input
                id="cert-scope"
                type="text"
                required
                value={form.issuerScope}
                onChange={(e) =>
                  setForm({ ...form, issuerScope: e.target.value })
                }
                placeholder="National Competition"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cert-href"
                className="font-mono text-xs uppercase text-ink"
              >
                External URL (optional)
              </label>
              <input
                id="cert-href"
                type="url"
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>
          </div>

          <ImageUploadField
            id="cert-image"
            label="Certificate Scan"
            folder="certs"
            value={form.image}
            onChange={(next) => setForm({ ...form, image: next })}
          />

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
              {isPending ? "Saving..." : "Save Certificate"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Certificate"
        description={`Delete "${deleteTarget?.name ?? ""}" permanently?`}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
