import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="panel flex flex-col items-center p-10"
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-risk-high-soft)" }}
        >
          <ShieldAlert size={26} style={{ color: "var(--color-risk-high)" }} />
        </div>
        <h1 className="font-display mt-4 text-2xl font-medium tracking-tight">Access denied</h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-ink-soft)]">
          Your account doesn't have permission to view this page. If you think this is a mistake, contact an
          administrator.
        </p>
        <Link
          to="/"
          className="btn-glow mt-6 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
