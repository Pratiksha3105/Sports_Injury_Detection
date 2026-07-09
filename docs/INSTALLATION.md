# Installation Guide

## Prerequisites
- Node.js 18+ (or Bun, since `bun.lock` is present)
- A Supabase project (free tier is fine)
- Git

## 1. Install dependencies
```bash
npm install
# or, since this project includes a bun.lock:
bun install
```

## 2. Configure environment variables
Copy `.env` to see the required keys (or create `.env` fresh):
```
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-public-key

VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```
Both a server-side (`SUPABASE_*`) and client-side (`VITE_SUPABASE_*`) copy
are required because this app uses TanStack Start's SSR — some code runs
on the server and some in the browser.

> The AI analysis feature also needs a Lovable AI Gateway API key at
> runtime (see `src/lib/ai-gateway.server.ts`). If you're running this
> outside of Lovable's hosting, you'll need to supply your own key and
> point `baseURL` at a compatible OpenAI-style endpoint, or swap in your
> own provider (e.g. OpenAI, Anthropic) via the `ai` SDK.

## 3. Apply the database schema
The schema lives in `supabase/migrations/`. If you're using the Supabase CLI:
```bash
supabase link --project-ref your-project-id
supabase db push
```
Or paste the contents of each file in `supabase/migrations/` into the
Supabase Dashboard → SQL Editor, in filename order.

## 4. Run locally
```bash
npm run dev
```
Visit http://localhost:3000 (TanStack Start's default dev port — check
your terminal output for the exact URL).

## 5. Verify the flow
1. Go to `/auth`, create an account (choose Athlete or Coach)
2. You'll be redirected to `/profile` — fill in your athlete details and save
3. Go to `/` (home), upload a short sports clip, choose a granularity, and click Analyze
4. Review the AI-generated report, check the history panel, and try exporting a PDF

## Build for production
```bash
npm run build
npm run preview
```
