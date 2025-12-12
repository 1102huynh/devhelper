# 🥒 Cucumber BDD - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Prerequisites
- ✅ Java 17+ installed
- ✅ Maven 3.6+ installed
- ✅ Node.js 18+ installed
- ✅ npm 9+ installed

### Step 1: Clone and Setup

```bash
cd devhelper

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Run Backend Tests

```bash
cd backend

# Option 1: Run all Cucumber tests
mvn test

# Option 2: Run with HTML report
mvn clean verify

# View report
# Open: target/cucumber-reports/cucumber.html
```

### Step 3: Run Frontend Tests

```bash
# First, start both servers:

# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Tests
cd frontend
npm run test:e2e:report

# View report
# Open: test-results/cucumber-report.html
```

## 🚀 Automated Testing (One Command)

### Windows:
```bash
run-cucumber-tests.bat
```

### Mac/Linux:
```bash
chmod +x run-cucumber-tests.sh
./run-cucumber-tests.sh
```

This will:
1. ✅ Build backend
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Run all backend tests
5. ✅ Run all frontend tests
6. ✅ Generate HTML reports

## 📝 Write Your First Test

### 1. Create Feature File

**Backend**: `backend/src/test/resources/features/my-feature.feature`

```gherkin
Feature: My New Feature
  As a user
  I want to test something
  So that I can be confident it works

  Background:
    Given the API is available

  Scenario: Test something
    When I do something
    Then I should see expected result
```

**Frontend**: `frontend/tests/e2e/features/my-feature.feature`

```gherkin
Feature: My UI Feature
  As a user
  I want to test UI
  So that I can ensure good UX

  Background:
    Given I am on the home page

  Scenario: Navigate to tool
    When I click on "Tool Name"
    Then I should be on the "tool-name" page
```

### 2. Run Test (Will show undefined steps)

```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm run test:e2e
```

### 3. Implement Step Definitions

**Backend**: Create in `backend/src/test/java/com/devhelper/cucumber/stepdefs/`

```java
package com.devhelper.cucumber.stepdefs;

import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

public class MyStepDefs {
    
    @When("I do something")
    public void iDoSomething() {
        // Implementation
    }
    
    @Then("I should see expected result")
    public void iShouldSeeExpectedResult() {
        // Implementation
    }
}
```

**Frontend**: Create in `frontend/tests/e2e/step-definitions/`

```javascript
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I do something', async function () {
  await this.page.click('button');
});

Then('I should see expected result', async function () {
  await expect(this.page.locator('text=Result')).toBeVisible();
});
```

### 4. Run Test Again (Should pass!)

```bash
# Backend
mvn test

# Frontend
npm run test:e2e
```

## 🎯 Running Specific Tests

### Backend - By Tag

```bash
cd backend

# Run smoke tests
mvn test -Dcucumber.filter.tags="@smoke"

# Run API tests
mvn test -Dcucumber.filter.tags="@api"

# Run integration tests
mvn test -Dcucumber.filter.tags="@integration"

# Exclude WIP tests
mvn test -Dcucumber.filter.tags="not @wip"

# Multiple tags
mvn test -Dcucumber.filter.tags="@smoke and @api"
```

### Frontend - By Tag

```bash
cd frontend

# Run smoke tests
npx cucumber-js --tags "@smoke"

# Run E2E tests
npx cucumber-js --tags "@e2e"

# Run quick tests only
npx cucumber-js --tags "@quick"

# Exclude slow tests
npx cucumber-js --tags "not @slow"
```

### Run Specific Feature File

```bash
# Backend
mvn test -Dcucumber.features="src/test/resources/features/notes.feature"

# Frontend
npx cucumber-js tests/e2e/features/navigation.feature
```

## 📊 View Reports

### Backend Reports

After running `mvn test` or `mvn clean verify`:

```
Open in browser:
backend/target/cucumber-reports/cucumber.html
```

### Frontend Reports

After running `npm run test:e2e:report`:

```
Open in browser:
frontend/test-results/cucumber-report.html
```

## 🔧 Common Issues & Solutions

### Issue 1: Tests timeout

**Solution**:
```javascript
// Frontend: Edit tests/e2e/support/hooks.js
setDefaultTimeout(120000); // Increase timeout
```

### Issue 2: Port already in use

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue 3: Backend tests fail - connection refused

**Solution**:
```yaml
# Edit backend/src/test/resources/application-test.yml
server:
  port: 0  # Use random port
```

### Issue 4: Frontend tests fail - element not found

**Solution**:
```javascript
// Add explicit wait
await this.page.waitForSelector('selector', { timeout: 10000 });
```

## 📚 Useful Commands Cheat Sheet

### Backend Commands

```bash
# Run all tests
mvn test

# Run with pretty output
mvn test -Dcucumber.plugin="pretty"

# Run and generate reports
mvn clean verify

# Skip tests during build
mvn clean package -DskipTests

# Run specific test class
mvn test -Dtest=CucumberTestRunner
```

### Frontend Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with HTML report
npm run test:e2e:report

# Run specific feature
npx cucumber-js tests/e2e/features/notes.feature

# Run with tags
npx cucumber-js --tags "@smoke"

# Dry run (check for undefined steps)
npx cucumber-js --dry-run
```

## 🎓 Learning Resources

### Official Docs
- 📖 [Cucumber Docs](https://cucumber.io/docs)
- 📖 [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- 📖 [REST Assured](https://rest-assured.io/)
- 📖 [Playwright](https://playwright.dev/)

### Video Tutorials
- 🎥 [Cucumber BDD Tutorial](https://www.youtube.com/results?search_query=cucumber+bdd+tutorial)
- 🎥 [REST Assured Tutorial](https://www.youtube.com/results?search_query=rest+assured+tutorial)
- 🎥 [Playwright Tutorial](https://www.youtube.com/results?search_query=playwright+tutorial)

### Example Tests
- 📂 Backend: `backend/src/test/resources/features/`
- 📂 Frontend: `frontend/tests/e2e/features/`

## 🎉 Next Steps

1. ✅ Run existing tests to see them pass
2. ✅ Read the feature files to understand test scenarios
3. ✅ Modify a scenario and see it fail
4. ✅ Write your first feature file
5. ✅ Implement step definitions
6. ✅ Run tests and see them pass
7. ✅ Check HTML reports
8. ✅ Add more test coverage

## 💡 Best Practices Checklist

- ✅ Write feature files in plain English
- ✅ Use Given-When-Then pattern
- ✅ Keep scenarios independent
- ✅ Use Background for common setup
- ✅ Tag scenarios appropriately
- ✅ Reuse step definitions
- ✅ Add explicit waits, not hardcoded sleeps
- ✅ Generate and review HTML reports
- ✅ Run tests before committing code
- ✅ Keep features as living documentation

## 🆘 Get Help

1. Read the detailed README:
   - Backend: `backend/src/test/resources/CUCUMBER_README.md`
   - Frontend: `frontend/tests/e2e/CUCUMBER_README.md`
   - Main guide: `CUCUMBER_IMPLEMENTATION.md`

2. Check example features:
   - Backend: `backend/src/test/resources/features/*.feature`
   - Frontend: `frontend/tests/e2e/features/*.feature`

3. Review step definitions:
   - Backend: `backend/src/test/java/com/devhelper/cucumber/stepdefs/`
   - Frontend: `frontend/tests/e2e/step-definitions/`

---

**Happy Testing! 🥒✨**

Start with: `mvn test` (backend) or `npm run test:e2e` (frontend)

