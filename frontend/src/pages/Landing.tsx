import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Gauge,
  LineChart,
  ScanEye,
  ShieldCheck,
  Video,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { roleHome } from "../auth/roleHome";
import { BackgroundFX } from "../components/BackgroundFX";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Landing() {
  const { isAuthenticated, user } = useAuth();
  const primaryHref = isAuthenticated && user ? roleHome(user.role) : "/register";
  const primaryLabel = isAuthenticated ? "Go to dashboard" : "Create a free account";

  return (
    <div className="min-h-screen">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative overflow-hidden">
        <BackgroundFX variant="hero" />

        <header className="relative z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg font-display text-sm font-bold"
                style={{ backgroundColor: "var(--color-glow)", color: "var(--color-deep)" }}
              >
                K
              </div>
              <span className="font-display text-lg font-medium tracking-tight text-white">Kinetic</span>
            </div>
            <nav className="flex items-center gap-5 text-sm">
              <Link to="/about" className="text-[var(--color-on-deep-soft)] transition-colors hover:text-white">
                About
              </Link>
              {isAuthenticated && user ? (
                <Link to={roleHome(user.role)} className="btn-glow rounded-lg px-4 py-1.5 font-medium text-white" style={{ backgroundColor: "var(--color-accent)" }}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-[var(--color-on-deep-soft)] transition-colors hover:text-white">
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-glow rounded-lg px-4 py-1.5 font-medium text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-16 text-center sm:pt-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: "var(--color-glass-border)", color: "var(--color-on-deep-soft)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-glow)" }} />
            Transparent, weighted risk scoring — not a black box
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-6xl"
          >
            Upload a clip.
            <br />
            <span className="glow-text">Read the kinetic chain.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-[var(--color-on-deep-soft)]"
          >
            Pose estimation, joint-angle biomechanics, and a weighted injury risk score — run on athlete
            movement video, in one pass.
          </motion.p>

          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ delay: 0.18 }}>
            <Link
              to={primaryHref}
              className="btn-glow mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {primaryLabel}
              <ArrowRight size={15} />
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.24 }}
            className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t pt-8"
            style={{ borderColor: "var(--color-glass-border)" }}
          >
            <Stat value="35/20/20/15/10%" label="Auditable score weights" />
            <Stat value="9+" label="Tracked joint angles" />
            <Stat value="4" label="Role-based workspaces" />
          </motion.div>
        </main>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Feature grid                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">Built on real biomechanics</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Every score traces back to a measurement you can see — not a guess.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={ScanEye} title="Pose estimation" text="Frame-by-frame skeletal tracking from a single uploaded video." />
          <FeatureCard icon={Activity} title="Biomechanics" text="Knee valgus, hip drop, trunk lean, and joint-angle analysis frame by frame." />
          <FeatureCard icon={Gauge} title="Weighted risk score" text="A transparent formula across biomechanics, history, asymmetry, load, and fatigue." />
          <FeatureCard icon={LineChart} title="Anomaly & fatigue trend" text="Track movement quality drift across the length of a clip." />
          <FeatureCard icon={Video} title="Annotated playback" text="Review the skeleton overlay alongside the original footage." />
          <FeatureCard icon={ShieldCheck} title="Role-based access" text="Coaches, athletes, and clinicians each see what's relevant to them." />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t px-6 py-20" style={{ borderColor: "var(--color-line)" }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-center text-2xl font-medium tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Step n="01" title="Upload" text="Drop in a clip of running, jumping, landing, cutting, or sport-specific movement." />
            <Step n="02" title="Analyze" text="Pose estimation feeds a biomechanics and anomaly-detection pipeline automatically." />
            <Step n="03" title="Review" text="Get a risk gauge, joint-level readouts, and corrective recommendations." />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA + footer                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-6 pb-20">
        <div className="deep-surface relative mx-auto max-w-5xl overflow-hidden rounded-2xl px-8 py-14 text-center">
          <BackgroundFX variant="hero" />
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Ready to see your movement data?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-on-deep-soft)]">
              Free to create an account. Upload your first clip in minutes.
            </p>
            <Link
              to={primaryHref}
              className="btn-glow mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {primaryLabel}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-8" style={{ borderColor: "var(--color-line)" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-[var(--color-muted)] sm:flex-row">
          <span>© {new Date().getFullYear()} Kinetic — Movement risk analysis.</span>
          <Link to="/about" className="hover:text-[var(--color-ink)]">
            About the methodology
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-lg font-medium text-white">{value}</div>
      <div className="mt-0.5 text-xs text-[var(--color-on-deep-soft)]">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: typeof Activity; title: string; text: string }) {
  return (
    <div className="panel hover-lift p-5 text-left">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: "linear-gradient(135deg, var(--color-accent-soft) 0%, var(--color-paper-dim) 100%)" }}
      >
        <Icon size={17} style={{ color: "var(--color-accent)" }} />
      </div>
      <h3 className="font-display mt-3 text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="panel p-5">
      <span className="font-mono-data text-xs" style={{ color: "var(--color-accent)" }}>
        {n}
      </span>
      <h3 className="font-display mt-2 text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{text}</p>
    </div>
  );
}
