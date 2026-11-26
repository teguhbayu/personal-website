"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import {
  deleteSiteConfigEntry,
  saveSiteConfigs,
  upsertSiteConfigEntry,
} from "@/lib/admin-actions";
import ImageUploadField from "../../components/ImageUploadField";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

interface OwnerFormState {
  fullName: string;
  shortName: string;
  role: string;
  school: string;
  location: string;
  email: string;
  portrait: string;
  leadStatement: string;
  biography: string;
}

interface CustomConfigEntry {
  id: string;
  key: string;
  value: string;
}

interface ConfigClientProps {
  initialOwner: OwnerFormState;
  customEntries: CustomConfigEntry[];
}

export default function ConfigClient({
  initialOwner,
  customEntries,
}: ConfigClientProps) {
  const router = useRouter();
  const [owner, setOwner] = useState<OwnerFormState>(initialOwner);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CustomConfigEntry | null>(
    null,
  );
  const [kvKey, setKvKey] = useState("");
  const [kvValue, setKvValue] = useState("");
  const [kvError, setKvError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomConfigEntry | null>(
    null,
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    startTransition(async () => {
      const res = await saveSiteConfigs([
        { key: "owner.fullName", value: owner.fullName },
        { key: "owner.shortName", value: owner.shortName },
        { key: "owner.role", value: owner.role },
        { key: "owner.school", value: owner.school },
        { key: "owner.location", value: owner.location },
        { key: "owner.email", value: owner.email },
        { key: "owner.portrait", value: owner.portrait },
        { key: "owner.leadStatement", value: owner.leadStatement },
        { key: "owner.biography", value: owner.biography },
      ]);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setStatusMsg("Owner profile and site copy saved to SiteConfig.");
      router.refresh();
    });
  };

  const openCreateModal = () => {
    setEditingEntry(null);
    setKvKey("");
    setKvValue("");
    setKvError(null);
    setModalOpen(true);
  };

  const openEditModal = (entry: CustomConfigEntry) => {
    setEditingEntry(entry);
    setKvKey(entry.key);
    setKvValue(entry.value);
    setKvError(null);
    setModalOpen(true);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setKvError(null);
    startTransition(async () => {
      const res = await upsertSiteConfigEntry({
        id: editingEntry?.id,
        key: kvKey,
        value: kvValue,
      });
      if (!res.ok) {
        setKvError(res.error);
        return;
      }
      setModalOpen(false);
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteSiteConfigEntry(deleteTarget.id);
      if (!res.ok) {
        setErrorMsg(res.error);
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
            Site Configuration &amp; Copy
          </h2>
          <p className="text-sm text-ink-muted">
            Edit profile details, biography paragraphs, portrait image, and
            custom key-value configuration records.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>Add Config Key</span>
        </button>
      </section>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 border border-accent-strong bg-sheet-alt text-sm text-ink rounded-sm"
        >
          {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div
          role="status"
          className="p-4 border border-rule bg-sheet-alt text-sm text-ink rounded-sm"
        >
          {statusMsg}
        </div>
      )}

      <form
        onSubmit={handleSaveProfile}
        className="border border-rule bg-sheet-alt rounded-sm overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-rule bg-sheet flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-accent uppercase">
              owner.* Keys
            </p>
            <h3 className="font-display font-bold text-lg text-ink">
              Owner Identity &amp; Practice Copy
            </h3>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <FiSave aria-hidden={true} className="text-sm" />
            <span>{isPending ? "Saving..." : "Save Profile Config"}</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cfg-fullname"
                className="font-mono text-xs uppercase text-ink"
              >
                Full Name (owner.fullName)
              </label>
              <input
                id="cfg-fullname"
                type="text"
                required
                value={owner.fullName}
                onChange={(e) =>
                  setOwner({ ...owner, fullName: e.target.value })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cfg-shortname"
                className="font-mono text-xs uppercase text-ink"
              >
                Short Name (owner.shortName)
              </label>
              <input
                id="cfg-shortname"
                type="text"
                required
                value={owner.shortName}
                onChange={(e) =>
                  setOwner({ ...owner, shortName: e.target.value })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cfg-role"
                className="font-mono text-xs uppercase text-ink"
              >
                Role (owner.role)
              </label>
              <input
                id="cfg-role"
                type="text"
                required
                value={owner.role}
                onChange={(e) => setOwner({ ...owner, role: e.target.value })}
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cfg-school"
                className="font-mono text-xs uppercase text-ink"
              >
                School / Institution (owner.school)
              </label>
              <input
                id="cfg-school"
                type="text"
                required
                value={owner.school}
                onChange={(e) => setOwner({ ...owner, school: e.target.value })}
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cfg-location"
                className="font-mono text-xs uppercase text-ink"
              >
                Location (owner.location)
              </label>
              <input
                id="cfg-location"
                type="text"
                required
                value={owner.location}
                onChange={(e) =>
                  setOwner({ ...owner, location: e.target.value })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cfg-email"
                className="font-mono text-xs uppercase text-ink"
              >
                Public Contact Email (owner.email)
              </label>
              <input
                id="cfg-email"
                type="email"
                required
                value={owner.email}
                onChange={(e) => setOwner({ ...owner, email: e.target.value })}
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              />
            </div>
          </div>

          <ImageUploadField
            id="cfg-portrait"
            label="Portrait Image (owner.portrait)"
            folder="profile"
            value={owner.portrait}
            onChange={(next) => setOwner({ ...owner, portrait: next })}
            placeholder="/bayu.png"
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cfg-lead"
              className="font-mono text-xs uppercase text-ink"
            >
              Lead Statement (owner.leadStatement)
            </label>
            <input
              id="cfg-lead"
              type="text"
              required
              value={owner.leadStatement}
              onChange={(e) =>
                setOwner({ ...owner, leadStatement: e.target.value })
              }
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cfg-bio"
              className="font-mono text-xs uppercase text-ink"
            >
              Biography (owner.biography, separate paragraphs with a blank line)
            </label>
            <textarea
              id="cfg-bio"
              rows={6}
              required
              value={owner.biography}
              onChange={(e) =>
                setOwner({ ...owner, biography: e.target.value })
              }
              className="p-3 bg-sheet border border-rule text-sm text-ink leading-relaxed rounded-sm"
            />
          </div>
        </div>
      </form>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-ink uppercase">
            Custom Key-Value Entries ({customEntries.length})
          </h3>
        </div>

        {customEntries.length === 0 ? (
          <div className="border border-rule bg-sheet-alt rounded-sm p-6 text-sm text-ink-muted">
            No extra custom keys yet. Use &quot;Add Config Key&quot; above to
            store additional site copy or flags.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customEntries.map((entry) => (
              <article
                key={entry.id}
                className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
              >
                <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 bg-accent-strong/10 border border-accent-strong/30 font-mono text-xs text-accent rounded-sm truncate">
                    {entry.key}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(entry)}
                      aria-label={`Edit ${entry.key}`}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                    >
                      <FiEdit2 aria-hidden={true} className="text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(entry)}
                      aria-label={`Delete ${entry.key}`}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                    >
                      <FiTrash2 aria-hidden={true} className="text-sm" />
                    </button>
                  </div>
                </div>
                <div className="p-4 text-sm text-ink-muted whitespace-pre-wrap break-words">
                  {entry.value}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <FormModal
        open={modalOpen}
        title={editingEntry ? "Edit Configuration Key" : "Add Configuration Key"}
        subtitle="Stored in SiteConfig key-value table"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSaveCustom} className="flex flex-col gap-4">
          {kvError && (
            <p role="alert" className="font-mono text-xs text-accent">
              {kvError}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="kv-key"
              className="font-mono text-xs uppercase text-ink"
            >
              Key
            </label>
            <input
              id="kv-key"
              type="text"
              required
              value={kvKey}
              onChange={(e) => setKvKey(e.target.value)}
              placeholder="site.announcement"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="kv-value"
              className="font-mono text-xs uppercase text-ink"
            >
              Value
            </label>
            <textarea
              id="kv-value"
              rows={5}
              required
              value={kvValue}
              onChange={(e) => setKvValue(e.target.value)}
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
              {isPending ? "Saving..." : "Save Key"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Configuration Key"
        description={`Remove "${deleteTarget?.key ?? ""}" from SiteConfig? This cannot be undone.`}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
