Feature: UUID Generator
  As a developer
  I want to generate UUIDs
  So that I can use them as unique identifiers

  Scenario: Generate a single UUID
    Given the API is available
    When I generate 1 UUID
    Then the response status should be 200
    And the response should contain 1 UUID

  Scenario: Generate multiple UUIDs
    Given the API is available
    When I generate 5 UUIDs
    Then the response status should be 200
    And the response should contain 5 UUIDs

  Scenario: Validate UUID format
    Given the API is available
    When I generate 1 UUID
    Then the response status should be 200
    And all UUIDs should be valid format

