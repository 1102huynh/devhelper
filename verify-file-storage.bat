@echo off
echo ====================================
echo File Storage - Verification Script
echo ====================================
echo.

echo [Step 1] Checking if data folder exists...
if exist "D:\devhelper-data\" (
    echo ✅ Folder D:\devhelper-data\ EXISTS
    echo.
    echo [Step 2] Listing files...
    dir "D:\devhelper-data\" /B
    echo.
) else (
    echo ⚠️  Folder D:\devhelper-data\ NOT FOUND
    echo.
    echo This folder will be created automatically when backend starts.
    echo.
)

echo [Step 3] Checking file contents...
if exist "D:\devhelper-data\notes.json" (
    echo.
    echo 📄 notes.json:
    type "D:\devhelper-data\notes.json"
    echo.
)

if exist "D:\devhelper-data\ssh-commands.json" (
    echo.
    echo 📄 ssh-commands.json:
    type "D:\devhelper-data\ssh-commands.json"
    echo.
)

echo ====================================
echo Verification complete!
echo ====================================
echo.
echo To start backend with File Storage:
echo   cd backend
echo   mvn spring-boot:run
echo.

pause

