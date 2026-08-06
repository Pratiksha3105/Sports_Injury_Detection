import { useState } from "react";
import { apiChangePassword } from "../auth/authApi";
import { useToast } from "../components/toast/ToastContext";
import { getApiErrorMessage } from "../utils/apiError";
import { inputClass, primaryButtonClass } from "./auth/AuthLayout";

export function Settings() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiChangePassword(currentPassword, newPassword);
      toast.success(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not change password"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-lg">
      <h1 className="font-display text-2xl font-medium tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Update your password and security preferences.</p>

      <div className="panel mt-6 p-5">
        <h2 className="font-display text-sm font-medium">Change password</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Changing your password signs you out of all other devices.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="tick-label">Current password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              className={`${inputClass} mt-1.5`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="tick-label">New password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={`${inputClass} mt-1.5`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="tick-label">Confirm new password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={`${inputClass} mt-1.5`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className={`${primaryButtonClass} w-auto px-5`}
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
