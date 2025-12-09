package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiTestRequest {
    private String method; // GET, POST, PUT, DELETE, PATCH
    private String url;
    private Map<String, String> headers;
    private String body;
    private Integer timeout = 30000; // 30 seconds default
}

