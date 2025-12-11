package com.devhelper.service;

import com.devhelper.model.Note;
import com.devhelper.repository.FirebaseNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class NoteService {

    @Autowired
    private FirebaseNoteRepository repository;

    public CompletableFuture<List<Note>> getAllNotes() {
        return repository.findAll();
    }

    public CompletableFuture<Optional<Note>> getNoteById(String id) {
        return repository.findById(id);
    }

    public CompletableFuture<List<Note>> searchNotes(String query) {
        return repository.searchByTitleOrContent(query);
    }

    public CompletableFuture<List<Note>> getNotesByTag(String tag) {
        return repository.findAll()
                .thenApply(notes -> notes.stream()
                        .filter(note -> note.getTags() != null && note.getTags().contains(tag))
                        .toList());
    }

    public CompletableFuture<Note> createNote(Note note) {
        return repository.save(note);
    }

    public CompletableFuture<Note> updateNote(String id, Note note) {
        return repository.findById(id)
                .thenCompose(existing -> {
                    if (existing.isPresent()) {
                        Note existingNote = existing.get();
                        existingNote.setTitle(note.getTitle());
                        existingNote.setContent(note.getContent());
                        existingNote.setTags(note.getTags());
                        if (note.isPinned() != existingNote.isPinned()) {
                            existingNote.setPinned(note.isPinned());
                        }
                        return repository.save(existingNote);
                    }
                    throw new RuntimeException("Note not found");
                });
    }

    public CompletableFuture<Note> togglePin(String id) {
        return repository.findById(id)
                .thenCompose(existing -> {
                    if (existing.isPresent()) {
                        Note note = existing.get();
                        note.setPinned(!note.isPinned());
                        return repository.save(note);
                    }
                    throw new RuntimeException("Note not found");
                });
    }

    public CompletableFuture<Void> deleteNote(String id) {
        return repository.deleteById(id);
    }
}

