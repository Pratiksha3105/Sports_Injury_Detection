import type { BiomechanicsSummary } from "../types/schema";

interface ChainNode {
  label: string;
  value: number | null;
  unit: string;
  /** true if this reading is flagged as out of the comfortable range */
  flagged: boolean;
}

interface Props {
  bio: BiomechanicsSummary;
}

/**
 * The Kinetic Chain Readout — a vertical instrument-panel strip listing the
 * body's load-bearing joints top to bottom, each with a live mono-font
 * reading and a status LED. This is the page's signature element: it makes
 * literal the idea of a "kinetic chain" (the anatomical term for how force
 * transmits joint-to-joint through the body), which is the actual subject
 * of a biomechanics analysis product — not a decorative sidebar.
 */
export function KineticChainReadout({ bio }: Props) {
  const nodes: ChainNode[] = [
    {
      label: "Trunk lean",
      value: bio.avg_trunk_lean_deg,
      unit: "°",
      flagged: (bio.avg_trunk_lean_deg ?? 0) > 15,
    },
    {
      label: "Hip stability",
      value: bio.hip_stability_score,
      unit: "/100",
      flagged: (bio.hip_stability_score ?? 100) < 60,
    },
    {
      label: "L knee valgus",
      value: bio.max_knee_valgus_left_deg,
      unit: "°",
      flagged: (bio.max_knee_valgus_left_deg ?? 0) > 12,
    },
    {
      label: "R knee valgus",
      value: bio.max_knee_valgus_right_deg,
      unit: "°",
      flagged: (bio.max_knee_valgus_right_deg ?? 0) > 12,
    },
    {
      label: "Symmetry",
      value: bio.movement_symmetry_score,
      unit: "/100",
      flagged: (bio.movement_symmetry_score ?? 100) < 70,
    },
    {
      label: "Landing softness",
      value: bio.landing_softness_score,
      unit: "/100",
      flagged: (bio.landing_softness_score ?? 100) < 55,
    },
    {
      label: "Balance",
      value: bio.balance_score,
      unit: "/100",
      flagged: (bio.balance_score ?? 100) < 55,
    },
  ];

  return (
    <div className="panel p-4 sm:sticky sm:top-4">
      <div className="tick-label mb-4 flex items-center justify-between">
        <span>Kinetic Chain</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          Live readout
        </span>
      </div>

      <div className="relative pl-5">
        {/* the spine */}
        <div
          className="absolute left-[7px] top-1 bottom-1 w-px"
          style={{ backgroundColor: "var(--color-line)" }}
          aria-hidden
        />
        <div className="flex flex-col gap-3.5">
          {nodes.map((node) => (
            <div key={node.label} className="relative flex items-baseline justify-between gap-3">
              <span
                className={`absolute -left-5 top-1 h-2 w-2 rounded-full ${node.flagged ? "led-pulse" : ""}`}
                style={{
                  backgroundColor: node.flagged ? "var(--color-risk-high)" : "var(--color-accent)",
                }}
                aria-hidden
              />
              <span className="text-[13px] text-[var(--color-ink-soft)]">{node.label}</span>
              <span className="font-mono-data text-[13px] font-medium whitespace-nowrap">
                {node.value !== null ? node.value.toFixed(1) : "—"}
                <span className="text-[var(--color-muted)]">{node.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t pt-3" style={{ borderColor: "var(--color-line)" }}>
        <div className="tick-label mb-1">Detection rate</div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-paper-dim)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(bio.detection_rate * 100)}%`,
                backgroundColor: "var(--color-accent)",
              }}
            />
          </div>
          <span className="font-mono-data text-xs">{Math.round(bio.detection_rate * 100)}%</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-muted)]">
          {bio.frames_with_detection} of {bio.frames_analyzed} sampled frames had a confident pose lock.
        </p>
      </div>
    </div>
  );
}
