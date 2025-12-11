package com.devhelper.controller;

import com.devhelper.model.Note;
import com.devhelper.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping
    public CompletableFuture<ResponseEntity<List<Note>>> getAllNotes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag) {

        if (search != null && !search.isEmpty()) {
            return noteService.searchNotes(search)
                    .thenApply(ResponseEntity::ok);
        }

        if (tag != null && !tag.isEmpty()) {
            return noteService.getNotesByTag(tag)
                    .thenApply(ResponseEntity::ok);
        }

        return noteService.getAllNotes()
                .thenApply(ResponseEntity::ok);
    }

    @GetMapping("/{id}")
    public CompletableFuture<ResponseEntity<Note>> getNoteById(@PathVariable String id) {
        return noteService.getNoteById(id)
                .thenApply(note -> note.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build()));
    }

    @PostMapping
    public CompletableFuture<ResponseEntity<Note>> createNote(@RequestBody Note note) {
        return noteService.createNote(note)
                .thenApply(created -> ResponseEntity.status(HttpStatus.CREATED).body(created));
    }

    @PutMapping("/{id}")
    public CompletableFuture<ResponseEntity<Note>> updateNote(@PathVariable String id, @RequestBody Note note) {
        return noteService.updateNote(id, note)
                .thenApply(ResponseEntity::ok)
                .exceptionally(e -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/pin")
    public CompletableFuture<ResponseEntity<Note>> togglePin(@PathVariable String id) {
        return noteService.togglePin(id)
                .thenApply(ResponseEntity::ok)
                .exceptionally(e -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public CompletableFuture<ResponseEntity<Void>> deleteNote(@PathVariable String id) {
        return noteService.deleteNote(id)
                .thenApply(v -> ResponseEntity.noContent().<Void>build());
    }
}

