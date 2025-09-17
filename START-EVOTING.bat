@echo off
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "start-evoting.ps1"
pause