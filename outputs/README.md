# outputs/

Reference copies of sample AI pipeline output, for browsing without running
the pipeline yourself.

- `analysis_results/sample_analysis_result.json` — a full `AnalysisResult`
  JSON payload (same shape returned by `GET /api/v1/videos/analyze/{id}`),
  analysis id `97ca45e8-9e5f-435a-a237-d3ffdac9271b`.
- `annotated_videos/sample_annotated_video.mp4` — the matching
  skeleton-annotated output video for that same analysis.

**These are also pre-loaded into the backend's live storage** at
`backend/storage/results/97ca45e8-9e5f-435a-a237-d3ffdac9271b.json` and
`backend/storage/annotated/97ca45e8-9e5f-435a-a237-d3ffdac9271b.mp4`, so you
can fetch them through the real API immediately after starting the backend,
without uploading a video first:

```
GET http://localhost:8000/api/v1/videos/analyze/97ca45e8-9e5f-435a-a237-d3ffdac9271b
GET http://localhost:8000/api/v1/videos/analyze/97ca45e8-9e5f-435a-a237-d3ffdac9271b/annotated
```

At runtime, new uploads and results generated through the API are written
to `backend/storage/{uploads,results,annotated}/`, not to this top-level
`outputs/` folder — this folder is a static, versioned reference sample only.
