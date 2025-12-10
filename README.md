# Dev Helper - Professional Developer Productivity Suite 🚀

A comprehensive, production-ready suite of **20 professional developer tools** designed specifically for Software Engineers. Built with Java/Spring Boot backend and Next.js/React frontend.

## ✨ All 20 Tools

### 🔧 Text & Code Processing
1. **Regex Tester** - Test regular expressions with live matching and highlighting
2. **JSON Formatter** - Format, validate, and beautify JSON with syntax highlighting
3. **XML Formatter** - Format and validate XML documents
4. **HTML Encoder/Decoder** - Encode and decode HTML entities
5. **Text Utilities** - 10+ text transformations (uppercase, camelCase, snake_case, etc.)
6. **Lorem Ipsum Generator** - Generate placeholder text for designs

### 🔐 Security & Encoding
7. **Base64 Encoder/Decoder** - Encode and decode Base64 strings
8. **Hash Generator** - Generate MD5, SHA-1, SHA-256, SHA-512 hashes
9. **JWT Decoder** - Decode and inspect JSON Web Tokens
10. **UUID Generator** - Generate random UUIDs (v4) in batch

### 🌐 Web Development
11. **URL Encoder/Decoder** - Encode and decode URLs and query parameters
12. **Color Converter** - Convert between HEX, RGB, and HSL formats
13. **QR Code Generator** - Generate QR codes for URLs, WiFi, etc.
14. **HTTP Status Codes** - Complete HTTP status code reference

### ⚙️ Developer Tools
15. **API Tester** - Quick REST API testing tool with all HTTP methods
16. **Cron Expression Parser** - Parse and understand cron expressions
17. **Diff Checker** - Compare two text blocks line-by-line
18. **Timestamp Converter** - Convert Unix timestamps to readable dates

### 📝 Productivity
19. **SSH Commands Manager** - Store and manage frequently used SSH commands
20. **Task Notes** - Lightning-fast notes with Ctrl+Space shortcut

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

### Option 1: One-Click Start (Recommended)

**Windows:**
```bash
.\start-all.bat
```

**Mac/Linux:**
```bash
chmod +x start-all.sh
./start-all.sh
```

This will automatically start both backend and frontend servers!

### Option 2: Manual Start

**Backend:**
```bash
cd backend
mvn spring-boot:run
```
Server will start on http://localhost:8080

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Application will start on http://localhost:3000

### Option 3: Docker
```bash
docker-compose up
```

## 📝 API Documentation

Base URL: `http://localhost:8080/api`

### All API Endpoints (25+)

**Text Processing:**
- `POST /regex/test` - Test regex patterns
- `POST /json/format` - Format JSON
- `POST /xml/format` - Format XML
- `POST /xml/validate` - Validate XML
- `POST /text/convert` - Text transformations
- `POST /text/stats` - Text statistics

**Security & Encoding:**
- `GET /uuid/generate` - Generate UUIDs
- `POST /cron/parse` - Parse cron expressions

**Comparison & Analysis:**
- `POST /diff/compare` - Compare text differences

**Data Management:**
- `GET /ssh` - Get SSH commands
- `POST /ssh` - Create SSH command
- `PUT /ssh/{id}` - Update SSH command
- `DELETE /ssh/{id}` - Delete SSH command

**API Testing:**
- `POST /api-tester/request` - Test API requests

**Notes:**
- `GET /notes` - Get all notes
- `POST /notes` - Create note
- `PUT /notes/{id}` - Update note
- `PATCH /notes/{id}/pin` - Toggle pin
- `DELETE /notes/{id}` - Delete note

## 🎨 UI/UX Features

✨ **Modern Design**
- Beautiful, clean interface
- Professional color schemes
- Smooth animations (Framer Motion)
- Consistent styling across all pages

🌗 **Theme Support**
- Dark/Light theme toggle
- Automatic theme persistence
- No hydration issues

📱 **Responsive Layout**
- Works on all devices
- Mobile-first design
- Adaptive grid system

⌨️ **Productivity**
- Keyboard shortcuts (Ctrl+Space for notes)
- One-click copy functionality
- Quick navigation sidebar
- Search and filter options

⚡ **Performance**
- Fast page loads
- Optimized rendering
- Lazy loading
- Code splitting

## 📊 Project Statistics

- **Total Tools:** 20
- **Backend Controllers:** 10
- **Frontend Pages:** 20
- **API Endpoints:** 25+
- **DTOs:** 14
- **Lines of Code:** 5000+
- **Technologies:** Java 17, Spring Boot 3, Next.js 14, TypeScript

## 🎯 Perfect for Java Developers

This suite is specifically designed for Java development workflows:

✅ **Spring Boot Development**
- XML configs (Spring application context)
- JSON APIs (REST controllers)
- Cron jobs (Quartz scheduler)
- JWT tokens (Spring Security)

✅ **Maven Projects**
- XML formatting (pom.xml)
- Dependency management
- Build debugging

✅ **Database Work**
- UUID generation (JPA entity IDs)
- SQL formatting
- Data comparison

✅ **API Development**
- REST API testing
- JSON formatting
- HTTP status codes
- Base64 encoding

## 📚 Documentation

- **[FEATURE_LIST.md](FEATURE_LIST.md)** - Complete list of all 20 tools
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Implementation summary
- **[COMPLETE_IMPLEMENTATION.md](COMPLETE_IMPLEMENTATION.md)** - Technical details
- **Backend README** - Backend-specific documentation
- **Frontend README** - Frontend-specific documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for Software Engineers

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 2025

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

