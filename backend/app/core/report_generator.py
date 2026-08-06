"""
PDF report generation for a completed movement analysis.

This module only *renders* an existing `AnalysisResult` (already produced by
the pose-estimation -> biomechanics -> risk-scoring pipeline in
`app/core/pipeline.py`). It does not compute anything new, so it can't
change or affect any prediction, score, or business logic — it's a pure
presentation layer on top of data that already exists.

Two report types are offered, matching the two "Download" buttons on the
dashboard:
  - build_summary_pdf()  -> a one-to-two page overview: risk gauge,
    headline scores, category, and top recommendations.
  - build_detailed_pdf() -> the full report: everything in the summary
    plus the biomechanics table, joint-angle summary, anomaly timeline,
    and the complete recommendation set.
"""
from __future__ import annotations

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.schemas import AnalysisResult, RiskCategory

# Brand palette (kept in sync with the frontend's --color-accent / risk scale
# design tokens in index.css so the PDF matches the product, not a guess).
INK = colors.HexColor("#16211b")
INK_SOFT = colors.HexColor("#3b453e")
MUTED = colors.HexColor("#6b756e")
LINE = colors.HexColor("#d9ded6")
ACCENT = colors.HexColor("#0f6b5c")
ACCENT_STRONG = colors.HexColor("#0a4f44")
PAPER_DIM = colors.HexColor("#eceee7")

RISK_COLORS = {
    RiskCategory.LOW: colors.HexColor("#2e8b57"),
    RiskCategory.MODERATE: colors.HexColor("#c69117"),
    RiskCategory.HIGH: colors.HexColor("#d9622b"),
    RiskCategory.CRITICAL: colors.HexColor("#c23b3b"),
}
RISK_SOFT = {
    RiskCategory.LOW: colors.HexColor("#e2f1e8"),
    RiskCategory.MODERATE: colors.HexColor("#f6ecd2"),
    RiskCategory.HIGH: colors.HexColor("#f8e3d5"),
    RiskCategory.CRITICAL: colors.HexColor("#f6dcdc"),
}

PRIORITY_COLORS = {"high": colors.HexColor("#c23b3b"), "medium": colors.HexColor("#c69117"), "low": colors.HexColor("#2e8b57")}


def _styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("KTitle", parent=base["Title"], textColor=INK, fontSize=22, leading=26, spaceAfter=2),
        "subtitle": ParagraphStyle("KSubtitle", parent=base["Normal"], textColor=MUTED, fontSize=9.5, leading=13),
        "h2": ParagraphStyle("KH2", parent=base["Heading2"], textColor=INK, fontSize=13, leading=16, spaceBefore=14, spaceAfter=6),
        "h3": ParagraphStyle("KH3", parent=base["Heading3"], textColor=INK, fontSize=10.5, leading=13, spaceBefore=8, spaceAfter=3),
        "body": ParagraphStyle("KBody", parent=base["Normal"], textColor=INK_SOFT, fontSize=9.5, leading=14),
        "muted": ParagraphStyle("KMuted", parent=base["Normal"], textColor=MUTED, fontSize=8.5, leading=12),
        "cell": ParagraphStyle("KCell", parent=base["Normal"], textColor=INK_SOFT, fontSize=9, leading=12),
        "cell_head": ParagraphStyle("KCellHead", parent=base["Normal"], textColor=MUTED, fontSize=7.5, leading=10),
        "score_big": ParagraphStyle("KScoreBig", parent=base["Normal"], textColor=INK, fontSize=30, leading=32, alignment=TA_CENTER, fontName="Helvetica-Bold"),
        "score_label": ParagraphStyle("KScoreLabel", parent=base["Normal"], textColor=MUTED, fontSize=7.5, leading=10, alignment=TA_CENTER),
        "footer": ParagraphStyle("KFooter", parent=base["Normal"], textColor=MUTED, fontSize=7.5, leading=10),
    }


def _fmt(v, suffix: str = "", digits: int = 1) -> str:
    if v is None:
        return "—"
    return f"{v:.{digits}f}{suffix}"


def _header(result: AnalysisResult, requested_by: str | None, styles: dict) -> list:
    generated = datetime.now(timezone.utc).strftime("%b %d, %Y %H:%M UTC")
    flow = [
        Paragraph("Kinetic — Movement Risk Report", styles["title"]),
        Paragraph(
            f"Analysis ID {result.analysis_id} &nbsp;·&nbsp; Generated {generated}"
            + (f" &nbsp;·&nbsp; Requested by {requested_by}" if requested_by else ""),
            styles["subtitle"],
        ),
        Spacer(1, 10),
        HRFlowable(width="100%", thickness=1, color=LINE, spaceAfter=10),
    ]
    return flow


