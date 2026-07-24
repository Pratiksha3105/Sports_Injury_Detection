# Database Documentation

See [`../database/schema.sql`](../database/schema.sql) for the full DDL and
[`../database/ER-diagram.md`](../database/ER-diagram.md) for the entity
relationship diagram.

## Tables at a glance

| Table | Purpose | Key columns |
|---|---|---|
| `roles` | Lookup table for the 3 account types | `role_id`, `role_name` |
| `users` | Core account/auth data for every person | `user_id`, `email`, `password_hash`, `role_id` |
| `athletes` | Athlete-specific profile data, 1:1 with a user | `athlete_id`, `user_id`, `sport`, `medical_history` |
| `videos` | Uploaded video metadata | `video_id`, `athlete_id`, `file_path`, `upload_status` |
| `predictions` | AI output per video (populated from Milestone 3+) | `prediction_id`, `video_id`, `risk_level`, `risk_score` |

## Why this shape?
- **Roles is a separate table**, not an enum on `users`, so new roles can be
  added later (e.g. "physiotherapist") without a schema migration touching
  every row.
- **Athletes is separated from Users** because coaches and admins don't need
  height/weight/medical-history columns — keeping them together would mean
  a lot of always-null columns for non-athlete accounts.
- **Predictions references both `video_id` and `athlete_id`** — the video
  reference is the source of truth, the athlete reference is a denormalized
  convenience column that makes "show me this athlete's full history" a
  single indexed query instead of a join through videos every time.

## Sample queries

Get an athlete's full risk history, most recent first:
```sql
SELECT p.risk_level, p.risk_score, p.body_part_flagged, p.created_at
FROM predictions p
WHERE p.athlete_id = :athlete_id
ORDER BY p.created_at DESC;
```

Count high-risk flags per sport in the last 30 days:
```sql
SELECT v.sport_activity, COUNT(*) AS high_risk_count
FROM predictions p
JOIN videos v ON v.video_id = p.video_id
WHERE p.risk_level = 'high'
  AND p.created_at >= NOW() - INTERVAL 30 DAY
GROUP BY v.sport_activity;
```
