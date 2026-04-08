# Script de demarrage pour le developpement (ASCII pour compatibilite PowerShell 5.x)

Write-Host "[CycloCourse v4] Demarrage en mode developpement" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERREUR] Node.js n'est pas installe. Installez-le depuis https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Node.js version: $(node --version)" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "[npm] Installation des dependances backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "[OK] Dependances backend installees" -ForegroundColor Green
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "[npm] Installation des dependances frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "[OK] Dependances frontend installees" -ForegroundColor Green
}

Write-Host ""
Write-Host "Demarrage des serveurs..." -ForegroundColor Cyan
Write-Host ""

$root = (Get-Location).Path
Write-Host "[Backend] http://localhost:3000" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$root\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[Frontend] http://localhost:5173 (ou port suivant si 5173 occupe)" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "[OK] Fenetres PowerShell ouvertes pour backend et frontend." -ForegroundColor Green
Write-Host ""
Write-Host "Astuce: pour arreter, fermez ces fenetres ou Ctrl+C dans chacune." -ForegroundColor Gray
Write-Host ""

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
