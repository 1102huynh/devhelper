# Dev Helper - Complete Feature List

## 🎯 All 20 Developer Tools

### 1. 🔍 Regex Tester
**Path:** `/regex-tester`
**Backend:** `/api/regex/test`

**Features:**
- Live regex pattern testing
- Real-time match highlighting
- Multiple flags support (global, case-insensitive, multiline)
- Match count and details
- Error handling with helpful messages
- Example patterns library

**Use Cases:**
- Validate email addresses
- Parse log files
- Extract data from text
- Test regex before implementation

---

### 2. 📋 JSON Formatter
**Path:** `/json-formatter`
**Backend:** `/api/json/format`

**Features:**
- Format and beautify JSON
- Validate JSON syntax
- Customizable indentation (2/4 spaces)
- Sort keys alphabetically
- Syntax highlighting
- Minify JSON option
- Copy to clipboard

**Use Cases:**
- Format API responses
- Validate JSON configuration
- Debug JSON data
- Prepare JSON for documentation

---

### 3. 📄 XML Formatter
**Path:** `/xml-formatter`
**Backend:** `/api/xml/format`, `/api/xml/validate`

**Features:**
- Format and beautify XML
- Validate XML syntax
- Customizable indentation
- Error messages with line numbers
- Side-by-side input/output view
- Copy to clipboard

**Use Cases:**
- Format Spring XML configs
- Validate SOAP messages
- Format Maven pom.xml
- Debug XML responses

---

### 4. 🔐 Base64 Encoder/Decoder
**Path:** `/base64`

**Features:**
- Encode text to Base64
- Decode Base64 to text
- Bidirectional conversion
- File encoding support
- Copy to clipboard

**Use Cases:**
- Encode credentials
- Decode JWT payloads
- Handle binary data in JSON
- Encode images for data URIs

---

### 5. 🔗 URL Encoder/Decoder
**Path:** `/url-encoder`

**Features:**
- Encode URLs and query parameters
- Decode URL-encoded strings
- Handle special characters
- Preserve structure
- Copy to clipboard

**Use Cases:**
- Build API request URLs
- Debug URL parameters
- Encode search queries
- Handle international characters

---

### 6. 🔑 HTML Encoder/Decoder
**Path:** `/html-encoder`

**Features:**
- Encode plain text to HTML entities
- Decode HTML entities to plain text
- Common entities reference table
- Tabbed interface
- Copy to clipboard

**Use Cases:**
- Prevent XSS attacks
- Display code in HTML
- Handle special characters
- Sanitize user input

---

### 7. #️⃣ Hash Generator
**Path:** `/hash-generator`

**Features:**
- Generate multiple hash types:
  - MD5
  - SHA-1
  - SHA-256
  - SHA-512
- Real-time hash generation
- Copy individual hashes
- Copy all hashes

**Use Cases:**
- Verify file integrity
- Generate password hashes
- Create checksums
- Security testing

---

### 8. 🎫 JWT Decoder
**Path:** `/jwt-decoder`

**Features:**
- Decode JWT tokens
- Display header, payload, signature
- Syntax highlighting
- Validate JWT structure
- Expiration check
- Copy decoded parts

**Use Cases:**
- Debug authentication issues
- Inspect token claims
- Verify token expiration
- Test JWT implementation

---

### 9. 🆔 UUID Generator
**Path:** `/uuid-generator`
**Backend:** `/api/uuid/generate`

**Features:**
- Generate UUID v4 (random)
- Batch generation (1-100 UUIDs)
- Copy individual or all UUIDs
- Educational information
- Format validation

**Use Cases:**
- Generate database IDs
- Create session identifiers
- Unique file names
- Distributed system IDs

---

### 10. ⏰ Timestamp Converter
**Path:** `/timestamp`

**Features:**
- Convert Unix timestamp to date
- Convert date to Unix timestamp
- Multiple formats support
- Current timestamp
- Timezone handling
- Copy to clipboard

**Use Cases:**
- Debug timestamp issues
- Convert log timestamps
- API timestamp handling
- Database timestamp conversion

---

### 11. 📅 Cron Expression Parser
**Path:** `/cron-parser`
**Backend:** `/api/cron/parse`

**Features:**
- Parse cron expressions
- Human-readable descriptions
- Visual cron format guide
- Common examples library
- Click-to-use examples
- Validation with error messages

**Use Cases:**
- Configure Quartz scheduler
- Debug cron jobs
- Understand cron syntax
- Schedule tasks in Spring

---

### 12. 🔄 Diff Checker
**Path:** `/diff-checker`
**Backend:** `/api/diff/compare`

**Features:**
- Line-by-line comparison
- Color-coded differences:
  - Green: Additions
  - Red: Deletions
  - Gray: Unchanged
