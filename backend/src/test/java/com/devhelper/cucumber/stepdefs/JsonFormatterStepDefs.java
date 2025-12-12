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
 * Step Definitions for JSON Formatter API
 */
public class JsonFormatterStepDefs {

    @Autowired
    private CucumberSpringConfiguration config;

    private RequestSpecification request;
    private Response response;
    private String jsonInput;

    @Given("I have a JSON string {string}")
    public void iHaveAJsonString(String json) {
        this.jsonInput = json;
        RestAssured.baseURI = config.getBaseUrl();
        request = given()
                .contentType("application/json")
                .accept("application/json");
    }

    @When("I format the JSON")
    public void iFormatTheJson() {
        String requestBody = String.format("{\"json\":\"%s\"}", jsonInput.replace("\"", "\\\""));

        response = request
                .body(requestBody)
                .when()
                .post("/api/json/format");
    }

    @When("I validate the JSON")
    public void iValidateTheJson() {
        String requestBody = String.format("{\"json\":\"%s\"}", jsonInput.replace("\"", "\\\""));

        response = request
                .body(requestBody)
                .when()
                .post("/api/json/validate");
    }

    @When("I minify the JSON")
    public void iMinifyTheJson() {
        String requestBody = String.format("{\"json\":\"%s\"}", jsonInput.replace("\"", "\\\""));

        response = request
                .body(requestBody)
                .when()
                .post("/api/json/minify");
    }

    @Then("the JSON should be valid")
    public void theJsonShouldBeValid() {
        response.then()
                .body("valid", equalTo(true));
    }

    @Then("the response should contain formatted JSON")
    public void theResponseShouldContainFormattedJson() {
        response.then()
                .body("formatted", notNullValue());
    }

    @Then("the JSON should be invalid")
    public void theJsonShouldBeInvalid() {
        response.then()
                .body("valid", equalTo(false));
    }

    @Then("the response should contain an error message")
    public void theResponseShouldContainAnErrorMessage() {
        response.then()
                .body("error", notNullValue());
    }
}

