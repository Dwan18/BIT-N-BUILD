@echo off
title Launch SMART_STAGE Full Platform
set "PATH=%APPDATA%\Antigravity\nodejs;%APPDATA%\Antigravity\bin;%PATH%"
echo ==========================================================
echo Starting SMART_STAGE Full Stack Platform
echo Backend:  http://localhost:5001/api
echo Frontend: http://localhost:5173
echo Demo:     TF2026 (PIN: 1234)
echo ==========================================================
start "SMART_STAGE Backend" "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
start "SMART_STAGE Frontend" "%~dp0start_frontend.bat"
echo.
echo Services launched in separate terminal windows.
echo Opening browser to http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173