def _athlete_video_table(result: AnalysisResult, styles: dict) -> Table:
    vm = result.video_meta
    rows = [
        ["Source file", vm.filename, "Activity type", (result.activity_type or "unspecified").replace("_", " ").title()],
        ["Duration", _fmt(vm.duration_sec, "s"), "Frame rate", _fmt(vm.fps, " fps")],
        ["Resolution", f"{vm.width}×{vm.height}", "Frames analyzed", f"{result.biomechanics_summary.frames_analyzed}"],
        [
            "Detection rate",
            _fmt(result.biomechanics_summary.detection_rate * 100, "%"),
            "AI confidence",
            _fmt(result.risk_assessment.confidence_level, "%"),
        ],
    ]
    data = []
    for a_label, a_val, b_label, b_val in rows:
        data.append(
            [
                Paragraph(a_label.upper(), styles["cell_head"]),
                Paragraph(str(a_val), styles["cell"]),
                Paragraph(b_label.upper(), styles["cell_head"]),
                Paragraph(str(b_val), styles["cell"]),
            ]
        )
    t = Table(data, colWidths=[1.3 * inch, 2.05 * inch, 1.3 * inch, 2.05 * inch])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.75, LINE),
                ("LEFTPADDING", (0, 0), (0, -1), 10),
                ("LEFTPADDING", (2, 0), (2, -1), 10),
            ]
        )
    )
    return t


def _risk_hero(result: AnalysisResult, styles: dict) -> Table:
    ra = result.risk_assessment
    risk_color = RISK_COLORS.get(ra.risk_category, ACCENT)
    risk_soft = RISK_SOFT.get(ra.risk_category, PAPER_DIM)

    gauge_cell = [
        Paragraph(_fmt(ra.overall_injury_risk_score, "", 0), styles["score_big"]),
        Paragraph("OVERALL RISK SCORE / 100", styles["score_label"]),
        Spacer(1, 6),
    ]
    gauge_table = Table([[c] for c in gauge_cell], colWidths=[1.7 * inch])
    gauge_table.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))

    badge = Table(
        [[Paragraph(f"<b>{ra.risk_category.value.upper()}</b>", ParagraphStyle("badge", parent=styles["body"], textColor=risk_color, alignment=TA_CENTER, fontSize=10))]],
        colWidths=[1.7 * inch],
    )
    badge.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), risk_soft),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("ROUNDEDCORNERS", [6, 6, 6, 6]),
            ]
        )
    )

    stat_rows = [
        ("Movement quality", ra.movement_quality_score),
        ("Biomech. efficiency", ra.biomechanical_efficiency_score),
        ("Fatigue risk", ra.fatigue_risk_score),
        ("Athlete health", ra.athlete_health_score),
    ]
    stat_cells = []
    for label, val in stat_rows:
        cell = Table(
            [[Paragraph(_fmt(val, "", 0), ParagraphStyle("sv", parent=styles["body"], fontSize=15, textColor=INK, fontName="Helvetica-Bold"))],
             [Paragraph(label.upper(), styles["cell_head"])]],
            colWidths=[1.35 * inch],
        )
        cell.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"), ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
        stat_cells.append(cell)

    stats_table = Table([stat_cells], colWidths=[1.35 * inch] * 4)
    stats_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.75, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    left_col = Table([[gauge_table], [badge]], colWidths=[1.8 * inch])
    left_col.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"), ("BOTTOMPADDING", (0, 0), (0, 0), 4)]))

    outer = Table([[left_col, stats_table]], colWidths=[1.9 * inch, 5.4 * inch])
    outer.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOX", (0, 0), (-1, -1), 0.75, LINE),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("LEFTPADDING", (0, 0), (0, -1), 12),
                ("RIGHTPADDING", (1, 0), (1, -1), 12),
            ]
        )
    )
    return outer


