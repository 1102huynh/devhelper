#!/bin/bash

echo "===================================="
echo "Dev Helper - Clean Build Frontend"
echo "===================================="
echo ""

cd frontend

echo "[1/3] Cleaning build directories..."
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
    sleep 1
fi

if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
fi

echo ""
echo "[2/3] Installing dependencies..."
npm install

echo ""
echo "[3/3] Building application..."
npm run build

echo ""
if [ $? -eq 0 ]; then
    echo "===================================="
    echo "Build completed successfully!"
    echo "===================================="
else
    echo "===================================="
    echo "Build failed! Check errors above."
    echo "===================================="
    exit 1
fi

