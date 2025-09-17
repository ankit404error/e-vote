#!/usr/bin/env powershell

# E-Vote Integrated System Startup Script
# Combines Master Branch Blockchain + Ankit Branch Authentication

Write-Host "🗳️ Starting E-Vote Integrated System..." -ForegroundColor Green
Write-Host "   Master Branch: Blockchain Voting" -ForegroundColor Cyan
Write-Host "   Ankit Branch: Aadhaar Authentication" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install npm with Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are installed" -ForegroundColor Green

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing main dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install main dependencies" -ForegroundColor Red
        exit 1
    }
}

# Install frontend dependencies if not exist
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Install voting-backend dependencies if not exist
if (-not (Test-Path "voting-backend/node_modules")) {
    Write-Host "📦 Installing voting-backend dependencies..." -ForegroundColor Yellow
    Set-Location voting-backend
    npm install
    Set-Location ..
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install voting-backend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Compile smart contracts
Write-Host "🔨 Compiling smart contracts..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to compile smart contracts" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Smart contracts compiled successfully" -ForegroundColor Green

# Start services in separate windows
Write-Host ""
Write-Host "🚀 Starting all services..." -ForegroundColor Green
Write-Host ""

# Terminal 1: Hardhat node
Write-Host "Terminal 1: Starting Hardhat blockchain node..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '⛓️ Hardhat Blockchain Node' -ForegroundColor Green; Write-Host 'Network: http://localhost:8545' -ForegroundColor Yellow; npx hardhat node"

# Wait a moment for blockchain to start
Start-Sleep -Seconds 3

# Terminal 2: Backend server
Write-Host "Terminal 2: Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔧 Backend Server (Aadhaar + Blockchain)' -ForegroundColor Green; Write-Host 'API: http://localhost:3000' -ForegroundColor Yellow; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Terminal 3: Frontend
Write-Host "Terminal 3: Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🎨 Frontend (React + Vite)' -ForegroundColor Green; Write-Host 'URL: http://localhost:5173' -ForegroundColor Yellow; cd frontend; npm run dev"

# Wait for services to start
Start-Sleep -Seconds 3

# Deploy contract (will run in this terminal)
Write-Host ""
Write-Host "📋 Deploying smart contract to local network..." -ForegroundColor Yellow
npx hardhat run scripts/deploy.js --network localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Smart contract deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Smart contract deployment failed. You may need to deploy manually." -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 E-Vote System is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor White
Write-Host "   🌐 Frontend:     http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔧 Backend API:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   ❤️  Health Check: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "   ⛓️  Blockchain:   http://localhost:8545" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Features Available:" -ForegroundColor White
Write-Host "   ✅ Aadhaar Registration & Fingerprint Authentication" -ForegroundColor Green
Write-Host "   ✅ Blockchain Voting with Master Branch Implementation" -ForegroundColor Green
Write-Host "   ✅ Real-time Results & Vote Verification" -ForegroundColor Green
Write-Host "   ✅ Professional Error Handling & Gas Optimization" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Note: Keep all terminal windows open for the system to function" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")