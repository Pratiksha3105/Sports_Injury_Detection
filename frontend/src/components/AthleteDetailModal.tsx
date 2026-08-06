import { useEffect, useState } from "react";
import { Download, FileText, Loader2, Sparkles, Video, X } from "lucide-react";
import type { Athlete } from "../types/athlete";
import type { HistoryItem } from "../types/history";
import { apiListHistory } from "../api/historyApi";
import { downloadReportPdf, fetchAnnotatedVideoBlob } from "../api/client";
import { downloadBlob } from "../utils/download";
import { getApiErrorMessage } from "../utils/apiError";
import { riskPalette } from "../utils/risk";
import type { RiskCategory } from "../types/schema";
import { AskAIDrawer } from "./AskAIDrawer";

type Tab = "profile" | "history";

export function AthleteDetailModal({ athlete, onClose }: { athlete: Athlete; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(7,20,16,0.55)" }}>
      <div
        className="glass-card flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden p-6"
        style={{ backgroundColor: "var(--color-panel)", borderColor: "var(--color-line)" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight">{athlete.full_name}</h2>
            <p className="text-xs text-[var(--color-muted)]">
              {[athlete.sport, athlete.position, athlete.team].filter(Boolean).join(" · ") || "No sport/team on file"}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 border-b" style={{ borderColor: "var(--color-line)" }}>
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>Profile</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>Analysis History</TabButton>
        </div>

        <div className="overflow-y-auto">
          {tab === "profile" ? <ProfileTab athlete={athlete} /> : <HistoryTab athleteId={athlete.id} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="border-b-2 px-3 pb-2 text-sm font-medium transition-colors"
      style={{
        borderColor: active ? "var(--color-accent)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-muted)",
      }}
    >
      {children}
    </button>
  );
}

function ProfileTab({ athlete }: { athlete: Athlete }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Age" value={athlete.age ?? "—"} />
        <Stat label="Gender" value={athlete.gender ?? "—"} />
        <Stat label="Height" value={athlete.height_cm ? `${athlete.height_cm} cm` : "—"} />
        <Stat label="Weight" value={athlete.weight_kg ? `${athlete.weight_kg} kg` : "—"} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat label="Contact" value={athlete.contact_phone ?? "—"} />
        <Stat label="Email" value={athlete.email ?? "—"} />
      </div>

      {athlete.recovery_status && (
        <div className="mt-4">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
          >
            {athlete.recovery_status}
          </span>
        </div>
      )}

      <Section label="Injury history" text={athlete.injury_history} />
      <Section label="Medical notes" text={athlete.medical_notes} />
      <Section label="Treatment plan" text={athlete.treatment_plan} />

      <p className="mt-5 text-xs text-[var(--color-muted)]">
        Added {new Date(athlete.created_at).toLocaleDateString()} · Last updated{" "}
        {new Date(athlete.updated_at).toLocaleDateString()}
      </p>
    </div>
  );
}

function HistoryTab({ athleteId }: { athleteId: string }) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [chatFor, setChatFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiListHistory({ athlete_id: athleteId, page_size: 20 })
      .then((res) => setItems(res.items))
      .catch((err) => {
        setError(getApiErrorMessage(err, "Could not load analysis history"));
        setItems([]);
      });
  }, [athleteId]);

  async function handleDownload(id: string, kind: "summary" | "detailed") {
    setBusyId(id + kind);
    try {
      const blob = await downloadReportPdf(id, kind);
      downloadBlob(blob, `kinetic_${kind}_${id}.pdf`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not download the report"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleViewVideo(id: string) {
    setBusyId(id);
    try {
      const blob = await fetchAnnotatedVideoBlob(id);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load the annotated video"));
    } finally {
      setBusyId(null);
    }
  }

  if (items === null) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-3 text-xs text-[var(--color-risk-critical)]">{error}</p>}
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">No analyses linked to this athlete yet.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const palette = riskPalette(item.risk_level as RiskCategory);
            return (
              <div key={item.id} className="panel flex flex-wrap items-center gap-3 p-3">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: palette.soft, color: palette.fg }}
                >
                  {item.risk_level.replace(" Risk", "")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.video_name}</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {new Date(item.analysis_timestamp).toLocaleDateString()} · {item.movement_type ?? "movement"} ·
                    probability {item.injury_probability.toFixed(0)} · confidence {item.confidence_score.toFixed(0)}%
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconButton title="Ask AI" onClick={() => setChatFor(item.id)} disabled={busyId !== null}>
                    <Sparkles size={13} />
                  </IconButton>
                  <IconButton title="Download summary" onClick={() => handleDownload(item.id, "summary")} disabled={busyId !== null}>
                    <Download size={13} />
                  </IconButton>
                  <IconButton title="Download detailed report" onClick={() => handleDownload(item.id, "detailed")} disabled={busyId !== null}>
                    <FileText size={13} />
                  </IconButton>
                  {item.processed_video_path && (
                    <IconButton title="View processed video" onClick={() => handleViewVideo(item.id)} disabled={busyId !== null}>
                      <Video size={13} />
                    </IconButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {chatFor && <AskAIDrawer analysisId={chatFor} onClose={() => setChatFor(null)} />}
    </div>
  );
}

function IconButton({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
      style={{ borderColor: "var(--color-line)" }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="tick-label">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function Section({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--color-line)" }}>
      <div className="tick-label mb-1">{label}</div>
      <p className="text-sm text-[var(--color-ink-soft)]">{text}</p>
    </div>
  );
}
