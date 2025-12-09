package com.devhelper.service;

import com.devhelper.model.Note;
import com.devhelper.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    @Autowired
    private NoteRepository repository;

    public List<Note> getAllNotes() {
        return repository.findByOrderByPinnedDescUpdatedAtDesc();
    }

    public Optional<Note> getNoteById(Long id) {
        return repository.findById(id);
    }

    public List<Note> searchNotes(String query) {
        return repository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query);
    }

    public List<Note> getNotesByTag(String tag) {
        return repository.findByTagsContaining(tag);
    }

    public Note createNote(Note note) {
        return repository.save(note);
    }

    public Note updateNote(Long id, Note note) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setTitle(note.getTitle());
                    existing.setContent(note.getContent());
                    existing.setTags(note.getTags());
                    existing.setPinned(note.isPinned());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    public Note togglePin(Long id) {
        return repository.findById(id)
                .map(note -> {
                    note.setPinned(!note.isPinned());
                    return repository.save(note);
                })
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    public void deleteNote(Long id) {
        repository.deleteById(id);
    }
}

