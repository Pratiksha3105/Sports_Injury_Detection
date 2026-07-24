# Frontend Architecture

```mermaid
flowchart TD
    Main["main.jsx<br/>(BrowserRouter + AuthProvider)"] --> App["App.jsx<br/>(Routes)"]

    App --> Public["Public Pages<br/>Home · About · Contact"]
    App --> Auth["Auth Pages<br/>Login · Register"]
    App --> Protected["Protected Routes<br/>(ProtectedRoute wrapper)"]

    Protected --> Dash["Dashboard"]
    Protected --> Profile["Athlete Profile"]
    Protected --> Upload["Upload Video"]
    Protected --> History["Prediction History"]

    Public --> MainLayout["MainLayout<br/>(Navbar + Footer)"]
    Auth --> Standalone["Standalone layout"]
    Protected --> DashLayout["DashboardLayout<br/>(Sidebar)"]

    subgraph Shared["Shared building blocks"]
        Components["components/<br/>GlassCard, Button, StatCard…"]
        Hooks["hooks/<br/>useAuth, useCountUp"]
        Context["context/<br/>AuthContext"]
        Services["services/<br/>api.js, authService.js"]
    end

    MainLayout --> Components
    DashLayout --> Components
    Dash --> Hooks
    Auth --> Context
    Context --> Services
```

## Folder responsibilities
- **`layouts/`** — page chrome shared across groups of pages (public site vs. authenticated dashboard)
- **`components/`** — small, reusable, presentation-focused pieces
- **`pages/`** — one file per route, composes layouts + components
- **`context/` + `hooks/`** — global auth state and reusable stateful logic
- **`services/`** — all HTTP calls, isolated from components so the API layer can change independently of the UI
