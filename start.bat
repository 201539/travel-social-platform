@echo off
chcp 65001 >nul
title 旅行社交平台 - 完整设置和启动
cls
echo ========================================
echo 旅行社交平台 - 完整设置和启动
echo ========================================
echo.

REM 检查Node.js
echo [1/7] 检查Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   ✗ Node.js未安装
    echo   请访问 https://nodejs.org/ 下载安装
    echo.
    pause
    exit /b 1
)
node --version
echo   ✓ Node.js已安装
echo.

REM 检查npm
echo [2/7] 检查npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   ✗ npm未安装
    echo.
    pause
    exit /b 1
)
npm --version
echo   ✓ npm已安装
echo.

REM 检查并创建.env文件
echo [3/7] 检查配置文件...
if not exist "server\.env" (
    echo   ✗ .env文件不存在，正在创建...
    copy "server\env-template.txt" "server\.env" >nul
    echo   ✓ .env文件已创建
) else (
    echo   ✓ .env文件已存在
)
echo.

REM 创建uploads目录
echo [4/7] 检查上传目录...
if not exist "server\uploads" (
    mkdir "server\uploads" >nul 2>&1
    echo   ✓ uploads目录已创建
) else (
    echo   ✓ uploads目录已存在
)
echo.

REM 检查依赖
echo [5/7] 检查依赖...
if not exist "node_modules" (
    echo   ✗ 根目录依赖未安装
    echo   正在安装，请稍候...
    call npm install
    if %errorlevel% neq 0 (
        echo   ✗ 依赖安装失败
        pause
        exit /b 1
    )
)
if not exist "server\node_modules" (
    echo   ✗ 后端依赖未安装
    echo   正在安装，请稍候...
    cd server
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo   ✗ 依赖安装失败
        pause
        exit /b 1
    )
)
if not exist "client\node_modules" (
    echo   ✗ 前端依赖未安装
    echo   正在安装，请稍候...
    cd client
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo   ✗ 依赖安装失败
        pause
        exit /b 1
    )
)
echo   ✓ 所有依赖已安装
echo.

REM 检查MongoDB
echo [6/7] 检查MongoDB服务...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ 检测到MongoDB服务
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo   ✓ MongoDB服务已启动
    ) else (
        echo   ⚠ MongoDB服务可能已在运行
    )
) else (
    echo   ✗ MongoDB服务未找到
    echo.
    echo   MongoDB可能未安装，请：
    echo   1. 访问 https://www.mongodb.com/try/download/community
    echo   2. 下载并安装MongoDB
    echo   3. 安装时选择"Install MongoDB as a Service"
    echo   4. 然后重新运行此脚本
    echo.
    echo   或者使用MongoDB Atlas云数据库（无需安装）
    echo   详见 START.md 文档
    echo.
    pause
    exit /b 1
)
echo.

REM 初始化数据库
echo [7/7] 初始化数据库...
cd server
node scripts/initDB.js
if %errorlevel% equ 0 (
    echo   ✓ 数据库初始化成功
) else (
    echo   ✗ 数据库初始化失败
    echo   请检查MongoDB服务是否正常运行
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo 设置完成！
echo ========================================
echo.
echo 示例账号：
echo   用户1: traveler1@example.com / 123456
echo   用户2: traveler2@example.com / 123456
echo.
echo 正在启动服务...
echo.
echo ========================================
echo 服务启动中...
echo ========================================
echo.
echo 前端: http://localhost:3000
echo 后端: http://localhost:5000
echo.
echo 服务将在新窗口中启动
echo 关闭窗口即可停止对应服务
echo.
echo ========================================
echo.

REM 启动后端服务器（新窗口）
echo 正在启动后端服务器...
start "Backend Server" cmd /k "cd /d %~dp0server && npm run dev"

REM 等待2秒
timeout /t 2 /nobreak >nul

REM 启动前端服务器（新窗口）
echo 正在启动前端服务器...
start "Frontend Server" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ========================================
echo 服务已启动！
echo ========================================
echo.
echo 后端和前端服务已在独立窗口中运行
echo 关闭对应窗口即可停止服务
echo.
pause

