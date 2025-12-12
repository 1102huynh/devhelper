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

### Testing
- **Cucumber BDD** - Behavior-Driven Development
- **REST Assured** - Backend API testing
- **Playwright** - Frontend E2E testing
- **JUnit 5** - Test runner
- **Spring Boot Test** - Integration testing

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
- **Test Scenarios:** 40+
- **Test Coverage:** Backend API + Frontend E2E
- **Technologies:** Java 17, Spring Boot 3, Next.js 14, TypeScript

## 🧪 Testing with Cucumber BDD

This project includes comprehensive **Behavior-Driven Development (BDD)** testing with **Cucumber**.

### ✅ Test Coverage

**Backend API Tests (Java):**
- ✅ Notes CRUD operations
- ✅ JSON formatter, validator, minifier
- ✅ Diff checker comparisons
- ✅ UUID generation
- ✅ Error handling
- ✅ Integration tests

**Frontend E2E Tests (JavaScript):**
- ✅ Navigation and routing
- ✅ JSON formatter UI
- ✅ Notes management UI
- ✅ UUID generator UI
- ✅ Regex tester UI
- ✅ End-to-end workflows
- ✅ Theme toggling
- ✅ Sidebar interactions

### 🚀 Running Tests

**📖 Complete Documentation:**
- **Quick Start**: [`CUCUMBER_QUICK_START.md`](CUCUMBER_QUICK_START.md) - 5-minute setup
- **Troubleshooting**: [`CUCUMBER_TROUBLESHOOTING.md`](CUCUMBER_TROUBLESHOOTING.md) - 13 common issues & solutions
- **Checklist**: [`CUCUMBER_CHECKLIST.md`](CUCUMBER_CHECKLIST.md) - Complete execution guide
- **Fix Summary**: [`CUCUMBER_FIX_SUMMARY.md`](CUCUMBER_FIX_SUMMARY.md) - Technical details
- **Complete Guide**: [`CUCUMBER_COMPLETE.md`](CUCUMBER_COMPLETE.md) - Full overview

**Quick Start - Run All Tests:**
```bash
# Windows
.\run-cucumber-tests.bat

# Mac/Linux
chmod +x run-cucumber-tests.sh
./run-cucumber-tests.sh
```

**Backend Tests Only:**
```bash
cd backend
mvn test

# Generate HTML report
mvn clean verify

# View report: backend/target/cucumber-reports/cucumber.html
```

**Frontend Tests Only:**
```bash
# FIRST TIME SETUP (Required):
cd frontend
npm install
npx playwright install chromium  # ← Install browsers

# Start servers first (Terminal 1 & 2)
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# Run tests (Terminal 3)
cd frontend
npm run test:e2e:report

# View report: frontend/test-results/cucumber-report.html
```

**⚠️ Important**: Playwright browsers must be installed before running E2E tests. See [CUCUMBER_QUICK_START.md](CUCUMBER_QUICK_START.md) for details.

**Run by Tags:**
```bash
# Backend
mvn test -Dcucumber.filter.tags="@smoke"
mvn test -Dcucumber.filter.tags="@api"

# Frontend
npx cucumber-js --tags "@e2e"
npx cucumber-js --tags "@integration"
```

### 📚 Testing Documentation

- 📖 **[Quick Start Guide](CUCUMBER_QUICK_START.md)** - Get started in 5 minutes
- 📖 **[Complete Implementation Guide](CUCUMBER_IMPLEMENTATION.md)** - Full details
- 📖 **[Backend Testing](backend/src/test/resources/CUCUMBER_README.md)** - Backend API tests
- 📖 **[Frontend Testing](frontend/tests/e2e/CUCUMBER_README.md)** - Frontend E2E tests
- ✅ **[Implementation Summary](CUCUMBER_COMPLETE.md)** - What we've built

### 🎯 Example Test Scenario

```gherkin
Feature: Notes Management
  As a developer
  I want to manage my notes
  So that I can quickly save and retrieve information

  Scenario: Create a new note
    Given I have a note with title "Test Note" and content "Test content"
    When I create a new note
    Then the response status should be 201
    And the response should contain the note with title "Test Note"
```

### 🛠️ Testing Technologies

- **Cucumber** - BDD framework with Gherkin syntax
- **REST Assured** - API testing library (Backend)
- **Playwright** - Browser automation (Frontend)
- **JUnit 5** - Test runner
- **Spring Boot Test** - Integration testing
- **H2 Database** - In-memory test database

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

