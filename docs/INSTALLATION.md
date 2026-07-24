# Installation Guide

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MySQL 8+
- Git

## 1. Clone / extract the project
```bash
git clone <your-repo-url>
cd Sports-Injury-Risk-Detection
```

## 2. Database setup
```bash
mysql -u root -p < database/schema.sql
```
This creates the `sports_injury_db` database with all tables and default roles.

## 3. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `.env` and set `DATABASE_URL` to match your MySQL credentials, e.g.:
```
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/sports_injury_db
```

Enable table creation on first run by uncommenting this line in `app/main.py`:
```python
Base.metadata.create_all(bind=engine)
```
(Only needed once, or use Alembic migrations for anything beyond Milestone 1.)

Run the API:
```bash
uvicorn app.main:app --reload
```
Visit http://localhost:8000/docs for interactive API documentation.

## 4. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` in `.env` points to your running backend
(default `http://localhost:8000/api/v1`).

Run the dev server:
```bash
npm run dev
```
Visit http://localhost:5173.

## 5. Verify the full flow
1. Open the frontend, click **Register**, create an athlete account.
2. Log in.
3. You should land on `/dashboard` with the sidebar, stat cards, and
   sample chart visible.
4. Visit `/dashboard/upload` and drag in any local `.mp4` file — this
   simulates the upload flow (no real processing happens in Milestone 1).

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| Frontend loads but login fails | Backend not running, or `VITE_API_BASE_URL` mismatch |
| `Access denied for user` on MySQL | Wrong credentials in `backend/.env` |
| CORS errors in the browser console | Add your frontend origin to `CORS_ORIGINS` in `backend/.env` |
| `ModuleNotFoundError` in FastAPI | Virtual environment not activated before `pip install` |
