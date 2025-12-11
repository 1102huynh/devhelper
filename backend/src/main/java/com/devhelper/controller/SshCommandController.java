package com.devhelper.controller;

import com.devhelper.model.SshCommand;
import com.devhelper.service.SshCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/ssh")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class SshCommandController {

    @Autowired
    private SshCommandService sshCommandService;

    @GetMapping
    public CompletableFuture<ResponseEntity<List<SshCommand>>> getAllCommands(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isEmpty()) {
            return sshCommandService.searchCommands(search)
                    .thenApply(ResponseEntity::ok);
        }

        if (category != null && !category.isEmpty()) {
            return sshCommandService.getCommandsByCategory(category)
                    .thenApply(ResponseEntity::ok);
        }

        return sshCommandService.getAllCommands()
                .thenApply(ResponseEntity::ok);
    }

    @GetMapping("/categories")
    public CompletableFuture<ResponseEntity<List<String>>> getAllCategories() {
        return sshCommandService.getAllCategories()
                .thenApply(ResponseEntity::ok);
    }

    @GetMapping("/{id}")
    public CompletableFuture<ResponseEntity<SshCommand>> getCommandById(@PathVariable String id) {
        return sshCommandService.getCommandById(id)
                .thenApply(command -> command.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build()));
    }

    @PostMapping
    public CompletableFuture<ResponseEntity<SshCommand>> createCommand(@RequestBody SshCommand command) {
        return sshCommandService.createCommand(command)
                .thenApply(created -> ResponseEntity.status(HttpStatus.CREATED).body(created));
    }

    @PutMapping("/{id}")
    public CompletableFuture<ResponseEntity<SshCommand>> updateCommand(@PathVariable String id, @RequestBody SshCommand command) {
        return sshCommandService.updateCommand(id, command)
                .thenApply(ResponseEntity::ok)
                .exceptionally(e -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public CompletableFuture<ResponseEntity<Void>> deleteCommand(@PathVariable String id) {
        return sshCommandService.deleteCommand(id)
                .thenApply(v -> ResponseEntity.noContent().<Void>build());
    }
}

