package com.devhelper.repository;

import com.devhelper.model.SshCommand;
import com.devhelper.service.FirebaseService;
import com.google.firebase.database.DataSnapshot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Repository
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class FirebaseSshCommandRepository {

    private static final String SSH_COMMANDS_PATH = "ssh_commands";

    @Autowired
    private FirebaseService firebaseService;

    /**
     * Save or update an SSH command
     */
    public CompletableFuture<SshCommand> save(SshCommand command) {
        if (command.getId() == null || command.getId().isEmpty()) {
            command.setId(UUID.randomUUID().toString());
        }

        long now = System.currentTimeMillis();
        if (command.getCreatedAt() == null) {
            command.setCreatedAt(now);
        }
        command.setUpdatedAt(now);

        return firebaseService.saveData(SSH_COMMANDS_PATH + "/" + command.getId(), command)
                .thenApply(v -> command);
    }

    /**
     * Find SSH command by ID
     */
    public CompletableFuture<Optional<SshCommand>> findById(String id) {
        return firebaseService.getDataSnapshot(SSH_COMMANDS_PATH + "/" + id)
                .thenApply(snapshot -> {
                    if (snapshot.exists()) {
                        SshCommand command = snapshot.getValue(SshCommand.class);
                        if (command != null) {
                            command.setId(id);
                        }
                        return Optional.ofNullable(command);
                    }
                    return Optional.empty();
                });
    }

    /**
     * Find all SSH commands
     */
    public CompletableFuture<List<SshCommand>> findAll() {
        return firebaseService.getDataSnapshot(SSH_COMMANDS_PATH)
                .thenApply(snapshot -> {
                    if (!snapshot.exists()) {
                        return new ArrayList<>();
                    }

                    return StreamSupport.stream(snapshot.getChildren().spliterator(), false)
                            .map(childSnapshot -> {
                                SshCommand command = childSnapshot.getValue(SshCommand.class);
                                if (command != null) {
                                    command.setId(childSnapshot.getKey());
                                }
                                return command;
                            })
                            .filter(Objects::nonNull)
                            .sorted(Comparator.comparing(SshCommand::getName))
                            .collect(Collectors.toList());
                });
    }

    /**
     * Find SSH commands by category
     */
    public CompletableFuture<List<SshCommand>> findByCategory(String category) {
        return findAll()
                .thenApply(commands -> commands.stream()
                        .filter(cmd -> category.equals(cmd.getCategory()))
                        .collect(Collectors.toList()));
    }

    /**
     * Search SSH commands by name or description
     */
    public CompletableFuture<List<SshCommand>> searchByNameOrDescription(String keyword) {
        return findAll()
                .thenApply(commands -> commands.stream()
                        .filter(cmd ->
                            (cmd.getName() != null && cmd.getName().toLowerCase().contains(keyword.toLowerCase())) ||
                            (cmd.getDescription() != null && cmd.getDescription().toLowerCase().contains(keyword.toLowerCase()))
                        )
                        .collect(Collectors.toList()));
    }

    /**
     * Delete SSH command by ID
     */
    public CompletableFuture<Void> deleteById(String id) {
        return firebaseService.deleteData(SSH_COMMANDS_PATH + "/" + id);
    }

    /**
     * Check if SSH command exists
     */
    public CompletableFuture<Boolean> existsById(String id) {
        return firebaseService.getDataSnapshot(SSH_COMMANDS_PATH + "/" + id)
                .thenApply(DataSnapshot::exists);
    }

    /**
     * Count all SSH commands
     */
    public CompletableFuture<Long> count() {
        return findAll()
                .thenApply(commands -> (long) commands.size());
    }

    /**
     * Delete all SSH commands
     */
    public CompletableFuture<Void> deleteAll() {
        return firebaseService.deleteData(SSH_COMMANDS_PATH);
    }

    /**
     * Get all unique categories
     */
    public CompletableFuture<List<String>> findAllCategories() {
        return findAll()
                .thenApply(commands -> commands.stream()
                        .map(SshCommand::getCategory)
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted()
                        .collect(Collectors.toList()));
    }
}

