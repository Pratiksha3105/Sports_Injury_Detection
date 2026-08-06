import axios from "axios";
import type { AnalysisResult, UploadFormValues } from "../types/schema";
import { getAccessToken, notifySessionExpired, setAccessToken } from "../auth/tokenStore";
import type { TokenResponse } from "../auth/types";

// Configure via .env: VITE_API_BASE_URL=http://localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// withCredentials so the httpOnly refresh-token cookie is sent on /auth/refresh.
export const client = axios.create({ baseURL: API_BASE_URL, timeout: 120_000, withCredentials: true });

// Attach the in-memory access token to every request.
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent-refresh-on-401: if a request fails with 401 (expired access token),
// try /auth/refresh once using the httpOnly cookie, then retry the original
// request with the new access token. If refresh also fails, the session is
// over — clear state and let the app redirect to /login.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<TokenResponse>(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.access_token);
        return res.data.access_token;
      })
      .catch(() => {
        notifySessionExpired();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = typeof original?.url === "string" && original.url.includes("/auth/");

    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      }
    }
    return Promise.reject(error);
  }
);

export async function analyzeVideo(
  file: File,
  form: UploadFormValues,
  onUploadProgress?: (pct: number) => void
): Promise<AnalysisResult> {
  const body = new FormData();
  body.append("file", file);
  if (form.activityType) body.append("activity_type", form.activityType);
  if (form.injuryHistory.trim()) body.append("injury_history", form.injuryHistory.trim());
  if (form.monthsSinceLastInjury) body.append("months_since_last_injury", form.monthsSinceLastInjury);
  if (form.weeklyTrainingHours) body.append("weekly_training_hours", form.weeklyTrainingHours);
  if (form.acuteChronicRatio) body.append("acute_chronic_ratio", form.acuteChronicRatio);
  if (form.athleteId) body.append("athlete_id", form.athleteId);
  body.append("export_annotated_video", String(form.exportAnnotatedVideo));

  const { data } = await client.post<AnalysisResult>("/api/v1/videos/analyze", body, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onUploadProgress && evt.total) {
        onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data;
}

export function annotatedVideoUrl(analysisId: string): string {
  return `${API_BASE_URL}/api/v1/videos/analyze/${analysisId}/annotated`;
}

export async function fetchAnnotatedVideoBlob(analysisId: string): Promise<Blob> {
  const { data } = await client.get(`/api/v1/videos/analyze/${analysisId}/annotated`, { responseType: "blob" });
  return data;
}

export async function fetchAnalysis(analysisId: string): Promise<AnalysisResult> {
  const { data } = await client.get<AnalysisResult>(`/api/v1/videos/analyze/${analysisId}`);
  return data;
}

// These endpoints require the Authorization header, so they can't be plain
// <a href> links — we fetch the PDF as a blob and trigger the browser's
// save dialog ourselves (see downloadBlob() in utils/download.ts).
export async function downloadReportPdf(analysisId: string, kind: "summary" | "detailed"): Promise<Blob> {
  const { data } = await client.get(`/api/v1/videos/analyze/${analysisId}/report/${kind}.pdf`, {
    responseType: "blob",
  });
  return data;
}
