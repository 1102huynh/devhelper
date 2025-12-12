#!/bin/bash

echo "===================================="
echo "  DevHelper - Run All Cucumber Tests"
echo "===================================="
echo ""

echo "[1/4] Building Backend..."
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "ERROR: Backend build failed!"
    exit 1
fi
echo "Backend build completed!"
echo ""

echo "[2/4] Starting Backend Server..."
mvn spring-boot:run &
BACKEND_PID=$!
sleep 10
echo "Backend server started (PID: $BACKEND_PID)"
echo ""

echo "[3/4] Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
sleep 15
echo "Frontend server started (PID: $FRONTEND_PID)"
echo ""

echo "[4/4] Running Backend Cucumber Tests..."
cd ../backend
mvn test -Dtest=CucumberTestRunner
BACKEND_TEST_RESULT=$?
if [ $BACKEND_TEST_RESULT -ne 0 ]; then
    echo "WARNING: Some backend tests failed!"
else
    echo "All backend tests passed!"
fi
echo ""

echo "Backend Test Report: backend/target/cucumber-reports/cucumber.html"
echo ""

echo "[5/4] Running Frontend E2E Tests..."
cd ../frontend
npm run test:e2e:report
FRONTEND_TEST_RESULT=$?
if [ $FRONTEND_TEST_RESULT -ne 0 ]; then
    echo "WARNING: Some frontend tests failed!"
else
    echo "All frontend tests passed!"
fi
echo ""

echo "Frontend Test Report: frontend/test-results/cucumber-report.html"
echo ""

# Cleanup
echo "Stopping servers..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

echo "===================================="
echo "  All tests completed!"
echo "===================================="
echo ""
echo "Open test reports:"
echo "  Backend:  $(pwd)/../backend/target/cucumber-reports/cucumber.html"
echo "  Frontend: $(pwd)/test-results/cucumber-report.html"
echo ""

exit $(( $BACKEND_TEST_RESULT + $FRONTEND_TEST_RESULT ))

