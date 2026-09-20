@echo off
title SMART_STAGE Frontend (Port 5173)
echo Starting SMART_STAGE Frontend on http://localhost:5173 ...
cd /d "%~dp0\Frontend"
npm run dev
pause
