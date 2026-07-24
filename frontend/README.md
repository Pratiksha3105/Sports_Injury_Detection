# Frontend — React + Vite (Milestone 1)

Production-quality UI foundation for PulseGuard AI: a dark, glassmorphism
SaaS-style interface built with React, Tailwind CSS, and Framer Motion.

## Pages
- **Home** — hero, features, benefits, how-it-works, testimonials, FAQ
- **Login / Register** — role-based registration (Athlete/Coach/Admin)
- **Dashboard** — stats, risk trend chart, quick actions, recent activity
- **Athlete Profile** — height/weight/age/gender/sport/experience/medical history
- **Upload Video** — drag-and-drop with simulated progress (UI only, Milestone 1)
- **Prediction History** — searchable, filterable, paginated table (sample data)
- **About Project** — objectives, tech stack, milestones, team
- **Contact** — contact form + details

## Setup
```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
npm run dev
```

## Structure
```
src/
  animations/    Shared Framer Motion variants
  components/    Reusable UI building blocks (Navbar, GlassCard, Button…)
  context/       AuthContext (global auth state)
  hooks/         useAuth, useCountUp
  layouts/       MainLayout (public site), DashboardLayout (sidebar shell)
  pages/         One file per route
  services/      axios instance + auth API calls
  utils/         Constants + dummy data used until real APIs are wired up
```

## Notes
- All "dummy data" (prediction history, testimonials, stats) lives in
  `src/utils/constants.js` — swap these out once the backend returns real data.
- The hero/login illustration is a hand-built animated SVG "pose skeleton"
  (`src/components/PoseIllustration.jsx`) rather than a stock Lottie file,
  so it renders correctly with zero external asset dependencies.
