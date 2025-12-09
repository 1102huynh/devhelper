#!/bin/bash

echo "========================================"
echo "Dev Helper - Project Verification"
echo "========================================"
echo ""

echo "Checking project structure..."
echo ""

# Check backend
if [ -d "backend" ]; then
    echo "[OK] Backend folder exists"
    if [ -f "backend/pom.xml" ]; then
        echo "[OK] Backend pom.xml exists"
    else
        echo "[ERROR] Backend pom.xml not found"
    fi
    if [ -d "backend/src/main/java/com/devhelper" ]; then
        echo "[OK] Backend source code exists"
    else
        echo "[ERROR] Backend source code not found"
    fi
else
    echo "[ERROR] Backend folder not found"
fi

echo ""

# Check frontend
if [ -d "frontend" ]; then
    echo "[OK] Frontend folder exists"
    if [ -f "frontend/package.json" ]; then
        echo "[OK] Frontend package.json exists"
    else
        echo "[ERROR] Frontend package.json not found"
    fi
    if [ -d "frontend/src/app" ]; then
        echo "[OK] Frontend source code exists"
    else
        echo "[ERROR] Frontend source code not found"
    fi
else
    echo "[ERROR] Frontend folder not found"
fi

echo ""

# Check documentation
if [ -f "README.md" ]; then
    echo "[OK] README.md exists"
else
    echo "[ERROR] README.md not found"
fi

if [ -f "SETUP_GUIDE.md" ]; then
    echo "[OK] SETUP_GUIDE.md exists"
else
    echo "[ERROR] SETUP_GUIDE.md not found"
fi

if [ -f "PROJECT_SUMMARY.md" ]; then
    echo "[OK] PROJECT_SUMMARY.md exists"
else
    echo "[ERROR] PROJECT_SUMMARY.md not found"
fi

echo ""

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if command -v java &> /dev/null; then
    echo "[OK] Java is installed"
    java -version 2>&1 | head -n 1
else
    echo "[ERROR] Java not found. Please install Java 17+"
fi

echo ""

if command -v mvn &> /dev/null; then
    echo "[OK] Maven is installed"
    mvn -v 2>&1 | head -n 1
else
    echo "[ERROR] Maven not found. Please install Maven 3.6+"
fi

echo ""

if command -v node &> /dev/null; then
    echo "[OK] Node.js is installed"
    node --version
else
    echo "[ERROR] Node.js not found. Please install Node.js 18+"
fi

echo ""

if command -v npm &> /dev/null; then
    echo "[OK] npm is installed"
    npm --version
else
    echo "[ERROR] npm not found. Please install npm"
fi

echo ""
echo "========================================"
echo "Verification Complete"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Read SETUP_GUIDE.md for detailed instructions"
echo "2. Run ./start-dev.sh to start development servers"
echo ""

