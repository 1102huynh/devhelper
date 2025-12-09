package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiTestResponse {
    private int statusCode;
    private String statusText;
    private Map<String, String> headers;
    private String body;
    private long responseTime; // in milliseconds
    private String error;
}

