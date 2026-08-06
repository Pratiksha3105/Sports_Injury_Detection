import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiVerifyEmail } from "../../auth/authApi";
import { getApiErrorMessage } from "../../utils/apiError";
import { AuthLayout } from "./AuthLayout";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    apiVerifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "This verification link is invalid or has expired."));
      });
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        {status === "loading" && <Loader2 size={28} className="animate-spin" style={{ color: "var(--color-accent)" }} />}
        {status === "success" && <CheckCircle2 size={28} style={{ color: "var(--color-risk-low)" }} />}
        {status === "error" && <XCircle size={28} style={{ color: "var(--color-risk-critical)" }} />}
        <p className="text-sm text-[var(--color-ink-soft)]">
          {status === "loading" ? "Verifying your email…" : message}
        </p>
        {status !== "loading" && (
          <Link to="/login" className="mt-2 text-sm font-medium text-[var(--color-accent)] hover:underline">
            Go to login
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
