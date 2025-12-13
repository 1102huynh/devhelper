#!/bin/bash

echo "===================================="
echo "Frontend - Local Build Test"
echo "===================================="
echo ""

cd frontend

echo "[1/3] Installing dependencies..."
npm install

echo ""
echo "[2/3] Building for production..."
npm run build

echo ""
if [ $? -eq 0 ]; then
    echo "[3/3] Starting production server..."
    echo ""
    echo "===================================="
    echo "Build successful!"
    echo "Testing at: http://localhost:3000"
    echo "===================================="
    echo ""
    npm start
else
    echo "===================================="
    echo "Build failed! Check errors above."
    echo "===================================="
    exit 1
fi

