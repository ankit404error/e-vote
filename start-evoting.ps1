# E-Voting System Automated Startup Script
# This script starts all required services in the correct order

Write-Host "🗳️  E-VOTING SYSTEM STARTUP SCRIPT" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to wait for a service to be ready
function Wait-ForService {
    param([string]$Name, [int]$Port, [int]$TimeoutSeconds = 30)
    Write-Host "⏳ Waiting for $Name to start on port $Port..." -ForegroundColor Yellow
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $Name is ready!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    Write-Host "❌ $Name failed to start within $TimeoutSeconds seconds" -ForegroundColor Red
    return $false
}

# Function to kill processes on specific ports
function Kill-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($processId in $processes) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore errors if no processes found
    }
}

Write-Host "🧹 Cleaning up any existing processes..." -ForegroundColor Cyan
Kill-ProcessOnPort -Port 8545
Kill-ProcessOnPort -Port 4000
Kill-ProcessOnPort -Port 5173
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
try {
    npm install --silent
    Set-Location "frontend"
    npm install --silent
    Set-Location ".."
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔨 Compiling smart contracts..." -ForegroundColor Cyan
try {
    npx hardhat compile
    Write-Host "✅ Smart contracts compiled successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to compile contracts: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Hardhat blockchain node..." -ForegroundColor Cyan
$hardhatJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\pande\OneDrive\Desktop\E-Vote"
    npx hardhat node --hostname 127.0.0.1 --port 8545 2>&1
}

if (-not (Wait-ForService -Name "Hardhat Node" -Port 8545)) {
    Write-Host "❌ Failed to start Hardhat node" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📄 Deploying SecureVoting contract..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
try {
    $deployOutput = npx hardhat run scripts/deploy-secure.js --network localhost 2>&1 | Out-String
    Write-Host $deployOutput -ForegroundColor Gray
    
    # Extract contract address from deployment output
    $contractAddress = $deployOutput | Select-String "SecureVoting deployed to: (0x[a-fA-F0-9]{40})" | ForEach-Object { $_.Matches[0].Groups[1].Value }
    
    if ($contractAddress) {
        Write-Host "✅ Contract deployed to: $contractAddress" -ForegroundColor Green
        
        # Update .env file with new contract address
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace "CONTRACT_ADDRESS=.*", "CONTRACT_ADDRESS=$contractAddress"
        Set-Content ".env" -Value $envContent
        Write-Host "✅ Updated .env file with contract address" -ForegroundColor Green
    } else {
        throw "Could not extract contract address from deployment output"
    }
} catch {
    Write-Host "❌ Failed to deploy contract: $($_.Exception.Message)" -ForegroundColor Red
    Stop-Job $hardhatJob -PassThru | Remove-Job
    exit 1
}

Write-Host ""
Write-Host "🖥️  Starting backend server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\pande\OneDrive\Desktop\E-Vote"
    node server.js 2>&1
}

if (-not (Wait-ForService -Name "Backend Server" -Port 4000)) {
    Write-Host "❌ Failed to start backend server" -ForegroundColor Red
    Stop-Job $hardhatJob -PassThru | Remove-Job
    Stop-Job $backendJob -PassThru | Remove-Job
    exit 1
}

# Test the candidates API
Write-Host "🧪 Testing candidates API..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/blockchain/candidates" -Method Get
    if ($response.success -and $response.candidates) {
        Write-Host "✅ Candidates API is working! Found $($response.candidates.Count) candidates" -ForegroundColor Green
        foreach ($candidate in $response.candidates) {
            Write-Host "   - $($candidate.name) ($($candidate.party)): $($candidate.voteCount) votes" -ForegroundColor Gray
        }
    } else {
        throw "API response indicates failure or no candidates found"
    }
} catch {
    Write-Host "❌ Candidates API test failed: $($_.Exception.Message)" -ForegroundColor Red
    Stop-Job $hardhatJob -PassThru | Remove-Job
    Stop-Job $backendJob -PassThru | Remove-Job
    exit 1
}

Write-Host ""
Write-Host "🌐 Starting frontend development server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\pande\OneDrive\Desktop\E-Vote\frontend"
    npm run dev 2>&1
}

if (-not (Wait-ForService -Name "Frontend Server" -Port 5173 -TimeoutSeconds 60)) {
    Write-Host "❌ Failed to start frontend server within 60 seconds" -ForegroundColor Red
    Write-Host "🔍 Checking frontend job status..." -ForegroundColor Yellow
    $frontendJobOutput = Receive-Job $frontendJob -ErrorAction SilentlyContinue
    if ($frontendJobOutput) {
        Write-Host "Frontend Output:" -ForegroundColor Gray
        Write-Host $frontendJobOutput -ForegroundColor Gray
    }
    Stop-Job $hardhatJob -PassThru | Remove-Job
    Stop-Job $backendJob -PassThru | Remove-Job
    Stop-Job $frontendJob -PassThru | Remove-Job
    exit 1
}

# Test frontend connectivity
Write-Host "🖻 Testing frontend connectivity..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible and responding!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend responded with status code: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Frontend connectivity test failed, but service might still be starting: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ALL SERVICES STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service Status:" -ForegroundColor White
Write-Host "  🔗 Hardhat Blockchain:  http://localhost:8545" -ForegroundColor Cyan
Write-Host "  🖥️  Backend API Server:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "  🌐 Frontend Website:     http://localhost:5173" -ForegroundColor Cyan
Write-Host "  👑 Admin Panel:          http://localhost:5173/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "📄 Smart Contract Address: $contractAddress" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Your E-Voting system is ready!" -ForegroundColor Green
Write-Host "   Visit: http://localhost:5173 to start using the system" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running and monitor services
try {
    while ($true) {
        # Check if all services are still running
        if (-not (Test-Port -Port 8545)) {
            Write-Host "❌ Hardhat node stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if (-not (Test-Port -Port 4000)) {
            Write-Host "❌ Backend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if (-not (Test-Port -Port 5173)) {
            Write-Host "❌ Frontend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "🛑 Shutting down services..." -ForegroundColor Yellow
} finally {
    # Clean up jobs
    Write-Host "🧹 Cleaning up background jobs..." -ForegroundColor Cyan
    Stop-Job $hardhatJob -PassThru | Remove-Job -ErrorAction SilentlyContinue
    Stop-Job $backendJob -PassThru | Remove-Job -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -PassThru | Remove-Job -ErrorAction SilentlyContinue
    
    # Kill any remaining processes
    Kill-ProcessOnPort -Port 8545
    Kill-ProcessOnPort -Port 4000
    Kill-ProcessOnPort -Port 5173
    
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
}