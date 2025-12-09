package com.devhelper.repository;

import com.devhelper.model.SshCommand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SshCommandRepository extends JpaRepository<SshCommand, Long> {
    List<SshCommand> findByCategory(String category);
    List<SshCommand> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}

