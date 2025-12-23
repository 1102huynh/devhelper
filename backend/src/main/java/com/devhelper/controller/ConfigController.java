package com.devhelper.controller;

import com.devhelper.dto.ConfigResultDTO;
import com.devhelper.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(originPatterns = "*")
public class ConfigController {

    @Autowired
    private ConfigService configService;

    /**
     * Replace database IP in project properties files only
     * Returns list of updated files
     */
    @PostMapping("/replace-database")
    public ResponseEntity<?> replaceDatabaseIp(@RequestBody Map<String, String> request) {
        try {
            String projectPath = request.get("projectPath");
            String newDatabaseIp = request.get("newDatabaseIp");
            
            if (projectPath == null || newDatabaseIp == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing projectPath or newDatabaseIp"));
            }
            
            ConfigResultDTO result = configService.replaceDatabaseOnlyWithDetails(projectPath, newDatabaseIp);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Replace XML test suite configurations (hub, sso credentials, orgAlias)
     * Returns list of updated files
     */
    @PostMapping("/replace-testsuite")
    public ResponseEntity<?> replaceTestSuite(@RequestBody Map<String, String> request) {
        try {
            String projectPath = request.get("projectPath");
            String hub = request.get("hub");
            String ssoUsername = request.get("ssoUsername");
            String ssoPassword = request.get("ssoPassword");
            String orgAlias = request.get("orgAlias");
            
            if (projectPath == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing projectPath"));
            }
            
            ConfigResultDTO result = configService.replaceTestSuiteConfigWithDetails(projectPath, hub, ssoUsername, ssoPassword, orgAlias);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Replace all configurations including database IP, hub, credentials, and orgAlias
     */
    @PostMapping("/replace-config")
    public ResponseEntity<?> replaceConfig(@RequestBody Map<String, String> request) {
        try {
            String projectPath = request.get("projectPath");
            String databaseIp = request.get("databaseIp");
            String hub = request.get("hub");
            String ssoUsername = request.get("ssoUsername");
            String ssoPassword = request.get("ssoPassword");
            String orgAlias = request.get("orgAlias");
            
            if (projectPath == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing projectPath"));
            }
            
            int filesUpdated = configService.replaceConfig(projectPath, databaseIp, hub, ssoUsername, ssoPassword, orgAlias);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "filesUpdated", filesUpdated,
                "message", "Configuration replaced successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
