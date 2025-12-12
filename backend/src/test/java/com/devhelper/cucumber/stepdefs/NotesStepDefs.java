package com.devhelper.cucumber.stepdefs;

import com.devhelper.cucumber.CucumberSpringConfiguration;
import com.devhelper.cucumber.TestContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
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

    @Autowired
    private TestContext testContext;

    private RequestSpecification request;
    private String noteTitle;
    private String noteContent;

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

        testContext.setResponse(request
                .body(requestBody)
                .when()
                .post("/api/notes"));

        if (testContext.getResponse().getStatusCode() == 201) {
            testContext.setCurrentNoteId(testContext.getResponse().jsonPath().getLong("id"));
        }
    }

    @When("I retrieve all notes")
    public void iRetrieveAllNotes() {
        testContext.setResponse(request
                .when()
                .get("/api/notes"));
    }

    @When("I retrieve the note by ID")
    public void iRetrieveTheNoteById() {
        testContext.setResponse(request
                .when()
                .get("/api/notes/" + testContext.getCurrentNoteId()));
    }

    @When("I update the note content to {string}")
    public void iUpdateTheNoteContentTo(String newContent) {
        String requestBody = String.format(
                "{\"title\":\"%s\",\"content\":\"%s\",\"pinned\":false}",
                noteTitle, newContent
        );

        testContext.setResponse(request
                .body(requestBody)
                .when()
                .put("/api/notes/" + testContext.getCurrentNoteId()));
    }

    @When("I delete the note")
    public void iDeleteTheNote() {
        testContext.setResponse(request
                .when()
                .delete("/api/notes/" + testContext.getCurrentNoteId()));
    }

    @When("I pin the note")
    public void iPinTheNote() {
        testContext.setResponse(request
                .when()
                .patch("/api/notes/" + testContext.getCurrentNoteId() + "/pin"));
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int statusCode) {
        assertEquals(statusCode, testContext.getResponse().getStatusCode());
    }

    @Then("the response should contain the note with title {string}")
    public void theResponseShouldContainTheNoteWithTitle(String title) {
        testContext.getResponse().then()
                .body("title", equalTo(title));
    }

    @Then("the response should contain at least one note")
    public void theResponseShouldContainAtLeastOneNote() {
        testContext.getResponse().then()
                .body("size()", greaterThan(0));
    }

    @Then("the note should be pinned")
    public void theNoteShouldBePinned() {
        testContext.getResponse().then()
                .body("pinned", equalTo(true));
    }

    @Then("the note content should be {string}")
    public void theNoteContentShouldBe(String content) {
        testContext.getResponse().then()
                .body("content", equalTo(content));
    }
}

