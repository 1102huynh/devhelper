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

/**
 * Step Definitions for Diff Checker API
 */
public class DiffCheckerStepDefs {

    @Autowired
    private CucumberSpringConfiguration config;

    @Autowired
    private TestContext testContext;

    private RequestSpecification request;

    @Given("I have original text {string}")
    public void iHaveOriginalText(String text) {
        testContext.setOriginalText(text);
        RestAssured.baseURI = config.getBaseUrl();
        request = given()
                .contentType("application/json")
                .accept("application/json");
    }

    @Given("I have modified text {string}")
    public void iHaveModifiedText(String text) {
        testContext.setModifiedText(text);
    }

    @When("I compare the texts")
    public void iCompareTheTexts() {
        String requestBody = String.format(
                "{\"original\":\"%s\",\"modified\":\"%s\"}",
                testContext.getOriginalText(), testContext.getModifiedText()
        );

        testContext.setResponse(request
                .body(requestBody)
                .when()
                .post("/api/diff/compare"));
    }

    @Then("the response should contain diff results")
    public void theResponseShouldContainDiffResults() {
        testContext.getResponse().then()
                .body("diff", notNullValue());
    }

    @Then("the diff should show changes")
    public void theDiffShouldShowChanges() {
        testContext.getResponse().then()
                .body("hasChanges", equalTo(true));
    }

    @Then("the diff should show no changes")
    public void theDiffShouldShowNoChanges() {
        testContext.getResponse().then()
                .body("hasChanges", equalTo(false));
    }
}

