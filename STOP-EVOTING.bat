@echo off
echo 🛑 Stopping E-Voting System Services...
echo.

REM Kill processes on specific ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8545 ^| findstr LISTENING') do taskkill /pid %%a /f >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do taskkill /pid %%a /f >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /pid %%a /f >nul 2>&1

REM Kill node processes
taskkill /f /im node.exe >nul 2>&1

echo ✅ All E-Voting services have been stopped!
echo.
pause