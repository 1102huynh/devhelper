Feature: Regex Tester
  As a developer
  I want to test regular expressions
  So that I can validate and debug regex patterns

  Background:
    Given I am on the "Regex Tester" page

  Scenario: Test simple regex pattern
    When I fill the input with "test@example.com"
    Then I should see "Regex Tester"

  Scenario: Test email validation regex
    When I fill the input with "user@domain.com"
    Then I should see "Test String"

  Scenario: Test phone number regex
    When I fill the input with "+1-234-567-8900"
    Then I should see "Regex Tester"

