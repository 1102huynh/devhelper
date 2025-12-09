package com.devhelper.service;

import com.devhelper.model.SshCommand;
import com.devhelper.repository.SshCommandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SshCommandService {

    @Autowired
    private SshCommandRepository repository;

    public List<SshCommand> getAllCommands() {
        return repository.findAll();
    }

    public Optional<SshCommand> getCommandById(Long id) {
        return repository.findById(id);
    }

    public List<SshCommand> getCommandsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public List<SshCommand> searchCommands(String query) {
        return repository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    public SshCommand createCommand(SshCommand command) {
        return repository.save(command);
    }

    public SshCommand updateCommand(Long id, SshCommand command) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setName(command.getName());
                    existing.setCommand(command.getCommand());
                    existing.setDescription(command.getDescription());
                    existing.setCategory(command.getCategory());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("SSH Command not found"));
    }

    public void deleteCommand(Long id) {
        repository.deleteById(id);
    }
}

