# Kinetic — Movement Risk Analysis Dashboard

The first frontend increment of the Sports Injury Risk Detection platform:
a single, polished dashboard that uploads a video to the AI core backend
and renders the full biomechanics/risk analysis. This proves the
frontend↔API contract before building the other role-based dashboards
(coach, physio, sports scientist, admin) on top of it.

## Design direction

Built around the actual subject — biomechanics — rather than a generic
SaaS template:

- **Palette**: cool paper background (`#F4F5F1`), deep pine ink
  (`#16211B`), kinetic teal accent (`#0F6B5C`). Risk severity uses its own
  4-stop scale (green → amber → orange → red) that carries real meaning —
  it's data color, not decoration.
- **Type**: Space Grotesk for display/headings, Inter for body copy, and
  **IBM Plex Mono for every numeric readout** (joint angles, scores,
  timestamps) — deliberately styled like lab-instrument output.
- **Signature element — the Kinetic Chain Readout**: a sticky vertical
  instrument panel listing the body's load-bearing joints top to bottom
  with live mono readouts and status LEDs, making literal the anatomical
  concept of a "kinetic chain" that the whole product is about.
- **Risk Gauge**: a 270° instrument dial (like a tachometer, not a generic
  circular progress ring) for the overall risk score.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if the backend isn't on :8000
npm run dev
```

Requires the AI core backend (see the other deliverable,
`sports-injury-ai-core`) running and reachable at `VITE_API_BASE_URL`.

```bash
npm run build     # type-checks (tsc -b) then builds — verified clean
npm run preview   # serve the production build locally
```

## What's here vs. what's next

This is **one dashboard**, by design — not all 5 role-based dashboards
from the full spec. It covers the upload → analysis → results flow end
to end: drag-and-drop upload with athlete context (activity, injury
history, training load), the risk gauge, kinetic chain readout, knee
flexion chart, per-injury-type risk breakdown, anomaly/fatigue timeline,
skeleton-overlay video playback, and grouped recommendations.

Natural next steps, in order:
1. Auth + athlete profile management, so this dashboard is scoped to a
   logged-in athlete instead of ad-hoc form fields.
2. Video history / list view (multiple past analyses per athlete).
3. Coach and physiotherapist dashboard variants, which reuse these same
   components (`RiskGauge`, `InjuryRiskBreakdown`, etc.) at a
   team/roster level instead of a single clip.

## Project layout

```
src/
  api/client.ts              # axios client, matches backend routes exactly
  types/schema.ts             # TS types mirroring the backend's Pydantic models
  utils/risk.ts                # shared risk-color mapping
  components/
    UploadPanel.tsx
    RiskGauge.tsx              # signature instrument dial
    KineticChainReadout.tsx    # signature instrument rail
    JointAngleChart.tsx        # recharts knee-flexion time series
    InjuryRiskBreakdown.tsx
    AnomalyTimeline.tsx
    RecommendationsPanel.tsx
    StatCard.tsx
  pages/Dashboard.tsx           # the single dashboard page
```
