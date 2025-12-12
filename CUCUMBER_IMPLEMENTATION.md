# 🥒 Cucumber BDD Implementation Guide

## Overview

This project implements **Behavior-Driven Development (BDD)** using **Cucumber** for both Backend (Java/Spring Boot) and Frontend (React/Next.js) testing.

## 📋 Table of Contents

1. [What is BDD?](#what-is-bdd)
2. [Project Structure](#project-structure)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

## What is BDD?

**Behavior-Driven Development (BDD)** is an Agile software development process that encourages collaboration between developers, QA, and non-technical stakeholders.

### Key Concepts:

- **Gherkin Language**: Human-readable format for test scenarios
- **Given-When-Then**: Structure for test scenarios
- **Living Documentation**: Tests serve as up-to-date documentation
- **Collaboration**: Bridge between technical and business teams

### Example:

```gherkin
Feature: User Login
  As a user
  I want to log in to the system
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be redirected to dashboard
    And I should see a welcome message
```

## 📁 Project Structure

```
devhelper/
├── backend/
│   └── src/
│       └── test/
│           ├── java/com/devhelper/
│           │   ├── CucumberTestRunner.java
│           │   └── cucumber/
│           │       ├── CucumberSpringConfiguration.java
│           │       └── stepdefs/
│           │           ├── NotesStepDefs.java
│           │           ├── JsonFormatterStepDefs.java
│           │           ├── DiffCheckerStepDefs.java
│           │           └── UuidGeneratorStepDefs.java
│           └── resources/
│               ├── application-test.yml
│               ├── CUCUMBER_README.md
│               └── features/
│                   ├── notes.feature
│                   ├── json-formatter.feature
│                   ├── diff-checker.feature
│                   └── uuid-generator.feature
│
└── frontend/
    ├── cucumber.js
    ├── .env.test
    └── tests/
        └── e2e/
            ├── features/
            │   ├── navigation.feature
            │   ├── json-formatter.feature
            │   ├── notes.feature
            │   ├── uuid-generator.feature
            │   └── regex-tester.feature
            ├── step-definitions/
            │   ├── common-steps.js
            │   ├── json-formatter-steps.js
            │   ├── notes-steps.js
            │   └── uuid-generator-steps.js
            ├── support/
            │   └── hooks.js
            └── CUCUMBER_README.md
```

## 🔧 Backend Testing

### Technologies:
- **Cucumber Java**: BDD framework
- **JUnit 5**: Test runner
- **REST Assured**: API testing
- **Spring Boot Test**: Integration testing
- **H2 Database**: In-memory test database

### Running Backend Tests:

```bash
cd backend

# Run all Cucumber tests
mvn test

# Run with detailed output
mvn test -Dcucumber.plugin="pretty"

# Run specific feature
mvn test -Dcucumber.filter.tags="@notes"

# Generate HTML report
mvn clean verify
# Open: target/cucumber-reports/cucumber.html
```

### Backend Test Examples:

#### API Test (notes.feature):
```gherkin
Feature: Notes Management
  Background:
    Given the API is available

  Scenario: Create a new note
    Given I have a note with title "Test Note" and content "Test content"
    When I create a new note
    Then the response status should be 201
    And the response should contain the note with title "Test Note"
```

#### Step Definition (NotesStepDefs.java):
```java
@Given("I have a note with title {string} and content {string}")
public void iHaveANoteWithTitleAndContent(String title, String content) {
    this.noteTitle = title;
    this.noteContent = content;
}

@When("I create a new note")
public void iCreateANewNote() {
    String requestBody = String.format(
        "{\"title\":\"%s\",\"content\":\"%s\"}",
        noteTitle, noteContent
    );
    response = request.body(requestBody).post("/api/notes");
}
```

## 🌐 Frontend Testing

### Technologies:
- **Cucumber.js**: BDD framework for JavaScript
- **Playwright**: Browser automation
- **Testing Library**: React testing utilities

### Running Frontend Tests:

```bash
cd frontend

# Install dependencies
npm install

# Start servers first
# Terminal 1: Start backend
cd backend && mvn spring-boot:run

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Run tests
npm run test:e2e

# Generate HTML report
npm run test:e2e:report
# Open: test-results/cucumber-report.html
```

### Frontend Test Examples:

#### UI Test (json-formatter.feature):
```gherkin
Feature: JSON Formatter
  Background:
    Given I am on the "JSON Formatter" page

  Scenario: Format valid JSON
    When I enter JSON '{"name":"John","age":30}'
    And I click the format button
    Then I should see formatted JSON output
```

#### Step Definition (json-formatter-steps.js):
```javascript
When('I enter JSON {string}', async function (json) {
  await this.page.fill('textarea', json);
});

When('I click the format button', async function () {
  await this.page.click('button:has-text("Format")');
});

Then('I should see formatted JSON output', async function () {
  const output = await this.page.locator('textarea').last().textContent();
  expect(output).toBeTruthy();
});
```

## 🚀 Running Tests

### Complete Test Suite:

```bash
# 1. Start Backend
cd backend
mvn spring-boot:run

# 2. Start Frontend (new terminal)
cd frontend
npm run dev

# 3. Run Backend Tests (new terminal)
cd backend
mvn test

# 4. Run Frontend Tests (new terminal)
cd frontend
npm run test:e2e
```

### Quick Commands:

#### Backend:
```bash
mvn test                           # Run all tests
mvn test -Dtest=CucumberTestRunner # Run Cucumber tests only
mvn clean verify                   # Run tests + generate reports
```

#### Frontend:
```bash
npm run test:e2e                   # Run all E2E tests
npm run test:e2e:report            # Run + generate HTML report
npx cucumber-js --tags "@smoke"    # Run tagged tests
```

## ✍️ Writing Tests

### 1. Write Feature File

Create a `.feature` file describing the behavior:

```gherkin
Feature: User Registration
  As a new user
  I want to register an account
  So that I can use the application

  Scenario: Successful registration
    Given I am on the registration page
    When I fill in registration form with valid data
    And I submit the form
    Then I should see a success message
    And I should receive a confirmation email
```

### 2. Run Test (It will fail)

```bash
# Backend
mvn test

# Frontend
npm run test:e2e
```

You'll see undefined step suggestions.

### 3. Implement Step Definitions

**Backend (Java)**:
```java
@Given("I am on the registration page")
public void iAmOnRegistrationPage() {
    // Implementation
}

@When("I fill in registration form with valid data")
public void iFillRegistrationForm() {
    // Implementation
}
```

**Frontend (JavaScript)**:
```javascript
Given('I am on the registration page', async function () {
  await this.page.goto(this.baseUrl + '/register');
});

When('I fill in registration form with valid data', async function () {
  await this.page.fill('input[name="email"]', 'test@example.com');
  await this.page.fill('input[name="password"]', 'password123');
});
```

### 4. Implement Feature

Now implement the actual feature in your application.

### 5. Run Test (It should pass)

```bash
# Backend
mvn test

# Frontend
npm run test:e2e
```

## 🎯 Best Practices

### 1. Feature Files

✅ **Good**:
```gherkin
Scenario: User creates a note
  Given I am logged in
  When I create a note with title "Meeting Notes"
  Then I should see the note in my list
```

❌ **Bad**:
```gherkin
Scenario: Test note creation
  When I click button
  And I type "Meeting Notes"
  Then I see note
```

### 2. Step Definitions

✅ **Good**:
- Reusable steps
- Clear naming
- Proper waits/assertions
- Error handling

❌ **Bad**:
- Hardcoded values
- Tight coupling
- No error handling
- Implicit waits

### 3. Organization

- Group related scenarios in one feature
- Use Background for common setup
- Use Scenario Outline for data-driven tests
- Tag scenarios appropriately

### 4. Tagging

```gherkin
@smoke @critical
Scenario: Critical user flow
  ...

@regression @slow
Scenario: Full regression test
  ...

@wip
Scenario: Work in progress
  ...
```

Run by tag:
```bash
# Backend
mvn test -Dcucumber.filter.tags="@smoke"

# Frontend
npx cucumber-js --tags "@smoke and not @wip"
```

## 🔄 CI/CD Integration

### GitHub Actions Example:

```yaml
name: BDD Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Run Cucumber Tests
        run: |
          cd backend
          mvn clean verify
      - name: Upload Test Report
        uses: actions/upload-artifact@v2
        with:
          name: cucumber-backend-report
          path: backend/target/cucumber-reports/

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run E2E Tests
        run: |
          cd frontend
          npm run test:e2e:report
      - name: Upload Test Report
        uses: actions/upload-artifact@v2
        with:
          name: cucumber-frontend-report
          path: frontend/test-results/
```

## 📊 Reports

### Backend Reports:
- **HTML**: `backend/target/cucumber-reports/cucumber.html`
- **JSON**: `backend/target/cucumber-reports/cucumber.json`

### Frontend Reports:
- **HTML**: `frontend/test-results/cucumber-report.html`
- **JSON**: `frontend/test-results/cucumber-report.json`

Open HTML reports in browser for detailed results.

## 🐛 Troubleshooting

### Backend Issues:

**Problem**: Tests fail with connection refused
```
Solution: Ensure application.yml has correct test configuration
```

**Problem**: Database constraint violations
```
Solution: Use @Transactional or clean database between tests
```

### Frontend Issues:

**Problem**: Element not found
```
Solution: Add explicit waits: await page.waitForSelector()
```

**Problem**: Tests are flaky
```
Solution: Use waitForLoadState('networkidle') and avoid hardcoded timeouts
```

## 📚 Additional Resources

### Documentation:
- [Cucumber Official Docs](https://cucumber.io/docs)
- [Cucumber Java](https://github.com/cucumber/cucumber-jvm)
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [REST Assured](https://rest-assured.io/)
- [Playwright](https://playwright.dev/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)

### Tutorials:
- [BDD with Cucumber](https://cucumber.io/docs/guides/10-minute-tutorial/)
- [REST Assured Tutorial](https://rest-assured.io/tutorial/)
- [Playwright Tutorial](https://playwright.dev/docs/intro)

## 🤝 Contributing

When adding new tests:

1. **Write feature file first** (BDD approach)
2. **Run tests** to see them fail
3. **Implement step definitions**
4. **Implement feature**
5. **Run tests** to see them pass
6. **Refactor** if needed
7. **Update documentation**

## 📝 Summary

This implementation provides:

✅ **Backend API Testing** with Cucumber + REST Assured  
✅ **Frontend E2E Testing** with Cucumber + Playwright  
✅ **Living Documentation** with Gherkin feature files  
✅ **CI/CD Ready** with automated test reports  
✅ **Best Practices** following BDD principles  
✅ **Comprehensive Coverage** for all major features  

---

**Happy Testing! 🥒🚀**

