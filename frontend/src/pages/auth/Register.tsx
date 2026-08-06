import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { SELF_REGISTERABLE_ROLES, ROLE_LABELS } from "../../auth/types";
import type { Role } from "../../auth/types";
import { roleHome } from "../../auth/roleHome";
import { getApiErrorMessage } from "../../utils/apiError";
import { AuthLayout, FormField, inputClass, primaryButtonClass } from "./AuthLayout";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("athlete");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await register({ full_name: fullName, email, password, role });
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create your account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Set up access to Kinetic's movement risk analysis."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full name">
          <input
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Jordan Rivera"
          />
        </FormField>
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
        <FormField label="Password">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters, incl. a number"
          />
        </FormField>
        <FormField label="I am a...">
          <div className="grid grid-cols-3 gap-2">
            {SELF_REGISTERABLE_ROLES.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className="rounded-sm border px-2 py-2 text-xs font-medium transition-colors"
                style={{
                  borderColor: role === r ? "var(--color-accent)" : "var(--color-line)",
                  backgroundColor: role === r ? "var(--color-accent-soft)" : "transparent",
                  color: role === r ? "var(--color-accent-strong)" : "var(--color-ink-soft)",
                }}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </FormField>

        {error && <p className="text-sm text-[var(--color-risk-critical)]">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={primaryButtonClass}
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {isSubmitting ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
