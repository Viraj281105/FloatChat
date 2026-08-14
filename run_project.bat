@echo off
echo ==============================================
echo J.A.R.V.I.S. Mainframe Boot Initiated...
echo ==============================================

echo [J.A.R.V.I.S.] Starting FastAPI Mainframe Backend...
start cmd /k "cd backend && ..\venv\Scripts\activate && uvicorn main:app --reload"

echo [J.A.R.V.I.S.] Launching HUD Frontend Console...
start cmd /k "cd frontend && npm run dev"

echo ==============================================
echo Mainframe Online. Console running at http://localhost:5173
echo ==============================================
pause
