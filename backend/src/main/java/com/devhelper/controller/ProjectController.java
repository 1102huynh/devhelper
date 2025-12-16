package com.devhelper.controller;

import com.devhelper.dto.GitCommandRequest;
import com.devhelper.dto.GitCommandResult;
import com.devhelper.dto.ProjectDTO;
import com.devhelper.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    /**
     * List all projects from a given base path
     */
    @GetMapping
    public CompletableFuture<ResponseEntity<List<ProjectDTO>>> listProjects(
            @RequestParam String basePath) {
        return projectService.listProjects(basePath)
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Maven build
     */
    @PostMapping("/maven/build")
    public CompletableFuture<ResponseEntity<GitCommandResult>> mavenBuild(
            @RequestBody GitCommandRequest request) {
        return projectService.mavenBuild(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * NPM build
     */
    @PostMapping("/npm/build")
    public CompletableFuture<ResponseEntity<GitCommandResult>> npmBuild(
            @RequestBody GitCommandRequest request) {
        return projectService.npmBuild(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Get build log for a project
     */
    @PostMapping("/build/log")
    public ResponseEntity<String> getBuildLog(@RequestBody GitCommandRequest request) {
        String log = projectService.getBuildLog(request.getProjectPath());
        return ResponseEntity.ok(log != null ? log : "No build log available");
    }

    /**
     * Git stash
     */
    @PostMapping("/git/stash")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitStash(
            @RequestBody GitCommandRequest request) {
        return projectService.gitStash(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Git stash pop
     */
    @PostMapping("/git/stash-pop")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitStashPop(
            @RequestBody GitCommandRequest request) {
        return projectService.gitStashPop(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Git push
     */
    @PostMapping("/git/push")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitPush(
            @RequestBody GitCommandRequest request) {
        return projectService.gitPush(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Git fetch
     */
    @PostMapping("/git/fetch")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitFetch(
            @RequestBody GitCommandRequest request) {
        return projectService.gitFetch(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Git pull
     */
    @PostMapping("/git/pull")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitPull(
            @RequestBody GitCommandRequest request) {
        return projectService.gitPull(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Git checkout
     */
    @PostMapping("/git/checkout")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitCheckout(
            @RequestBody GitCommandRequest request) {
        return projectService.gitCheckout(request.getProjectPath(), request.getBranch())
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Git status
     */
    @PostMapping("/git/status")
    public CompletableFuture<ResponseEntity<GitCommandResult>> gitStatus(
            @RequestBody GitCommandRequest request) {
        return projectService.gitStatus(request.getProjectPath())
                .thenApply(ResponseEntity::ok);
    }
}
