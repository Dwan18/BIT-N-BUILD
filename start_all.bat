@echo off
title Launch SMART_STAGE Full Platform
echo ==========================================================
echo Starting SMART_STAGE Full Stack Platform
echo Backend:  http://localhost:5001/api
echo Frontend: http://localhost:5173
echo Demo:     TF2026 (PIN: 1234)
echo ==========================================================
start "SMART_STAGE Backend" "%~dp0\start_backend.bat"
timeout /t 2 /nobreak >nul
start "SMART_STAGE Frontend" "%~dp0\start_frontend.bat"
echo Services launched in separate terminal windows.
pause
