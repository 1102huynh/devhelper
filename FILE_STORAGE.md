# 📁 File Storage Implementation

**Date:** December 13, 2025  
**Status:** ✅ IMPLEMENTED

---

## 🎯 Overview

Dev Helper hiện đã hỗ trợ **File Storage** - lưu trữ dữ liệu cục bộ trên máy tính thay vì Firebase.

---

## 📂 Storage Location

```
D:/devhelper-data/
├── notes.json          # Lưu trữ tất cả notes
└── ssh-commands.json   # Lưu trữ SSH commands
```

**Ưu điểm:**
- ✅ Tự động tạo folder nếu chưa tồn tại
- ✅ Không cần Internet
- ✅ Dữ liệu lưu local, an toàn
- ✅ Dễ dàng backup (copy file)
- ✅ Có thể chỉnh sửa trực tiếp file JSON

---

## 🏗️ Architecture

### New Components

#### 1. FileStorageService
**Location:** `backend/src/main/java/com/devhelper/service/FileStorageService.java`

**Chức năng:**
- Tạo folder `D:/devhelper-data/` tự động khi khởi động
- Đọc dữ liệu từ JSON files
- Ghi dữ liệu vào JSON files (with pretty print)
- Quản lý file operations

**Methods:**
```java
public <T> List<T> readFromFile(String fileName, Class<T> clazz)
public <T> void writeToFile(String fileName, List<T> data)
public boolean fileExists(String fileName)
public boolean deleteFile(String fileName)
public String getDataDirectory()
```

#### 2. FileNoteRepository
**Location:** `backend/src/main/java/com/devhelper/repository/FileNoteRepository.java`

**Chức năng:**
- CRUD operations cho Notes
- Save/Update notes
- Search, filter, sort notes
- Toggle pin status

**Methods:**
```java
public Note save(Note note)
public Optional<Note> findById(String id)
public List<Note> findAll()
public List<Note> findByPinned(boolean pinned)
public List<Note> searchByTitleOrContent(String keyword)
public List<Note> findByTag(String tag)
public boolean deleteById(String id)
public long count()
public Note togglePin(String id)
```

#### 3. FileSshCommandRepository
**Location:** `backend/src/main/java/com/devhelper/repository/FileSshCommandRepository.java`

**Chức năng:**
- CRUD operations cho SSH Commands
- Save/Update commands
- Search by name, description, command
- Filter by category

**Methods:**
```java
public SshCommand save(SshCommand command)
public Optional<SshCommand> findById(String id)
public List<SshCommand> findAll()
public List<SshCommand> findByCategory(String category)
public List<SshCommand> searchByNameOrDescription(String keyword)
public List<String> findAllCategories()
public boolean deleteById(String id)
public long count()
```

---

## 🔄 Updated Components

### NoteService
**Changes:** Sử dụng `FileNoteRepository` thay vì `FirebaseNoteRepository`

```java
@Autowired
private FileNoteRepository repository;
```

### SshCommandService
**Changes:** Sử dụng `FileSshCommandRepository` thay vì `FirebaseSshCommandRepository`

```java
@Autowired
private FileSshCommandRepository repository;
```

### DataInitializer
**Changes:** 
- Sử dụng File repositories
- Không cần async operations (`.join()`)
- Đơn giản hơn

---

## 📊 Data Format

### notes.json
```json
[
  {
    "id": "uuid-here",
    "title": "Welcome to Dev Helper",
    "content": "This is your quick notes area...",
    "tags": "welcome,getting-started",
    "pinned": true,
    "createdAt": 1702468800000,
    "updatedAt": 1702468800000
  }
]
```

### ssh-commands.json
```json
[
  {
    "id": "uuid-here",
    "name": "SSH into server",
    "command": "ssh user@hostname -p 22",
    "description": "Connect to remote server via SSH",
    "category": "Connection",
    "createdAt": 1702468800000,
    "updatedAt": 1702468800000
  }
]
```

---

## 🚀 How It Works

### 1. Application Startup

```java
@PostConstruct
public void init() {
    // Tự động tạo folder D:/devhelper-data/
    Path dataPath = Paths.get(DATA_DIR);
    if (!Files.exists(dataPath)) {
        Files.createDirectories(dataPath);
        logger.info("✅ Created data directory: {}", DATA_DIR);
    }
}
```

### 2. Save Data

```java
public Note save(Note note) {
    List<Note> notes = findAll();
    
    // Generate ID if new
    if (note.getId() == null) {
        note.setId(UUID.randomUUID().toString());
    }
    
    // Update timestamps
    long now = System.currentTimeMillis();
    if (note.getCreatedAt() == null) {
        note.setCreatedAt(now);
    }
    note.setUpdatedAt(now);
    
    // Remove old version (for update)
    notes.removeIf(n -> n.getId().equals(note.getId()));
    
    // Add note
    notes.add(note);
    
    // Save to file
    fileStorageService.writeToFile(FILE_NAME, notes);
    
    return note;
}
```

### 3. Read Data

