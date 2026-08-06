import { useRef, useState } from "react";
import { UploadCloud, Video } from "lucide-react";
import type { UploadFormValues } from "../types/schema";
import type { Athlete } from "../types/athlete";

interface Props {
  onSubmit: (file: File, form: UploadFormValues) => void;
  isSubmitting: boolean;
  uploadProgress: number;
  errorMessage: string | null;
  athletes?: Athlete[];
}

const ACTIVITIES = [
  "running", "sprinting", "jumping", "squatting", "landing", "throwing", "cutting", "sport_specific",
];

export function UploadPanel({ onSubmit, isSubmitting, uploadProgress, errorMessage, athletes = [] }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<UploadFormValues>({
    activityType: "running",
    injuryHistory: "",
    monthsSinceLastInjury: "",
    weeklyTrainingHours: "",
    acuteChronicRatio: "",
    exportAnnotatedVideo: true,
    athleteId: "",
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(file, form);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="panel flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm px-6 py-14 text-center transition-colors"
        style={{
          borderColor: dragOver ? "var(--color-accent)" : "var(--color-line)",
          backgroundColor: dragOver ? "var(--color-accent-soft)" : "var(--color-panel)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <Video size={28} style={{ color: "var(--color-accent)" }} />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="tick-label mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB — click to change</p>
            </div>
          </>
        ) : (
          <>
            <UploadCloud size={28} style={{ color: "var(--color-muted)" }} />
            <div>
              <p className="font-medium">Drop a movement clip here, or click to browse</p>
              <p className="tick-label mt-1">MP4, MOV, AVI, MKV, or WEBM · up to 500MB</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {athletes.length > 0 && (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="tick-label">Link to athlete (optional)</span>
            <select
              value={form.athleteId}
              onChange={(e) => setForm({ ...form, athleteId: e.target.value })}
              className="panel rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Not linked to a specific athlete</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                  {a.sport ? ` · ${a.sport}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="tick-label">Activity</span>
          <select
            value={form.activityType}
            onChange={(e) => setForm({ ...form, activityType: e.target.value })}
            className="panel rounded-sm px-3 py-2 text-sm"
          >
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {a.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="tick-label">Weekly training hours</span>
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="e.g. 10"
            value={form.weeklyTrainingHours}
            onChange={(e) => setForm({ ...form, weeklyTrainingHours: e.target.value })}
            className="panel rounded-sm px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="tick-label">Injury history (comma-separated, optional)</span>
          <input
            type="text"
            placeholder="e.g. ACL tear, hamstring strain"
            value={form.injuryHistory}
            onChange={(e) => setForm({ ...form, injuryHistory: e.target.value })}
            className="panel rounded-sm px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="tick-label">Months since last injury</span>
          <input
            type="number"
            min={0}
            placeholder="optional"
            value={form.monthsSinceLastInjury}
            onChange={(e) => setForm({ ...form, monthsSinceLastInjury: e.target.value })}
            className="panel rounded-sm px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="tick-label">Acute:chronic load ratio</span>
          <input
            type="number"
            min={0}
            step={0.1}
            placeholder="optional"
            value={form.acuteChronicRatio}
            onChange={(e) => setForm({ ...form, acuteChronicRatio: e.target.value })}
            className="panel rounded-sm px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.exportAnnotatedVideo}
          onChange={(e) => setForm({ ...form, exportAnnotatedVideo: e.target.checked })}
        />
        Export skeleton-overlay annotated video
      </label>

      {errorMessage && (
        <div className="rounded-sm p-3 text-sm" style={{ backgroundColor: "var(--color-risk-high-soft)", color: "var(--color-risk-high)" }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || isSubmitting}
        className="font-display flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        {isSubmitting ? (
          <>Analyzing{uploadProgress < 100 ? ` — uploading ${uploadProgress}%` : "…"}</>
        ) : (
          "Run biomechanics analysis"
        )}
      </button>
    </form>
  );
}
