import type { InjuryTypeRisk } from "../types/schema";
import { scoreToRiskColor } from "../utils/risk";

interface Props {
  risks: InjuryTypeRisk[];
}

export function InjuryRiskBreakdown({ risks }: Props) {
  const sorted = [...risks].sort((a, b) => b.probability_pct - a.probability_pct);

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((r) => (
        <div key={r.injury_type}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm text-[var(--color-ink-soft)]">{r.injury_type}</span>
            <span className="font-mono-data text-sm font-medium" style={{ color: scoreToRiskColor(r.probability_pct) }}>
              {r.probability_pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-paper-dim)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.min(100, r.probability_pct)}%`, backgroundColor: scoreToRiskColor(r.probability_pct) }}
            />
          </div>
          {r.contributing_factors.length > 0 && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
              {r.contributing_factors[0]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
