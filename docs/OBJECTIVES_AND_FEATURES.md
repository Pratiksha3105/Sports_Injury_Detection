# Project Objectives & Features

## Objectives
1. Build a scalable, well-normalized data model for athletes, videos, and predictions.
2. Implement secure, role-based authentication (Athlete / Coach / Admin) using JWT.
3. Design a production-quality UI so the project is usable, not just demoable.
4. Structure the codebase so AI capability can be added in later milestones
   without restructuring the frontend or database.

## Milestone 1 feature checklist
- [x] React + Vite + Tailwind + Framer Motion frontend
- [x] Responsive marketing site (Home, About, Contact)
- [x] Login / Register with role selection and client-side validation
- [x] Protected dashboard shell with sidebar navigation
- [x] Athlete profile form (height, weight, age, gender, sport, experience, medical history)
- [x] Drag-and-drop video upload UI with simulated progress
- [x] Prediction history table with search, filter, and pagination (sample data)
- [x] FastAPI backend with JWT auth, SQLAlchemy models, Pydantic schemas
- [x] Normalized MySQL schema (Roles, Users, Athletes, Videos, Predictions)
- [ ] AI model integration — deliberately out of scope for Milestone 1

## Non-functional goals
- Dark/light mode toggle
- Mobile, tablet, and desktop responsive layouts
- Clean separation of concerns: components / pages / services / hooks / context
