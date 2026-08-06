#!/usr/bin/env bash
# ============================================================================
# Sports Injury Risk Detection — local dev startup script (Linux/macOS)
#
# Starts the FastAPI backend and the Vite frontend dev server together,
# without Docker. For containerized startup use `docker compose up --build`
# instead.
# ============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "=============================================="
echo " Sports Injury Risk Detection — starting up"
echo "=============================================="

# ---- Backend setup ----------------------------------------------------
cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "[backend] created backend/.env from .env.example"
fi

if [ ! -d "venv" ]; then
  echo "[backend] creating Python virtual environment..."
  python3 -m venv venv
fi

# shellcheck disable=SC1091
source venv/bin/activate

echo "[backend] installing Python dependencies (this can take a few minutes on first run)..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

mkdir -p storage/uploads storage/results storage/annotated

echo "[backend] starting FastAPI on http://localhost:8000 (docs at /docs) ..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

deactivate

# ---- Frontend setup -----------------------------------------------------
cd "$FRONTEND_DIR"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "[frontend] created frontend/.env from .env.example"
fi

if [ ! -d "node_modules" ]; then
  echo "[frontend] installing npm dependencies (this can take a few minutes on first run)..."
  npm install
fi

echo "[frontend] starting Vite dev server on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

# ---- Shutdown handling ----------------------------------------------------
cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo ""
echo "=============================================="
echo " Backend:  http://localhost:8000  (docs: /docs)"
echo " Frontend: http://localhost:5173"
echo " Press Ctrl+C to stop both."
echo "=============================================="

wait
