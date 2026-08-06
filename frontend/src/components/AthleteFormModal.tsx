import { useState } from "react";
import { X } from "lucide-react";
import type { AthleteFormValues } from "../types/athlete";
import { formValuesToPayload } from "../types/athlete";
import { inputClass, primaryButtonClass } from "../pages/auth/AuthLayout";

const RECOVERY_STATUSES = ["", "Not injured", "In progress", "Cleared for full training", "Return to play"];

export function AthleteFormModal({
  initial,
  title,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial: AthleteFormValues;
  title: string;
  onCancel: () => void;
  onSubmit: (payload: ReturnType<typeof formValuesToPayload>) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<AthleteFormValues>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof AthleteFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    onSubmit(formValuesToPayload(form));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(7,20,16,0.55)" }}>
      <div
        className="glass-card max-h-[88vh] w-full max-w-xl overflow-y-auto p-6"
        style={{ backgroundColor: "var(--color-panel)", borderColor: "var(--color-line)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
          <button onClick={onCancel} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name *">
            <input className={inputClass} value={form.full_name} onChange={set("full_name")} required />
          </Field>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Age"><input type="number" min={0} className={inputClass} value={form.age} onChange={set("age")} /></Field>
            <Field label="Gender"><input className={inputClass} value={form.gender} onChange={set("gender")} /></Field>
            <Field label="Height (cm)"><input type="number" min={0} className={inputClass} value={form.height_cm} onChange={set("height_cm")} /></Field>
            <Field label="Weight (kg)"><input type="number" min={0} className={inputClass} value={form.weight_kg} onChange={set("weight_kg")} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Sport"><input className={inputClass} value={form.sport} onChange={set("sport")} /></Field>
            <Field label="Position"><input className={inputClass} value={form.position} onChange={set("position")} /></Field>
            <Field label="Team"><input className={inputClass} value={form.team} onChange={set("team")} /></Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Contact phone"><input className={inputClass} value={form.contact_phone} onChange={set("contact_phone")} /></Field>
            <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={set("email")} /></Field>
          </div>

          <Field label="Injury history">
            <textarea className={inputClass} rows={2} value={form.injury_history} onChange={set("injury_history")} placeholder="e.g. ACL tear (2023), ankle sprain (2024)" />
          </Field>
          <Field label="Medical notes">
            <textarea className={inputClass} rows={2} value={form.medical_notes} onChange={set("medical_notes")} />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Recovery status">
              <select className={inputClass} value={form.recovery_status} onChange={set("recovery_status")}>
                {RECOVERY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s || "—"}</option>
                ))}
              </select>
            </Field>
            <Field label="Treatment plan">
              <input className={inputClass} value={form.treatment_plan} onChange={set("treatment_plan")} />
            </Field>
          </div>

          {error && <p className="text-xs text-[var(--color-risk-critical)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={primaryButtonClass} style={{ backgroundColor: "var(--color-accent)", width: "auto" }}>
              {submitting ? "Saving…" : "Save athlete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="tick-label">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
