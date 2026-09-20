@echo off
title SMART_STAGE Backend (Port 5001)
echo Starting SMART_STAGE Backend on http://localhost:5001 ...
cd /d "%~dp0\backend"
node server.js
pause
