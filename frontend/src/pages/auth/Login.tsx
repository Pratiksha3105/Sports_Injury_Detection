import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";
import { AuthLayout, FormField, inputClass, primaryButtonClass } from "./AuthLayout";
import { roleHome } from "../../auth/roleHome";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname;
      navigate(redirectTo && redirectTo !== "/login" ? redirectTo : roleHome(user.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back — enter your details to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
            Register
          </Link>
        </>
      }
    >
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
        <FormField label="Password">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </FormField>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-[var(--color-accent)] hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-[var(--color-risk-critical)]">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={primaryButtonClass}
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {isSubmitting ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
