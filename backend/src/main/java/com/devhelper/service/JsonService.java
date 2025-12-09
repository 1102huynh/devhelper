package com.devhelper.service;

import com.devhelper.dto.JsonFormatRequest;
import com.devhelper.dto.JsonFormatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

@Service
public class JsonService {

    private final ObjectMapper objectMapper;

    public JsonService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    public JsonFormatResponse formatJson(JsonFormatRequest request) {
        JsonFormatResponse response = new JsonFormatResponse();

        try {
            // Parse JSON
            JsonNode jsonNode = objectMapper.readTree(request.getJsonString());

            // Format with indent
            ObjectMapper formattedMapper = new ObjectMapper();
            formattedMapper.enable(SerializationFeature.INDENT_OUTPUT);
            String formatted = formattedMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(jsonNode);

            // Minify
            ObjectMapper minifiedMapper = new ObjectMapper();
            String minified = minifiedMapper.writeValueAsString(jsonNode);

            response.setValid(true);
            response.setFormatted(formatted);
            response.setMinified(minified);
            response.setSize(request.getJsonString().length());

        } catch (Exception e) {
            response.setValid(false);
            response.setError(e.getMessage());
        }

        return response;
    }
}

