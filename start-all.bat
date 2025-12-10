@echo off
echo.
echo To stop the services, close the terminal windows.
echo.
echo ================================================
echo    Dev Helper is now running!
echo ================================================
echo.

start http://localhost:3000

pause
echo Press any key to open the application in your browser...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
echo.
echo ================================================
echo    Services Starting...
echo ================================================
echo.

start "DevHelper Frontend" cmd /k "cd frontend && npm run dev"
echo Starting Frontend (Next.js)...

timeout /t 10 /nobreak
echo Waiting 10 seconds for backend to start...

start "DevHelper Backend" cmd /k "cd backend && mvn spring-boot:run"
echo Starting Backend (Spring Boot)...

echo.
echo [3/3] Starting services...
echo.

)
    exit /b 1
    pause
    echo ERROR: Node.js not found! Please install Node.js 18 or higher.
if %errorlevel% neq 0 (
node --version
echo [2/3] Checking Node.js...
echo.

)
    exit /b 1
    pause
    echo ERROR: Java not found! Please install Java 17 or higher.
if %errorlevel% neq 0 (
java -version
echo [1/3] Checking Java...

echo.
echo ================================================
echo    Dev Helper - Starting All Services
echo ================================================

