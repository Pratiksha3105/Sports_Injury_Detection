import { Loader2 } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-[var(--color-muted)]">
        <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-accent)" }} />
        <span className="tick-label">Loading</span>
      </div>
    </div>
  );
}
