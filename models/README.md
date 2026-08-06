# models/

Reserved for trained/exported model artifacts (e.g. a serialized
`scikit-learn`/`xgboost` model if the rule-based risk-scoring formula in
`backend/app/core/risk_engine.py` is ever replaced or augmented with a
learned model).

**Current state:** the injury-risk scoring in this project is a transparent,
weighted rule-based formula (see `backend/README.md` → "Scope & honesty"),
not a trained ML model, so this directory is currently empty. Pose
estimation uses MediaPipe's bundled pretrained weights (installed via the
`mediapipe` pip package — see the pinned version note in
`backend/requirements.txt`), so no separate model file needs to live here
for the app to run today.

If you add a trained model later:

1. Save it here, e.g. `models/injury_risk_xgb_v1.joblib`.
2. Load it in `backend/app/core/risk_engine.py` (or a new module) with an
   env-var-configurable path, e.g. `MODEL_PATH=models/injury_risk_xgb_v1.joblib`.
3. Document the training data/provenance in `docs/`.
