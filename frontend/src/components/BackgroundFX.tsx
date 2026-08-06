/**
 * BackgroundFX
 * ------------
 * A lightweight, dependency-free ambient background: a few large, blurred,
 * slowly-drifting gradient shapes plus a faint motion-line pattern evoking
 * a running track / sprint lanes. Everything is CSS + SVG, so it:
 *   - never 404s or shows a broken-image icon
 *   - adds ~0 bytes of network weight and no video decode cost
 *   - respects prefers-reduced-motion (see index.css)
 *   - composites on the GPU (transform/opacity only) so it stays smooth
 *     on low-end mobile devices
 *
 * `variant="ambient"` is meant to sit fixed behind the whole app at very
 * low opacity — safe behind data-dense dashboard panels.
 * `variant="hero"` is a full-bleed dark surface for marketing / auth
 * screens where a glass card sits on top.
 */
export function BackgroundFX({ variant = "ambient" }: { variant?: "ambient" | "hero" }) {
  if (variant === "hero") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden deep-surface">
        <div
          className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
          style={{ background: "var(--color-glow)", animation: "blob-drift-a 22s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--color-accent)", animation: "blob-drift-b 26s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[-160px] left-1/3 h-[460px] w-[460px] rounded-full opacity-30 blur-3xl"
          style={{ background: "#0a4f44", animation: "blob-drift-c 30s ease-in-out infinite" }}
        />
        <TrackLines opacity={0.08} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,20,16,0) 0%, rgba(7,20,16,0.35) 75%, rgba(7,20,16,0.65) 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "var(--color-accent)", animation: "blob-drift-a 28s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "var(--color-glow)", animation: "blob-drift-b 32s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-200px] left-1/4 h-[440px] w-[440px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "#0a4f44", animation: "blob-drift-c 34s ease-in-out infinite" }}
      />
    </div>
  );
}

/** Faint diagonal "sprint lane" strokes — a nod to track lane markings
 * without depicting any real place, person, or licensed content. */
function TrackLines({ opacity }: { opacity: number }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      style={{ opacity }}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1={-200 + i * 180}
          y1={900}
          x2={200 + i * 180}
          y2={-100}
          stroke="white"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
