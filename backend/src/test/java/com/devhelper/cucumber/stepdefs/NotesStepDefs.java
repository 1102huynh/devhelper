package com.devhelper.cucumber.stepdefs;

import com.devhelper.cucumber.CucumberSpringConfiguration;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.springframework.beans.factory.annotation.Autowired;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Step Definitions for Notes API
 */
public class NotesStepDefs {

    @Autowired
    private CucumberSpringConfiguration config;

    private RequestSpecification request;
    private Response response;
    private String noteTitle;
    private String noteContent;
    private Long createdNoteId;

    @Given("the API is available")
    public void theApiIsAvailable() {
        RestAssured.baseURI = config.getBaseUrl();
        request = given()
                .contentType("application/json")
                .accept("application/json");
    }

    @Given("I have a note with title {string} and content {string}")
    public void iHaveANoteWithTitleAndContent(String title, String content) {
        this.noteTitle = title;
        this.noteContent = content;
    }

    @When("I create a new note")
    public void iCreateANewNote() {
        String requestBody = String.format(
                "{\"title\":\"%s\",\"content\":\"%s\",\"pinned\":false}",
                noteTitle, noteContent
        );

        response = request
                .body(requestBody)
                .when()
                .post("/api/notes");

        if (response.getStatusCode() == 201) {
            createdNoteId = response.jsonPath().getLong("id");
        }
    }

    @When("I retrieve all notes")
    public void iRetrieveAllNotes() {
        response = request
                .when()
                .get("/api/notes");
    }

    @When("I retrieve the note by ID")
    public void iRetrieveTheNoteById() {
        response = request
                .when()
                .get("/api/notes/" + createdNoteId);
    }

    @When("I update the note content to {string}")
    public void iUpdateTheNoteContentTo(String newContent) {
        String requestBody = String.format(
                "{\"title\":\"%s\",\"content\":\"%s\",\"pinned\":false}",
                noteTitle, newContent
        );

        response = request
                .body(requestBody)
                .when()
                .put("/api/notes/" + createdNoteId);
    }

    @When("I delete the note")
    public void iDeleteTheNote() {
        response = request
                .when()
                .delete("/api/notes/" + createdNoteId);
    }

    @When("I pin the note")
    public void iPinTheNote() {
        response = request
                .when()
                .patch("/api/notes/" + createdNoteId + "/pin");
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int statusCode) {
        assertEquals(statusCode, response.getStatusCode());
    }

    @Then("the response should contain the note with title {string}")
    public void theResponseShouldContainTheNoteWithTitle(String title) {
        response.then()
                .body("title", equalTo(title));
    }

    @Then("the response should contain at least one note")
    public void theResponseShouldContainAtLeastOneNote() {
        response.then()
                .body("size()", greaterThan(0));
    }

    @Then("the note should be pinned")
    public void theNoteShouldBePinned() {
        response.then()
                .body("pinned", equalTo(true));
    }

    @Then("the note content should be {string}")
    public void theNoteContentShouldBe(String content) {
        response.then()
                .body("content", equalTo(content));
    }
}

