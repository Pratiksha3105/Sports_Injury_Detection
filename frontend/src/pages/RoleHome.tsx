import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

interface SecondaryAction {
  label: string;
  description: string;
  path: string;
  icon?: LucideIcon;
}

export function RoleHome({
  title,
  description,
  analysisPath,
  secondaryAction,
}: {
  title: string;
  description: string;
  analysisPath: string;
  secondaryAction?: SecondaryAction;
}) {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-2xl font-medium tracking-tight">
        {title}
        {user && <span className="text-[var(--color-ink-soft)]">, {user.full_name.split(" ")[0]}</span>}
      </h1>
      <p className="mt-1 max-w-lg text-sm text-[var(--color-ink-soft)]">{description}</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <ActionCard to={analysisPath} icon={Activity} title="Movement Analysis" description="Upload a clip and run the risk pipeline." />
        {secondaryAction && (
          <ActionCard
            to={secondaryAction.path}
            icon={secondaryAction.icon ?? Users}
            title={secondaryAction.label}
            description={secondaryAction.description}
          />
        )}
      </div>
    </motion.div>
  );
}

function ActionCard({ to, icon: Icon, title, description }: { to: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <Link
      to={to}
      className="panel hover-lift group flex max-w-md flex-1 items-center justify-between p-5 transition-colors hover:border-[var(--color-accent)]"
    >
      <div className="flex items-center gap-3.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, var(--color-accent-soft) 0%, var(--color-paper-dim) 100%)" }}
        >
          <Icon size={18} style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <div className="font-display text-sm font-medium">{title}</div>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{description}</p>
        </div>
      </div>
      <ArrowRight
        size={16}
        className="transition-transform group-hover:translate-x-1"
        style={{ color: "var(--color-accent)" }}
      />
    </Link>
  );
}
