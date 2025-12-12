package com.devhelper.cucumber.stepdefs;

import com.devhelper.cucumber.CucumberSpringConfiguration;
import com.devhelper.cucumber.TestContext;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.regex.Pattern;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Step Definitions for UUID Generator API
 */
public class UuidGeneratorStepDefs {

    @Autowired
    private CucumberSpringConfiguration config;

    @Autowired
    private TestContext testContext;

    private RequestSpecification request;
    private static final Pattern UUID_PATTERN = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    );

    @When("I generate {int} UUID")
    @When("I generate {int} UUIDs")
    public void iGenerateUuids(int count) {
        RestAssured.baseURI = config.getBaseUrl();
        request = given()
                .contentType("application/json")
                .accept("application/json");

        testContext.setResponse(request
                .queryParam("count", count)
                .when()
                .get("/api/uuid/generate"));
    }

    @Then("the response should contain {int} UUID")
    @Then("the response should contain {int} UUIDs")
    public void theResponseShouldContainUuids(int count) {
        List<String> uuids = testContext.getResponse().jsonPath().getList("uuids");
        assertEquals(count, uuids.size());
    }

    @Then("all UUIDs should be valid format")
    public void allUuidsShouldBeValidFormat() {
        List<String> uuids = testContext.getResponse().jsonPath().getList("uuids");
        for (String uuid : uuids) {
            assertTrue(UUID_PATTERN.matcher(uuid.toLowerCase()).matches(),
                    "UUID " + uuid + " is not in valid format");
        }
    }
}

