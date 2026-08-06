import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { apiDeleteUser, apiListUsers, apiUpdateUser } from "../../auth/authApi";
import type { AuthUser, Role } from "../../auth/types";
import { ROLE_LABELS } from "../../auth/types";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/toast/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";

const ALL_ROLES: Role[] = ["admin", "coach", "athlete", "physiotherapist"];

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AuthUser[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    apiListUsers()
      .then(setUsers)
      .catch((err) => toast.error(getApiErrorMessage(err, "Could not load users")));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (u: AuthUser, role: Role) => {
    setBusyId(u.id);
    try {
      const updated = await apiUpdateUser(u.id, { role });
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? updated : x)) ?? null);
      toast.success(`${u.full_name}'s role updated to ${ROLE_LABELS[role]}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update role"));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (u: AuthUser) => {
    setBusyId(u.id);
    try {
      const updated = await apiUpdateUser(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? updated : x)) ?? null);
      toast.success(updated.is_active ? `${u.full_name} activated` : `${u.full_name} deactivated`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update account status"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (u: AuthUser) => {
    if (!window.confirm(`Delete ${u.full_name}'s account? This can't be undone.`)) return;
    setBusyId(u.id);
    try {
      await apiDeleteUser(u.id);
      setUsers((prev) => prev?.filter((x) => x.id !== u.id) ?? null);
      toast.success(`${u.full_name} deleted`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete user"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-medium tracking-tight">User Management</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Manage accounts, roles, and access across the platform.
      </p>

      <div className="panel mt-6 overflow-x-auto">
        {users === null ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" style={{ color: "var(--color-accent)" }} />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b tick-label" style={{ borderColor: "var(--color-line)" }}>
                <th className="px-4 py-2.5 font-normal">Name</th>
                <th className="px-4 py-2.5 font-normal">Email</th>
                <th className="px-4 py-2.5 font-normal">Role</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isBusy = busyId === u.id;
                return (
                  <tr key={u.id} className="border-b last:border-0" style={{ borderColor: "var(--color-line)" }}>
                    <td className="px-4 py-2.5">
                      {u.full_name} {isSelf && <span className="tick-label ml-1">(you)</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={u.role}
                        disabled={isSelf || isBusy}
                        onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                        className="rounded-sm border bg-[var(--color-panel)] px-2 py-1 text-xs disabled:opacity-50"
                        style={{ borderColor: "var(--color-line)" }}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={isSelf || isBusy}
                        className="rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                        style={{
                          backgroundColor: u.is_active ? "var(--color-risk-low-soft)" : "var(--color-risk-critical-soft)",
                          color: u.is_active ? "var(--color-risk-low)" : "var(--color-risk-critical)",
                        }}
                      >
                        {u.is_active ? "Active" : "Deactivated"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isSelf || isBusy}
                        className="text-[var(--color-muted)] hover:text-[var(--color-risk-critical)] disabled:opacity-30"
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
