import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, TrendingUp } from "lucide-react";
import { BackgroundFX } from "../../components/BackgroundFX";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left: brand / value-prop panel — hidden on small screens */}
      <div className="relative hidden w-[44%] shrink-0 lg:block">
        <BackgroundFX variant="hero" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg font-display text-sm font-bold text-white"
              style={{ backgroundColor: "var(--color-glow)", color: "var(--color-deep)" }}
            >
              K
            </div>
            <span className="font-display text-lg font-medium tracking-tight text-white">Kinetic</span>
          </Link>

          <div>
            <h2 className="font-display max-w-sm text-3xl font-medium leading-tight tracking-tight glow-text">
              Read the kinetic chain before it reads you.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-[var(--color-on-deep-soft)]">
              Pose estimation, joint-angle biomechanics, and a transparent, weighted injury-risk score — built
              for coaches, athletes, and physiotherapists working from the same numbers.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <TrustLine icon={Activity} text="Frame-by-frame biomechanical analysis" />
              <TrustLine icon={TrendingUp} text="A weighted risk score you can audit" />
              <TrustLine icon={ShieldCheck} text="Role-based access for your whole team" />
            </div>
          </div>

          <p className="text-xs text-[var(--color-on-deep-soft)]">© {new Date().getFullYear()} Kinetic</p>
        </div>
      </div>

      {/* Right: the auth form */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute inset-0 -z-10 lg:hidden">
          <BackgroundFX variant="hero" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-sm font-display text-sm font-bold text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              K
            </div>
            <span className="font-display text-lg font-medium tracking-tight text-white">Kinetic</span>
          </Link>

          <div
            className="rounded-2xl border p-7 shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-panel) 94%, transparent)",
              borderColor: "var(--color-glass-border)",
            }}
          >
            <h1 className="font-display text-xl font-medium tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-[var(--color-on-deep-soft)] lg:text-[var(--color-ink-soft)]">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function TrustLine({ icon: Icon, text }: { icon: typeof Activity; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-[var(--color-on-deep-soft)]">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <Icon size={12} style={{ color: "var(--color-glow)" }} />
      </span>
      {text}
    </div>
  );
}

export function FormField({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="tick-label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-[var(--color-risk-critical)]">{error}</p>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none " +
  "transition-all placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15";

export const primaryButtonClass =
  "btn-glow w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50";
