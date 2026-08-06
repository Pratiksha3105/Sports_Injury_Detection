interface Props {
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
}

export function StatCard({ label, value, suffix = "/100", hint }: Props) {
  return (
    <div className="panel p-4">
      <div className="tick-label">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="font-mono-data text-2xl font-medium">{Math.round(value)}</span>
        <span className="font-mono-data text-xs text-[var(--color-muted)]">{suffix}</span>
      </div>
      {hint && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
