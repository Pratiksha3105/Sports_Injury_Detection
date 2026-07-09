# How the AI Analysis Pipeline Works

```
Browser                              Server (TanStack Start)             AI Gateway
───────                              ────────────────────────             ──────────
1. User selects a video file
2. <canvas> samples N frames
   at even intervals (N = 6/10/16
   depending on chosen granularity)
3. Frames are downscaled to
   max 720px width, encoded as
   JPEG data URLs
4. analyzePose(input) is called ───► 5. analyze.functions.ts validates
   as a TanStack "server function"      input with Zod, builds a prompt
                                        from sport + notes + frame data
                                     6. generateText() (Vercel AI SDK)
                                        is called against the model ───► 7. Vision-capable LLM inspects
                                        via createAiGatewayProvider()      the frames and returns
                                                                            structured JSON matching
                                     8. Response is parsed against    ◄─── AnalysisSchema (Zod)
                                        AnalysisSchema; throws if the
                                        model's output doesn't match
9. Result renders in the UI    ◄────  the shape
   (scores, risky moments, etc.)
10. saveAnalysis() persists a
    trimmed copy to localStorage
```

## Why frames instead of the raw video?
Sampling frames client-side keeps the payload small, keeps raw video off
the server entirely, and lets the granularity control trade off
cost/speed vs. analysis depth without any server-side video processing
infrastructure (no ffmpeg, no OpenCV, no video storage).

## Why a strict Zod schema on the AI response?
`generateText` + `Output` structured output (see `analyze.functions.ts`)
forces the model to return exactly the shape the UI expects — risk level
enums, bounded percentages (0–100), and capped array lengths (max 8 injury
risks, max 12 risky moments) — so a single badly-formed model response
can't crash the report UI.

## Extending this
- Swap the AI provider by changing `createAiGatewayProvider` in
  `src/lib/ai-gateway.server.ts` to point at any OpenAI-compatible endpoint.
- To persist analyses server-side instead of `localStorage`, add a
  Supabase table (e.g. `analyses`) and write to it from `analyze.functions.ts`
  after a successful response, with RLS policies scoping rows to `auth.uid()`.
