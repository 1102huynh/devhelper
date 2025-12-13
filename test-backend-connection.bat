@echo off
echo ====================================
echo Frontend-Backend Connection Test
echo ====================================
echo.

set /p BACKEND_URL="Enter your backend URL (e.g., https://devhelper-backend-xxx.onrender.com): "

echo.
echo Testing backend connection...
echo.

echo [1/3] Testing Health Check...
curl -s -o nul -w "Status: %%{http_code}\n" %BACKEND_URL%/actuator/health
echo.

echo [2/3] Testing Notes API...
curl -s -o nul -w "Status: %%{http_code}\n" %BACKEND_URL%/api/notes
echo.

echo [3/3] Testing SSH Commands API...
curl -s -o nul -w "Status: %%{http_code}\n" %BACKEND_URL%/api/ssh
echo.

echo ====================================
echo Test complete!
echo.
echo Expected results:
echo   Health Check: Status: 200
echo   Notes API: Status: 200
echo   SSH Commands API: Status: 200
echo.
echo If you see 000 or timeout:
echo   - Backend is not running
echo   - Wrong URL
echo.
echo If you see 404:
echo   - API endpoints not found
echo   - Check path is correct
echo.
echo If you see 403 or CORS errors in browser:
echo   - Update backend CORS config
echo ====================================
echo.

pause

