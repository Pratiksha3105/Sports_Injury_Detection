# 🏃 KinetIQ — AI Sports Injury & Performance Analysis

Upload a sports training clip and get an AI-generated breakdown of injury
risk, posture, technique, and performance — with a risky-moment timeline,
joint-level analysis, prevention exercises, and exportable PDF reports.

Built with **TanStack Start** (React 19, SSR), **Supabase** (Postgres auth +
row-level security), and an AI vision model via the Lovable AI Gateway.

---

## ✨ Features

- **Drag-and-drop video upload** with client-side frame extraction (no video ever leaves the browser unprocessed — only sampled frames are sent for analysis)
- **Adjustable analysis granularity** — Quick (6 frames), Standard (10), Deep (16)
- **AI-generated report**: overall injury risk %, posture & performance scores, per-joint injury risks with probability, technique findings, improvement suggestions, and prevention exercises
- **Risky-moment timeline** — flags specific timestamps in the clip worth reviewing
- **Radar chart** of movement stability, joint alignment, landing technique, balance, and fatigue indicators
- **Session history** (stored locally in the browser) with side-by-side comparison between two analyses
- **PDF export** of any analysis report
- **Authentication & athlete profiles** via Supabase (email/password), with `athlete` / `coach` / `admin` roles
- **Role-aware access** — coaches can view all athlete profiles (via RLS policy)

## 🧱 Tech stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19 + Vite + SSR) |
| Routing | TanStack Router (file-based) |
| Styling / UI | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Charts | Recharts |
| PDF export | jsPDF |
| Auth & DB | Supabase (Postgres, Row-Level Security, Auth) |
| AI analysis | Vercel AI SDK (`ai`, `@ai-sdk/openai-compatible`) via Lovable AI Gateway |
| Validation | Zod |

## 🗂 Project structure

```
├── src/
│   ├── routes/                  File-based routes (TanStack Router)
│   │   ├── index.tsx             Main upload + analyze experience
│   │   ├── auth.tsx               Sign in / sign up
│   │   └── _authenticated/
│   │       ├── route.tsx          Auth guard (redirects to /auth if signed out)
│   │       └── profile.tsx        Athlete profile form
│   ├── lib/
│   │   ├── analyze.functions.ts   Server function: builds the AI prompt + validates the structured JSON response
│   │   ├── ai-gateway.server.ts   AI Gateway provider setup
│   │   └── history.ts             Client-side (localStorage) analysis history
│   ├── integrations/
│   │   ├── supabase/               Supabase client + generated DB types
│   │   └── auth/                    Auth helpers
│   └── components/ui/                shadcn/ui component library
├── supabase/
│   └── migrations/                 Postgres schema (profiles, user_roles, RLS policies)
├── docs/                            Installation, features, and workflow docs
├── database/                        Schema documentation + ER diagram
├── architecture/                    System architecture & data-flow diagrams
├── wireframes/                      Low-fidelity page layouts
└── screenshots/                     How to capture screenshots of the live app
```

## 🚀 Quick start

```bash
npm install
cp .env.example .env   # fill in your Supabase project credentials
npm run dev
```
Full setup steps: [`docs/INSTALLATION.md`](docs/INSTALLATION.md)

## 📄 Documentation

| Document | Contents |
|---|---|
| [`docs/INSTALLATION.md`](docs/INSTALLATION.md) | Environment variables, Supabase setup, running locally |
| [`docs/FEATURES.md`](docs/FEATURES.md) | Full feature breakdown by page |
| [`docs/AI_ANALYSIS.md`](docs/AI_ANALYSIS.md) | How the frame extraction → AI analysis pipeline works |
| [`database/DATABASE.md`](database/DATABASE.md) | Schema, RLS policies, ER diagram |
| [`architecture/system-architecture.md`](architecture/system-architecture.md) | Request/data flow across client, server functions, Supabase, and the AI gateway |

## ⚠️ Disclaimer

This tool provides an AI-generated screening estimate for awareness purposes.
It is not a medical device and does not replace evaluation by a qualified
physiotherapist or sports physician.

## License

MIT
