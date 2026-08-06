import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { apiResetPassword } from "../../auth/authApi";
import { getApiErrorMessage } from "../../utils/apiError";
import { AuthLayout, FormField, inputClass, primaryButtonClass } from "./AuthLayout";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiResetPassword(token, password);
      navigate("/login", { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setError(getApiErrorMessage(err, "This reset link is invalid or has expired"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset your password">
        <p className="text-sm text-[var(--color-risk-critical)]">
          Missing or invalid reset link. Please request a new one.
        </p>
        <Link to="/forgot-password" className="mt-4 block text-sm text-[var(--color-accent)] hover:underline">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Make it something you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New password">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Confirm password">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </FormField>

        {error && <p className="text-sm text-[var(--color-risk-critical)]">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={primaryButtonClass}
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {isSubmitting ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}
