Feature: UUID Generator
  As a developer
  I want to generate UUIDs
  So that I can use them as unique identifiers in my projects

  Background:
    Given I am on the "UUID Generator" page

  Scenario: Generate a single UUID
    When I click the generate button
    Then I should see generated UUIDs

  Scenario: Generate multiple UUIDs
    When I select to generate 5 UUIDs
    And I click the generate button
    Then I should see 5 UUID

  Scenario: Generate UUID on page load
    Given I am on the "UUID Generator" page
    Then I should see generated UUIDs

  Scenario: Copy UUID to clipboard
    Given I am on the "UUID Generator" page
    When I click the generate button
    Then I should see "Copy"

