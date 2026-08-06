import { NavLink } from "react-router-dom";
import {
  Activity,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin/users", label: "User Management", icon: Users, end: true },
    { to: "/admin/analysis", label: "Movement Analysis", icon: Activity },
    { to: "/history", label: "Analysis History", icon: History },
  ],
  coach: [
    { to: "/coach", label: "Team Overview", icon: LayoutDashboard, end: true },
    { to: "/coach/athletes", label: "Athlete Management", icon: Users },
    { to: "/coach/analysis", label: "Movement Analysis", icon: Activity },
    { to: "/history", label: "Analysis History", icon: History },
  ],
  athlete: [
    { to: "/athlete", label: "My Dashboard", icon: LayoutDashboard, end: true },
    { to: "/athlete/analysis", label: "Movement Analysis", icon: Activity },
    { to: "/history", label: "Analysis History", icon: History },
  ],
  physiotherapist: [
    { to: "/physio", label: "Assigned Athletes", icon: LayoutDashboard, end: true },
    { to: "/physio/athletes", label: "Athlete Management", icon: Users },
    { to: "/physio/analysis", label: "Movement Analysis", icon: Activity },
    { to: "/history", label: "Analysis History", icon: History },
  ],
};

const COMMON_ITEMS: NavItem[] = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    <aside
      className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 border-r backdrop-blur-xl md:flex md:flex-col"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "color-mix(in srgb, var(--color-paper) 60%, transparent)",
      }}
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="tick-label mb-1 px-2">Workspace</div>
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        <div className="tick-label mb-1 mt-5 px-2">Account</div>
        {COMMON_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        {user.role === "admin" && (
          <div
            className="mt-5 flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs"
            style={{ color: "var(--color-accent-strong)", backgroundColor: "var(--color-accent-soft)" }}
          >
            <ShieldCheck size={13} /> Admin access
          </div>
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-all duration-200 ${
          isActive
            ? "font-medium shadow-sm"
            : "text-[var(--color-ink-soft)] hover:translate-x-0.5 hover:text-[var(--color-ink)]"
        }`
      }
      style={({ isActive }) => ({
        backgroundColor: isActive ? "var(--color-accent-soft)" : "transparent",
        color: isActive ? "var(--color-accent-strong)" : undefined,
      })}
    >
      <Icon size={15} />
      {item.label}
    </NavLink>
  );
}
