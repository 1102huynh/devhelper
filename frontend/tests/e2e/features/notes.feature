Feature: Notes Management
  As a developer
  I want to manage my quick notes
  So that I can quickly save and retrieve important information

  Background:
    Given I am on the "Notes" page

  Scenario: Create a new note
    When I click the create note button
    And I enter note title "Test Note"
    And I enter note content "This is a test note content"
    And I save the note
    Then I should see the note "Test Note"

  Scenario: Pin a note
    When I click the create note button
    And I enter note title "Important Note"
    And I enter note content "This note should be pinned"
    And I save the note
    And I click the pin button for the note
    Then the note should be pinned

  Scenario: Delete a note
    When I click the create note button
    And I enter note title "Temporary Note"
    And I enter note content "This note will be deleted"
    And I save the note
    And I click the delete button for the note
    Then the note should be deleted

  Scenario: View all notes
    Given I am on the "Notes" page
    Then I should see "Notes"
    And I should see "Add Note"

