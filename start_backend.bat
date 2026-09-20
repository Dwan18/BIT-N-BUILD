@echo off
title SMART_STAGE Backend (Port 5001)
set "PATH=%APPDATA%\Antigravity\nodejs;%APPDATA%\Antigravity\bin;%PATH%"
echo ==========================================================
echo Starting SMART_STAGE Backend on http://localhost:5001 ...
echo ==========================================================
cd /d "%~dp0backend"
node server.js
pause
