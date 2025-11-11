@echo off
echo ========================================
echo   MemHawk - Memory Forensics Tool
echo   Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js 16.x or later from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Found npm, starting MemHawk...
    npm start
) else (
    echo npm command not found, trying npm.cmd...
    npm.cmd --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Found npm.cmd, starting MemHawk...
        npm.cmd start
    ) else (
        echo Error: npm not found
        echo Please reinstall Node.js from https://nodejs.org
        echo Make sure to include npm in the installation
        pause
        exit /b 1
    )
)