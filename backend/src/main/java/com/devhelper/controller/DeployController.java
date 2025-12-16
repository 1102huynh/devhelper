package com.devhelper.controller;

import com.devhelper.dto.DeploymentInfo;
import com.devhelper.dto.TomcatInfo;
import com.devhelper.service.DeployService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deploy")
@CrossOrigin(originPatterns = "*")
public class DeployController {

    @Autowired
    private DeployService deployService;

    /**
     * List Tomcat installations from base path
     */
    @GetMapping("/tomcats")
    public ResponseEntity<List<TomcatInfo>> listTomcats(@RequestParam String basePath) {
        return ResponseEntity.ok(deployService.listTomcats(basePath));
    }

    /**
     * Prepare deployment - add WAR/JAR to pending list
     */
    @PostMapping("/prepare")
    public ResponseEntity<?> prepareDeployment(@RequestBody Map<String, String> request) {
        try {
            String projectPath = request.get("projectPath");
            String projectName = request.get("projectName");
            
            DeploymentInfo deployment = deployService.prepareDeployment(projectPath, projectName);
            return ResponseEntity.ok(deployment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all deployments
     */
    @GetMapping("/list")
    public ResponseEntity<List<DeploymentInfo>> getDeployments() {
        return ResponseEntity.ok(deployService.getDeployments());
    }

    /**
     * Deploy WAR to Tomcat
     */
    @PostMapping("/to-tomcat")
    public ResponseEntity<?> deployToTomcat(@RequestBody Map<String, String> request) {
        try {
            String deploymentId = request.get("deploymentId");
            String tomcatPath = request.get("tomcatPath");
            
            DeploymentInfo deployment = deployService.deployToTomcat(deploymentId, tomcatPath);
            return ResponseEntity.ok(deployment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Start Tomcat
     */
    @PostMapping("/tomcat/start")
    public ResponseEntity<?> startTomcat(@RequestBody Map<String, String> request) {
        try {
            String tomcatPath = request.get("tomcatPath");
            String result = deployService.startTomcat(tomcatPath);
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Stop Tomcat
     */
    @PostMapping("/tomcat/stop")
    public ResponseEntity<?> stopTomcat(@RequestBody Map<String, String> request) {
        try {
            String tomcatPath = request.get("tomcatPath");
            String result = deployService.stopTomcat(tomcatPath);
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Remove deployment from list
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeDeployment(@PathVariable String id) {
        deployService.removeDeployment(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
