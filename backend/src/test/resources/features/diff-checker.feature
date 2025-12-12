Feature: Diff Checker
  As a developer
  I want to compare two text files
  So that I can see the differences between them

  Scenario: Compare two different texts
    Given I have original text "Hello World"
    And I have modified text "Hello DevHelper"
    When I compare the texts
    Then the response status should be 200
    And the response should contain diff results
    And the diff should show changes

  Scenario: Compare identical texts
    Given I have original text "Same text"
    And I have modified text "Same text"
    When I compare the texts
    Then the response status should be 200
    And the response should contain diff results
    And the diff should show no changes

  Scenario: Compare multiline texts with additions
    Given I have original text "Line 1\nLine 2"
    And I have modified text "Line 1\nLine 2\nLine 3"
    When I compare the texts
    Then the response status should be 200
    And the response should contain diff results
    And the diff should show changes

  Scenario: Compare multiline texts with deletions
    Given I have original text "Line 1\nLine 2\nLine 3"
    And I have modified text "Line 1\nLine 3"
    When I compare the texts
    Then the response status should be 200
    And the response should contain diff results
    And the diff should show changes

  Scenario: Compare code snippets
    Given I have original text "function hello() { return 'world'; }"
    And I have modified text "function hello() { return 'devhelper'; }"
    When I compare the texts
    Then the response status should be 200
    And the response should contain diff results
    And the diff should show changes

