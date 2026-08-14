Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "J.A.R.V.I.S. Mainframe Boot Initiated..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Start Backend
Write-Host "[J.A.R.V.I.S.] Starting FastAPI Mainframe Backend..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd backend && ..\venv\Scripts\activate && uvicorn main:app --reload"

# Start Frontend
Write-Host "[J.A.R.V.I.S.] Launching HUD Frontend Console..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd frontend && npm run dev"

Write-Host "==============================================" -ForegroundColor Green
Write-Host "Mainframe Online. Console running at http://localhost:5173" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
