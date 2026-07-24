# Backend Architecture

```mermaid
flowchart TD
    Main["main.py<br/>(FastAPI app + CORS + routers)"]

    Main --> R1["routers/auth.py"]
    Main --> R2["routers/users.py"]
    Main --> R3["routers/athletes.py"]
    Main --> R4["routers/videos.py"]
    Main --> R5["routers/predictions.py"]

    R1 & R2 & R3 & R4 & R5 --> Deps["utils/dependencies.py<br/>get_current_user · require_role"]
    R1 & R2 & R3 & R4 & R5 --> Schemas["schemas/*.py<br/>Pydantic request/response models"]
    R1 & R2 & R3 & R4 & R5 --> Models["models/*.py<br/>SQLAlchemy ORM models"]

    Deps --> Security["core/security.py<br/>JWT + bcrypt"]
    Models --> DB["db/database.py<br/>Engine + Session"]
    Models --> Base["db/base.py<br/>Declarative Base"]
    Security --> Config["core/config.py<br/>Settings (.env)"]
    DB --> Config
```

## Request lifecycle (example: `GET /athletes/me`)
1. Request hits `routers/athletes.py`
2. FastAPI resolves the `get_current_user` dependency, which decodes the JWT
   via `core/security.py` and loads the `User` row via SQLAlchemy
3. The route queries `Athlete` filtered by `user_id`
4. The ORM object is serialized through the `AthleteOut` Pydantic schema
5. FastAPI returns JSON to the client
