# Dev Helper Backend

Spring Boot backend API for Dev Helper tools.

## 🚀 Technologies

- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- H2 Database (in-memory)
- Lombok
- Maven

## 📦 Project Structure

```
backend/
├── src/main/java/com/devhelper/
│   ├── DevHelperApplication.java
│   ├── config/
│   │   ├── CorsConfig.java
│   │   └── DataInitializer.java
│   ├── controller/
│   │   ├── ApiTesterController.java
│   │   ├── JsonController.java
│   │   ├── NoteController.java
│   │   ├── RegexController.java
│   │   └── SshCommandController.java
│   ├── dto/
│   │   ├── ApiTestRequest.java
│   │   ├── ApiTestResponse.java
│   │   ├── JsonFormatRequest.java
│   │   ├── JsonFormatResponse.java
│   │   ├── RegexTestRequest.java
│   │   └── RegexTestResponse.java
│   ├── model/
│   │   ├── Note.java
│   │   └── SshCommand.java
│   ├── repository/
│   │   ├── NoteRepository.java
│   │   └── SshCommandRepository.java
│   └── service/
│       ├── ApiTesterService.java
│       ├── JsonService.java
│       ├── NoteService.java
│       ├── RegexService.java
│       └── SshCommandService.java
└── src/main/resources/
    └── application.yml
```

## 🛠️ Setup & Run

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Run Locally
```bash
cd backend
mvn spring-boot:run
```

Server will start on http://localhost:8080

### Build
```bash
mvn clean package
```

### Run JAR
```bash
java -jar target/devhelper-backend-1.0.0.jar
```

## 📡 API Endpoints

### Regex Tester
- `POST /api/regex/test` - Test regex patterns

### JSON Formatter
- `POST /api/json/format` - Format and validate JSON

### SSH Commands
- `GET /api/ssh` - Get all SSH commands
- `GET /api/ssh/{id}` - Get SSH command by ID
- `POST /api/ssh` - Create new SSH command
- `PUT /api/ssh/{id}` - Update SSH command
- `DELETE /api/ssh/{id}` - Delete SSH command
- `GET /api/ssh?category={category}` - Filter by category
- `GET /api/ssh?search={query}` - Search commands

### API Tester
- `POST /api/api-tester/request` - Test API requests

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/{id}` - Get note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update note
- `PATCH /api/notes/{id}/pin` - Toggle pin status
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/notes?search={query}` - Search notes
- `GET /api/notes?tag={tag}` - Filter by tag

## 🗄️ Database

Using H2 in-memory database. Access H2 console at:
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:devhelper`
- Username: `sa`
- Password: (empty)

## 🔧 Configuration

Edit `src/main/resources/application.yml` to configure:
- Server port
- Database settings
- CORS settings
- Logging levels

## 🎯 Sample Data

The application automatically initializes with sample data:
- 10 SSH commands across different categories
- 6 sample notes including pinned items

## 🐳 Docker

Build image:
```bash
docker build -t devhelper-backend .
```

Run container:
```bash
docker run -p 8080:8080 devhelper-backend
```

## 📝 License

MIT

