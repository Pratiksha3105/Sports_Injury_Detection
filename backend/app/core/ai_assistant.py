"""
"Ask AI" report assistant (Features 4-7).

This module builds a system prompt that grounds every answer in the
specific report being discussed — athlete profile, full biomechanics/risk
data, and the recovery/treatment context if the report is linked to a
managed athlete — then calls the Anthropic Messages API. Conversation
history is passed back in on every call (Anthropic's API is stateless per
request), which is what gives the assistant "memory" of the current report
within a session (Feature 5) without re-sending the report context in the
visible conversation.

Requires ANTHROPIC_API_KEY (see .env.example). Without it, `ask()` raises
AIAssistantNotConfigured so the route can return a clear 503 instead of a
confusing failure.
"""
from __future__ import annotations

import httpx

from app.core.config import settings
from app.db.models import Athlete, ChatMessage
from app.models.schemas import AnalysisResult

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"


class AIAssistantNotConfigured(Exception):
    pass


class AIAssistantError(Exception):
    pass


def _fmt(v, suffix: str = "") -> str:
    return "unknown" if v is None else f"{v}{suffix}"


def build_system_prompt(result: AnalysisResult, athlete: Athlete | None, uploader_role: str) -> str:
    ra = result.risk_assessment
    bio = result.biomechanics_summary

    lines: list[str] = [
        "You are the Kinetic Sports Injury Assistant, embedded in a specific athlete's movement-analysis "
        "report. Answer using ONLY the report data given below plus general, well-established sports-medicine "
        "knowledge to explain *why* those numbers matter. Never invent numbers that aren't in this context. "
        "Be direct, specific, and cite the actual figures (e.g. 'your knee valgus reached 19°, above the ~12° "
        "reference threshold') rather than giving generic internet advice. If asked something the report can't "
        "answer, say so plainly. You are not a substitute for a licensed medical professional, and you should "
        "say so if the user seems to be asking for a diagnosis or treatment decision rather than an explanation "
        "of their data.",
        "",
        "=== ATHLETE PROFILE ===",
    ]
    if athlete:
        lines += [
            f"Name: {athlete.full_name}",
            f"Age: {_fmt(athlete.age)}  Gender: {_fmt(athlete.gender)}",
            f"Height: {_fmt(athlete.height_cm, ' cm')}  Weight: {_fmt(athlete.weight_kg, ' kg')}",
            f"Sport: {_fmt(athlete.sport)}  Position: {_fmt(athlete.position)}  Team: {_fmt(athlete.team)}",
            f"Injury history: {athlete.injury_history or 'none on file'}",
            f"Medical notes: {athlete.medical_notes or 'none on file'}",
            f"Recovery status: {athlete.recovery_status or 'not set'}",
            f"Treatment plan: {athlete.treatment_plan or 'none on file'}",
        ]
    else:
        lines.append(f"No linked athlete profile — this report was uploaded directly by a {uploader_role} account.")

    lines += [
        "",
        "=== CURRENT REPORT ===",
        f"Analysis ID: {result.analysis_id}",
        f"Activity type: {result.activity_type or 'unspecified'}",
        f"Overall injury risk score: {ra.overall_injury_risk_score:.1f}/100 ({ra.risk_category.value})",
        f"Movement quality: {ra.movement_quality_score:.1f}  Biomechanical efficiency: {ra.biomechanical_efficiency_score:.1f}",
        f"Fatigue risk: {ra.fatigue_risk_score:.1f}  Athlete health: {ra.athlete_health_score:.1f}  AI confidence: {ra.confidence_level:.1f}%",
        "Score composition (weight): "
        f"biomechanical deviations {ra.breakdown.biomechanical_deviations_score:.0f} (35%), "
        f"historical injury factors {ra.breakdown.historical_injury_factors_score:.0f} (20%), "
        f"movement asymmetry {ra.breakdown.movement_asymmetry_score:.0f} (20%), "
        f"training load {ra.breakdown.training_load_score:.0f} (15%), "
        f"fatigue {ra.breakdown.fatigue_score:.0f} (10%).",
    ]

    if ra.injury_type_risks:
        lines.append("Injury type probabilities:")
        for r in sorted(ra.injury_type_risks, key=lambda x: x.probability_pct, reverse=True):
            factors = ", ".join(r.contributing_factors) if r.contributing_factors else "none listed"
            lines.append(f"  - {r.injury_type}: {r.probability_pct:.0f}% (factors: {factors})")

    lines += [
        "",
        "Joint angles / biomechanics:",
        f"  Avg knee angle L/R: {_fmt(bio.avg_left_knee_angle,'°')} / {_fmt(bio.avg_right_knee_angle,'°')}",
        f"  Min knee angle L/R: {_fmt(bio.min_left_knee_angle,'°')} / {_fmt(bio.min_right_knee_angle,'°')}",
        f"  Max knee valgus L/R: {_fmt(bio.max_knee_valgus_left_deg,'°')} / {_fmt(bio.max_knee_valgus_right_deg,'°')}",
        f"  Trunk lean avg/max: {_fmt(bio.avg_trunk_lean_deg,'°')} / {_fmt(bio.max_trunk_lean_deg,'°')}",
        f"  Hip stability: {_fmt(bio.hip_stability_score)}/100  Symmetry: {_fmt(bio.movement_symmetry_score)}/100  "
        f"Balance: {_fmt(bio.balance_score)}/100  Landing softness: {_fmt(bio.landing_softness_score)}/100",
        f"  Pose detection rate: {bio.detection_rate * 100:.0f}% across {bio.frames_analyzed} analyzed frames",
    ]

    if result.anomaly_summary.events:
        lines.append("")
        lines.append(f"Movement anomalies ({result.anomaly_summary.total_anomalies} total):")
        for e in result.anomaly_summary.events[:10]:
            lines.append(f"  - {e.timestamp_sec:.1f}s [{e.severity}] {e.anomaly_type}: {e.description}")
    if result.anomaly_summary.fatigue_trend_detected:
        lines.append(
            f"Fatigue trend detected starting around {result.anomaly_summary.fatigue_onset_timestamp_sec:.1f}s."
        )

    lines.append("")
    lines.append("Recommendations:")
    for label, items in (
        ("Training modifications", result.recommendations.training_modifications),
        ("Recovery plan", result.recommendations.recovery_plan),
        ("Strengthening", result.recommendations.strengthening),
        ("Mobility", result.recommendations.mobility),
        ("Exercises", result.recommendations.exercises),
    ):
        for r in items:
            lines.append(f"  - [{label} / {r.priority}] {r.title}: {r.description}")

    lines += [
        "",
        "Keep answers concise and conversational unless the user explicitly asks for a longer plan "
        "(e.g. 'generate a weekly recovery plan'). When comparing to a previous report isn't possible because "
        "no earlier report was provided in this context, say that plainly instead of guessing.",
    ]
    return "\n".join(lines)


async def ask(system_prompt: str, history: list[ChatMessage], new_user_message: str) -> str:
    """Sends the conversation (report context as system prompt + prior turns +
    the new user message) to Claude and returns the assistant's reply text."""
    if not settings.ANTHROPIC_API_KEY:
        raise AIAssistantNotConfigured(
            "The AI assistant isn't configured yet — set ANTHROPIC_API_KEY in the backend environment."
        )

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": new_user_message})

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                ANTHROPIC_API_URL,
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": ANTHROPIC_VERSION,
                    "content-type": "application/json",
                },
                json={
                    "model": settings.ANTHROPIC_MODEL,
                    "max_tokens": 1024,
                    "system": system_prompt,
                    "messages": messages,
                },
            )
        except httpx.HTTPError as e:
            raise AIAssistantError(f"Could not reach the AI provider: {e}") from e

    if resp.status_code != 200:
        raise AIAssistantError(f"AI provider returned {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
    if not text_blocks:
        raise AIAssistantError("AI provider returned no text content.")
    return "\n".join(text_blocks)
