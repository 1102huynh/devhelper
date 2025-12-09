# 🚀 Dev Helper - Quick Start Guide

Complete setup guide for Dev Helper - Software Engineer Productivity Tools

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Backend Requirements
- ☕ Java 17 or higher ([Download](https://adoptium.net/))
- 📦 Maven 3.6+ ([Download](https://maven.apache.org/download.cgi))

### Frontend Requirements
- 🟢 Node.js 18+ or 20+ ([Download](https://nodejs.org/))
- 📦 npm (comes with Node.js)

### Optional
- 🐳 Docker & Docker Compose (for containerized deployment)

## 🎯 Quick Start (Development)

### Option 1: Run Locally

#### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```
✅ Backend will be available at: http://localhost:8080

#### 2. Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend will be available at: http://localhost:3000

### Option 2: Using Docker Compose

```bash
# From project root directory
docker-compose up --build
```
✅ Both services will start automatically:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## 🔧 Detailed Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies (Maven will do this automatically)**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Verify backend is running**
   - Open: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:devhelper`
   - Username: `sa`
   - Password: (leave empty)

5. **Test API endpoint**
   ```bash
   curl http://localhost:8080/api/notes
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # .env.local is already created with:
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Navigate to: http://localhost:3000
   - You should see the Dev Helper homepage

## 🎨 Features Overview

### 1. 🔍 Regex Tester
- Location: http://localhost:3000/regex-tester
- Test regular expressions with live highlighting
- View capture groups and match positions
- Quick reference guide included

### 2. 📋 JSON Formatter
- Location: http://localhost:3000/json-formatter
- Validate and format JSON
- Minify for production
- Copy formatted output

### 3. 💻 SSH Commands
- Location: http://localhost:3000/ssh-commands
- Store frequently used SSH commands
- Organize by categories
- Quick search and copy

### 4. ⚡ API Tester
- Location: http://localhost:3000/api-tester
- Test REST APIs quickly
- Support for all HTTP methods
- View response headers and body

### 5. 📝 Task Notes
- Location: http://localhost:3000/notes
- Lightning-fast note taking
- Press `Ctrl+Space` anywhere to add notes
- Pin important notes
- Tag organization

## 🎯 Testing the Application

### Sample Data
The application comes pre-loaded with sample data:
- 10 SSH commands across different categories
- 6 sample notes with various tags

### Test Regex Tester
1. Go to Regex Tester
2. Pattern: `\d{3}-\d{3}-\d{4}`
3. Test String: `My phone is 123-456-7890`
4. Click "Test Pattern"

### Test JSON Formatter
1. Go to JSON Formatter
2. Click "Load Sample"
3. Click "Format JSON"
4. Switch between Formatted and Minified tabs

### Test API Tester
1. Go to API Tester
2. Click "Load Sample"
3. Click "Send Request"
4. View response in formatted JSON

## 🔑 Keyboard Shortcuts

- `Ctrl + Space` - Quick add note (works on any page)

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Port 8080 already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

**Problem**: Maven build fails
```bash
mvn clean
mvn clean install -U
```

### Frontend Issues

**Problem**: Port 3000 already in use
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

**Problem**: Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem**: CORS errors
- Ensure backend is running on port 8080
- Check `application.yml` CORS configuration
- Verify `.env.local` has correct API URL

### Connection Issues

**Problem**: Frontend can't connect to backend
1. Check backend is running: http://localhost:8080/api/notes
2. Verify `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
3. Clear browser cache and hard reload

## 📦 Building for Production

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

### Docker (Both Services)
```bash
docker-compose up --build
```

## 🔐 Security Notes

- H2 console is enabled for development only
- For production, disable H2 console in `application.yml`
- Configure proper database (PostgreSQL, MySQL)
- Add authentication/authorization
- Use HTTPS in production

## 🎨 Customization

### Change Theme Colors
Edit `frontend/src/app/globals.css` and `frontend/tailwind.config.js`

### Add New Tool
1. Create new page in `frontend/src/app/[tool-name]/page.tsx`
2. Add route to `frontend/src/components/sidebar.tsx`
3. Create corresponding backend controller if needed

### Modify Sample Data
Edit `backend/src/main/java/com/devhelper/config/DataInitializer.java`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints
- `POST /regex/test` - Test regex patterns
- `POST /json/format` - Format JSON
- `GET /ssh` - Get SSH commands
- `POST /ssh` - Create SSH command
- `POST /api-tester/request` - Test API
- `GET /notes` - Get notes
- `POST /notes` - Create note

Full API documentation available in `backend/README.md`

## 🚀 Next Steps

1. ✅ Explore all 5 tools
2. ✅ Add your own SSH commands
3. ✅ Create some notes
4. ✅ Test the Regex and JSON tools
5. ✅ Try the API Tester with different endpoints
6. 📝 Configure database for persistence
7. 🔐 Add authentication
8. 🌐 Deploy to production

## 🤝 Contributing

Feel free to:
- Add new tools
- Improve existing features
- Report bugs
- Suggest enhancements

## 📄 License

MIT License - Feel free to use this project for learning or production!

## 🎉 Enjoy Dev Helper!

If you encounter any issues, check the individual README files:
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`

Happy coding! 🚀

