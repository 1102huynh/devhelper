#!/bin/bash

echo "================================================"
echo "   Dev Helper - Starting All Services"
echo "================================================"
echo ""

echo "[1/3] Checking Java..."
java -version
if [ $? -ne 0 ]; then
    echo "ERROR: Java not found! Please install Java 17 or higher."
    exit 1
fi

echo ""
echo "[2/3] Checking Node.js..."
node --version
if [ $? -ne 0 ]; then
    echo "ERROR: Node.js not found! Please install Node.js 18 or higher."
    exit 1
fi

echo ""
echo "[3/3] Starting services..."
echo ""

echo "Starting Backend (Spring Boot)..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

echo "Waiting 10 seconds for backend to start..."
sleep 10

echo "Starting Frontend (Next.js)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "   Services Started!"
echo "================================================"
echo ""
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop services, press Ctrl+C or run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Opening application in browser..."
sleep 5

# Open browser (works on most Unix systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
fi

# Keep script running
wait

