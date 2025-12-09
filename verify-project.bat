@echo off
echo ========================================
echo Dev Helper - Project Verification
echo ========================================
echo.

echo Checking project structure...
echo.

REM Check backend
if exist "backend\" (
    echo [OK] Backend folder exists
    if exist "backend\pom.xml" (
        echo [OK] Backend pom.xml exists
    ) else (
        echo [ERROR] Backend pom.xml not found
    )
    if exist "backend\src\main\java\com\devhelper\" (
        echo [OK] Backend source code exists
    ) else (
        echo [ERROR] Backend source code not found
    )
) else (
    echo [ERROR] Backend folder not found
)

echo.

REM Check frontend
if exist "frontend\" (
    echo [OK] Frontend folder exists
    if exist "frontend\package.json" (
        echo [OK] Frontend package.json exists
    ) else (
        echo [ERROR] Frontend package.json not found
    )
    if exist "frontend\src\app\" (
        echo [OK] Frontend source code exists
    ) else (
        echo [ERROR] Frontend source code not found
    )
) else (
    echo [ERROR] Frontend folder not found
)

echo.

REM Check documentation
if exist "README.md" (
    echo [OK] README.md exists
) else (
    echo [ERROR] README.md not found
)

if exist "SETUP_GUIDE.md" (
    echo [OK] SETUP_GUIDE.md exists
) else (
    echo [ERROR] SETUP_GUIDE.md not found
)

if exist "PROJECT_SUMMARY.md" (
    echo [OK] PROJECT_SUMMARY.md exists
) else (
    echo [ERROR] PROJECT_SUMMARY.md not found
)

echo.

REM Check prerequisites
echo Checking prerequisites...
echo.

where java >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Java is installed
    java -version 2>&1 | findstr /C:"version"
) else (
    echo [ERROR] Java not found. Please install Java 17+
)

echo.

where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Maven is installed
    mvn -v 2>&1 | findstr /C:"Apache Maven"
) else (
    echo [ERROR] Maven not found. Please install Maven 3.6+
)

echo.

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js not found. Please install Node.js 18+
)

echo.

where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm not found. Please install npm
)

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.
echo Next steps:
echo 1. Read SETUP_GUIDE.md for detailed instructions
echo 2. Run start-dev.bat to start development servers
echo.
pause

