@echo off
echo ====================================
echo Frontend - Local Build Test
echo ====================================
echo.

cd frontend

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Building for production...
call npm run build

echo.
if %ERRORLEVEL% EQU 0 (
    echo [3/3] Starting production server...
    echo.
    echo ====================================
    echo Build successful!
    echo Testing at: http://localhost:3000
    echo ====================================
    echo.
    call npm start
) else (
    echo ====================================
    echo Build failed! Check errors above.
    echo ====================================
    pause
)

