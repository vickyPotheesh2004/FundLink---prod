
# FundLink Deployment Script
# Usage: Right-click and "Run with PowerShell" or run .\deploy.ps1 in terminal

Write-Host "=== FundLink Firebase Deployment Automation ===" -ForegroundColor Cyan

# 1. Install Root Dependencies
Write-Host "`n[1/4] Installing Root Dependencies..." -ForegroundColor Yellow
npm install

# 2. Install Cloud Functions Dependencies
Write-Host "`n[2/4] Installing Cloud Functions Dependencies..." -ForegroundColor Yellow
Set-Location functions
npm install
Set-Location ..

# 3. Check Firebase Login
Write-Host "`n[3/4] Authenticating with Firebase..." -ForegroundColor Yellow
Write-Host "If a browser opens, please log in with your Google account." -ForegroundColor Gray
npx firebase-tools login

# 4. Deploy
Write-Host "`n[4/4] Deploying to Firebase Hosting & Cloud Functions..." -ForegroundColor Yellow
Write-Host "NOTE: If this is your first time, you may need to select a project." -ForegroundColor Gray

# Check if project is initialized
if (-not (Test-Path ".firebaserc")) {
    Write-Host "Project not initialized. initializing..." -ForegroundColor Magenta
    npx firebase-tools init hosting
}

npx firebase-tools deploy

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Look for the 'Hosting URL' in the output above to access your live site." -ForegroundColor Cyan
Read-Host -Prompt "Press Enter to exit"
