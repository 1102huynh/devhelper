# 🔧 Cucumber Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: Playwright browser not installed ⚠️ **CRITICAL**
```
browserType.launch: Executable doesn't exist at C:\Users\...\ms-playwright\chromium_headless_shell-1200\chrome-headless-shell.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
╚═════════════════════════════════════════════════════════════════════════╝
```

**Cause**: Playwright browsers not downloaded after npm install

**Solution**: Install Playwright browsers (required for E2E tests):
```bash
cd frontend
npx playwright install chromium

# Or install all browsers (optional)
npx playwright install
```

**Note**: This is required after:
- First time setup
- Updating @playwright/test package
- Switching computers/environments

---

### Issue 2: `publishQuiet` is deprecated
```
⚠ `publishQuiet` option is no longer needed
```

**Solution**: Update `cucumber.js`:
```javascript
publish: false  // Instead of publishQuiet: true
```

---

### Issue 3: Cannot find module 'ts-node/register'
```
Error: Cannot find module 'ts-node/register'
```

**Solution**: 
- **Option A** (Recommended): Remove from `cucumber.js` if using JavaScript:
```javascript
// Remove this line:
requireModule: ['ts-node/register']
```

- **Option B**: Install if you need TypeScript support:
```bash
npm install --save-dev ts-node @types/node
```

---

### Issue 4: Tests fail with "Cannot read properties of undefined"
```
TypeError: Cannot read properties of undefined (reading 'goto')
TypeError: Cannot read properties of undefined (reading 'page')
```

**Cause**: Hooks not being loaded

**Solution**: Ensure `cucumber.js` includes support files:
```javascript
require: [
  'tests/e2e/support/**/*.js',      // Include hooks
  'tests/e2e/step-definitions/**/*.js'
]
```

---

### Issue 5: Multiple step definitions match
```
Multiple step definitions match:
  I click on {string} - common-steps.js:40
  I click on {string} - integration-steps.js:4
```

**Solution**: Remove duplicate step definitions. Keep only one implementation per step pattern.

---

### Issue 6: Connection refused / ECONNREFUSED
```
Error: connect ECONNREFUSED 127.0.0.1:3000
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Cause**: Servers not running

**Solution**: 
1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Wait for both to be ready
4. Then run tests: `cd frontend && npm run test:e2e`

---

### Issue 7: Tests timeout
```
Error: Timeout of 60000ms exceeded
```

**Solution**: Increase timeout in `tests/e2e/support/hooks.js`:
```javascript
setDefaultTimeout(120000); // 2 minutes
```

---

### Issue 8: Port 3000 is in use
```
⚠ Port 3000 is in use, trying 3001 instead.
```

**Solution**: 
- **Option A**: Kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

- **Option B**: Update test config to use the new port:
```javascript
this.baseUrl = 'http://localhost:3001'; // In hooks.js
```

---

### Issue 9: HTML report not generated
```
Cannot find test-results/cucumber-report.html
```

**Solution**: 
1. Create the directory:
```bash
mkdir -p test-results
```

2. Run with report format:
```bash
npm run test:e2e:report
```

Or manually:
```bash
npx cucumber-js --format html:test-results/cucumber-report.html
```

---

### Issue 10: No scenarios/steps found
```
0 scenarios
0 steps
```

**Solution**: Check paths in `cucumber.js`:
```javascript
paths: ['tests/e2e/features/**/*.feature']  // Correct path
```

Verify feature files exist:
```bash
ls tests/e2e/features/
```

---

### Issue 11: Step definitions not found
```
Undefined. Implement with the following snippet:
  Given('I am on the home page', async function () {
    // Write code here
  });
```

**Cause**: Step definitions not loaded

**Solution**: 
1. Check `cucumber.js` includes step definitions path
2. Verify step definition files exist
3. Check step definition pattern matches exactly

---

### Issue 12: Browser not launching (Playwright)
```
Error: browserType.launch: Failed to launch chromium
```

**Solution**: Install Playwright browsers:
```bash
npx playwright install chromium
# Or all browsers
npx playwright install
```

**Note**: This is the same as Issue 1. Make sure browsers are installed before running tests.

---

### Issue 13: CORS errors in tests
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**: Already fixed in backend `WebConfig.java`:
```java
.allowedOriginPatterns("*")  // Instead of .allowedOrigins("*")
```

---

## Quick Diagnosis Commands

### Check Cucumber configuration
```bash
cd frontend
npx cucumber-js --dry-run
```

Expected: No errors, all scenarios/steps recognized

### Check if servers are running
```bash
# Check backend (should return JSON)
curl http://localhost:8080/api/notes

# Check frontend (should return HTML)
curl http://localhost:3000
```

### Check for duplicate step definitions
```bash
cd frontend
npx cucumber-js --dry-run 2>&1 | grep "Multiple step definitions"
```

Expected: No output (no duplicates)

### List all available step definitions
```bash
cd frontend
npx cucumber-js --dry-run --format usage
```

### Check Node and npm versions
```bash
node --version   # Should be 18+
npm --version    # Should be 9+
java --version   # Should be 17+
mvn --version    # Should be 3.6+
```

---

## Test Execution Checklist

Before running tests:

- [ ] Backend server is running on port 8080
- [ ] Frontend server is running on port 3000
- [ ] No configuration errors: `npx cucumber-js --dry-run`
- [ ] Playwright browsers installed: `npx playwright install`
- [ ] Test results directory exists: `mkdir -p test-results`

Run tests:
```bash
cd frontend
npm run test:e2e
```

---

## Getting Help

1. **Check logs**: 
   - Backend: Console where `mvn spring-boot:run` is running
   - Frontend: Browser console (F12)
   - Tests: Terminal where tests are running

2. **Verify environment**:
```bash
cd frontend
npm list @cucumber/cucumber @playwright/test
```

3. **Clean and reinstall**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

4. **Run specific test**:
```bash
npx cucumber-js tests/e2e/features/navigation.feature
```

5. **Run with debug output**:
```bash
npx cucumber-js --format @cucumber/cucumber/lib/formatter/json_formatter
```

---

## Best Practices

✅ Always run `--dry-run` after config changes
✅ Keep step definitions DRY (Don't Repeat Yourself)
✅ Use descriptive step names
✅ Add explicit waits, not hardcoded sleeps
✅ Start servers before running tests
✅ Check HTML reports after test runs
✅ Tag scenarios appropriately (@smoke, @integration)
✅ Keep feature files in sync with UI changes

---

**Last Updated**: December 12, 2025
**Status**: All known issues documented and resolved

