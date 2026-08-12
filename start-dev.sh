#!/bin/bash

echo "========================================"
echo "Dev Helper - Development Servers"
echo "========================================"
echo ""
echo "Starting Backend and Frontend..."
echo ""

# Check if required tools are installed
if ! command -v java &> /dev/null; then
    echo "[ERROR] Java not found. Please install Java 17+"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "[ERROR] Maven not found. Please install Maven 3.6+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "All prerequisites found!"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
echo "Starting Backend on http://localhost:8080..."
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 10

# Start frontend
echo "Starting Frontend on http://localhost:3000..."
cd frontend
npm install
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Both servers are running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "H2 Console: http://localhost:8080/h2-console"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait

