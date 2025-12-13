@echo off
pause

)
    echo ====================================
    echo Build failed! Check errors above.
    echo ====================================
) else (
    echo ====================================
    echo Build completed successfully!
    echo ====================================
if %ERRORLEVEL% EQU 0 (
echo.

call npm run build
echo [3/3] Building application...
echo.

call npm install
echo [2/3] Installing dependencies...
echo.

)
    rmdir /s /q node_modules 2>nul
    echo Removing node_modules...
if exist node_modules (

)
    timeout /t 1 >nul
    rmdir /s /q .next 2>nul
    echo Removing .next directory...
if exist .next (
echo [1/3] Cleaning build directories...

cd frontend

echo.
echo ====================================
echo Dev Helper - Clean Build Frontend
echo ====================================

