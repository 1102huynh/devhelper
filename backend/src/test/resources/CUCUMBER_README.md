# Cucumber BDD Tests for DevHelper Backend

This directory contains Behavior-Driven Development (BDD) tests using Cucumber for the DevHelper backend API.

## 📁 Structure

```
src/test/
├── java/com/devhelper/
│   ├── CucumberTestRunner.java          # Main test runner
│   └── cucumber/
│       ├── CucumberSpringConfiguration.java  # Spring Boot test configuration
│       └── stepdefs/                     # Step definitions
│           ├── NotesStepDefs.java
│           ├── JsonFormatterStepDefs.java
│           ├── DiffCheckerStepDefs.java
│           └── UuidGeneratorStepDefs.java
└── resources/
    ├── application-test.yml              # Test configuration
    └── features/                         # Feature files (Gherkin)
        ├── notes.feature
        ├── json-formatter.feature
        ├── diff-checker.feature
        └── uuid-generator.feature
```

## 🚀 Running Tests

### Run all Cucumber tests
```bash
cd backend
mvn test
```

### Run specific feature
```bash
mvn test -Dcucumber.filter.tags="@notes"
```

### Run with Maven Surefire
```bash
mvn clean verify
```

## 📝 Feature Files

### 1. Notes Management (`notes.feature`)
Tests CRUD operations for notes:
- Create a new note
- Retrieve all notes
- Retrieve a note by ID
- Update a note
- Pin/unpin a note
- Delete a note

### 2. JSON Formatter (`json-formatter.feature`)
Tests JSON operations:
- Format JSON
- Validate JSON
- Minify JSON
- Handle invalid JSON
- Format complex nested JSON

### 3. Diff Checker (`diff-checker.feature`)
Tests text comparison:
- Compare different texts
- Compare identical texts
- Compare multiline texts
- Detect additions and deletions

### 4. UUID Generator (`uuid-generator.feature`)
Tests UUID generation:
- Generate single UUID
- Generate multiple UUIDs
- Validate UUID format

## 🔧 Writing New Tests

### 1. Create a Feature File
Create a new `.feature` file in `src/test/resources/features/`:

```gherkin
Feature: New Feature Name
  As a user
  I want to do something
  So that I can achieve a goal

  Scenario: Test scenario name
    Given some precondition
    When I perform an action
    Then I should see expected result
```

### 2. Create Step Definitions
Create a new step definition class in `src/test/java/com/devhelper/cucumber/stepdefs/`:

```java
@Autowired
private CucumberSpringConfiguration config;

@Given("some precondition")
public void somePrecondition() {
    // Implementation
}

@When("I perform an action")
public void iPerformAnAction() {
    // Implementation
}

@Then("I should see expected result")
public void iShouldSeeExpectedResult() {
    // Implementation
}
```

## 📊 Reports

After running tests, reports are generated in:
- HTML Report: `target/cucumber-reports/cucumber.html`
- JSON Report: `target/cucumber-reports/cucumber.json`

Open the HTML report in a browser to see detailed test results.

## 🧪 Test Technologies

- **Cucumber**: BDD framework
- **JUnit 5**: Test runner
- **REST Assured**: REST API testing
- **Spring Boot Test**: Spring integration testing
- **H2 Database**: In-memory database for testing

## 🎯 Best Practices

1. **Use descriptive scenario names** that explain what is being tested
2. **Keep scenarios independent** - each scenario should be able to run in isolation
3. **Use Background** for common setup steps
4. **Follow Given-When-Then** pattern consistently
5. **Reuse step definitions** when possible
6. **Keep feature files readable** by non-technical stakeholders
7. **Use scenario outlines** for data-driven tests

## 📖 Example Scenario

```gherkin
Feature: User Authentication
  As a user
  I want to authenticate with the API
  So that I can access protected resources

  Scenario: Successful login with valid credentials
    Given the API is available
    And I have valid credentials
    When I send a login request
    Then the response status should be 200
    And I should receive an authentication token
    
  Scenario: Failed login with invalid credentials
    Given the API is available
    And I have invalid credentials
    When I send a login request
    Then the response status should be 401
    And I should receive an error message
```

## 🔍 Debugging Tests

### Enable debug logging
Edit `application-test.yml`:
```yaml
logging:
  level:
    com.devhelper: DEBUG
    io.cucumber: DEBUG
```

### Run single scenario
Add `@focus` tag to scenario and run:
```bash
mvn test -Dcucumber.filter.tags="@focus"
```

### View detailed REST Assured logs
Add to step definition:
```java
response = request
    .log().all()  // Log request
    .when()
    .get("/api/endpoint")
    .then()
    .log().all()  // Log response
    .extract().response();
```

## 📚 Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Cucumber Java](https://github.com/cucumber/cucumber-jvm)
- [REST Assured Documentation](https://rest-assured.io/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)

## 🤝 Contributing

When adding new features:
1. Write feature file first (BDD approach)
2. Run tests to see them fail
3. Implement step definitions
4. Implement actual feature
5. Run tests to see them pass
6. Refactor if needed

