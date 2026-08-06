import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, Search, Sparkles, Trash2, Video } from "lucide-react";
import { apiDashboardStats, apiDeleteHistoryItem, apiListHistory } from "../api/historyApi";
import { downloadReportPdf, fetchAnnotatedVideoBlob } from "../api/client";
import { downloadBlob } from "../utils/download";
import type { DashboardStats, HistoryItem } from "../types/history";
import { riskPalette } from "../utils/risk";
import type { RiskCategory } from "../types/schema";
import { useToast } from "../components/toast/ToastContext";
import { getApiErrorMessage } from "../utils/apiError";
import { useAuth } from "../auth/AuthContext";
import { AskAIDrawer } from "../components/AskAIDrawer";

const RISK_LEVELS = ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"];
const PAGE_SIZE = 12;

export function History() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [athleteFilter, setAthleteFilter] = useState("");
  const [uploaderFilter, setUploaderFilter] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [chatFor, setChatFor] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  function load() {
    apiListHistory({
      page,
      page_size: PAGE_SIZE,
      search: search.trim() || undefined,
      athlete: athleteFilter.trim() || undefined,
      uploader: uploaderFilter.trim() || undefined,
      sport: sportFilter.trim() || undefined,
      risk_level: riskFilter || undefined,
    })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, "Could not load history")));
  }

  useEffect(() => {
    apiDashboardStats().then(setStats).catch(() => setStats(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, athleteFilter, uploaderFilter, sportFilter, riskFilter]);

  async function handleDelete(item: HistoryItem) {
    if (!window.confirm(`Delete the analysis of "${item.video_name}"? This can't be undone.`)) return;
    setBusyId(item.id);
    try {
      await apiDeleteHistoryItem(item.id);
      setItems((prev) => prev?.filter((x) => x.id !== item.id) ?? null);
      setTotal((t) => t - 1);
      toast.success("Analysis removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete this entry"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(item: HistoryItem, kind: "summary" | "detailed") {
    setBusyId(item.id + kind);
    try {
      const blob = await downloadReportPdf(item.id, kind);
      downloadBlob(blob, `kinetic_${kind}_${item.id}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not download the report"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleViewVideo(analysisId: string) {
    setBusyId(analysisId);
    try {
      const blob = await fetchAnnotatedVideoBlob(analysisId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not load the annotated video"));
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const trend = stats?.improvement_trend.filter((p) => (athleteFilter ? p.athlete_name?.toLowerCase().includes(athleteFilter.toLowerCase()) : true)) ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-2xl font-medium tracking-tight">Analysis History</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Every uploaded video and its analysis, kept permanently until you delete it.
      </p>

      {stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total analyses" value={stats.total_analyses} />
          <StatTile label="This week" value={stats.weekly_upload_count} />
          <StatTile
            label="Highest risk"
            value={stats.highest_risk ? `${stats.highest_risk.injury_probability.toFixed(0)}` : "—"}
            sub={stats.highest_risk?.athlete_name ?? stats.highest_risk?.video_name}
          />
          <StatTile
            label="Most common risk"
            value={
              Object.entries(stats.risk_distribution).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(" Risk", "") ?? "—"
            }
          />
        </div>
      )}

      {trend.length > 1 && (
        <div className="panel mt-5 p-4">
          <div className="tick-label mb-2">Risk trend over time</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={trend.map((p) => ({ ...p, dateLabel: new Date(p.date).toLocaleDateString() }))}>
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--color-muted)" width={28} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="injury_probability" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search video or athlete name…"
            className="w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-panel)" }}
          />
        </div>
        <FilterInput placeholder="Athlete" value={athleteFilter} onChange={(v) => { setPage(1); setAthleteFilter(v); }} />
        {isAdmin && (
          <FilterInput placeholder="Coach / physio" value={uploaderFilter} onChange={(v) => { setPage(1); setUploaderFilter(v); }} />
        )}
        <FilterInput placeholder="Sport" value={sportFilter} onChange={(v) => { setPage(1); setSportFilter(v); }} />
        <select
          value={riskFilter}
          onChange={(e) => {
            setPage(1);
            setRiskFilter(e.target.value);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-panel)" }}
        >
          <option value="">All risk levels</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {items === null ? (
        <div className="flex justify-center p-16">
          <Loader2 className="animate-spin" style={{ color: "var(--color-accent)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="panel mt-5 flex flex-col items-center gap-2 p-14 text-center">
          <FileText size={26} style={{ color: "var(--color-muted)" }} />
          <p className="text-sm text-[var(--color-ink-soft)]">No analyses match your filters yet.</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              busy={busyId === item.id || busyId === item.id + "summary" || busyId === item.id + "detailed"}
              onDelete={() => handleDelete(item)}
              onDownload={(kind) => handleDownload(item, kind)}
              onAskAI={() => setChatFor(item.id)}
              onViewVideo={handleViewVideo}
              canDelete={isAdmin || item.user_id === user?.id}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-30"
            style={{ borderColor: "var(--color-line)" }}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="tick-label">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-30"
            style={{ borderColor: "var(--color-line)" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {chatFor && <AskAIDrawer analysisId={chatFor} onClose={() => setChatFor(null)} />}
    </motion.div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string | null }) {
  return (
    <div className="panel p-3.5">
      <div className="tick-label">{label}</div>
      <div className="font-display mt-1 text-xl font-medium">{value}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{sub}</div>}
    </div>
  );
}

function FilterInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-36 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-panel)" }}
    />
  );
}

function HistoryCard({
  item,
  busy,
  onDelete,
  onDownload,
  onAskAI,
  onViewVideo,
  canDelete,
}: {
  item: HistoryItem;
  busy: boolean;
  onDelete: () => void;
  onDownload: (kind: "summary" | "detailed") => void;
  onAskAI: () => void;
  onViewVideo: (id: string) => void;
  canDelete: boolean;
}) {
  const palette = riskPalette(item.risk_level as RiskCategory);
  return (
    <div className="panel hover-lift flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-medium">{item.athlete_name ?? item.video_name}</div>
          <div className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
            {[item.sport_type, item.movement_type].filter(Boolean).join(" · ") || item.video_name}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: palette.soft, color: palette.fg }}
        >
          {item.risk_level.replace(" Risk", "")}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-ink-soft)]">
        <div>Probability: <span className="font-medium">{item.injury_probability.toFixed(0)}</span></div>
        <div>Confidence: <span className="font-medium">{item.confidence_score.toFixed(0)}%</span></div>
      </div>
      <div className="mt-1 text-[11px] text-[var(--color-muted)]">
        {new Date(item.analysis_timestamp).toLocaleString()}
        {item.uploader_name && <> · by {item.uploader_name}</>}
      </div>
      {item.recommendation_summary && (
        <p className="mt-2 line-clamp-2 text-xs text-[var(--color-muted)]">{item.recommendation_summary}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "var(--color-line)" }}>
        <IconButton title="Ask AI about this report" onClick={onAskAI} disabled={busy}>
          <Sparkles size={13} />
        </IconButton>
        <IconButton title="Download summary PDF" onClick={() => onDownload("summary")} disabled={busy}>
          <Download size={13} />
        </IconButton>
        <IconButton title="Download detailed PDF" onClick={() => onDownload("detailed")} disabled={busy}>
          <FileText size={13} />
        </IconButton>
        {item.processed_video_path && (
          <IconButton title="View skeleton overlay video" onClick={() => onViewVideo(item.id)} disabled={busy}>
            <Video size={13} />
          </IconButton>
        )}
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={busy}
            className="ml-auto text-[var(--color-muted)] hover:text-[var(--color-risk-critical)] disabled:opacity-30"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
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
