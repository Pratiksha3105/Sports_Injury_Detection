import { AlertTriangle, TrendingDown } from "lucide-react";
import type { AnomalySummary } from "../types/schema";
import { severityColor } from "../utils/risk";

interface Props {
  anomalies: AnomalySummary;
  durationSec: number;
}

export function AnomalyTimeline({ anomalies, durationSec }: Props) {
  if (anomalies.total_anomalies === 0 && !anomalies.fatigue_trend_detected) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-risk-low)" }} />
        No movement anomalies flagged in this clip.
      </div>
    );
  }

  return (
    <div>
      {/* Timeline strip */}
      <div className="relative h-8 w-full rounded-sm" style={{ backgroundColor: "var(--color-paper-dim)" }}>
        {anomalies.events.map((e, i) => (
          <div
            key={i}
            title={`${e.anomaly_type} at ${e.timestamp_sec.toFixed(1)}s`}
            className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2"
            style={{
              left: `${Math.min(99, (e.timestamp_sec / Math.max(durationSec, 0.1)) * 100)}%`,
              backgroundColor: severityColor(e.severity),
            }}
          />
        ))}
        {anomalies.fatigue_onset_timestamp_sec !== null && (
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed"
            style={{
              left: `${Math.min(99, (anomalies.fatigue_onset_timestamp_sec / Math.max(durationSec, 0.1)) * 100)}%`,
              borderColor: "var(--color-risk-high)",
            }}
          />
        )}
      </div>
      <div className="mt-1.5 flex justify-between tick-label">
        <span>0s</span>
        <span>{durationSec.toFixed(0)}s</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {anomalies.fatigue_trend_detected && (
          <div className="flex items-start gap-2 rounded-sm p-2.5" style={{ backgroundColor: "var(--color-risk-high-soft)" }}>
            <TrendingDown size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-risk-high)" }} />
            <div>
              <p className="text-sm font-medium">Fatigue-driven technique decline</p>
              <p className="text-xs text-[var(--color-ink-soft)]">
                Movement quality dropped in the second half of the clip
                {anomalies.fatigue_onset_timestamp_sec !== null &&
                  ` (from roughly ${anomalies.fatigue_onset_timestamp_sec.toFixed(1)}s onward)`}
                .
              </p>
            </div>
          </div>
        )}
        {anomalies.events.slice(0, 4).map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: severityColor(e.severity) }} />
            <span className="text-[var(--color-ink-soft)]">
              <span className="font-mono-data text-xs text-[var(--color-muted)]">{e.timestamp_sec.toFixed(1)}s</span>{" "}
              {e.anomaly_type}
            </span>
          </div>
        ))}
        {anomalies.events.length > 4 && (
          <p className="text-xs text-[var(--color-muted)]">+{anomalies.events.length - 4} more flagged frames</p>
        )}
      </div>
    </div>
  );
}
