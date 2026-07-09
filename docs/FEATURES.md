# Feature Breakdown

## `/` — Upload & Analyze (main experience)
- Drag-and-drop or click-to-browse video upload
- Sport selector (auto-detect or manually pick: running, cricket batting/bowling, football, basketball, tennis, weightlifting)
- Optional free-text notes to give the AI more context
- Granularity control — trades analysis depth for speed (6 / 10 / 16 sampled frames)
- Client-side frame extraction via `<canvas>` (video never uploaded whole — only sampled frames are sent to the AI)
- AI-generated report:
  - Overall injury risk level + percentage
  - Posture score and performance score
  - Five sub-scores: movement stability, joint alignment, landing technique, balance, fatigue indicator (shown on a radar chart)
  - Per-joint injury risks with probability %, reasoning, and correction advice
  - Technique findings (area, observation, suggestion)
  - Improvement suggestions list
  - Suggested prevention exercises (name, target area, sets)
  - Coach notes summary
  - Risky-moment timeline — specific timestamps flagged with severity and explanation
- Session history (stored in `localStorage`, capped at 12 entries) with thumbnails
- Side-by-side comparison between any two saved analyses
- One-click PDF export of a report (via jsPDF)

## `/auth` — Sign in / Sign up
- Tabs for sign-in vs sign-up
- Sign-up collects display name and role (Athlete or Coach)
- Supabase email/password auth; on success redirects to `/profile`
- A database trigger (`handle_new_user`) automatically creates a `profiles`
  row and assigns the chosen role (defaulting to `athlete`) on signup

## `/profile` — Athlete Profile (protected route)
- Guarded by the `_authenticated` layout route — signed-out users are
  redirected to `/auth`
- Editable fields: full name, display name, date of birth, gender, height,
  weight, dominant side, primary sport, position, experience (years),
  training frequency, injury history, goals
- Shows the user's assigned role(s)
- Sign-out action
