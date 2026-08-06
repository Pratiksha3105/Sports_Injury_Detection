import type { RiskAssessment } from "../types/schema";
import { riskPalette } from "../utils/risk";

interface Props {
  risk: RiskAssessment;
}

const SIZE = 216;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
// Instrument dial sweeps 270°, like a tachometer, not a full circle.
const SWEEP_DEG = 270;
const START_DEG = 135; // start at bottom-left

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function RiskGauge({ risk }: Props) {
  const palette = riskPalette(risk.risk_category);
  const pct = Math.max(0, Math.min(100, risk.overall_injury_risk_score));
  const sweepValue = (pct / 100) * SWEEP_DEG;

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const trackPath = describeArc(cx, cy, RADIUS, START_DEG, START_DEG + SWEEP_DEG);
  const valuePath = describeArc(cx, cy, RADIUS, START_DEG, START_DEG + sweepValue);

  // Tick marks at 0 / 25 / 50 / 75 / 100
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE * 0.86} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <path d={trackPath} fill="none" stroke="var(--color-line)" strokeWidth={STROKE} strokeLinecap="round" />
        {ticks.map((t) => {
          const angle = START_DEG + (t / 100) * SWEEP_DEG;
          const inner = polarToCartesian(cx, cy, RADIUS - STROKE / 2 - 6, angle);
          const outer = polarToCartesian(cx, cy, RADIUS + STROKE / 2 + 2, angle);
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--color-muted)"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}
        <path
          d={valuePath}
          fill="none"
          stroke={palette.fg}
          strokeWidth={STROKE}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="font-mono-data"
          style={{ fontSize: 44, fontWeight: 500, fill: "var(--color-ink)" }}
        >
          {Math.round(pct)}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          className="tick-label"
          style={{ fill: "var(--color-muted)" }}
        >
          / 100 risk index
        </text>
      </svg>
      <span
        className="mt-1 rounded-full px-3 py-1 text-sm font-medium font-display"
        style={{ backgroundColor: palette.soft, color: palette.fg }}
      >
        {palette.label}
      </span>
      <span className="tick-label mt-2">Confidence {Math.round(risk.confidence_level)}%</span>
    </div>
  );
}
