"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { sileo } from "sileo";
import {
  deleteSkillGroup,
  deleteSkillItem,
  saveSkillGroup,
  saveSkillItem,
} from "@/lib/admin-actions";
import type { ResolvedIcon } from "@/lib/icon-data";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import IconCombobox, { SkillIconGlyph } from "./IconCombobox";

interface AdminSkillItem {
  id: string;
  name: string;
  note: string;
  iconKey: string;
  icon: ResolvedIcon | null;
  order: number;
  groupId: string;
}

interface AdminSkillGroup {
  id: string;
  index: string;
  domain: string;
  summary: string;
  order: number;
  items: AdminSkillItem[];
}

interface StackAdminClientProps {
  groups: AdminSkillGroup[];
}

export default function StackAdminClient({ groups }: StackAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pageError, setPageError] = useState<string | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    id: undefined as string | undefined,
    index: "01",
    domain: "",
    summary: "",
    order: 0,
  });
  const [groupError, setGroupError] = useState<string | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    id: undefined as string | undefined,
    name: "",
    note: "",
    iconKey: "",
    icon: null as ResolvedIcon | null,
    order: 0,
    groupId: "",
  });
  const [itemError, setItemError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "group"; id: string; label: string }
    | { kind: "item"; id: string; label: string }
    | null
  >(null);

  const openCreateGroup = () => {
    setGroupForm({
      id: undefined,
      index: String(groups.length + 1).padStart(2, "0"),
      domain: "",
      summary: "",
      order: groups.length,
    });
    setGroupError(null);
    setGroupModalOpen(true);
  };

  const openEditGroup = (g: AdminSkillGroup) => {
    setGroupForm({
      id: g.id,
      index: g.index,
      domain: g.domain,
      summary: g.summary,
      order: g.order,
    });
    setGroupError(null);
    setGroupModalOpen(true);
  };

  const openCreateItem = (groupId: string, count: number) => {
    setItemForm({
      id: undefined,
      name: "",
      note: "",
      iconKey: "",
      icon: null,
      order: count,
      groupId,
    });
    setItemError(null);
    setItemModalOpen(true);
  };

  const openEditItem = (item: AdminSkillItem) => {
    setItemForm({ ...item });
    setItemError(null);
    setItemModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError(null);
    const isEdit = Boolean(groupForm.id);
    const domain = groupForm.domain.trim();
    startTransition(async () => {
      const res = await saveSkillGroup(groupForm);
      if (!res.ok) {
        setGroupError(res.error);
        sileo.error({ title: "Save failed", description: res.error });
        return;
      }
      setGroupModalOpen(false);
      sileo.success({
        title: isEdit ? "Stack layer updated" : "Stack layer added",
        description: domain,
      });
      router.refresh();
    });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemError(null);
    const isEdit = Boolean(itemForm.id);
    const name = itemForm.name.trim();
    startTransition(async () => {
      const res = await saveSkillItem({
        id: itemForm.id,
        name: itemForm.name,
        note: itemForm.note,
        iconKey: itemForm.iconKey,
        order: itemForm.order,
        groupId: itemForm.groupId,
      });
      if (!res.ok) {
        setItemError(res.error);
        sileo.error({ title: "Save failed", description: res.error });
        return;
      }
      setItemModalOpen(false);
      sileo.success({
        title: isEdit ? "Technology updated" : "Technology added",
        description: name,
      });
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetKind = deleteTarget.kind;
    const targetLabel = deleteTarget.label;
    setPageError(null);
    startTransition(async () => {
      const res =
        targetKind === "group"
          ? await deleteSkillGroup(deleteTarget.id)
          : await deleteSkillItem(deleteTarget.id);
      if (!res.ok) {
        setPageError(res.error);
        sileo.error({ title: "Delete failed", description: res.error });
      } else {
        sileo.success({
          title:
            targetKind === "group"
              ? "Stack layer deleted"
              : "Technology deleted",
          description: targetLabel,
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
            Technical Stack Layers
          </h2>
          <p className="text-sm text-ink-muted">
            Organize engineering domains and searchable Simple Icons displayed
            on the public Stack channel.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateGroup}
          className="min-h-[46px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <FiPlus aria-hidden={true} className="text-sm" />
          <span>Add Stack Layer</span>
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

      {groups.length === 0 ? (
        <div className="border border-rule bg-sheet-alt rounded-sm p-8 text-center text-sm text-ink-muted">
          No stack layers yet. Add a layer above or seed defaults from the
          Overview page.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groups.map((group) => (
            <article
              key={group.id}
              className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-rule bg-sheet flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm">
                  Layer {group.index}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openCreateItem(group.id, group.items.length)}
                    className="min-h-[40px] px-3 inline-flex items-center gap-1.5 border border-rule bg-sheet-alt text-ink font-mono text-[11px] uppercase rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiPlus aria-hidden={true} className="text-xs" />
                    <span>Skill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditGroup(group)}
                    aria-label={`Edit ${group.domain}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiEdit2 aria-hidden={true} className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        kind: "group",
                        id: group.id,
                        label: group.domain,
                      })
                    }
                    aria-label={`Delete ${group.domain}`}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                  >
                    <FiTrash2 aria-hidden={true} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">
                    {group.domain}
                  </h3>
                  <p className="text-sm text-ink-muted mt-0.5">
                    {group.summary}
                  </p>
                </div>

                {group.items.length === 0 ? (
                  <p className="font-mono text-xs text-ink-muted border border-rule bg-sheet rounded-sm p-3">
                    No technologies in this layer yet.
                  </p>
                ) : (
                  <div className="divide-y divide-rule border border-rule rounded-sm bg-sheet overflow-hidden">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-3.5 py-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-sm border border-rule bg-sheet-alt inline-flex items-center justify-center text-ink shrink-0">
                            <SkillIconGlyph
                              icon={item.icon}
                              className="w-4 h-4 text-accent"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="font-display font-bold text-sm text-ink truncate">
                              {item.name}
                            </p>
                            <p className="font-mono text-[11px] text-ink-muted truncate">
                              {item.note}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditItem(item)}
                            aria-label={`Edit ${item.name}`}
                            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink rounded-sm hover:border-accent-strong transition-colors"
                          >
                            <FiEdit2 aria-hidden={true} className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                kind: "item",
                                id: item.id,
                                label: item.name,
                              })
                            }
                            aria-label={`Delete ${item.name}`}
                            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center border border-accent-strong/40 bg-accent-strong/10 text-accent rounded-sm hover:bg-accent-strong hover:text-white transition-colors"
                          >
                            <FiTrash2 aria-hidden={true} className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <FormModal
        open={groupModalOpen}
        title={groupForm.id ? "Edit Stack Layer" : "Add Stack Layer"}
        onClose={() => setGroupModalOpen(false)}
      >
        <form onSubmit={handleSaveGroup} className="flex flex-col gap-4">
          {groupError && (
            <p role="alert" className="font-mono text-xs text-accent">
              {groupError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="grp-index"
                className="font-mono text-xs uppercase text-ink"
              >
                Index
              </label>
              <input
                id="grp-index"
                type="text"
                required
                value={groupForm.index}
                onChange={(e) =>
                  setGroupForm({ ...groupForm, index: e.target.value })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="grp-order"
                className="font-mono text-xs uppercase text-ink"
              >
                Order
              </label>
              <input
                id="grp-order"
                type="number"
                value={groupForm.order}
                onChange={(e) =>
                  setGroupForm({
                    ...groupForm,
                    order: Number(e.target.value) || 0,
                  })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="grp-domain"
              className="font-mono text-xs uppercase text-ink"
            >
              Domain Name
            </label>
            <input
              id="grp-domain"
              type="text"
              required
              value={groupForm.domain}
              onChange={(e) =>
                setGroupForm({ ...groupForm, domain: e.target.value })
              }
              placeholder="Frontend & Mobile"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="grp-summary"
              className="font-mono text-xs uppercase text-ink"
            >
              Summary
            </label>
            <textarea
              id="grp-summary"
              rows={3}
              required
              value={groupForm.summary}
              onChange={(e) =>
                setGroupForm({ ...groupForm, summary: e.target.value })
              }
              className="p-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setGroupModalOpen(false)}
              className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 bg-accent-strong text-white text-xs font-mono uppercase rounded-sm disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Layer"}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={itemModalOpen}
        title={itemForm.id ? "Edit Technology" : "Add Technology"}
        onClose={() => setItemModalOpen(false)}
      >
        <form onSubmit={handleSaveItem} className="flex flex-col gap-4">
          {itemError && (
            <p role="alert" className="font-mono text-xs text-accent">
              {itemError}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sk-name"
              className="font-mono text-xs uppercase text-ink"
            >
              Name
            </label>
            <input
              id="sk-name"
              type="text"
              required
              value={itemForm.name}
              onChange={(e) =>
                setItemForm({ ...itemForm, name: e.target.value })
              }
              placeholder="Next.js"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>

          <IconCombobox
            id="sk-icon"
            value={itemForm.iconKey}
            initialIcon={itemForm.icon}
            onChange={(nextKey, nextIcon) =>
              setItemForm({ ...itemForm, iconKey: nextKey, icon: nextIcon })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sk-group"
                className="font-mono text-xs uppercase text-ink"
              >
                Layer
              </label>
              <select
                id="sk-group"
                value={itemForm.groupId}
                onChange={(e) =>
                  setItemForm({ ...itemForm, groupId: e.target.value })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.domain}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sk-order"
                className="font-mono text-xs uppercase text-ink"
              >
                Order
              </label>
              <input
                id="sk-order"
                type="number"
                value={itemForm.order}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    order: Number(e.target.value) || 0,
                  })
                }
                className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sk-note"
              className="font-mono text-xs uppercase text-ink"
            >
              Usage Note
            </label>
            <input
              id="sk-note"
              type="text"
              required
              value={itemForm.note}
              onChange={(e) =>
                setItemForm({ ...itemForm, note: e.target.value })
              }
              placeholder="Primary application framework"
              className="min-h-[44px] px-3 bg-sheet border border-rule text-sm text-ink rounded-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 bg-accent-strong text-white text-xs font-mono uppercase rounded-sm disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Technology"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === "group"
            ? "Delete Stack Layer"
            : "Delete Technology"
        }
        description={
          deleteTarget?.kind === "group"
            ? `Delete "${deleteTarget.label}" and all technologies inside it?`
            : `Delete "${deleteTarget?.label ?? ""}" from this stack layer?`
        }
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
