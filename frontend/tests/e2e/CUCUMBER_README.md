# Cucumber E2E Tests for DevHelper Frontend

This directory contains End-to-End (E2E) Behavior-Driven Development (BDD) tests using Cucumber and Playwright for the DevHelper frontend application.

## 📁 Structure

```
frontend/
├── cucumber.js                          # Cucumber configuration
├── tests/
│   └── e2e/
│       ├── features/                    # Feature files (Gherkin)
│       │   ├── navigation.feature
│       │   ├── json-formatter.feature
│       │   ├── notes.feature
│       │   ├── uuid-generator.feature
│       │   └── regex-tester.feature
│       ├── step-definitions/            # Step definitions
│       │   ├── common-steps.js
│       │   ├── json-formatter-steps.js
│       │   ├── notes-steps.js
│       │   └── uuid-generator-steps.js
│       └── support/
│           └── hooks.js                 # Before/After hooks
└── test-results/                        # Test reports (generated)
    ├── cucumber-report.html
    └── cucumber-report.json
```

## 🚀 Setup

### Install dependencies
```bash
cd frontend
npm install
```

### Required dependencies
- `@cucumber/cucumber`: Cucumber framework
- `@playwright/test`: Browser automation
- `@testing-library/react`: React testing utilities
- `@testing-library/jest-dom`: Jest matchers

## 🏃 Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests with HTML report
```bash
npm run test:e2e:report
```

### Run specific feature
```bash
npx cucumber-js tests/e2e/features/navigation.feature
```

### Run with tags
```bash
npx cucumber-js --tags "@smoke"
```

## 🌐 Test Environment

### Environment Variables
Create a `.env.test` file:
```env
BASE_URL=http://localhost:3000
API_URL=http://localhost:8080
```

### Prerequisites
- Frontend server running on `http://localhost:3000`
- Backend API running on `http://localhost:8080`

### Start servers before testing
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Tests
cd frontend
npm run test:e2e
```

## 📝 Feature Files

### 1. Navigation (`navigation.feature`)
Tests application navigation:
- View home page
- Navigate to different tools
- Check UI elements
- Verify GitHub star button

### 2. JSON Formatter (`json-formatter.feature`)
Tests JSON operations in UI:
- Format JSON
- Validate JSON
- Minify JSON
- Handle invalid JSON
- Format complex nested JSON

### 3. Notes Management (`notes.feature`)
Tests notes CRUD operations:
- Create new notes
- Pin/unpin notes
- Delete notes
- View all notes

### 4. UUID Generator (`uuid-generator.feature`)
Tests UUID generation in UI:
- Generate single UUID
- Generate multiple UUIDs
- Copy to clipboard
- Verify UUID format

### 5. Regex Tester (`regex-tester.feature`)
Tests regex validation:
- Test regex patterns
- Email validation
- Phone number validation

## 🔧 Writing New Tests

### 1. Create a Feature File
Create a new `.feature` file in `tests/e2e/features/`:

```gherkin
Feature: New Feature Name
  As a user
  I want to do something
  So that I can achieve a goal

  Background:
    Given I am on the "Tool Name" page

  Scenario: Test scenario name
    When I perform an action
    Then I should see expected result
```

### 2. Create Step Definitions
Create a new step definition file in `tests/e2e/step-definitions/`:

```javascript
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I perform an action', async function () {
  await this.page.click('button');
});

Then('I should see expected result', async function () {
  await expect(this.page.locator('text=Result')).toBeVisible();
});
```

## 📊 Test Reports

After running tests, open the HTML report:
```bash
# Windows
start test-results/cucumber-report.html

# Mac/Linux
open test-results/cucumber-report.html
```

## 🎯 Common Step Definitions

### Navigation
```gherkin
Given I am on the home page
Given I am on the "JSON Formatter" page
When I click on "Link Text"
When I click the "Button Text" button
Then I should be on the "page-name" page
Then the URL should contain "path"
```

### Input/Output
```gherkin
When I enter "text" in the "Field Name" field
When I fill the input with "value"
When I fill the textarea with "value"
Then I should see "text"
Then I should see the text "text"
```

### Page Elements
```gherkin
Then the page title should be "Title"
Then I should see "Element Text"
```

## 🧪 Testing Best Practices

1. **Independent scenarios**: Each scenario should run independently
2. **Use Background**: Share common setup steps
3. **Clear naming**: Use descriptive scenario names
4. **Wait for elements**: Always wait for dynamic content
5. **Clean state**: Reset state between tests
6. **Readable features**: Write features for non-technical stakeholders
7. **Reusable steps**: Create generic step definitions

## 🔍 Debugging Tests

### Run in headed mode (see browser)
Edit `tests/e2e/support/hooks.js`:
```javascript
this.browser = await chromium.launch({
  headless: false,  // Changed from true
  slowMo: 500       // Slow down actions
});
```

### Enable screenshots on failure
Add to `hooks.js` After hook:
```javascript
After(async function (scenario) {
  if (scenario.result.status === 'failed') {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
});
```

### Add console logs
```javascript
When('I click something', async function () {
  console.log('Current URL:', this.page.url());
  await this.page.click('button');
  const text = await this.page.textContent('selector');
  console.log('Found text:', text);
});
```

### Use Playwright Inspector
```javascript
await this.page.pause(); // Pauses execution
```

## 📖 Example Scenarios

### Basic Navigation
```gherkin
Scenario: Navigate to tool
  Given I am on the home page
  When I click on "JSON Formatter"
  Then I should be on the "json-formatter" page
  And I should see "Format JSON"
```

### Form Interaction
```gherkin
Scenario: Submit form
  Given I am on the "Notes" page
  When I click the create note button
  And I enter note title "My Note"
  And I enter note content "Content here"
  And I save the note
  Then I should see the note "My Note"
```

### Data Validation
```gherkin
Scenario: Validate generated data
  Given I am on the "UUID Generator" page
  When I click the generate button
  Then I should see generated UUIDs
  And I should see "Copy"
```

## 🐛 Troubleshooting

### Tests timing out
- Increase timeout in `hooks.js`: `setDefaultTimeout(120000)`
- Ensure servers are running
- Check network connectivity

### Element not found
- Use `await this.page.waitForSelector('selector')`
- Check if element is in viewport
- Verify correct selector

### Flaky tests
- Add explicit waits: `await this.page.waitForLoadState('networkidle')`
- Avoid hardcoded timeouts
- Check for race conditions

## 📚 Resources

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Playwright Documentation](https://playwright.dev/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🎨 Tagging Scenarios

Use tags to organize and filter tests:

```gherkin
@smoke @fast
Scenario: Quick smoke test
  Given I am on the home page
  Then I should see "DevHelper"

@regression @slow
Scenario: Full regression test
  Given I am on the "Notes" page
  When I create multiple notes
  Then all notes should be visible
```

Run tagged scenarios:
```bash
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@regression and not @slow"
```

## 🤝 Contributing

When adding new E2E tests:
1. Write feature file first (BDD approach)
2. Run tests to see them fail
3. Implement step definitions
4. Implement actual feature in UI
5. Run tests to see them pass
6. Update this README if needed

## ⚡ Performance Tips

1. Run tests in parallel (when supported)
2. Use headless mode for CI/CD
3. Reuse browser contexts when possible
4. Mock external API calls
5. Use test data fixtures

## 🔐 Security Notes

- Don't commit sensitive data in feature files
- Use environment variables for credentials
- Clean up test data after runs
- Use separate test database/environment

