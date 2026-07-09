# System Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI["React 19 UI<br/>(routes: /, /auth, /profile)"]
        Canvas["Canvas frame extractor"]
        LS[("localStorage<br/>analysis history")]
    end

    subgraph Server["TanStack Start Server"]
        SFN["Server Function<br/>analyzePose()"]
    end

    subgraph Supabase["Supabase (Postgres)"]
        Auth["Auth (email/password)"]
        DB[("profiles · user_roles<br/>Row-Level Security")]
    end

    subgraph AI["Lovable AI Gateway"]
        LLM["Vision-capable LLM<br/>(structured JSON output)"]
    end

    UI -- "sign in / sign up" --> Auth
    Auth -- "session" --> UI
    UI -- "profile read/write" --> DB

    UI --> Canvas --> UI
    UI -- "sampled frames + sport + notes" --> SFN
    SFN -- "prompt" --> LLM
    LLM -- "structured analysis JSON" --> SFN
    SFN -- "validated result" --> UI
    UI -- "save/compare" --> LS
```

## Why this shape?
- **No video ever hits a server or database** — frames are sampled and
  downscaled entirely in the browser via `<canvas>`, keeping the app
  free of video storage/streaming infrastructure.
- **Auth and profile data live in Supabase**, protected by Row-Level
  Security, so a user can only ever read/write their own profile (with a
  narrow, function-gated exception for coaches).
- **Analysis is stateless and on-demand** — the server function is a thin
  validation + prompting layer between the browser and the AI gateway; it
  doesn't persist anything itself. History lives client-side.
