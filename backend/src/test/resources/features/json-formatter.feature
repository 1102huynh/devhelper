Feature: JSON Formatter
  As a developer
  I want to format, validate and minify JSON
  So that I can work with JSON data efficiently

  Scenario: Format valid JSON
    Given I have a JSON string "{\"name\":\"John\",\"age\":30}"
    When I format the JSON
    Then the response status should be 200
    And the response should contain formatted JSON

  Scenario: Validate valid JSON
    Given I have a JSON string "{\"name\":\"John\",\"age\":30}"
    When I validate the JSON
    Then the response status should be 200
    And the JSON should be valid

  Scenario: Validate invalid JSON
    Given I have a JSON string "{\"name\":\"John\",\"age\":30"
    When I validate the JSON
    Then the response status should be 200
    And the JSON should be invalid
    And the response should contain an error message

  Scenario: Minify JSON
    Given I have a JSON string "{ \"name\": \"John\", \"age\": 30 }"
    When I minify the JSON
    Then the response status should be 200

  Scenario: Format complex JSON with nested objects
    Given I have a JSON string "{\"user\":{\"name\":\"John\",\"address\":{\"city\":\"NYC\"}}}"
    When I format the JSON
    Then the response status should be 200
    And the response should contain formatted JSON

  Scenario: Format JSON array
    Given I have a JSON string "[{\"id\":1,\"name\":\"John\"},{\"id\":2,\"name\":\"Jane\"}]"
    When I format the JSON
    Then the response status should be 200
    And the response should contain formatted JSON

