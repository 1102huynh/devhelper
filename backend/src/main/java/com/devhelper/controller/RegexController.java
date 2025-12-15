package com.devhelper.controller;

import com.devhelper.dto.RegexTestRequest;
import com.devhelper.dto.RegexTestResponse;
import com.devhelper.service.RegexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/regex")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class RegexController {

    @Autowired
    private RegexService regexService;

    @PostMapping("/test")
    public ResponseEntity<RegexTestResponse> testRegex(@RequestBody RegexTestRequest request) {
        RegexTestResponse response = regexService.testRegex(request);
        return ResponseEntity.ok(response);
    }
}

