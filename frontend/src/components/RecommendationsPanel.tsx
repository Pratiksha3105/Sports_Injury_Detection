import { Activity, Dumbbell, HeartPulse, Move, Settings2 } from "lucide-react";
import type { Recommendation, RecommendationSet } from "../types/schema";

interface Props {
  recs: RecommendationSet;
}

const SECTIONS: { key: keyof RecommendationSet; title: string; icon: typeof Activity }[] = [
  { key: "exercises", title: "Corrective exercises", icon: Activity },
  { key: "strengthening", title: "Strengthening", icon: Dumbbell },
  { key: "mobility", title: "Mobility", icon: Move },
  { key: "recovery_plan", title: "Recovery plan", icon: HeartPulse },
  { key: "training_modifications", title: "Training modifications", icon: Settings2 },
];

function priorityColor(p: Recommendation["priority"]) {
  if (p === "high") return "var(--color-risk-high)";
  if (p === "medium") return "var(--color-risk-moderate)";
  return "var(--color-muted)";
}

export function RecommendationsPanel({ recs }: Props) {
  const nonEmpty = SECTIONS.filter((s) => recs[s.key].length > 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {nonEmpty.map(({ key, title, icon: Icon }) => (
        <div key={key} className="panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <Icon size={16} style={{ color: "var(--color-accent)" }} />
            <h3 className="font-display text-sm font-medium">{title}</h3>
          </div>
          <div className="flex flex-col gap-3">
            {(recs[key] as Recommendation[]).map((item, i) => (
              <div key={i} className="border-l-2 pl-3" style={{ borderColor: priorityColor(item.priority) }}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span
                    className="tick-label"
                    style={{ color: priorityColor(item.priority) }}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
