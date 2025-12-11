package com.devhelper.controller;

import com.devhelper.service.FirebaseService;
import com.google.firebase.database.DataSnapshot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/firebase")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class FirebaseTestController {

    @Autowired
    private FirebaseService firebaseService;

    /**
     * Test endpoint to verify Firebase connection
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Firebase is configured and ready");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    /**
     * Save test data to Firebase
     */
    @PostMapping("/test-save")
    public CompletableFuture<ResponseEntity<Map<String, String>>> testSave(@RequestBody Map<String, Object> data) {
        return firebaseService.saveData("test/" + System.currentTimeMillis(), data)
                .thenApply(result -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("status", "success");
                    response.put("message", "Data saved successfully to Firebase");
                    return ResponseEntity.ok(response);
                })
                .exceptionally(error -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("status", "error");
                    response.put("message", error.getMessage());
                    return ResponseEntity.status(500).body(response);
                });
    }

    /**
     * Get test data from Firebase
     */
    @GetMapping("/test-get/{path}")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> testGet(@PathVariable String path) {
        return firebaseService.getDataSnapshot(path)
                .thenApply(snapshot -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "success");
                    response.put("exists", snapshot.exists());
                    response.put("data", snapshot.getValue());
                    return ResponseEntity.ok(response);
                })
                .exceptionally(error -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "error");
                    response.put("message", error.getMessage());
                    return ResponseEntity.status(500).body(response);
                });
    }
}

