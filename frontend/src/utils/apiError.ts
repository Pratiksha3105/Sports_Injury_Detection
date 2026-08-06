import { AxiosError } from "axios";

/** FastAPI returns {"detail": "..."} or {"detail": [{"msg": "...", ...}, ...]} for validation errors. */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg ?? String(d)).join(" ");
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
