package com.devhelper.repository;

import com.devhelper.model.Note;
import com.devhelper.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class FileNoteRepository {

    private static final String FILE_NAME = "notes.json";

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Save or update a note
     */
    public Note save(Note note) {
        List<Note> notes = findAll();

        // Generate ID if new
        if (note.getId() == null || note.getId().isEmpty()) {
            note.setId(UUID.randomUUID().toString());
        }

        long now = System.currentTimeMillis();
        if (note.getCreatedAt() == null) {
            note.setCreatedAt(now);
        }
        note.setUpdatedAt(now);

        // Remove existing note with same ID (for update)
        notes.removeIf(n -> n.getId().equals(note.getId()));

        // Add note
        notes.add(note);

        // Save to file
        fileStorageService.writeToFile(FILE_NAME, notes);

        return note;
    }

    /**
     * Find note by ID
     */
    public Optional<Note> findById(String id) {
        return findAll().stream()
                .filter(note -> note.getId().equals(id))
                .findFirst();
    }

    /**
     * Find all notes
     */
    public List<Note> findAll() {
        List<Note> notes = fileStorageService.readFromFile(FILE_NAME, Note.class);

        // Sort by pinned first, then by updatedAt descending
        return notes.stream()
                .sorted((n1, n2) -> {
                    if (n1.isPinned() != n2.isPinned()) {
                        return n1.isPinned() ? -1 : 1;
                    }
                    return Long.compare(n2.getUpdatedAt(), n1.getUpdatedAt());
                })
                .collect(Collectors.toList());
    }

    /**
     * Find notes by pinned status
     */
    public List<Note> findByPinned(boolean pinned) {
        return findAll().stream()
                .filter(note -> note.isPinned() == pinned)
                .collect(Collectors.toList());
    }

    /**
     * Search notes by title or content
     */
    public List<Note> searchByTitleOrContent(String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return findAll().stream()
                .filter(note ->
                    (note.getTitle() != null && note.getTitle().toLowerCase().contains(lowerKeyword)) ||
                    (note.getContent() != null && note.getContent().toLowerCase().contains(lowerKeyword))
                )
                .collect(Collectors.toList());
    }

    /**
     * Find notes by tag
     */
    public List<Note> findByTag(String tag) {
        return findAll().stream()
                .filter(note -> note.getTags() != null && note.getTags().toLowerCase().contains(tag.toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Delete note by ID
     */
    public boolean deleteById(String id) {
        List<Note> notes = findAll();
        boolean removed = notes.removeIf(note -> note.getId().equals(id));

        if (removed) {
            fileStorageService.writeToFile(FILE_NAME, notes);
        }

        return removed;
    }

    /**
     * Delete all notes
     */
    public void deleteAll() {
        fileStorageService.writeToFile(FILE_NAME, new ArrayList<>());
    }

    /**
     * Count all notes
     */
    public long count() {
        return findAll().size();
    }

    /**
     * Toggle pin status
     */
    public Note togglePin(String id) {
        Optional<Note> noteOpt = findById(id);

        if (noteOpt.isPresent()) {
            Note note = noteOpt.get();
            note.setPinned(!note.isPinned());
            return save(note);
        }

        return null;
    }
}

