package com.devhelper.repository;

import com.devhelper.model.SshCommand;
import com.devhelper.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class FileSshCommandRepository {

    private static final String FILE_NAME = "ssh-commands.json";

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Save or update an SSH command
     */
    public SshCommand save(SshCommand command) {
        List<SshCommand> commands = findAll();

        // Generate ID if new
        if (command.getId() == null || command.getId().isEmpty()) {
            command.setId(UUID.randomUUID().toString());
        }

        long now = System.currentTimeMillis();
        if (command.getCreatedAt() == null) {
            command.setCreatedAt(now);
        }
        command.setUpdatedAt(now);

        // Remove existing command with same ID (for update)
        commands.removeIf(c -> c.getId().equals(command.getId()));

        // Add command
        commands.add(command);

        // Save to file
        fileStorageService.writeToFile(FILE_NAME, commands);

        return command;
    }

    /**
     * Find SSH command by ID
     */
    public Optional<SshCommand> findById(String id) {
        return findAll().stream()
                .filter(cmd -> cmd.getId().equals(id))
                .findFirst();
    }

    /**
     * Find all SSH commands
     */
    public List<SshCommand> findAll() {
        List<SshCommand> commands = fileStorageService.readFromFile(FILE_NAME, SshCommand.class);

        // Sort by name
        return commands.stream()
                .sorted(Comparator.comparing(SshCommand::getName))
                .collect(Collectors.toList());
    }

    /**
     * Find SSH commands by category
     */
    public List<SshCommand> findByCategory(String category) {
        return findAll().stream()
                .filter(cmd -> category.equals(cmd.getCategory()))
                .collect(Collectors.toList());
    }

    /**
     * Search SSH commands by name or description
     */
    public List<SshCommand> searchByNameOrDescription(String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return findAll().stream()
                .filter(cmd ->
                    (cmd.getName() != null && cmd.getName().toLowerCase().contains(lowerKeyword)) ||
                    (cmd.getDescription() != null && cmd.getDescription().toLowerCase().contains(lowerKeyword)) ||
                    (cmd.getCommand() != null && cmd.getCommand().toLowerCase().contains(lowerKeyword))
                )
                .collect(Collectors.toList());
    }

    /**
     * Get all unique categories
     */
    public List<String> findAllCategories() {
        return findAll().stream()
                .map(SshCommand::getCategory)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Delete SSH command by ID
     */
    public boolean deleteById(String id) {
        List<SshCommand> commands = findAll();
        boolean removed = commands.removeIf(cmd -> cmd.getId().equals(id));

        if (removed) {
            fileStorageService.writeToFile(FILE_NAME, commands);
        }

        return removed;
    }

    /**
     * Delete all SSH commands
     */
    public void deleteAll() {
        fileStorageService.writeToFile(FILE_NAME, new ArrayList<>());
    }

    /**
     * Count all SSH commands
     */
    public long count() {
        return findAll().size();
    }

    /**
     * Check if command exists by ID
     */
    public boolean existsById(String id) {
        return findById(id).isPresent();
    }
}