- Line numbers
- Change statistics
- Side-by-side view

**Use Cases:**
- Compare code versions
- Review configuration changes
- Debug data differences
- Code review assistance

---

### 13. ✏️ Text Utilities
**Path:** `/text-utils`
**Backend:** `/api/text/convert`

**Features:**
- 10+ text transformations:
  - UPPERCASE
  - lowercase
  - Capitalize Words
  - camelCase
  - snake_case
  - kebab-case
  - Reverse
  - Trim whitespace
  - Remove all whitespace
  - Remove line breaks
- Text statistics (chars, words, lines)
- Copy to clipboard

**Use Cases:**
- Convert naming conventions
- Format code identifiers
- Clean up text
- Quick text transformations

---

### 14. 🎨 Color Converter
**Path:** `/color-converter`

**Features:**
- Convert between formats:
  - HEX (#RRGGBB)
  - RGB (r, g, b)
  - HSL (h, s%, l%)
- Real-time color preview
- Interactive RGB/HSL sliders
- Copy any format
- Visual color display

**Use Cases:**
- CSS color conversion
- Design system colors
- Color palette creation
- Accessibility testing

---

### 15. 📝 Lorem Ipsum Generator
**Path:** `/lorem-ipsum`

**Features:**
- Generate paragraphs
- Generate specific word count
- Generate sentences
- Quick generate buttons
- Statistics display
- Copy to clipboard

**Use Cases:**
- Mockup placeholder text
- Design templates
- Content length testing
- UI/UX prototypes

---

### 16. 📱 QR Code Generator
**Path:** `/qr-generator`

**Features:**
- Generate QR codes for any text
- High-quality canvas rendering
- Download as PNG
- Quick examples:
  - URLs
  - Email addresses
  - Phone numbers
  - WiFi credentials
  - SMS messages
- Format guide

**Use Cases:**
- Share URLs quickly
- WiFi guest access
- Contact information
- Mobile app links

---

### 17. ℹ️ HTTP Status Codes Reference
**Path:** `/http-status`

**Features:**
- Comprehensive status code database
- Search functionality
- Color-coded by category:
  - 1xx: Informational (gray)
  - 2xx: Success (green)
  - 3xx: Redirection (blue)
  - 4xx: Client Error (yellow)
  - 5xx: Server Error (red)
- Detailed descriptions
- Category overview

**Use Cases:**
- Debug API responses
- Learn HTTP protocol
- Quick status code lookup
- Documentation reference

---

### 18. 💻 SSH Commands Manager
**Path:** `/ssh-commands`
**Backend:** `/api/ssh/*`

**Features:**
- Store frequently used SSH commands
- Categorize by type
- Search functionality
- Quick copy commands
- CRUD operations
- Command templates

**Use Cases:**
- Save deployment commands
- Quick server access
- Team command sharing
- DevOps automation

---

### 19. ⚡ API Tester
**Path:** `/api-tester`
**Backend:** `/api/api-tester/request`

**Features:**
- Test REST APIs
- Support all HTTP methods:
  - GET, POST, PUT, PATCH, DELETE
- Custom headers
- Request body editor
- Response viewer
- Status code display
- Response time tracking
- Save request history

**Use Cases:**
- Test API endpoints
- Debug API calls
- Quick API exploration
- API documentation testing

---

### 20. 📌 Task Notes
**Path:** `/notes`
**Backend:** `/api/notes/*`

**Features:**
- Lightning-fast note creation
- Ctrl+Space global shortcut
- Pin important notes
- Tag system
- Search functionality
- Markdown support
- Color coding
- CRUD operations

**Use Cases:**
- Quick task notes
- Code snippets
- Meeting notes
- TODO lists
- Bug tracking

---

## 🎯 Statistics

- **Total Tools:** 20
- **Backend Controllers:** 10
- **Frontend Pages:** 20
- **API Endpoints:** 25+
- **DTOs:** 14
- **Lines of Code:** 5000+

## 🛠️ Technologies

### Backend
- Java 17
- Spring Boot 3.2
- Maven
- Lombok
- REST APIs

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

## 🎨 UI/UX Features

- ✅ Dark/Light theme support
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Keyboard shortcuts
- ✅ Copy to clipboard
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications

## 🚀 Performance

- Client-side rendering where possible
- Optimized API calls
- Lazy loading
- Code splitting
- Image optimization
- Cached results

## 📱 Mobile Support

All tools are fully responsive and work on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

---

**Perfect for Java Developers!** 🎉

All tools are specifically designed with Java development in mind:
- XML configs (Spring, Maven)
- JSON APIs (REST services)
- Cron expressions (Quartz)
- JWT tokens (Spring Security)
- UUIDs (JPA entities)
- Base64 (encoding)
- Hash generation (security)
- And much more!

