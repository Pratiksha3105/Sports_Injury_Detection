import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();

  // ProtectedRoute (parent) already guarantees `user` is set by the time
  // this renders, but guard defensively anyway.
  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
