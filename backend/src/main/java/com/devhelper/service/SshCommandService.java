package com.devhelper.service;

import com.devhelper.model.SshCommand;
import com.devhelper.repository.FirebaseSshCommandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class SshCommandService {

    @Autowired
    private FirebaseSshCommandRepository repository;

    public CompletableFuture<List<SshCommand>> getAllCommands() {
        return repository.findAll();
    }

    public CompletableFuture<Optional<SshCommand>> getCommandById(String id) {
        return repository.findById(id);
    }

    public CompletableFuture<List<SshCommand>> getCommandsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public CompletableFuture<List<SshCommand>> searchCommands(String query) {
        return repository.searchByNameOrDescription(query);
    }

    public CompletableFuture<SshCommand> createCommand(SshCommand command) {
        return repository.save(command);
    }

    public CompletableFuture<SshCommand> updateCommand(String id, SshCommand command) {
        return repository.findById(id)
                .thenCompose(existing -> {
                    if (existing.isPresent()) {
                        SshCommand existingCommand = existing.get();
                        existingCommand.setName(command.getName());
                        existingCommand.setCommand(command.getCommand());
                        existingCommand.setDescription(command.getDescription());
                        existingCommand.setCategory(command.getCategory());
                        return repository.save(existingCommand);
                    }
                    throw new RuntimeException("SSH Command not found");
                });
    }

    public CompletableFuture<Void> deleteCommand(String id) {
        return repository.deleteById(id);
    }

    public CompletableFuture<List<String>> getAllCategories() {
        return repository.findAllCategories();
    }
}

