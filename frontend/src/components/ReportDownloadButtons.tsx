import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { downloadReportPdf } from "../api/client";
import { downloadBlob } from "../utils/download";

export function ReportDownloadButtons({ analysisId }: { analysisId: string }) {
  const [pending, setPending] = useState<"summary" | "detailed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(kind: "summary" | "detailed") {
    setPending(kind);
    setError(null);
    try {
      const blob = await downloadReportPdf(analysisId, kind);
      downloadBlob(blob, `kinetic_${kind}_${analysisId}.pdf`);
    } catch {
      setError("Couldn't generate the PDF. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        onClick={() => handleDownload("summary")}
        disabled={pending !== null}
        className="hover-lift flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{ borderColor: "var(--color-line)" }}
      >
        {pending === "summary" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Download PDF
      </button>
      <button
        onClick={() => handleDownload("detailed")}
        disabled={pending !== null}
        className="btn-glow hover-lift flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        {pending === "detailed" ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
        Download Detailed Report
      </button>
      {error && <span className="text-xs text-[var(--color-risk-critical)]">{error}</span>}
    </div>
  );
}
