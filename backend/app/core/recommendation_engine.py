"""
Corrective Recommendation Engine
===================================
Implements spec section 9: exercise recommendations, mobility suggestions,
strengthening recommendations, recovery planning, training modification
suggestions -- generated deterministically from the risk assessment and
biomechanics summary so recommendations are always traceable to a specific
measured finding.
"""
from __future__ import annotations

from app.models.schemas import (
    BiomechanicsSummary,
    RiskAssessment,
    AnomalySummary,
    Recommendation,
    RecommendationSet,
)


def build_recommendations(
    bio: BiomechanicsSummary,
    risk: RiskAssessment,
    anomalies: AnomalySummary,
) -> RecommendationSet:
    exercises: list[Recommendation] = []
    mobility: list[Recommendation] = []
    strengthening: list[Recommendation] = []
    recovery: list[Recommendation] = []
    training_mods: list[Recommendation] = []

    max_valgus = max(bio.max_knee_valgus_left_deg or 0, bio.max_knee_valgus_right_deg or 0)
    if max_valgus > 10:
        strengthening.append(Recommendation(
            category="strengthening",
            title="Hip abductor & glute medius strengthening",
            description="Elevated knee valgus was detected during movement, which is commonly linked to "
                        "weak hip abductors. Add lateral band walks, clamshells, and single-leg glute "
                        "bridges 3x/week.",
            priority="high" if max_valgus > 15 else "medium",
        ))
        exercises.append(Recommendation(
            category="exercise",
            title="Single-leg landing drills",
            description="Practice controlled single-leg drop-landings focusing on knee-over-toe alignment "
                        "to retrain landing mechanics and reduce valgus collapse.",
            priority="high" if max_valgus > 15 else "medium",
        ))

    if bio.movement_symmetry_score is not None and bio.movement_symmetry_score < 75:
        exercises.append(Recommendation(
            category="exercise",
            title="Unilateral strength balancing work",
            description=f"Left/right movement symmetry scored {bio.movement_symmetry_score:.0f}/100. "
                        "Incorporate single-leg squats, step-ups, and split-squats to correct the imbalance "
                        "between limbs.",
            priority="medium",
        ))

    if bio.hip_stability_score is not None and bio.hip_stability_score < 65:
        strengthening.append(Recommendation(
            category="strengthening",
            title="Core & pelvic stability program",
            description="Hip stability score indicates pelvic control deficits. Add planks, dead bugs, "
                        "and Pallof presses to the training program 3-4x/week.",
            priority="medium",
        ))

    if bio.avg_trunk_lean_deg is not None and bio.avg_trunk_lean_deg > 12:
        mobility.append(Recommendation(
            category="mobility",
            title="Thoracic and hip mobility work",
            description=f"Average trunk lean of {bio.avg_trunk_lean_deg:.1f}° suggests compensatory "
                        "forward-leaning technique. Add thoracic extensions and hip flexor stretches "
                        "before training sessions.",
            priority="medium",
        ))

    if bio.landing_softness_score is not None and bio.landing_softness_score < 55:
        exercises.append(Recommendation(
            category="exercise",
            title="Eccentric landing control training",
            description="Landings show a hard/abrupt deceleration pattern. Practice 'stick the landing' "
                        "drills with a 2-3 second controlled eccentric phase to build shock absorption.",
            priority="high",
        ))

    if anomalies.fatigue_trend_detected:
        recovery.append(Recommendation(
            category="recovery",
            title="Fatigue-driven technique breakdown detected",
            description="Movement quality declined over the course of the clip, consistent with fatigue. "
                        "Prioritize sleep (7-9h), hydration, and consider reducing session volume by "
                        "10-15% this week while monitoring for recovery.",
            priority="high",
        ))
        training_mods.append(Recommendation(
            category="training_modification",
            title="Insert technical work earlier in sessions",
            description="Schedule technique-critical drills (plyometrics, cutting, sprinting) at the "
                        "start of sessions, before fatigue compromises movement quality.",
            priority="medium",
        ))

    if risk.risk_category.value in ("High Risk", "Critical Risk"):
        training_mods.append(Recommendation(
            category="training_modification",
            title="Reduce high-impact training load temporarily",
            description=f"Overall injury risk score is {risk.overall_injury_risk_score:.0f}/100 "
                        f"({risk.risk_category.value}). Reduce plyometric and high-speed change-of-direction "
                        "volume by ~30% for 1-2 weeks while corrective work is implemented, and reassess.",
            priority="high",
        ))
        recovery.append(Recommendation(
            category="recovery",
            title="Physiotherapist / sports medicine review recommended",
            description="Given the elevated risk score, a hands-on assessment from a physiotherapist or "
                        "sports medicine professional is recommended to confirm findings before making "
                        "training decisions based on this automated analysis.",
            priority="high",
        ))

    # Always include a baseline recovery-plan entry so the section is never empty.
    if not recovery:
        recovery.append(Recommendation(
            category="recovery",
            title="Maintain standard recovery protocol",
            description="No elevated fatigue or risk signals detected. Continue standard recovery "
                        "practices: adequate sleep, hydration, and periodized training load.",
            priority="low",
        ))
    if not exercises:
        exercises.append(Recommendation(
            category="exercise",
            title="Maintain current training program",
            description="Movement mechanics are within normal ranges for this clip. Continue current "
                        "programming and re-test periodically.",
            priority="low",
        ))

    return RecommendationSet(
        exercises=exercises,
        mobility=mobility,
        strengthening=strengthening,
        recovery_plan=recovery,
        training_modifications=training_mods,
    )
