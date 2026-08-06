import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/toast/ToastContext";
import { ROLE_LABELS } from "../auth/types";

export function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const initials = user.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    toast.info("You've been logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "color-mix(in srgb, var(--color-paper) 78%, transparent)",
      }}
    >
      <div className="flex items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg font-display text-sm font-bold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-glow) 100%)" }}
          >
            K
          </div>
          <span className="font-display text-lg font-medium tracking-tight">Kinetic</span>
          <span className="tick-label ml-1 hidden sm:inline">Movement risk analysis</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-paper-dim)]"
          >
            {user.profile_image ? (
              <img src={user.profile_image} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                {initials || <User size={13} />}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <div className="text-sm font-medium leading-tight">{user.full_name}</div>
              <div className="tick-label leading-tight">{ROLE_LABELS[user.role]}</div>
            </div>
            <ChevronDown size={14} className="text-[var(--color-muted)]" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="panel animate-fade-up absolute right-0 z-20 mt-2 w-44 overflow-hidden py-1">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-paper-dim)]"
                >
                  <User size={14} /> Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-paper-dim)]"
                >
                  <Settings size={14} /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-paper-dim)]"
                  style={{ color: "var(--color-risk-critical)" }}
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
