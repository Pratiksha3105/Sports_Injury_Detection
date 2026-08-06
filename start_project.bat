@echo off
REM ============================================================================
REM Sports Injury Risk Detection — local dev startup script (Windows)
REM
REM Starts the FastAPI backend and the Vite frontend dev server together,
REM without Docker. For containerized startup use `docker compose up --build`
REM instead.
REM ============================================================================

setlocal
set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%frontend

echo ==============================================
echo  Sports Injury Risk Detection — starting up
echo ==============================================

REM ---- Backend setup --------------------------------------------------------
cd /d "%BACKEND_DIR%"

if not exist ".env" (
    copy /Y ".env.example" ".env" >nul
    echo [backend] created backend\.env from .env.example
)

if not exist "venv" (
    echo [backend] creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo [backend] installing Python dependencies (this can take a few minutes on first run)...
python -m pip install --upgrade pip -q
pip install -r requirements.txt -q

if not exist "storage\uploads" mkdir storage\uploads
if not exist "storage\results" mkdir storage\results
if not exist "storage\annotated" mkdir storage\annotated

echo [backend] starting FastAPI on http://localhost:8000 (docs at /docs) ...
start "Sports Injury Backend" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

call venv\Scripts\deactivate.bat

REM ---- Frontend setup -------------------------------------------------------
cd /d "%FRONTEND_DIR%"

if not exist ".env" (
    copy /Y ".env.example" ".env" >nul
    echo [frontend] created frontend\.env from .env.example
)

if not exist "node_modules" (
    echo [frontend] installing npm dependencies (this can take a few minutes on first run)...
    call npm install
)

echo [frontend] starting Vite dev server on http://localhost:5173 ...
start "Sports Injury Frontend" cmd /k "npm run dev"

echo.
echo ==============================================
echo  Backend:  http://localhost:8000  (docs: /docs)
echo  Frontend: http://localhost:5173
echo  Two new terminal windows were opened. Close them to stop the servers.
echo ==============================================

endlocal
