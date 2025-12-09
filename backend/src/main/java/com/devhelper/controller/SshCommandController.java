package com.devhelper.controller;

import com.devhelper.model.SshCommand;
import com.devhelper.service.SshCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ssh")
public class SshCommandController {

    @Autowired
    private SshCommandService sshCommandService;

    @GetMapping
    public ResponseEntity<List<SshCommand>> getAllCommands(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(sshCommandService.searchCommands(search));
        }

        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(sshCommandService.getCommandsByCategory(category));
        }

        return ResponseEntity.ok(sshCommandService.getAllCommands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SshCommand> getCommandById(@PathVariable Long id) {
        return sshCommandService.getCommandById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SshCommand> createCommand(@RequestBody SshCommand command) {
        SshCommand created = sshCommandService.createCommand(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SshCommand> updateCommand(@PathVariable Long id, @RequestBody SshCommand command) {
        try {
            SshCommand updated = sshCommandService.updateCommand(id, command);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommand(@PathVariable Long id) {
        sshCommandService.deleteCommand(id);
        return ResponseEntity.noContent().build();
    }
}

