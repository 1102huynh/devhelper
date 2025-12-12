Feature: Notes Management
  As a developer
  I want to manage my notes
  So that I can quickly save and retrieve important information

  Background:
    Given the API is available

  Scenario: Create a new note
    Given I have a note with title "Test Note" and content "This is a test note"
    When I create a new note
    Then the response status should be 201
    And the response should contain the note with title "Test Note"

  Scenario: Retrieve all notes
    Given I have a note with title "First Note" and content "First content"
    When I create a new note
    And I retrieve all notes
    Then the response status should be 200
    And the response should contain at least one note

  Scenario: Retrieve a note by ID
    Given I have a note with title "Specific Note" and content "Specific content"
    When I create a new note
    And I retrieve the note by ID
    Then the response status should be 200
    And the response should contain the note with title "Specific Note"

  Scenario: Update a note
    Given I have a note with title "Update Test" and content "Original content"
    When I create a new note
    And I update the note content to "Updated content"
    Then the response status should be 200
    And the note content should be "Updated content"

  Scenario: Pin a note
    Given I have a note with title "Pin Test" and content "This note will be pinned"
    When I create a new note
    And I pin the note
    Then the response status should be 200
    And the note should be pinned

  Scenario: Delete a note
    Given I have a note with title "Delete Test" and content "This note will be deleted"
    When I create a new note
    And I delete the note
    Then the response status should be 204

