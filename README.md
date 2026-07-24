# 🏃 PulseGuard AI — Sports Injury Risk Detection from Video using AI

**Final Year B.Tech Computer Science Project — Milestone 1: Foundation**

An AI-assisted platform that will analyze athletic movement in training
footage to flag injury-risk patterns early. **This milestone builds the
complete product foundation only** — authentication, database, API scaffolding,
and a production-quality UI. No AI/video-processing logic (MediaPipe, LSTM,
OpenCV, or prediction inference) is implemented yet; that begins in Milestone 2.

---

## ✨ What's in Milestone 1

| Layer | Status |
|---|---|
| **Frontend** — React + Vite + Tailwind + Framer Motion, 10 fully built pages | ✅ Complete |
| **Auth** — JWT register/login, role-based routing (Athlete/Coach/Admin) | ✅ Complete |
| **Backend** — FastAPI project structure, routers, schemas, models | ✅ Foundation complete |
| **Database** — Normalized MySQL schema (5 tables), ER diagram | ✅ Complete |
| **AI Pipeline** — Video processing, pose estimation, risk model | ⏳ Milestone 2–4 |

## 📸 Preview

The UI uses a dark, glassmorphism aesthetic with a teal/violet/coral accent
palette, an animated motion-capture-style hero illustration, and Framer
Motion transitions throughout. See `wireframes/` for layout references, or
run the app locally (below) to see it live — screenshots depend on
animation and are best viewed in-browser.

## 🗂 Folder structure

```
Sports-Injury-Risk-Detection/
├── frontend/          React + Vite + Tailwind + Framer Motion SPA
├── backend/            FastAPI project (auth, models, schemas, routers)
├── database/           schema.sql + ER diagram
├── docs/                Installation, workflow, API & DB docs
├── architecture/        System/frontend/backend/user-flow diagrams (Mermaid)
├── wireframes/          Low-fidelity page wireframes (PNG)
├── screenshots/         Instructions for capturing live UI screenshots
├── requirements.txt      Root convenience pointer to backend/requirements.txt
├── package.json          Root convenience scripts
└── .gitignore
```

## 🚀 Quick start

```bash
# 1. Database
mysql -u root -p < database/schema.sql

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL
uvicorn app.main:app --reload

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:5173 · Backend docs: http://localhost:8000/docs

Full step-by-step instructions: [`docs/INSTALLATION.md`](docs/INSTALLATION.md)

## 🧱 Tech stack

**Frontend:** React (Vite) · React Router · Tailwind CSS · Framer Motion · React Icons · Axios · Recharts
**Backend:** FastAPI · SQLAlchemy · Pydantic · python-jose (JWT) · passlib (bcrypt)
**Database:** MySQL 8
**Tooling:** Git, ESLint, Vite

## 📄 Documentation index

| Document | Contents |
|---|---|
| [`docs/INSTALLATION.md`](docs/INSTALLATION.md) | Full setup walkthrough |
| [`docs/PROJECT_WORKFLOW.md`](docs/PROJECT_WORKFLOW.md) | User journeys, git workflow |
| [`docs/OBJECTIVES_AND_FEATURES.md`](docs/OBJECTIVES_AND_FEATURES.md) | Objectives + feature checklist |
| [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) | Endpoint reference |
| [`docs/DATABASE_DOCUMENTATION.md`](docs/DATABASE_DOCUMENTATION.md) | Schema rationale + sample queries |
| [`docs/FUTURE_MILESTONES.md`](docs/FUTURE_MILESTONES.md) | Roadmap for Milestones 2–5 |
| [`database/ER-diagram.md`](database/ER-diagram.md) | Entity relationship diagram |
| [`architecture/`](architecture) | System, frontend, backend & user-flow diagrams |

## 🗺 Roadmap

- **Milestone 1 (this repo):** Full-stack foundation, auth, UI, schema
- **Milestone 2:** Real video upload pipeline + OpenCV frame extraction
- **Milestone 3:** MediaPipe pose landmark extraction
- **Milestone 4:** LSTM-based injury risk classification model
- **Milestone 5:** Deployment, monitoring, coach/admin analytics

## ⚠️ Disclaimer

This is an academic project. It is a screening/awareness tool, not a
diagnostic or medical device, and does not replace professional medical
or physiotherapy advice.

## 📜 License

MIT — see individual file headers for details, or adapt for your
institution's project submission requirements.
