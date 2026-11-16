# Start TalentBridge Full-Stack Application
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Launching TalentBridge Full Stack Platform       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in separate window
Start-Process powershell -WorkingDirectory "$PSScriptRoot\backend" -ArgumentList "-NoExit", "-Command", "Write-Host 'FastAPI running on http://127.0.0.1:8000 (Docs at /docs)' -ForegroundColor Green; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in separate window
Start-Process powershell -WorkingDirectory "$PSScriptRoot\frontend" -ArgumentList "-NoExit", "-Command", "Write-Host 'React Frontend running on http://localhost:5173' -ForegroundColor Cyan; npm run dev"

Write-Host "`nTalentBridge backend and frontend launched in separate windows!" -ForegroundColor Green
Write-Host "Frontend URL : http://localhost:5173" -ForegroundColor White
Write-Host "Backend API  : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "Swagger Docs : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Demo Login   : admin@talentbridge.com / Admin@12345" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

