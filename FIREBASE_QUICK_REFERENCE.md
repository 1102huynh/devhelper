# 🔥 Firebase Quick Reference - DevHelper

## API Endpoints

### Notes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes?search={keyword}` | Search notes |
| GET | `/api/notes?tag={tag}` | Filter by tag |
| GET | `/api/notes/{id}` | Get note by ID |
| POST | `/api/notes` | Create new note |
| PUT | `/api/notes/{id}` | Update note |
| PATCH | `/api/notes/{id}/pin` | Toggle pin |
| DELETE | `/api/notes/{id}` | Delete note |

### SSH Commands API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ssh` | Get all commands |
| GET | `/api/ssh?search={keyword}` | Search commands |
| GET | `/api/ssh?category={cat}` | Filter by category |
| GET | `/api/ssh/categories` | Get all categories |
| GET | `/api/ssh/{id}` | Get command by ID |
| POST | `/api/ssh` | Create command |
| PUT | `/api/ssh/{id}` | Update command |
| DELETE | `/api/ssh/{id}` | Delete command |

---

## Usage Examples

### Create Note
```bash
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Note",
    "content": "Note content here",
    "tags": "tag1,tag2",
    "pinned": false
  }'
```

### Search Notes
```bash
curl http://localhost:8080/api/notes?search=firebase
```

### Update Note
```bash
curl -X PUT http://localhost:8080/api/notes/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content",
    "tags": "updated",
    "pinned": true
  }'
```

### Toggle Pin
```bash
curl -X PATCH http://localhost:8080/api/notes/{id}/pin
```

---

## Firebase Database Paths

```
notes/
  {uuid}/
    - id: String
    - title: String
    - content: String
    - tags: String
    - pinned: Boolean
    - createdAt: Long
    - updatedAt: Long

ssh_commands/
  {uuid}/
    - id: String
    - name: String
    - command: String
    - description: String
    - category: String
    - createdAt: Long
    - updatedAt: Long
```

---

## PowerShell Commands

### Get All Notes
```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/notes -Method GET
```

### Create Note
```powershell
$body = @{
    title = "Test Note"
    content = "Content here"
    tags = "test"
    pinned = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/notes `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Search
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/notes?search=firebase"
```

---

## Direct Firebase Access

### Using Firebase Console
1. Open: https://console.firebase.google.com
2. Select project: test-c3845
3. Go to Realtime Database
4. Browse data at: https://test-c3845-default-rtdb.firebaseio.com

### Using Firebase Admin SDK (Java)
```java
@Autowired
private FirebaseService firebaseService;

// Save data
firebaseService.saveData("notes/" + id, note)
    .thenAccept(v -> System.out.println("Saved!"));

// Read data
firebaseService.getDataSnapshot("notes/" + id)
    .thenAccept(snapshot -> {
        Note note = snapshot.getValue(Note.class);
        System.out.println(note.getTitle());
    });

// Delete data
firebaseService.deleteData("notes/" + id);
```

---

## Development Commands

### Start Backend
```bash
cd backend
mvn spring-boot:run
```

### Build
```bash
mvn clean package -DskipTests
```

### Run JAR
```bash
java -jar target/devhelper-backend-1.0.0.jar
```

### Stop Server
```powershell
Stop-Process -Name java -Force
```

---

## Environment Variables

Set these for production:

```bash
FIREBASE_CREDENTIALS_PATH=/path/to/credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Find process on port 8080
netstat -ano | findstr :8080

# Kill process
Stop-Process -Id {PID} -Force
```

### Firebase Connection Issues
1. Check internet connection
2. Verify credentials file exists
3. Check Firebase Console for project status
4. Verify database URL in application.yml

### Build Errors
```bash
# Clean Maven cache
mvn clean

# Force update dependencies
mvn clean install -U

# Skip tests
mvn package -DskipTests
```

---

## Useful Links

- **Firebase Console**: https://console.firebase.google.com
- **Database URL**: https://test-c3845-default-rtdb.firebaseio.com
- **API Base URL**: http://localhost:8080/api
- **Firebase Docs**: https://firebase.google.com/docs/database

---

**Last Updated:** December 11, 2025

