"""
Quick end-to-end smoke test: runs the full pipeline against a real video
and prints a summary. Not a unit test suite (see tests/ for that) -- this
is meant to be run manually to sanity-check the pipeline after setup.

Usage:
    python tests/smoke_test.py /path/to/video.mp4
"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.pipeline import run_analysis  # noqa: E402


def main():
    video_path = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/vtest.avi")
    print(f"Running pipeline on: {video_path}")

    result = run_analysis(
        video_path,
        activity_type="running",
        injury_history=["Hamstring strain"],
        months_since_last_injury=4,
        weekly_training_hours=12,
        acute_chronic_ratio=1.3,
        target_sample_fps=8.0,
        export_annotated_video=True,
        annotated_output_path=Path("/tmp/annotated_smoke_test.mp4"),
    )

    print("\n=== VIDEO META ===")
    print(result.video_meta.model_dump_json(indent=2))

    print("\n=== BIOMECHANICS SUMMARY ===")
    print(result.biomechanics_summary.model_dump_json(indent=2))

    print("\n=== ANOMALIES ===")
    print(f"Total anomalies: {result.anomaly_summary.total_anomalies}")
    print(f"Fatigue trend detected: {result.anomaly_summary.fatigue_trend_detected}")
    for e in result.anomaly_summary.events[:5]:
        print(f"  [{e.severity}] t={e.timestamp_sec:.1f}s {e.anomaly_type}")

    print("\n=== RISK ASSESSMENT ===")
    print(result.risk_assessment.model_dump_json(indent=2))

    print("\n=== RECOMMENDATIONS ===")
    for section_name, items in [
        ("exercises", result.recommendations.exercises),
        ("mobility", result.recommendations.mobility),
        ("strengthening", result.recommendations.strengthening),
        ("recovery_plan", result.recommendations.recovery_plan),
        ("training_modifications", result.recommendations.training_modifications),
    ]:
        for item in items:
            print(f"  [{section_name}/{item.priority}] {item.title}")

    out_path = Path("/tmp/smoke_test_result.json")
    out_path.write_text(result.model_dump_json(indent=2))
    print(f"\nFull result written to {out_path}")
    print(f"Annotated video written to /tmp/annotated_smoke_test.mp4")


if __name__ == "__main__":
    main()
