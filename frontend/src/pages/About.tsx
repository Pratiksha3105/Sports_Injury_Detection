import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function About() {
  return (
    <div className="min-h-screen">
      <header className="border-b" style={{ borderColor: "var(--color-line)" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg font-display text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-glow) 100%)" }}
            >
              K
            </div>
            <span className="font-display text-lg font-medium tracking-tight">Kinetic</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-3xl font-medium tracking-tight">About Kinetic</h1>
          <p className="mt-4 text-[var(--color-ink-soft)]">
            Kinetic analyzes athlete movement video with pose estimation and biomechanical modeling to surface an
            injury risk score, joint-level anomalies, and corrective recommendations — built for coaches, athletes,
            and physiotherapists working together.
          </p>

          <div className="panel mt-8 p-5">
            <h2 className="font-display text-sm font-medium">Honest scope</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              The injury-risk score is a transparent, weighted rule-based formula built on measured biomechanics —
              knee valgus, movement symmetry, trunk lean, and related indicators grounded in published sports-medicine
              research. It is not a clinically validated diagnostic tool, and it doesn't replace assessment by a
              qualified medical professional.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
