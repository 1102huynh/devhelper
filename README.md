# Dev Helper - Software Engineer Productivity Tools

A comprehensive suite of developer tools including Regex Tester, JSON Formatter, SSH Quick Commands, API Tester, and Task Notes.

## 🚀 Features

- **Regex Tester** - Test regular expressions with live matching and highlighting
- **JSON Formatter** - Format, validate, and beautify JSON with syntax highlighting
- **SSH Quick Commands** - Store and manage frequently used SSH commands
- **API Tester** - Quick REST API testing tool
- **Task Notes** - Lightning-fast notes with Ctrl+Space shortcut

## 🛠️ Tech Stack

### Backend
- Java 17+
- Spring Boot 3.x
- Maven
- In-memory storage (H2)

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion

## 📦 Project Structure

```
devhelper/
├── backend/          # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/         # Next.js application
│   ├── src/
│   ├── package.json
│   └── README.md
└── docker-compose.yml
```

## 🚀 Quick Start

### Backend
```bash
cd backend
mvn spring-boot:run
```
Server will start on http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Application will start on http://localhost:3000

### Docker
```bash
docker-compose up
```

## 📝 API Documentation

Base URL: `http://localhost:8080/api`

### Endpoints
- `POST /regex/test` - Test regex patterns
- `POST /json/format` - Format JSON
- `GET /ssh/commands` - Get SSH commands
- `POST /api-tester/request` - Test API requests
- `GET /notes` - Get all notes
- `POST /notes` - Create note

## 🎨 UI/UX Features

- Dark/Light theme toggle
- Responsive design
- Keyboard shortcuts
- Real-time validation
- Beautiful animations
- Toast notifications

## 🔧 Troubleshooting

### Hydration Errors
If you encounter React hydration errors, see [HYDRATION_FIX.md](./HYDRATION_FIX.md) for the solution and [HYDRATION_PREVENTION_GUIDE.md](./HYDRATION_PREVENTION_GUIDE.md) for prevention tips.

### Common Issues
- **Port already in use**: Change ports in `application.yml` (backend) or use `PORT=3001 npm run dev` (frontend)
- **Build errors**: Run `npm install` or `mvn clean install` to refresh dependencies
- **CORS issues**: Check `CorsConfig.java` for allowed origins

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Project Summary](./PROJECT_SUMMARY.md) - Architecture and technical details
- [Quick Reference](./QUICK_REFERENCE.md) - Common commands and shortcuts
- [Hydration Fix](./HYDRATION_FIX.md) - Solution for React hydration errors
- [Hydration Prevention](./HYDRATION_PREVENTION_GUIDE.md) - Best practices guide

## 📄 License

MIT

