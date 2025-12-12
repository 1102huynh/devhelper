Feature: Navigation
  As a developer
  I want to navigate through the DevHelper application
  So that I can access different tools

  Scenario: View home page
    Given I am on the home page
    Then I should see "DevHelper"
    And I should see "Developer Tools"

  Scenario: Navigate to JSON Formatter
    Given I am on the home page
    When I click on "JSON Formatter"
    Then I should be on the "json-formatter" page

  Scenario: Navigate to UUID Generator
    Given I am on the home page
    When I click on "UUID Generator"
    Then I should be on the "uuid-generator" page

  Scenario: Navigate to Notes
    Given I am on the home page
    When I click on "Notes"
    Then I should be on the "notes" page

  Scenario: Navigate to Regex Tester
    Given I am on the home page
    When I click on "Regex Tester"
    Then I should be on the "regex-tester" page

  Scenario: Check GitHub Star button
    Given I am on the home page
    Then I should see "Star on GitHub"

