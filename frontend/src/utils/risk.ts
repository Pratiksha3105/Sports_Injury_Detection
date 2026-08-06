import type { RiskCategory } from "../types/schema";

export interface RiskPalette {
  fg: string;
  soft: string;
  label: string;
}

const PALETTES: Record<RiskCategory, RiskPalette> = {
  "Low Risk": { fg: "var(--color-risk-low)", soft: "var(--color-risk-low-soft)", label: "Low Risk" },
  "Moderate Risk": { fg: "var(--color-risk-moderate)", soft: "var(--color-risk-moderate-soft)", label: "Moderate Risk" },
  "High Risk": { fg: "var(--color-risk-high)", soft: "var(--color-risk-high-soft)", label: "High Risk" },
  "Critical Risk": { fg: "var(--color-risk-critical)", soft: "var(--color-risk-critical-soft)", label: "Critical Risk" },
};

export function riskPalette(category: RiskCategory): RiskPalette {
  return PALETTES[category];
}

/** Maps a 0-100 severity score directly to the same 4-stop scale used for
 * risk categories, for gauges/bars that don't have a category string. */
export function scoreToRiskColor(score: number): string {
  if (score < 25) return "var(--color-risk-low)";
  if (score < 50) return "var(--color-risk-moderate)";
  if (score < 75) return "var(--color-risk-high)";
  return "var(--color-risk-critical)";
}

export function severityColor(severity: "low" | "moderate" | "high"): string {
  if (severity === "high") return "var(--color-risk-high)";
  if (severity === "moderate") return "var(--color-risk-moderate)";
  return "var(--color-muted)";
}
