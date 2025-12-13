package com.devhelper.service;

import com.devhelper.model.SshCommand;
import com.devhelper.repository.FileSshCommandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class SshCommandService {

    @Autowired
    private FileSshCommandRepository repository;

    public CompletableFuture<List<SshCommand>> getAllCommands() {
        return CompletableFuture.completedFuture(repository.findAll());
    }

    public CompletableFuture<Optional<SshCommand>> getCommandById(String id) {
        return CompletableFuture.completedFuture(repository.findById(id));
    }

    public CompletableFuture<List<SshCommand>> getCommandsByCategory(String category) {
        return CompletableFuture.completedFuture(repository.findByCategory(category));
    }

    public CompletableFuture<List<SshCommand>> searchCommands(String query) {
        return CompletableFuture.completedFuture(repository.searchByNameOrDescription(query));
    }

    public CompletableFuture<SshCommand> createCommand(SshCommand command) {
        return CompletableFuture.completedFuture(repository.save(command));
    }

    public CompletableFuture<SshCommand> updateCommand(String id, SshCommand command) {
        Optional<SshCommand> existing = repository.findById(id);
        if (existing.isPresent()) {
            SshCommand existingCommand = existing.get();
            existingCommand.setName(command.getName());
            existingCommand.setCommand(command.getCommand());
            existingCommand.setDescription(command.getDescription());
            existingCommand.setCategory(command.getCategory());
            return CompletableFuture.completedFuture(repository.save(existingCommand));
        }
        return CompletableFuture.failedFuture(new RuntimeException("SSH Command not found"));
    }

    public CompletableFuture<Void> deleteCommand(String id) {
        repository.deleteById(id);
        return CompletableFuture.completedFuture(null);
    }

    public CompletableFuture<List<String>> getAllCategories() {
        return CompletableFuture.completedFuture(repository.findAllCategories());
    }
}

