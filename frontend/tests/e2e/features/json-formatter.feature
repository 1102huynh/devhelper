Feature: JSON Formatter
  As a developer
  I want to format, validate and minify JSON
  So that I can work with JSON data efficiently in the UI

  Background:
    Given I am on the "JSON Formatter" page

  Scenario: Format valid JSON
    When I enter JSON '{"name":"John","age":30}'
    And I click the format button
    Then I should see formatted JSON output

  Scenario: Validate valid JSON
    When I enter JSON '{"name":"John","age":30}'
    And I click the validate button
    Then I should see a validation success message

  Scenario: Validate invalid JSON
    When I enter JSON '{"name":"John","age":30'
    And I click the validate button
    Then I should see a validation error message

  Scenario: Minify JSON
    When I enter JSON '{ "name": "John", "age": 30 }'
    And I click the minify button
    Then I should see minified JSON

  Scenario: Format complex nested JSON
    When I enter JSON '{"user":{"name":"John","address":{"city":"NYC"}}}'
    And I click the format button
    Then I should see formatted JSON output

  Scenario: Format JSON array
    When I enter JSON '[{"id":1,"name":"John"},{"id":2,"name":"Jane"}]'
    And I click the format button
    Then I should see formatted JSON output

