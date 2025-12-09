# 🚀 Dev Helper - Quick Reference Card

## 📦 Project Structure
```
devhelper/
├── backend/          # Spring Boot (Java 17, Port 8080)
├── frontend/         # Next.js (TypeScript, Port 3000)
├── README.md         # Main documentation
├── SETUP_GUIDE.md    # Detailed setup instructions
├── PROJECT_SUMMARY.md # Complete project overview
├── verify-project.*  # Verification scripts
└── start-dev.*       # Quick start scripts
```

## ⚡ Quick Start

### Windows
```bash
verify-project.bat    # Check setup
start-dev.bat         # Start both servers
```

### Linux/Mac
```bash
chmod +x verify-project.sh start-dev.sh
./verify-project.sh   # Check setup
./start-dev.sh        # Start both servers
```

### Manual Start
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up --build
```

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend | http://localhost:8080 | REST API |
| H2 Console | http://localhost:8080/h2-console | Database admin |

## 🛠️ Tools Overview

| Tool | Route | Shortcut | Description |
|------|-------|----------|-------------|
| 🏠 Home | / | - | Dashboard |
| 🔍 Regex Tester | /regex-tester | - | Test regex patterns |
| 📋 JSON Formatter | /json-formatter | - | Format & validate JSON |
| 💻 SSH Commands | /ssh-commands | - | Manage SSH commands |
| ⚡ API Tester | /api-tester | - | Test REST APIs |
| 📝 Task Notes | /notes | Ctrl+Space | Quick notes |

## 🎯 API Endpoints

### Regex
```
POST /api/regex/test
```

### JSON
```
POST /api/json/format
```

### SSH Commands
```
GET    /api/ssh
POST   /api/ssh
PUT    /api/ssh/{id}
DELETE /api/ssh/{id}
```

### API Tester
```
POST /api/api-tester/request
```

### Notes
```
GET    /api/notes
POST   /api/notes
PUT    /api/notes/{id}
PATCH  /api/notes/{id}/pin
DELETE /api/notes/{id}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Space | Quick add note (global) |

## 🎨 Theme

| Mode | Shortcut | Location |
|------|----------|----------|
| Toggle Dark/Light | Click button | Sidebar bottom |

## 📊 Sample Data

### SSH Commands: 10 pre-loaded
- Connection (2)
- File Transfer (3)
- Tunneling (1)
- Remote Execution (1)
- Monitoring (2)
- System Admin (1)

### Notes: 6 pre-loaded
- Welcome (pinned)
- Regex examples (pinned)
- Git commands
- Docker reference
- API testing tips
- JSON shortcuts

## 🐛 Common Issues

### Backend Issues
```bash
# Port 8080 in use
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Maven build fails
mvn clean install -U
```

### Frontend Issues
```bash
# Port 3000 in use
# Edit package.json: "dev": "next dev -p 3001"

# Dependencies issue
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues
- Check backend is running on port 8080
- Verify `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`

## 📝 Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.1
- H2 Database
- Maven
- Lombok

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## 🔧 Configuration Files

### Backend
```
backend/src/main/resources/application.yml
```

### Frontend
```
frontend/.env.local
frontend/tailwind.config.js
frontend/next.config.js
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Project overview |
| SETUP_GUIDE.md | Detailed setup |
| PROJECT_SUMMARY.md | Technical details |
| backend/README.md | Backend docs |
| frontend/README.md | Frontend docs |

## 🚀 Build for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/devhelper-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Docker
```bash
docker-compose up --build
```

## 🎯 Next Steps

1. ✅ Run `verify-project` script
2. ✅ Run `start-dev` script
3. ✅ Open http://localhost:3000
4. ✅ Explore all 5 tools
5. ✅ Read documentation
6. 📝 Configure database
7. 🔐 Add authentication
8. 🌐 Deploy

## 💡 Tips

- Use `Ctrl+Space` for quick notes anywhere
- Dark mode toggle in sidebar
- All data is sample/mock initially
- Check console logs for errors
- H2 database resets on restart

## 📞 Help

- Check `SETUP_GUIDE.md` for detailed instructions
- Check `PROJECT_SUMMARY.md` for technical details
- Check individual README files in backend/frontend folders

## 🎉 Enjoy!

Dev Helper - Your productivity companion! 🚀

