import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { analyzeVideo, annotatedVideoUrl } from "../api/client";
import { apiListAthletes } from "../api/athleteApi";
import type { AnalysisResult, UploadFormValues } from "../types/schema";
import type { Athlete } from "../types/athlete";
import { UploadPanel } from "../components/UploadPanel";
import { RiskGauge } from "../components/RiskGauge";
import { StatCard } from "../components/StatCard";
import { KineticChainReadout } from "../components/KineticChainReadout";
import { JointAngleChart } from "../components/JointAngleChart";
import { InjuryRiskBreakdown } from "../components/InjuryRiskBreakdown";
import { AnomalyTimeline } from "../components/AnomalyTimeline";
import { RecommendationsPanel } from "../components/RecommendationsPanel";
import { ReportDownloadButtons } from "../components/ReportDownloadButtons";
import { AskAIDrawer } from "../components/AskAIDrawer";
import { useAuth } from "../auth/AuthContext";
import { scoreToRiskColor } from "../utils/risk";

export function Dashboard() {
  const { user } = useAuth();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (user && (user.role === "coach" || user.role === "physiotherapist")) {
      apiListAthletes().then(setAthletes).catch(() => setAthletes([]));
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: ({ file, form }: { file: File; form: UploadFormValues }) =>
      analyzeVideo(file, form, setUploadProgress),
    onSuccess: (data) => setResult(data),
  });

  const errorMessage = mutation.isError
    ? mutation.error instanceof Error
      ? // axios errors carry a nested response detail from FastAPI's HTTPException
        // @ts-expect-error axios error shape
        mutation.error.response?.data?.detail ?? mutation.error.message
      : "Something went wrong analyzing this clip."
    : null;

  return (
    <div>
      {result && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <ReportDownloadButtons analysisId={result.analysis_id} />
            <button
              onClick={() => setChatOpen(true)}
              className="hover-lift flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
            >
              <Sparkles size={13} /> Ask AI
            </button>
          </div>
          <button
            onClick={() => setResult(null)}
            className="hover-lift flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
          >
            <RotateCcw size={14} /> New analysis
          </button>
        </div>
      )}
      {chatOpen && result && <AskAIDrawer analysisId={result.analysis_id} onClose={() => setChatOpen(false)} />}
      {!result ? (
        <>
          <div className="animate-fade-up mx-auto mb-10 max-w-2xl text-center">
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Upload a clip. Read the kinetic chain.
            </h1>
            <p className="mt-3 text-[var(--color-ink-soft)]">
              Pose estimation, joint-angle biomechanics, and a weighted injury
              risk score — run on your own video, in one pass.
            </p>
          </div>
          <UploadPanel
            onSubmit={(file, form) => mutation.mutate({ file, form })}
            isSubmitting={mutation.isPending}
            uploadProgress={uploadProgress}
            errorMessage={errorMessage}
            athletes={athletes}
          />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]"
        >
          {/* Signature instrument rail */}
          <KineticChainReadout bio={result.biomechanics_summary} />

          <div className="flex flex-col gap-6">
            {/* Hero: risk gauge + secondary stats */}
            <div className="panel grid grid-cols-1 gap-8 p-6 md:grid-cols-[auto_1fr]">
              <RiskGauge risk={result.risk_assessment} />
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <span className="font-mono-data">{result.video_meta.filename}</span>
                  <span>·</span>
                  <span className="font-mono-data">{result.video_meta.duration_sec.toFixed(1)}s</span>
                  <span>·</span>
                  <span className="capitalize">{result.activity_type ?? "unspecified activity"}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Movement quality" value={result.risk_assessment.movement_quality_score} />
                  <StatCard label="Biomech. efficiency" value={result.risk_assessment.biomechanical_efficiency_score} />
                  <StatCard label="Fatigue risk" value={result.risk_assessment.fatigue_risk_score} />
                  <StatCard label="Athlete health" value={result.risk_assessment.athlete_health_score} />
                </div>

                {/* Weighted score breakdown */}
                <div className="mt-5">
                  <div className="tick-label mb-2">Score composition</div>
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    {[
                      { key: "Biomechanical", val: result.risk_assessment.breakdown.biomechanical_deviations_score, w: 35 },
                      { key: "History", val: result.risk_assessment.breakdown.historical_injury_factors_score, w: 20 },
                      { key: "Asymmetry", val: result.risk_assessment.breakdown.movement_asymmetry_score, w: 20 },
                      { key: "Training load", val: result.risk_assessment.breakdown.training_load_score, w: 15 },
                      { key: "Fatigue", val: result.risk_assessment.breakdown.fatigue_score, w: 10 },
                    ].map((seg) => (
                      <div
                        key={seg.key}
                        title={`${seg.key}: ${seg.val.toFixed(0)}/100 (weight ${seg.w}%)`}
                        style={{ width: `${seg.w}%`, backgroundColor: scoreToRiskColor(seg.val) }}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                    <span>Biomechanical 35%</span>
                    <span>History 20%</span>
                    <span>Asymmetry 20%</span>
                    <span>Training load 15%</span>
                    <span>Fatigue 10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annotated video, if requested */}
            {result.video_meta && (
              <AnnotatedVideoCard analysisId={result.analysis_id} />
            )}

            {/* Joint angle chart + injury breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="panel p-5">
                <h2 className="font-display mb-1 text-sm font-medium">Knee flexion over time</h2>
                <p className="mb-2 text-xs text-[var(--color-muted)]">
                  180° ≈ fully extended. Sharp drops indicate flexion (squat, land, cut).
                </p>
                <JointAngleChart frames={result.per_frame_biomechanics} />
              </div>
              <div className="panel p-5">
                <h2 className="font-display mb-3 text-sm font-medium">Injury type risk</h2>
                <InjuryRiskBreakdown risks={result.risk_assessment.injury_type_risks} />
              </div>
            </div>

            {/* Anomalies */}
            <div className="panel p-5">
              <h2 className="font-display mb-3 text-sm font-medium">Movement anomalies &amp; fatigue trend</h2>
              <AnomalyTimeline anomalies={result.anomaly_summary} durationSec={result.video_meta.duration_sec} />
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="font-display mb-3 text-sm font-medium">Recommendations</h2>
              <RecommendationsPanel recs={result.recommendations} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AnnotatedVideoCard({ analysisId }: { analysisId: string }) {
  const [hasVideo, setHasVideo] = useState(true);
  if (!hasVideo) return null;
  return (
    <div className="panel p-5">
      <h2 className="font-display mb-3 text-sm font-medium">Skeleton overlay</h2>
      <video
        controls
        className="w-full rounded-sm bg-black"
        style={{ maxHeight: 420 }}
        onError={() => setHasVideo(false)}
        src={annotatedVideoUrl(analysisId)}
      />
    </div>
  );
}
