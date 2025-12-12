Feature: API Integration Testing
  As a developer
  I want to test API integrations
  So that I can ensure all endpoints work correctly together

  Background:
    Given the API is available

  @integration @api
  Scenario: Create multiple notes and manage them
    Given I have a note with title "Note 1" and content "Content 1"
    When I create a new note
    Then the response status should be 201

    Given I have a note with title "Note 2" and content "Content 2"
    When I create a new note
    Then the response status should be 201

    When I retrieve all notes
    Then the response status should be 200
    And the response should contain at least one note

  @integration @api
  Scenario: Test JSON formatter with various inputs
    Given I have a JSON string "{\"simple\":\"object\"}"
    When I format the JSON
    Then the response status should be 200
    And the response should contain formatted JSON

    Given I have a JSON string "[1,2,3,4,5]"
    When I format the JSON
    Then the response status should be 200
    And the response should contain formatted JSON

    Given I have a JSON string "{\"nested\":{\"deep\":{\"value\":\"test\"}}}"
    When I format the JSON
    Then the response status should be 200
    And the response should contain formatted JSON

  @integration @api
  Scenario: Test diff checker with complex texts
    Given I have original text "function hello() {\n  return 'world';\n}"
    And I have modified text "function hello() {\n  return 'devhelper';\n}"
    When I compare the texts
    Then the response status should be 200
    And the response should contain diff results
    And the diff should show changes

  @smoke @api
  Scenario: Quick API health check
    When I retrieve all notes
    Then the response status should be 200

    When I generate 1 UUID
    Then the response status should be 200
    And the response should contain 1 UUID

  @error-handling @api
  Scenario: Test error handling
    Given I have a JSON string "invalid json{"
    When I validate the JSON
    Then the response status should be 200
    And the JSON should be invalid
    And the response should contain an error message

  @performance @api
  Scenario: Generate multiple UUIDs
    When I generate 10 UUIDs
    Then the response status should be 200
    And the response should contain 10 UUIDs
    And all UUIDs should be valid format

