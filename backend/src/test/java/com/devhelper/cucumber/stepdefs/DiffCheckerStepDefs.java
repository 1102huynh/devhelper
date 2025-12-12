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

/**
 * Step Definitions for Diff Checker API
 */
public class DiffCheckerStepDefs {

    @Autowired
    private CucumberSpringConfiguration config;

    private RequestSpecification request;
    private Response response;
    private String originalText;
    private String modifiedText;

    @Given("I have original text {string}")
    public void iHaveOriginalText(String text) {
        this.originalText = text;
        RestAssured.baseURI = config.getBaseUrl();
        request = given()
                .contentType("application/json")
                .accept("application/json");
    }

    @Given("I have modified text {string}")
    public void iHaveModifiedText(String text) {
        this.modifiedText = text;
    }

    @When("I compare the texts")
    public void iCompareTheTexts() {
        String requestBody = String.format(
                "{\"original\":\"%s\",\"modified\":\"%s\"}",
                originalText, modifiedText
        );

        response = request
                .body(requestBody)
                .when()
                .post("/api/diff/compare");
    }

    @Then("the response should contain diff results")
    public void theResponseShouldContainDiffResults() {
        response.then()
                .body("diff", notNullValue());
    }

    @Then("the diff should show changes")
    public void theDiffShouldShowChanges() {
        response.then()
                .body("hasChanges", equalTo(true));
    }

    @Then("the diff should show no changes")
    public void theDiffShouldShowNoChanges() {
        response.then()
                .body("hasChanges", equalTo(false));
    }
}

