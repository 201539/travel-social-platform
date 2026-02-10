@echo off
chcp 65001 >nul 2>&1
title Generate Travel Data - Full
cls

cd /d "%~dp0server"

echo ========================================
echo Generate Travel Data - Full Version
echo ========================================
echo.
echo This script will:
echo   - Create 20 user accounts
echo   - Generate travel logs for 30 cities
echo   - 3-5 travel logs per city
echo   - Time range: Jan-Dec 2025
echo   - Use AI to generate content
echo.
echo Note:
echo   - This will take 10-20 minutes
echo   - Make sure MongoDB is running
echo   - Make sure openai package is installed
echo   - Will call AI API to generate content
echo.
pause

echo.
echo Starting generation...
echo.

node scripts/generateTravels.js

echo.
echo ========================================
echo Generation Complete
echo ========================================
echo.
pause
