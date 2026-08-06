import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { apiForgotPassword } from "../../auth/authApi";
import { getApiErrorMessage } from "../../utils/apiError";
import { AuthLayout, FormField, inputClass, primaryButtonClass } from "./AuthLayout";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiForgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a reset link to your email if an account exists."
      footer={
        <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-[var(--color-ink-soft)]">
          If an account exists for <span className="font-medium text-[var(--color-ink)]">{email}</span>, a reset
          link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </FormField>

          {error && <p className="text-sm text-[var(--color-risk-critical)]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={primaryButtonClass}
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            {isSubmitting ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