def _score_breakdown_table(result: AnalysisResult, styles: dict) -> Table:
    b = result.risk_assessment.breakdown
    rows = [
        ("Biomechanical deviations", b.biomechanical_deviations_score, b.biomechanical_deviations_weight),
        ("Historical injury factors", b.historical_injury_factors_score, b.historical_injury_factors_weight),
        ("Movement asymmetry", b.movement_asymmetry_score, b.movement_asymmetry_weight),
        ("Training load", b.training_load_score, b.training_load_weight),
        ("Fatigue", b.fatigue_score, b.fatigue_weight),
    ]
    data = [[Paragraph("COMPONENT", styles["cell_head"]), Paragraph("SCORE /100", styles["cell_head"]), Paragraph("WEIGHT", styles["cell_head"]), ""]]
    for label, score, weight in rows:
        bar_pct = max(0, min(100, score)) / 100
        bar = Table([[""]], colWidths=[1.6 * inch * bar_pct if bar_pct > 0 else 0.02])
        bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), ACCENT), ("LINEBELOW", (0,0),(-1,-1), 0, colors.white)]))
        bar_wrap = Table([[bar, ""]], colWidths=[1.6 * inch, 0.01 * inch])
        bar_wrap.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, 0), PAPER_DIM), ("TOPPADDING", (0,0),(-1,-1), 3), ("BOTTOMPADDING", (0,0),(-1,-1), 3)]))
        data.append(
            [
                Paragraph(label, styles["cell"]),
                Paragraph(_fmt(score, "", 0), styles["cell"]),
                Paragraph(f"{weight * 100:.0f}%", styles["cell"]),
                bar_wrap,
            ]
        )
    t = Table(data, colWidths=[2.0 * inch, 0.8 * inch, 0.7 * inch, 2.8 * inch])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LINEBELOW", (0, 0), (-1, 0), 1, LINE),
                ("LINEBELOW", (0, 1), (-1, -2), 0.5, LINE),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def _injury_type_table(result: AnalysisResult, styles: dict) -> Table | None:
    risks = result.risk_assessment.injury_type_risks
    if not risks:
        return None
    data = [[Paragraph("INJURY TYPE", styles["cell_head"]), Paragraph("PROBABILITY", styles["cell_head"]), Paragraph("CONTRIBUTING FACTORS", styles["cell_head"])]]
    for r in sorted(risks, key=lambda x: x.probability_pct, reverse=True):
        data.append(
            [
                Paragraph(r.injury_type, styles["cell"]),
                Paragraph(_fmt(r.probability_pct, "%", 0), styles["cell"]),
                Paragraph(", ".join(r.contributing_factors) if r.contributing_factors else "—", styles["cell"]),
            ]
        )
    t = Table(data, colWidths=[1.6 * inch, 1.0 * inch, 3.7 * inch])
    t.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, 0), 1, LINE),
                ("LINEBELOW", (0, 1), (-1, -2), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def _joint_angle_table(result: AnalysisResult, styles: dict) -> Table:
    s = result.biomechanics_summary
    pairs = [
        ("Avg. left knee angle", _fmt(s.avg_left_knee_angle, "°")),
        ("Avg. right knee angle", _fmt(s.avg_right_knee_angle, "°")),
        ("Min. left knee angle", _fmt(s.min_left_knee_angle, "°")),
        ("Min. right knee angle", _fmt(s.min_right_knee_angle, "°")),
        ("Max. knee valgus (L)", _fmt(s.max_knee_valgus_left_deg, "°")),
        ("Max. knee valgus (R)", _fmt(s.max_knee_valgus_right_deg, "°")),
        ("Avg. trunk lean", _fmt(s.avg_trunk_lean_deg, "°")),
        ("Max. trunk lean", _fmt(s.max_trunk_lean_deg, "°")),
        ("Hip stability score", _fmt(s.hip_stability_score, "/100", 0)),
        ("Movement symmetry score", _fmt(s.movement_symmetry_score, "/100", 0)),
        ("Balance score", _fmt(s.balance_score, "/100", 0)),
        ("Landing softness score", _fmt(s.landing_softness_score, "/100", 0)),
    ]
    data = []
    for i in range(0, len(pairs), 2):
        row = []
        for label, val in pairs[i : i + 2]:
            row += [Paragraph(label.upper(), styles["cell_head"]), Paragraph(val, styles["cell"])]
        if len(row) < 4:
            row += ["", ""]
        data.append(row)
    t = Table(data, colWidths=[1.7 * inch, 0.85 * inch, 1.7 * inch, 0.85 * inch])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def _anomaly_table(result: AnalysisResult, styles: dict) -> Table | None:
    events = result.anomaly_summary.events
    if not events:
        return None
    data = [[Paragraph(h, styles["cell_head"]) for h in ["TIME", "TYPE", "SEVERITY", "DESCRIPTION"]]]
    for e in events[:30]:
        sev_color = {"low": colors.HexColor("#2e8b57"), "moderate": colors.HexColor("#c69117"), "high": colors.HexColor("#d9622b")}.get(
            e.severity.lower(), MUTED
        )
        data.append(
            [
                Paragraph(f"{e.timestamp_sec:.1f}s", styles["cell"]),
                Paragraph(e.anomaly_type.replace("_", " ").title(), styles["cell"]),
                Paragraph(f'<font color="#{sev_color.hexval()[2:]}"><b>{e.severity.title()}</b></font>', styles["cell"]),
                Paragraph(e.description, styles["cell"]),
            ]
        )
    t = Table(data, colWidths=[0.6 * inch, 1.1 * inch, 0.8 * inch, 3.8 * inch])
    t.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, 0), 1, LINE),
                ("LINEBELOW", (0, 1), (-1, -2), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


def _recommendation_flow(result: AnalysisResult, styles: dict, limit: int | None = None) -> list:
    rec = result.recommendations
    groups = [
        ("Training modifications", rec.training_modifications),
        ("Recovery plan", rec.recovery_plan),
        ("Strengthening", rec.strengthening),
        ("Mobility", rec.mobility),
        ("Exercises", rec.exercises),
    ]
    flow: list = []
    shown = 0
    for group_label, items in groups:
        if not items:
            continue
        if limit is not None and shown >= limit:
            break
        flow.append(Paragraph(group_label, styles["h3"]))
        for r in items:
            if limit is not None and shown >= limit:
                break
            pcolor = PRIORITY_COLORS.get(r.priority.lower(), MUTED)
            line = (
                f'<font color="#{pcolor.hexval()[2:]}"><b>[{r.priority.upper()}]</b></font> '
                f"<b>{r.title}</b> — {r.description}"
            )
            flow.append(Paragraph(line, styles["body"]))
            flow.append(Spacer(1, 3))
            shown += 1
    return flow


def _footer_note(styles: dict) -> Paragraph:
    return Paragraph(
        "AI model information: pose estimation via MediaPipe Pose (BlazePose landmark model). "
        "The injury-risk score is a transparent, weighted rule-based formula "
        "(biomechanical deviations 35% + historical factors 20% + movement asymmetry 20% + "
        "training load 15% + fatigue 10%) built on measured biomechanics — it is not a clinically "
        "validated diagnostic prediction and does not replace assessment by a qualified medical "
        "professional. Generated automatically by Kinetic.",
        styles["footer"],
    )


def _build(result: AnalysisResult, requested_by: str | None, detailed: bool) -> bytes:
    styles = _styles()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=LETTER,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title=f"Kinetic Report — {result.analysis_id}",
    )

    flow: list = []
    flow += _header(result, requested_by, styles)
    flow.append(KeepTogether(_athlete_video_table(result, styles)))
    flow.append(Paragraph("Injury Risk Assessment", styles["h2"]))
    flow.append(KeepTogether(_risk_hero(result, styles)))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph("Score Composition", styles["h3"]))
    flow.append(_score_breakdown_table(result, styles))

    injury_table = _injury_type_table(result, styles)
    if injury_table is not None:
        flow.append(Paragraph("Injury Type Risk", styles["h2"]))
        flow.append(injury_table)

    if detailed:
        flow.append(Paragraph("Biomechanics Summary", styles["h2"]))
        flow.append(_joint_angle_table(result, styles))

        anomaly_table = _anomaly_table(result, styles)
        flow.append(Paragraph("Movement Anomalies & Fatigue", styles["h2"]))
        if anomaly_table is not None:
            fatigue_note = (
                f"Fatigue trend detected from ~{result.anomaly_summary.fatigue_onset_timestamp_sec:.1f}s."
                if result.anomaly_summary.fatigue_trend_detected and result.anomaly_summary.fatigue_onset_timestamp_sec is not None
                else "No sustained fatigue trend detected."
            )
            flow.append(Paragraph(f"{result.anomaly_summary.total_anomalies} anomaly event(s) detected. {fatigue_note}", styles["body"]))
            flow.append(Spacer(1, 4))
            flow.append(anomaly_table)
        else:
            flow.append(Paragraph("No anomalies detected in this clip.", styles["body"]))

        flow.append(Paragraph("Recommendations", styles["h2"]))
        flow += _recommendation_flow(result, styles)
    else:
        flow.append(Paragraph("Top Recommendations", styles["h2"]))
        flow += _recommendation_flow(result, styles, limit=4)
        flow.append(Spacer(1, 4))
        flow.append(Paragraph("Download the detailed report for the full biomechanics table, anomaly timeline, and complete recommendation set.", styles["muted"]))

    flow.append(Spacer(1, 16))
    flow.append(HRFlowable(width="100%", thickness=0.5, color=LINE, spaceAfter=6))
    flow.append(_footer_note(styles))

    doc.build(flow)
    return buf.getvalue()


def build_summary_pdf(result: AnalysisResult, requested_by: str | None = None) -> bytes:
    """A concise 1-2 page overview: risk gauge, headline scores, and top recommendations."""
    return _build(result, requested_by, detailed=False)


def build_detailed_pdf(result: AnalysisResult, requested_by: str | None = None) -> bytes:
    """The complete report: everything in the summary plus biomechanics, anomalies, and all recommendations."""
    return _build(result, requested_by, detailed=True)
