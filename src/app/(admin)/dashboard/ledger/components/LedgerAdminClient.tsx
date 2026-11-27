"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { sileo } from "sileo";
import { deleteLedgerEntry, saveLedgerEntry } from "@/lib/admin-actions";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

interface AdminLedgerEntry {
  id: string;
  label: string;
  value: string;
  scope: string;
  order: number;
}

interface LedgerAdminClientProps {
  entries: AdminLedgerEntry[];
}

const EMPTY_FORM = {
  id: undefined as string | undefined,
  label: "",
  value: "",
  scope: "",
  order: 0,
};

export default function LedgerAdminClient({
  entries,
}: LedgerAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLedgerEntry | null>(
    null,
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, order: entries.length });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (entry: AdminLedgerEntry) => {
    setForm({ ...entry });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const isEdit = Boolean(form.id);
    const label = form.label.trim();
    startTransition(async () => {
      const res = await saveLedgerEntry(form);
      if (!res.ok) {
        setFormError(res.error);
        sileo.error({ title: "Save failed", description: res.error });
        return;
      }
      setModalOpen(false);
      sileo.success({
        title: isEdit ? "Record updated" : "Record added",
        description: label,
      });
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const deletedLabel = deleteTarget.label;
    setPageError(null);
    startTransition(async () => {
      const res = await deleteLedgerEntry(deleteTarget.id);
      if (!res.ok) {
        setPageError(res.error);
        sileo.error({ title: "Delete failed", description: res.error });
      } else {
        sileo.success({ title: "Record deleted", description: deletedLabel });
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
            Verified Record Ledger
          </h2>
          <p className="text-sm text-ink-muted">
            Manage verified awards, scores, and career milestones shown in the
            Practice section.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>Add Record</span>
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

      {entries.length === 0 ? (
        <div className="border border-rule bg-sheet-alt rounded-sm p-8 text-center text-sm text-ink-muted">
          No verified record entries yet. Add one above or seed defaults from
          the Overview page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry, idx) => (
            <article
              key={entry.id}
              className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm">
                  Record {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(entry)}
                    aria-label={`Edit ${entry.label}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(entry)}
                    aria-label={`Delete ${entry.label}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                  >
                    <FiTrash2 aria-hidden={true} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col divide-y divide-rule">
                <div className="pb-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">
                    Label
                  </p>
                  <p className="font-display font-bold text-lg text-ink mt-0.5">
                    {entry.label}
                  </p>
                </div>
                <div className="pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-ink-muted">
                      Value
                    </p>
                    <p className="font-display font-bold text-lg text-accent mt-0.5">
                      {entry.value}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase text-ink-muted">
                      Scope
                    </p>
                    <p className="font-mono text-xs text-ink-muted mt-1">
                      {entry.scope}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        title={form.id ? "Edit Record Entry" : "Add Record Entry"}
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
              htmlFor="led-label"
              className="font-mono text-xs uppercase text-ink"
            >
              Label
            </label>
            <input
              id="led-label"
              type="text"
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="National LKS Cloud Computing"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="led-value"
                className="font-mono text-xs uppercase text-ink"
              >
                Value
              </label>
              <input
                id="led-value"
                type="text"
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="1st Place"
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="led-order"
                className="font-mono text-xs uppercase text-ink"
              >
                Order
              </label>
              <input
                id="led-order"
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) || 0 })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="led-scope"
              className="font-mono text-xs uppercase text-ink"
            >
              Scope / Context
            </label>
            <input
              id="led-scope"
              type="text"
              required
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              placeholder="LKSN, East Java & Malang"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
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
              {isPending ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Record Entry"
        description={`Delete "${deleteTarget?.label ?? ""}" from Verified Record?`}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
