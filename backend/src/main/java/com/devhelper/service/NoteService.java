package com.devhelper.service;

import com.devhelper.model.Note;
import com.devhelper.repository.FileNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class NoteService {

    @Autowired
    private FileNoteRepository repository;

    public CompletableFuture<List<Note>> getAllNotes() {
        return CompletableFuture.completedFuture(repository.findAll());
    }

    public CompletableFuture<Optional<Note>> getNoteById(String id) {
        return CompletableFuture.completedFuture(repository.findById(id));
    }

    public CompletableFuture<List<Note>> searchNotes(String query) {
        return CompletableFuture.completedFuture(repository.searchByTitleOrContent(query));
    }

    public CompletableFuture<List<Note>> getNotesByTag(String tag) {
        return CompletableFuture.completedFuture(repository.findByTag(tag));
    }

    public CompletableFuture<Note> createNote(Note note) {
        return CompletableFuture.completedFuture(repository.save(note));
    }

    public CompletableFuture<Note> updateNote(String id, Note note) {
        Optional<Note> existing = repository.findById(id);
        if (existing.isPresent()) {
            Note existingNote = existing.get();
            existingNote.setTitle(note.getTitle());
            existingNote.setContent(note.getContent());
            existingNote.setTags(note.getTags());
            if (note.isPinned() != existingNote.isPinned()) {
                existingNote.setPinned(note.isPinned());
            }
            return CompletableFuture.completedFuture(repository.save(existingNote));
        }
        return CompletableFuture.failedFuture(new RuntimeException("Note not found"));
    }

    public CompletableFuture<Note> togglePin(String id) {
        Note note = repository.togglePin(id);
        if (note != null) {
            return CompletableFuture.completedFuture(note);
        }
        return CompletableFuture.failedFuture(new RuntimeException("Note not found"));
    }

    public CompletableFuture<Void> deleteNote(String id) {
        repository.deleteById(id);
        return CompletableFuture.completedFuture(null);
    }
}

