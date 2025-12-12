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
 * Step Definitions for JSON Formatter API
 */
public class JsonFormatterStepDefs {

    @Autowired
    private CucumberSpringConfiguration config;

    @Autowired
    private TestContext testContext;

    private RequestSpecification request;

    @Given("I have a JSON string {string}")
    public void iHaveAJsonString(String json) {
        testContext.setJsonInput(json);
        RestAssured.baseURI = config.getBaseUrl();
        request = given()
                .contentType("application/json")
                .accept("application/json");
    }

    @When("I format the JSON")
    public void iFormatTheJson() {
        String requestBody = String.format("{\"json\":\"%s\"}",
            testContext.getJsonInput().replace("\"", "\\\""));

        testContext.setResponse(request
                .body(requestBody)
                .when()
                .post("/api/json/format"));
    }

    @When("I validate the JSON")
    public void iValidateTheJson() {
        String requestBody = String.format("{\"json\":\"%s\"}",
            testContext.getJsonInput().replace("\"", "\\\""));

        testContext.setResponse(request
                .body(requestBody)
                .when()
                .post("/api/json/validate"));
    }

    @When("I minify the JSON")
    public void iMinifyTheJson() {
        String requestBody = String.format("{\"json\":\"%s\"}",
            testContext.getJsonInput().replace("\"", "\\\""));

        testContext.setResponse(request
                .body(requestBody)
                .when()
                .post("/api/json/minify"));
    }

    @Then("the JSON should be valid")
    public void theJsonShouldBeValid() {
        testContext.getResponse().then()
                .body("valid", equalTo(true));
    }

    @Then("the response should contain formatted JSON")
    public void theResponseShouldContainFormattedJson() {
        testContext.getResponse().then()
                .body("formatted", notNullValue());
    }

    @Then("the JSON should be invalid")
    public void theJsonShouldBeInvalid() {
        testContext.getResponse().then()
                .body("valid", equalTo(false));
    }

    @Then("the response should contain an error message")
    public void theResponseShouldContainAnErrorMessage() {
        testContext.getResponse().then()
                .body("error", notNullValue());
    }
}

