@echo off
echo Starting Backend Server...
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload"

echo Starting Frontend Dev Server...
start cmd /k "cd frontend && npm run dev"

echo All systems initialized.
echo Backend:   http://localhost:8000
echo Frontend:  http://localhost:5173
pause
