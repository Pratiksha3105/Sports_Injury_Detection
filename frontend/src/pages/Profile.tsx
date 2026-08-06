import { useState } from "react";
import { apiUpdateProfile } from "../auth/authApi";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABELS } from "../auth/types";
import { useToast } from "../components/toast/ToastContext";
import { getApiErrorMessage } from "../utils/apiError";
import { inputClass, primaryButtonClass } from "./auth/AuthLayout";

export function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [profileImage, setProfileImage] = useState(user?.profile_image ?? "");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiUpdateProfile({ full_name: fullName, profile_image: profileImage || undefined });
      refreshUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-lg">
      <h1 className="font-display text-2xl font-medium tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Manage your personal details.</p>

      <div className="panel mt-6 p-5">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-[var(--color-muted)]">Email</dt>
          <dd className="font-mono-data">{user.email}</dd>
          <dt className="text-[var(--color-muted)]">Role</dt>
          <dd>{ROLE_LABELS[user.role]}</dd>
          <dt className="text-[var(--color-muted)]">Email verified</dt>
          <dd>{user.is_email_verified ? "Yes" : "No"}</dd>
        </dl>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t pt-5" style={{ borderColor: "var(--color-line)" }}>
          <label className="block">
            <span className="tick-label">Full name</span>
            <input
              className={`${inputClass} mt-1.5`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="tick-label">Profile image URL</span>
            <input
              className={`${inputClass} mt-1.5`}
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className={`${primaryButtonClass} w-auto px-5`}
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
