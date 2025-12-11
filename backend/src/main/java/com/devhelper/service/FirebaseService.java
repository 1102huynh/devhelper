package com.devhelper.service;

import com.google.firebase.database.*;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class FirebaseService {

    private final DatabaseReference databaseReference;

    public FirebaseService() {
        this.databaseReference = FirebaseDatabase.getInstance().getReference();
    }

    /**
     * Save data to Firebase Realtime Database
     * @param path The database path (e.g., "users", "notes/123")
     * @param data The data to save
     * @return CompletableFuture that completes when the operation is done
     */
    public CompletableFuture<Void> saveData(String path, Object data) {
        CompletableFuture<Void> future = new CompletableFuture<>();

        databaseReference.child(path).setValue(data, (error, ref) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });

        return future;
    }

    /**
     * Get data from Firebase Realtime Database
     * @param path The database path
     * @param valueType The class type to deserialize to
     * @return CompletableFuture with the data
     */
    public <T> CompletableFuture<T> getData(String path, Class<T> valueType) {
        CompletableFuture<T> future = new CompletableFuture<>();

        databaseReference.child(path).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                T value = snapshot.getValue(valueType);
                future.complete(value);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    /**
     * Get a snapshot of data from Firebase
     * @param path The database path
     * @return CompletableFuture with the DataSnapshot
     */
    public CompletableFuture<DataSnapshot> getDataSnapshot(String path) {
        CompletableFuture<DataSnapshot> future = new CompletableFuture<>();

        databaseReference.child(path).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                future.complete(snapshot);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    /**
     * Update data in Firebase Realtime Database
     * @param path The database path
     * @param updates Map of fields to update
     * @return CompletableFuture that completes when the operation is done
     */
    public CompletableFuture<Void> updateData(String path, java.util.Map<String, Object> updates) {
        CompletableFuture<Void> future = new CompletableFuture<>();

        databaseReference.child(path).updateChildren(updates, (error, ref) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });

        return future;
    }

    /**
     * Delete data from Firebase Realtime Database
     * @param path The database path
     * @return CompletableFuture that completes when the operation is done
     */
    public CompletableFuture<Void> deleteData(String path) {
        CompletableFuture<Void> future = new CompletableFuture<>();

        databaseReference.child(path).removeValue((error, ref) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });

        return future;
    }

    /**
     * Get a reference to a specific path
     * @param path The database path
     * @return DatabaseReference
     */
    public DatabaseReference getReference(String path) {
        return databaseReference.child(path);
    }
}

