@echo off
title Push SMART_STAGE to GitHub (Dwan18/BIT-N-BUILD)
echo ======================================================================
echo Pushing SMART_STAGE project to https://github.com/Dwan18/BIT-N-BUILD
echo ======================================================================
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo [SUCCESS] Project uploaded successfully to GitHub!
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo If GitHub asks for credentials, you can enter your Personal Access Token
    echo or sign in via browser when prompted.
    echo ======================================================================
)
pause
