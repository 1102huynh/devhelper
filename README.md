# DevHelper - Developer Tools Platform

## 🎯 Overview

DevHelper is an integrated platform of essential tools for Software Engineers. It provides a modern web interface and powerful backend API.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Deployment**: Vercel
- **URL**: https://devhelper-iota.vercel.app

### Backend
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Build Tool**: Maven
- **Storage**: File-based (JSON)
- **Deployment**: Render (Docker)
- **URL**: https://devhelper-37jw.onrender.com

## 🛠️ Features

### 1. Text & Data Processing
- **JSON Formatter** - Format, validate, minify JSON
- **XML Formatter** - Format and validate XML
- **Regex Tester** - Test regular expressions
- **Text Utils** - Case conversion, encoding, etc.
- **Diff Checker** - Compare text differences

### 2. Development Tools
- **UUID Generator** - Generate UUIDs
- **API Tester** - Test HTTP APIs
- **Cron Parser** - Parse cron expressions
- **Hash Generator** - MD5, SHA256, etc.

### 3. Productivity
- **Notes** - Quick note-taking with pin support
- **SSH Commands** - Quick SSH command reference
- **Mock API Generator** - Generate mock API responses

### 4. Testing
- **E2E Tests** - Cucumber + Playwright
- **API Tests** - REST Assured

## 📁 Project Structure

```
devhelper/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities & API client
│   ├── tests/            # E2E tests (Cucumber + Playwright)
│   └── package.json
│
├── backend/              # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/devhelper/
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── service/       # Business logic
│   │   │   │   ├── repository/    # Data access
│   │   │   │   ├── model/         # Domain models
│   │   │   │   ├── dto/           # Data transfer objects
│   │   │   │   └── config/        # Configuration
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-production.yml
│   │   └── test/         # Backend tests
│   ├── Dockerfile
│   └── pom.xml
│
├── render.yaml           # Render deployment config
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Java** 17
- **Maven** 3.9+
- **Git**

### Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/1102huynh/devhelper.git
cd devhelper
```

#### 2. Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: http://localhost:8080

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

### Production Deployment

#### Backend (Render)
- **Auto-deploy**: Enabled on `develop` branch
- **Build**: Docker-based
- **Storage**: `/opt/render/project/data`
- **Environment**: 
  - `PORT=10000`
  - `SPRING_PROFILES_ACTIVE=production`

#### Frontend (Vercel)
- **Auto-deploy**: Enabled on `develop` branch
- **Build**: Next.js
- **Environment**:
  - `NEXT_PUBLIC_API_URL=https://devhelper-37jw.onrender.com`

## 🔧 Configuration

### Backend Environment Variables

**Development** (`application.yml`):
```yaml
server:
  port: 8080

logging:
  level:
    com.devhelper: DEBUG
```

**Production** (`application-production.yml`):
```yaml
server:
  port: ${PORT:10000}

file:
  storage:
    base-path: ${FILE_STORAGE_BASE_PATH:/opt/render/project/data}

logging:
  level:
    com.devhelper: INFO
```

### Frontend Environment Variables

**Development** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Production** (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://devhelper-37jw.onrender.com
```

## 📡 API Endpoints

### Notes API
```
GET    /api/notes           - Get all notes
POST   /api/notes           - Create note
GET    /api/notes/{id}      - Get note by ID
PUT    /api/notes/{id}      - Update note
DELETE /api/notes/{id}      - Delete note
PATCH  /api/notes/{id}/pin  - Toggle pin
```

### SSH Commands API
```
GET    /api/ssh             - Get SSH commands
POST   /api/ssh             - Create SSH command
PUT    /api/ssh/{id}        - Update SSH command
DELETE /api/ssh/{id}        - Delete SSH command
```

### Utility APIs
```
POST   /api/json/format     - Format JSON
POST   /api/json/validate   - Validate JSON
POST   /api/json/minify     - Minify JSON
GET    /api/uuid/generate   - Generate UUIDs
POST   /api/regex/test      - Test regex
POST   /api/diff/compare    - Compare text
POST   /api/text/convert    - Convert text
POST   /api/xml/format      - Format XML
POST   /api/cron/parse      - Parse cron
```

### Health Check
```
GET    /actuator/health     - Health status
```

## 🧪 Testing

### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e
```

### Backend Tests
```bash
cd backend
mvn test
```

## 🔒 CORS Configuration

Backend allows all origins via pattern matching:
```java
@Configuration
public class CorsConfig {
    config.addAllowedOriginPattern("*");
    config.setAllowCredentials(true);
}
```

## 📦 Storage

### File-Based Storage
Data is stored in JSON files:
- **Development**: `./data/`
- **Production**: `/opt/render/project/data/`

Files:
- `notes.json` - User notes
- `ssh-commands.json` - SSH commands

## 🛠️ Scripts

### Backend
```bash
mvn clean install        # Build
mvn spring-boot:run      # Run dev
mvn test                 # Run tests
```

### Frontend
```bash
npm install              # Install dependencies
npm run dev              # Run dev server
npm run build            # Build for production
npm run start            # Start production server
npm run test:e2e         # Run E2E tests
```

### Docker
```bash
# Backend
cd backend
docker build -t devhelper-backend .
docker run -p 8080:8080 devhelper-backend

# Full stack
docker-compose up
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 8080 (backend)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### CORS Issues
- Check backend logs for CORS configuration
- Verify `NEXT_PUBLIC_API_URL` in frontend
- Ensure backend is running

### Build Failures
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
mvn clean
mvn install
```

## 📚 Documentation

- **Setup Guide**: `SETUP_GUIDE.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Feature List**: `FEATURE_LIST.md`
- **Vercel Analytics Setup**: `VERCEL_ANALYTICS_SETUP.md`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-tool`
3. Commit changes: `git commit -m 'Add new tool'`
4. Push to branch: `git push origin feature/new-tool`
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Huynh Nguyen**
- GitHub: [@1102huynh](https://github.com/1102huynh)
- Repository: https://github.com/1102huynh/devhelper

## 🙏 Acknowledgments

- Next.js Team
- Spring Boot Team
- Vercel for hosting
- Render for backend hosting

---

**Version**: 1.0.0
**Last Updated**: December 15, 2025
**Status**: ✅ Production Ready

