package com.devhelper.cucumber;

import io.restassured.response.Response;
import org.springframework.stereotype.Component;

/**
 * Shared context for Cucumber step definitions
 * This class holds shared state between step definition classes
 */
@Component
public class TestContext {

    private Response response;
    private Long currentNoteId;
    private String jsonInput;
    private String originalText;
    private String modifiedText;

    public Response getResponse() {
        return response;
    }

    public void setResponse(Response response) {
        this.response = response;
    }

    public Long getCurrentNoteId() {
        return currentNoteId;
    }

    public void setCurrentNoteId(Long currentNoteId) {
        this.currentNoteId = currentNoteId;
    }

    public String getJsonInput() {
        return jsonInput;
    }

    public void setJsonInput(String jsonInput) {
        this.jsonInput = jsonInput;
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
    }

    public String getModifiedText() {
        return modifiedText;
    }

    public void setModifiedText(String modifiedText) {
        this.modifiedText = modifiedText;
    }
}

