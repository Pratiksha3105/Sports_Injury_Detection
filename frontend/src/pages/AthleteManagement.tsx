import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Search, Trash2, UserRound } from "lucide-react";
import { apiCreateAthlete, apiDeleteAthlete, apiListAthletes, apiUpdateAthlete } from "../api/athleteApi";
import type { Athlete } from "../types/athlete";
import { athleteToFormValues, EMPTY_ATHLETE_FORM } from "../types/athlete";
import { AthleteFormModal } from "../components/AthleteFormModal";
import { AthleteDetailModal } from "../components/AthleteDetailModal";
import { useToast } from "../components/toast/ToastContext";
import { getApiErrorMessage } from "../utils/apiError";

export function AthleteManagement({ title, description }: { title: string; description: string }) {
  const toast = useToast();
  const [athletes, setAthletes] = useState<Athlete[] | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Athlete | "new" | null>(null);
  const [viewing, setViewing] = useState<Athlete | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load(q?: string) {
    apiListAthletes(q).then(setAthletes).catch((err) => toast.error(getApiErrorMessage(err, "Could not load athletes")));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search.trim() || undefined), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleSave(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing === "new") {
        const created = await apiCreateAthlete(payload);
        setAthletes((prev) => [created, ...(prev ?? [])]);
        toast.success(`${created.full_name} added`);
      } else if (editing) {
        const updated = await apiUpdateAthlete(editing.id, payload);
        setAthletes((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
        toast.success(`${updated.full_name} updated`);
      }
      setEditing(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save athlete"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Athlete) {
    if (!window.confirm(`Remove ${a.full_name}? This can't be undone.`)) return;
    setBusyId(a.id);
    try {
      await apiDeleteAthlete(a.id);
      setAthletes((prev) => prev?.filter((x) => x.id !== a.id) ?? null);
      toast.success(`${a.full_name} removed`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not remove athlete"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
          <p className="mt-1 max-w-lg text-sm text-[var(--color-ink-soft)]">{description}</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="btn-glow hover-lift flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <Plus size={15} /> Add athlete
        </button>
      </div>

      <div className="relative mt-5 max-w-xs">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, sport, or team…"
          className="w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)]"
          style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-panel)" }}
        />
      </div>

      <div className="panel mt-5 overflow-x-auto">
        {athletes === null ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" style={{ color: "var(--color-accent)" }} />
          </div>
        ) : athletes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <UserRound size={28} style={{ color: "var(--color-muted)" }} />
            <p className="text-sm text-[var(--color-ink-soft)]">
              {search ? "No athletes match your search." : "No athletes yet — add your first one."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b tick-label" style={{ borderColor: "var(--color-line)" }}>
                <th className="px-4 py-2.5 font-normal">Name</th>
                <th className="px-4 py-2.5 font-normal">Sport / Team</th>
                <th className="px-4 py-2.5 font-normal">Recovery status</th>
                <th className="px-4 py-2.5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((a) => {
                const isBusy = busyId === a.id;
                return (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-[var(--color-paper-dim)]"
                    style={{ borderColor: "var(--color-line)" }}
                    onClick={() => setViewing(a)}
                  >
                    <td className="px-4 py-2.5 font-medium">{a.full_name}</td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-soft)]">
                      {[a.sport, a.team].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {a.recovery_status ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                        >
                          {a.recovery_status}
                        </span>
                      ) : (
                        <span className="text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditing(a)}
                          disabled={isBusy}
                          className="text-xs font-medium text-[var(--color-accent)] hover:opacity-80 disabled:opacity-40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          disabled={isBusy}
                          className="text-[var(--color-muted)] hover:text-[var(--color-risk-critical)] disabled:opacity-30"
                          title="Remove athlete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <AthleteFormModal
          title={editing === "new" ? "Add athlete" : `Edit ${editing.full_name}`}
          initial={editing === "new" ? EMPTY_ATHLETE_FORM : athleteToFormValues(editing)}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
          submitting={saving}
        />
      )}
      {viewing && <AthleteDetailModal athlete={viewing} onClose={() => setViewing(null)} />}
    </motion.div>
  );
}
