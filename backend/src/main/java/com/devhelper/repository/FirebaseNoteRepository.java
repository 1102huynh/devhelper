package com.devhelper.repository;

import com.devhelper.model.Note;
import com.devhelper.service.FirebaseService;
import com.google.firebase.database.DataSnapshot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Repository
public class FirebaseNoteRepository {

    private static final String NOTES_PATH = "notes";

    @Autowired
    private FirebaseService firebaseService;

    /**
     * Save or update a note
     */
    public CompletableFuture<Note> save(Note note) {
        if (note.getId() == null || note.getId().isEmpty()) {
            note.setId(UUID.randomUUID().toString());
        }

        long now = System.currentTimeMillis();
        if (note.getCreatedAt() == null) {
            note.setCreatedAt(now);
        }
        note.setUpdatedAt(now);

        return firebaseService.saveData(NOTES_PATH + "/" + note.getId(), note)
                .thenApply(v -> note);
    }

    /**
     * Find note by ID
     */
    public CompletableFuture<Optional<Note>> findById(String id) {
        return firebaseService.getDataSnapshot(NOTES_PATH + "/" + id)
                .thenApply(snapshot -> {
                    if (snapshot.exists()) {
                        Note note = snapshot.getValue(Note.class);
                        if (note != null) {
                            note.setId(id);
                        }
                        return Optional.ofNullable(note);
                    }
                    return Optional.empty();
                });
    }

    /**
     * Find all notes
     */
    public CompletableFuture<List<Note>> findAll() {
        return firebaseService.getDataSnapshot(NOTES_PATH)
                .thenApply(snapshot -> {
                    if (!snapshot.exists()) {
                        return new ArrayList<>();
                    }

                    return StreamSupport.stream(snapshot.getChildren().spliterator(), false)
                            .map(childSnapshot -> {
                                Note note = childSnapshot.getValue(Note.class);
                                if (note != null) {
                                    note.setId(childSnapshot.getKey());
                                }
                                return note;
                            })
                            .filter(Objects::nonNull)
                            .sorted((n1, n2) -> {
                                // Sort by pinned first, then by updatedAt descending
                                if (n1.isPinned() != n2.isPinned()) {
                                    return n1.isPinned() ? -1 : 1;
                                }
                                return Long.compare(n2.getUpdatedAt(), n1.getUpdatedAt());
                            })
                            .collect(Collectors.toList());
                });
    }

    /**
     * Find notes by pinned status
     */
    public CompletableFuture<List<Note>> findByPinned(boolean pinned) {
        return findAll()
                .thenApply(notes -> notes.stream()
                        .filter(note -> note.isPinned() == pinned)
                        .collect(Collectors.toList()));
    }

    /**
     * Search notes by title or content
     */
    public CompletableFuture<List<Note>> searchByTitleOrContent(String keyword) {
        return findAll()
                .thenApply(notes -> notes.stream()
                        .filter(note ->
                            (note.getTitle() != null && note.getTitle().toLowerCase().contains(keyword.toLowerCase())) ||
                            (note.getContent() != null && note.getContent().toLowerCase().contains(keyword.toLowerCase()))
                        )
                        .collect(Collectors.toList()));
    }

    /**
     * Delete note by ID
     */
    public CompletableFuture<Void> deleteById(String id) {
        return firebaseService.deleteData(NOTES_PATH + "/" + id);
    }

    /**
     * Check if note exists
     */
    public CompletableFuture<Boolean> existsById(String id) {
        return firebaseService.getDataSnapshot(NOTES_PATH + "/" + id)
                .thenApply(DataSnapshot::exists);
    }

    /**
     * Count all notes
     */
    public CompletableFuture<Long> count() {
        return findAll()
                .thenApply(notes -> (long) notes.size());
    }

    /**
     * Delete all notes
     */
    public CompletableFuture<Void> deleteAll() {
        return firebaseService.deleteData(NOTES_PATH);
    }
}

