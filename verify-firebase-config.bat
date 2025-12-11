@echo off
echo ============================================
echo Firebase Configuration Verification
echo ============================================
echo.

echo Checking Firebase Configuration Files...
echo.

REM Check FirebaseConfig.java
if exist "backend\src\main\java\com\devhelper\config\FirebaseConfig.java" (
    echo [OK] FirebaseConfig.java exists
) else (
    echo [ERROR] FirebaseConfig.java not found
)

REM Check Firebase credentials
if exist "backend\src\main\resources\abc.json" (
    echo [OK] Firebase credentials file exists
) else (
    echo [ERROR] Firebase credentials file not found
)

REM Check application.yml
if exist "backend\src\main\resources\application.yml" (
    echo [OK] application.yml exists
    findstr /C:"firebase:" backend\src\main\resources\application.yml >nul
    if %ERRORLEVEL%==0 (
        echo [OK] Firebase configuration found in application.yml
    ) else (
        echo [ERROR] Firebase configuration not found in application.yml
    )
) else (
    echo [ERROR] application.yml not found
)

REM Check FirebaseService.java
if exist "backend\src\main\java\com\devhelper\service\FirebaseService.java" (
    echo [OK] FirebaseService.java exists
) else (
    echo [WARN] FirebaseService.java not found (optional)
)

REM Check FirebaseTestController.java
if exist "backend\src\main\java\com\devhelper\controller\FirebaseTestController.java" (
    echo [OK] FirebaseTestController.java exists
) else (
    echo [WARN] FirebaseTestController.java not found (optional)
)

REM Check pom.xml for Firebase dependency
findstr /C:"firebase-admin" backend\pom.xml >nul
if %ERRORLEVEL%==0 (
    echo [OK] Firebase Admin SDK dependency found in pom.xml
) else (
    echo [ERROR] Firebase Admin SDK dependency not found in pom.xml
)

echo.
echo ============================================
echo Verification Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Build the project: cd backend ^&^& mvn clean install
echo 2. Run the application: mvn spring-boot:run
echo 3. Test Firebase: http://localhost:8080/api/firebase/test
echo.
pause

