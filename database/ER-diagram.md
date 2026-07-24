# Entity Relationship Diagram — Milestone 1

Rendered with [Mermaid](https://mermaid.js.org/) — view directly on GitHub or in VS Code with the Mermaid preview extension.

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o| ATHLETES : "extends"
    ATHLETES ||--o{ VIDEOS : uploads
    VIDEOS ||--o{ PREDICTIONS : generates
    ATHLETES ||--o{ PREDICTIONS : owns

    ROLES {
        int role_id PK
        string role_name
        string description
    }

    USERS {
        int user_id PK
        string full_name
        string email
        string password_hash
        int role_id FK
        string phone
        boolean is_active
        string profile_image
    }

    ATHLETES {
        int athlete_id PK
        int user_id FK
        decimal height_cm
        decimal weight_kg
        int age
        string gender
        string sport
        decimal experience_years
        text medical_history
    }

    VIDEOS {
        int video_id PK
        int athlete_id FK
        string file_name
        string file_path
        decimal file_size_mb
        int duration_secs
        string sport_activity
        string upload_status
    }

    PREDICTIONS {
        int prediction_id PK
        int video_id FK
        int athlete_id FK
        string risk_level
        decimal risk_score
        string body_part_flagged
        string model_version
        string status
    }
```

## Relationship summary

| Relationship | Type | Notes |
|---|---|---|
| Roles → Users | 1 : N | A role can be assigned to many users |
| Users → Athletes | 1 : 1 | Only users with the `athlete` role get a row here |
| Athletes → Videos | 1 : N | An athlete can upload many videos |
| Videos → Predictions | 1 : N | Milestone 1 models 1 video → many predictions (supports re-runs in later milestones) |
| Athletes → Predictions | 1 : N | Denormalized FK kept on predictions for fast per-athlete history queries |

## Normalization notes
- **1NF**: every column holds a single atomic value (no comma-separated lists).
- **2NF**: every non-key column depends on the whole primary key — trivial here since all tables use single-column surrogate keys.
- **3NF**: no transitive dependencies, e.g. `role_name` lives only in `roles`, not repeated on every `users` row.
