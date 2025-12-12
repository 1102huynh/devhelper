# ✅ Cucumber Test Execution Checklist

## Before Running Tests (First Time Setup)

### 1. Install Dependencies
- [ ] Backend dependencies installed: `cd backend && mvn clean install`
- [ ] Frontend dependencies installed: `cd frontend && npm install`

### 2. Install Playwright Browsers ⚠️ **REQUIRED**
```bash
cd frontend
npx playwright install chromium
```

**Expected output**:
```
Downloading Chromium Headless Shell...
Chromium Headless Shell downloaded to C:\Users\...\AppData\Local\ms-playwright\...
```

✅ This step must be completed before running any E2E tests!

---

## Before Each Test Run

### 1. Start Backend Server
```bash
# Terminal 1
cd backend
mvn spring-boot:run
```

**Wait for**:
```
Started DevHelperApplication in X.XXX seconds
```

✅ Backend ready at: http://localhost:8080

### 2. Start Frontend Server
```bash
# Terminal 2
cd frontend
npm run dev
```

**Wait for**:
```
✓ Ready in X.Xs
- Local: http://localhost:3000
```

✅ Frontend ready at: http://localhost:3000

### 3. Verify Servers Are Running

**Check Backend**:
```bash
curl http://localhost:8080/api/notes
```
Should return: `[]` (empty array) or list of notes

**Check Frontend**:
```bash
curl http://localhost:3000
```
Should return: HTML content

---

## Running Tests

### Option 1: Run All Tests
```bash
# Terminal 3
cd frontend
npm run test:e2e
```

### Option 2: Run with HTML Report
```bash
cd frontend
npm run test:e2e:report
```

**View report**: Open `frontend/test-results/cucumber-report.html`

### Option 3: Run Specific Feature
```bash
cd frontend
npx cucumber-js tests/e2e/features/navigation.feature
```

### Option 4: Dry Run (No Browser, Check Config)
```bash
cd frontend
npx cucumber-js --dry-run
```

**Expected output**:
```
28 scenarios (28 skipped)
128 steps (128 skipped)
```

---

## Post-Test Verification

### Check Test Results
- [ ] All scenarios passed or check failures
- [ ] HTML report generated: `frontend/test-results/cucumber-report.html`
- [ ] JSON report generated: `frontend/test-results/cucumber-report.json`

### View Reports
```bash
# Windows
start frontend/test-results/cucumber-report.html

# Mac
open frontend/test-results/cucumber-report.html

# Linux
xdg-open frontend/test-results/cucumber-report.html
```

---

## Troubleshooting Quick Checks

### If tests fail to start:
```bash
# 1. Check Playwright browsers installed
cd frontend
npx playwright install --dry-run

# 2. Check configuration
npx cucumber-js --dry-run

# 3. Check servers are running
curl http://localhost:8080/api/notes
curl http://localhost:3000
```

### If tests timeout:
- Check both servers are fully started
- Check no errors in server consoles
- Increase timeout in `tests/e2e/support/hooks.js`:
  ```javascript
  setDefaultTimeout(120000); // 2 minutes
  ```

### If browser doesn't launch:
```bash
cd frontend
npx playwright install chromium --force
```

---

## Common Commands Reference

### Backend
```bash
# Start server
mvn spring-boot:run

# Run backend Cucumber tests
mvn test

# Run with report
mvn clean verify

# View backend test report
# Open: backend/target/cucumber-reports/cucumber.html
```

### Frontend
```bash
# Install dependencies
npm install

# Install browsers (REQUIRED first time)
npx playwright install chromium

# Start dev server
npm run dev

# Run E2E tests
npm run test:e2e

# Run with HTML report
npm run test:e2e:report

# Dry run (config check)
npx cucumber-js --dry-run

# Run specific feature
npx cucumber-js tests/e2e/features/navigation.feature
```

---

## Test Execution Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. First Time Setup                                 │
│    ├── npm install                                  │
│    └── npx playwright install chromium ✅           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. Start Backend (Terminal 1)                       │
│    └── mvn spring-boot:run                          │
│    └── Wait for "Started DevHelperApplication"     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Start Frontend (Terminal 2)                      │
│    └── npm run dev                                  │
│    └── Wait for "Ready in X.Xs"                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. Run Tests (Terminal 3)                           │
│    └── npm run test:e2e                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 5. View Results                                     │
│    └── Open: test-results/cucumber-report.html     │
└─────────────────────────────────────────────────────┘
```

---

## Quick Health Check

Run this to verify everything is set up correctly:

```bash
# 1. Check Node/npm versions
node --version   # Should be 18+
npm --version    # Should be 9+

# 2. Check Java/Maven versions
java --version   # Should be 17+
mvn --version    # Should be 3.6+

# 3. Check Playwright browsers
cd frontend
npx playwright install --dry-run

# 4. Check Cucumber configuration
npx cucumber-js --dry-run

# 5. Start servers and run a quick test
# (Follow the test execution flow above)
```

---

## Expected Test Results

After running `npm run test:e2e`, you should see:

```
28 scenarios (28 passed)
128 steps (128 passed)
0m45.123s
```

If all tests pass: ✅ **Setup complete!**

If some tests fail: Check the HTML report for details and see `CUCUMBER_TROUBLESHOOTING.md`

---

**Last Updated**: December 12, 2025
**Status**: ✅ All setup steps documented

