@echo off
chcp 65001 >nul
title Kill Port 5000
cls

echo ========================================
echo Kill Process Using Port 5000
echo ========================================
echo.

echo Finding process using port 5000...
netstat -ano | findstr :5000

echo.
echo Closing processes using port 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Closing process ID: %%a
    taskkill /F /PID %%a 2>nul
    if errorlevel 1 (
        echo [WARNING] Failed to close PID %%a - may need Administrator
    ) else (
        echo [OK] Process %%a closed
    )
)

echo.
echo Closing all node.exe processes...
taskkill /F /IM node.exe 2>nul

echo.
echo ========================================
echo Done
echo ========================================
echo.
echo Checking if port 5000 is free...
timeout /t 1 /nobreak >nul
netstat -ano | findstr :5000
if errorlevel 1 (
    echo [OK] Port 5000 is now free
) else (
    echo [WARNING] Port 5000 may still be in use
    echo Please run this script as Administrator
)
echo.
pause