```java
public List<Note> findAll() {
    List<Note> notes = fileStorageService.readFromFile(FILE_NAME, Note.class);
    
    // Sort by pinned first, then by updatedAt
    return notes.stream()
        .sorted((n1, n2) -> {
            if (n1.isPinned() != n2.isPinned()) {
                return n1.isPinned() ? -1 : 1;
            }
            return Long.compare(n2.getUpdatedAt(), n1.getUpdatedAt());
        })
        .collect(Collectors.toList());
}
```

---

## ✅ Features

### Notes Features
- ✅ Create new notes
- ✅ Update existing notes
- ✅ Delete notes
- ✅ Pin/Unpin notes
- ✅ Search by title or content
- ✅ Filter by tags
- ✅ Auto-sort (pinned first, then by date)

### SSH Commands Features
- ✅ Create new commands
- ✅ Update existing commands
- ✅ Delete commands
- ✅ Search by name, description, command
- ✅ Filter by category
- ✅ Get all unique categories
- ✅ Auto-sort by name

---

## 🔧 Configuration

### Change Storage Location

Edit `FileStorageService.java`:

```java
private static final String DATA_DIR = "D:/devhelper-data/";
```

Change to your preferred location:
```java
private static final String DATA_DIR = "C:/my-data/";
private static final String DATA_DIR = "/home/user/devhelper/";
```

---

## 💾 Backup & Restore

### Backup
Simply copy the folder:
```bash
# Windows
xcopy D:\devhelper-data D:\backup\devhelper-data /E /I

# Linux/Mac
cp -r /path/to/devhelper-data /path/to/backup/
```

### Restore
Copy back to original location:
```bash
# Windows
xcopy D:\backup\devhelper-data D:\devhelper-data /E /I

# Linux/Mac
cp -r /path/to/backup/devhelper-data /path/to/devhelper-data/
```

---

## 🔄 Migration from Firebase

**Firebase config files are kept** - you can switch back anytime!

**Current setup:**
- ✅ File Storage: Active (default)
- ✅ Firebase config: Preserved (inactive)

**To switch back to Firebase:**
1. Change `NoteService` to use `FirebaseNoteRepository`
2. Change `SshCommandService` to use `FirebaseSshCommandRepository`
3. Update `DataInitializer` to use Firebase repositories

---

## 📝 API Endpoints (Unchanged)

All API endpoints work exactly the same:

### Notes API
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `PATCH /api/notes/{id}/pin` - Toggle pin
- `DELETE /api/notes/{id}` - Delete note

### SSH Commands API
- `GET /api/ssh` - Get all commands
- `POST /api/ssh` - Create command
- `PUT /api/ssh/{id}` - Update command
- `DELETE /api/ssh/{id}` - Delete command

---

## ⚡ Performance

| Operation | File Storage | Firebase |
|-----------|-------------|----------|
| Read | ⚡ Fast | 🌐 Network dependent |
| Write | ⚡ Instant | 🌐 Network dependent |
| Startup | ⚡ Instant | ⏱️ Connection time |
| Offline | ✅ Works | ❌ Fails |

---

## 🐛 Troubleshooting

### Issue: Folder not created
**Solution:** Check permissions on D: drive

### Issue: Cannot write to file
**Solution:** 
1. Check folder permissions
2. Close any programs that might lock the file
3. Check disk space

### Issue: Data not loading
**Solution:**
1. Check if files exist in `D:/devhelper-data/`
2. Verify JSON format is valid
3. Check application logs

---

## 📊 Advantages

### File Storage
- ✅ No internet required
- ✅ Instant operations
- ✅ Full control of data
- ✅ Easy backup (copy files)
- ✅ Can edit JSON directly
- ✅ No external dependencies
- ✅ Free forever

### Firebase (Original)
- ✅ Real-time sync across devices
- ✅ Automatic backups
- ✅ Scalable
- ✅ Cloud-based
- ❌ Requires internet
- ❌ External service dependency

---

## 🎯 Best Practices

1. **Regular Backups**
   - Copy `D:/devhelper-data/` periodically
   - Use cloud storage for backup folder

2. **Don't Edit Files While App Running**
   - Stop backend before manual edits
   - Restart after changes

3. **Valid JSON Format**
   - Use JSON validator if editing manually
   - Keep array structure `[...]`

4. **Monitor Disk Space**
   - Check available space on D: drive
   - Clean old data if needed

---

## 🏆 Summary

**Status:** ✅ Successfully implemented File Storage

**Changes Made:**
1. ✅ Created `FileStorageService.java`
2. ✅ Created `FileNoteRepository.java`
3. ✅ Created `FileSshCommandRepository.java`
4. ✅ Updated `NoteService.java`
5. ✅ Updated `SshCommandService.java`
6. ✅ Updated `DataInitializer.java`
7. ✅ Auto-creates `D:/devhelper-data/` folder
8. ✅ All features working (CRUD, search, filter)

**Firebase Config:** ✅ Preserved (can switch back anytime)

**Build Status:** ✅ Success

---

**Implementation Date:** December 13, 2025  
**Storage Location:** D:/devhelper-data/  
**Status:** Ready for use! 🚀

