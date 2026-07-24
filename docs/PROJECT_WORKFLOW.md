# Project Workflow

## Development flow (this milestone)
```
 ┌────────────┐      ┌──────────────┐      ┌────────────┐
 │  Frontend   │◄────►│   Backend    │◄────►│   MySQL    │
 │ React+Vite  │ REST │   FastAPI    │ ORM  │  Database  │
 │  Tailwind   │ JSON │  JWT + CRUD  │      │            │
 └────────────┘      └──────────────┘      └────────────┘
```

## User journeys implemented in Milestone 1

**Athlete**
1. Register → choose "Athlete" role
2. Login → redirected to `/dashboard`
3. Complete athlete profile (height, weight, sport, medical history)
4. Upload a video (UI + registration in DB; no AI processing yet)
5. View prediction history (sample data until the AI pipeline ships)

**Coach / Admin**
1. Register → choose "Coach" or "Admin" role
2. Login → same dashboard shell; role-aware navigation guards routes
3. (Milestone 2+) view athletes under their supervision

## Git workflow suggestion
```
main            → stable, demo-ready
develop         → integration branch
feature/xyz     → one branch per feature
```
Commit early and often; keep `Milestone 1`, `Milestone 2`, etc. as tags
or release branches so mentors can diff progress between milestones.
