Feature: End-to-End Workflow
  As a developer
  I want to use multiple tools in sequence
  So that I can complete my development tasks efficiently

  @e2e @integration
  Scenario: Complete development workflow
    Given I am on the home page
    When I click on "UUID Generator"
    And I click the generate button
    Then I should see generated UUIDs

    When I click on "JSON Formatter"
    And I enter JSON '{"id":"12345","name":"John Doe","email":"john@example.com"}'
    And I click the format button
    Then I should see formatted JSON output

    When I click on "Notes"
    And I click the create note button
    And I enter note title "Project Setup"
    And I enter note content "UUID generated and JSON formatted successfully"
    And I save the note
    Then I should see the note "Project Setup"

  @smoke @quick
  Scenario: Quick smoke test of main features
    Given I am on the home page
    Then I should see "DevHelper"
    And I should see "Developer Tools"

    When I click on "JSON Formatter"
    Then I should be on the "json-formatter" page

    When I click on "UUID Generator"
    Then I should be on the "uuid-generator" page

    When I click on "Notes"
    Then I should be on the "notes" page

  @accessibility
  Scenario: Check sidebar navigation
    Given I am on the home page
    Then I should see "JSON Formatter"
    And I should see "UUID Generator"
    And I should see "Notes"
    And I should see "Regex Tester"
    And I should see "Hash Generator"
    And I should see "Base64"

  @theme
  Scenario: Toggle dark/light theme
    Given I am on the home page
    When I click on "Toggle theme"
    Then the theme should change
    When I click on "Toggle theme"
    Then the theme should change

  @responsive
  Scenario: Collapse sidebar
    Given I am on the home page
    When I click the sidebar toggle button
    Then the sidebar should be collapsed
    When I click the sidebar toggle button
    Then the sidebar should be expanded

