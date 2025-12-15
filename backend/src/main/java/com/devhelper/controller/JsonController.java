package com.devhelper.controller;

import com.devhelper.dto.JsonFormatRequest;
import com.devhelper.dto.JsonFormatResponse;
import com.devhelper.service.JsonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/json")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class JsonController {

    @Autowired
    private JsonService jsonService;

    @PostMapping("/format")
    public ResponseEntity<JsonFormatResponse> formatJson(@RequestBody JsonFormatRequest request) {
        JsonFormatResponse response = jsonService.formatJson(request);
        return ResponseEntity.ok(response);
    }
}

