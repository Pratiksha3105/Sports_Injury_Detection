# System Architecture

```mermaid
flowchart LR
    subgraph Client["Browser"]
        FE["React + Vite SPA<br/>Tailwind · Framer Motion"]
    end

    subgraph Server["Application Server"]
        API["FastAPI<br/>JWT Auth · REST Endpoints"]
        ORM["SQLAlchemy ORM"]
    end

    subgraph Data["Data Layer"]
        DB[("MySQL<br/>sports_injury_db")]
    end

    subgraph Future["Milestone 2+ (not built yet)"]
        CV["OpenCV frame extraction"]
        MP["MediaPipe pose estimation"]
        LSTM["LSTM risk classifier"]
    end

    FE -- "HTTPS / JSON (axios)" --> API
    API --> ORM --> DB
    API -.-> CV -.-> MP -.-> LSTM -.-> API

    style Future stroke-dasharray: 5 5
```

## Layer responsibilities

| Layer | Responsibility | Milestone 1 status |
|---|---|---|
| Client | Rendering, routing, client-side validation, token storage | ✅ Complete |
| Application Server | Auth, request validation, business rules | ✅ Foundation complete |
| Data Layer | Persistent storage of users, athletes, videos, predictions | ✅ Schema complete |
| AI Pipeline | Frame extraction → pose estimation → risk classification | ⏳ Milestone 2–4 |
