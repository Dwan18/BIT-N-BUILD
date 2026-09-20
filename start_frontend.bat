@echo off
title SMART_STAGE Frontend (Port 5173)
set "PATH=%APPDATA%\Antigravity\nodejs;%APPDATA%\Antigravity\bin;%PATH%"
echo ==========================================================
echo Starting SMART_STAGE Frontend on http://localhost:5173 ...
echo ==========================================================
cd /d "%~dp0Frontend"
npm run dev
pause
