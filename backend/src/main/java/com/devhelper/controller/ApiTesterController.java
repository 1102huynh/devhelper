package com.devhelper.controller;

import com.devhelper.dto.ApiTestRequest;
import com.devhelper.dto.ApiTestResponse;
import com.devhelper.service.ApiTesterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/api-tester")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ApiTesterController {

    @Autowired
    private ApiTesterService apiTesterService;

    @PostMapping("/request")
    public ResponseEntity<ApiTestResponse> testApi(@RequestBody ApiTestRequest request) {
        ApiTestResponse response = apiTesterService.testApi(request);
        return ResponseEntity.ok(response);
    }
}

