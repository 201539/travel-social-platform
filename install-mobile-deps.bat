@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title Install Mobile Dependencies
cls

cd /d "%~dp0"

echo ========================================
echo Installing Mobile Dependencies
echo ========================================
echo.

REM Check if mobile directory exists
if not exist "mobile" (
    echo [ERROR] mobile directory not found!
    echo.
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "mobile\package.json" (
    echo [ERROR] mobile\package.json not found!
    echo.
    pause
    exit /b 1
)

REM Try to use npm directly first (refresh PATH)
call npm --version >nul 2>&1
if not errorlevel 1 (
    set NPM_CMD=npm
    goto :found_npm
)

REM If direct call fails, try to refresh PATH and find npm
REM Refresh environment variables
call set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%LOCALAPPDATA%\Programs\nodejs"

REM Try again after refreshing PATH
call npm --version >nul 2>&1
if not errorlevel 1 (
    set NPM_CMD=npm
    goto :found_npm
)

REM Try to find npm through node
call node --version >nul 2>&1
if not errorlevel 1 (
    REM Get node path and try to find npm in same directory
    for /f "delims=" %%i in ('where node 2^>nul') do (
        set "NODE_DIR=%%~dpi"
        if exist "!NODE_DIR!npm.cmd" (
            set "NPM_CMD=!NODE_DIR!npm.cmd"
            goto :found_npm
        )
        if exist "!NODE_DIR!npm.exe" (
            set "NPM_CMD=!NODE_DIR!npm.exe"
            goto :found_npm
        )
    )
)

REM Try common Node.js installation paths
if exist "C:\Program Files\nodejs\npm.cmd" (
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
    goto :found_npm
)
if exist "C:\Program Files (x86)\nodejs\npm.cmd" (
    set "NPM_CMD=C:\Program Files (x86)\nodejs\npm.cmd"
    goto :found_npm
)
if exist "%LOCALAPPDATA%\Programs\nodejs\npm.cmd" (
    set "NPM_CMD=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
    goto :found_npm
)

REM If we get here, npm was not found
echo [ERROR] npm command not found in this script context!
echo.
echo Since you mentioned npm and node were found before, this might be a PATH issue.
echo.
echo Please try one of these:
echo   1. Run manually in a new command prompt:
echo      cd "C:\Users\25345\Desktop\移动互联网\mobile"
echo      npm install expo-image-manipulator @react-native-community/slider
echo.
echo   2. Or use the full path (run find-npm.bat to get the exact path):
echo      cd "C:\Users\25345\Desktop\移动互联网\mobile"
echo      "C:\Program Files\nodejs\npm.cmd" install expo-image-manipulator @react-native-community/slider
echo.
pause
exit /b 1

:found_npm
echo [OK] Using npm: %NPM_CMD%
echo.

echo This will install required packages for:
echo   - expo-image-manipulator (for beauty editing)
echo   - @react-native-community/slider (for beauty controls)
echo.

cd mobile

if errorlevel 1 (
    echo [ERROR] Failed to change to mobile directory!
    echo.
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

echo Installing dependencies...
echo This may take a few minutes...
echo.

REM Use call to ensure proper execution
call "%NPM_CMD%" install expo-image-manipulator @react-native-community/slider

if errorlevel 1 (
    echo.
    echo ========================================
    echo [ERROR] Failed to install dependencies
    echo ========================================
    echo.
    echo Possible causes:
    echo   1. Network connection issue
    echo   2. npm registry problem
    echo   3. Package version conflict
    echo.
    echo Try running manually:
    echo   cd mobile
    echo   npm install expo-image-manipulator @react-native-community/slider
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [OK] Dependencies installed successfully!
echo ========================================
echo.
echo Installed packages:
echo   - expo-image-manipulator
echo   - @react-native-community/slider
echo.
echo You can now use the beauty editing feature in the mobile app.
echo.
echo Press any key to exit...
pause >nul
exit /b 0
