package com.devhelper.controller;

import com.devhelper.dto.GitCommandRequest;
import com.devhelper.dto.GitCommandResult;
import com.devhelper.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(originPatterns = "*")
public class TestController {

    @Autowired
    private TestService testService;

    @PostMapping("/run")
    public CompletableFuture<ResponseEntity<GitCommandResult>> runTest(@RequestBody GitCommandRequest request) {
        String cmd = request.getCommand();
        if (cmd == null || cmd.isEmpty()) {
            cmd = "mvn test"; // Default
        }
        boolean openTerminal = request.isOpenTerminal();
        return testService.runTest(request.getProjectPath(), cmd, openTerminal)
                .thenApply(ResponseEntity::ok);
    }

    @GetMapping("/log")
    public ResponseEntity<String> getLog(@RequestParam String projectPath) {
        return ResponseEntity.ok(testService.getTestLog(projectPath));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus(@RequestParam String projectPath) {
        return ResponseEntity.ok(Map.of("running", testService.isTestRunning(projectPath)));
    }

    @GetMapping("/suites")
    public ResponseEntity<List<Map<String, String>>> getTestSuites(@RequestParam String projectPath) {
        return ResponseEntity.ok(testService.getTestSuites(projectPath));
    }

    @PostMapping("/clear-log")
    public ResponseEntity<Void> clearLog(@RequestParam String projectPath) {
        testService.clearTestLog(projectPath);
        return ResponseEntity.ok().build();
    }
}
