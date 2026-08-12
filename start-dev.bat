@echo off
echo ========================================
echo Dev Helper - Development Servers
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

REM Check if required tools are installed
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found. Please install Java 17+
    pause
    exit /b 1
)

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven not found. Please install Maven 3.6+
    pause
    exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo All prerequisites found!
echo.

REM Start backend in new window
echo Starting Backend on http://localhost:8080...
start "Dev Helper Backend" cmd /k "cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local"

REM Wait a bit for backend to start
echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend on http://localhost:3000...
start "Dev Helper Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo H2 Console: http://localhost:8080/h2-console
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Development servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

