@echo off
echo ====================================
echo   DevHelper - Run All Cucumber Tests
echo ====================================
echo.

echo [1/4] Building Backend...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo ERROR: Backend build failed!
    exit /b 1
)
echo Backend build completed!
echo.

echo [2/4] Starting Backend Server...
start "DevHelper Backend" cmd /c "mvn spring-boot:run"
timeout /t 10 /nobreak > nul
echo Backend server started!
echo.

echo [3/4] Starting Frontend Server...
cd ..\frontend
start "DevHelper Frontend" cmd /c "npm run dev"
timeout /t 15 /nobreak > nul
echo Frontend server started!
echo.

echo [4/4] Running Backend Cucumber Tests...
cd ..\backend
call mvn test -Dtest=CucumberTestRunner
if errorlevel 1 (
    echo WARNING: Some backend tests failed!
) else (
    echo All backend tests passed!
)
echo.

echo Backend Test Report: backend\target\cucumber-reports\cucumber.html
echo.

echo [5/4] Running Frontend E2E Tests...
cd ..\frontend
call npm run test:e2e:report
if errorlevel 1 (
    echo WARNING: Some frontend tests failed!
) else (
    echo All frontend tests passed!
)
echo.

echo Frontend Test Report: frontend\test-results\cucumber-report.html
echo.

echo ====================================
echo   All tests completed!
echo ====================================
echo.
echo Open test reports:
echo   Backend:  %cd%\..\backend\target\cucumber-reports\cucumber.html
echo   Frontend: %cd%\test-results\cucumber-report.html
echo.
pause

