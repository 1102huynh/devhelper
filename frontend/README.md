# Dev Helper Frontend

Next.js frontend for Dev Helper tools - A comprehensive suite of developer productivity tools.

## 🚀 Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- React Hot Toast
- Axios

## 📦 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api-tester/
│   │   │   └── page.tsx
│   │   ├── json-formatter/
│   │   │   └── page.tsx
│   │   ├── notes/
│   │   │   └── page.tsx
│   │   ├── regex-tester/
│   │   │   └── page.tsx
│   │   ├── ssh-commands/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── sidebar.tsx
│   │   └── theme-provider.tsx
│   └── lib/
│       ├── api.ts
│       └── utils.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🛠️ Setup & Run

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```

Application will start on http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## ✨ Features

### 1. Regex Tester
- Live regex pattern testing
- Match highlighting
- Capture group display
- Multiple flags support (i, m, s)
- Quick reference guide

### 2. JSON Formatter
- JSON validation
- Beautiful formatting
- Minification
- Copy to clipboard
- Error highlighting

### 3. SSH Commands
- Store frequently used SSH commands
- Category organization
- Search functionality
- Quick copy
- CRUD operations

### 4. API Tester
- Support for GET, POST, PUT, DELETE, PATCH
- Custom headers
- Request body for POST/PUT/PATCH
- Response display with syntax highlighting
- Response time tracking
- Status code reference

### 5. Task Notes
- Quick note taking
- Global keyboard shortcut (Ctrl+Space)
- Pin important notes
- Tag organization
- Search functionality
- Markdown support

## 🎨 UI Features

- Dark/Light theme toggle
- Responsive design
- Beautiful animations (Framer Motion)
- Toast notifications
- Modern UI with shadcn/ui components
- Smooth transitions

## ⌨️ Keyboard Shortcuts

- `Ctrl + Space` - Quick add note (works globally)

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Environment behavior:
- Local `npm run dev`: frontend calls `http://localhost:8080` and local-path features use your machine paths (for example `D:\\learn`).
- Production deploy: frontend calls Render backend URL and server-side path features use server paths.

### API Configuration

Edit `src/lib/api.ts` to change API base URL or add interceptors.

### Theme Configuration

Edit `tailwind.config.js` and `src/app/globals.css` to customize colors and themes.

## 🐳 Docker

Build image:
```bash
docker build -t devhelper-frontend .
```

Run container:
```bash
docker run -p 3000:3000 devhelper-frontend
```

## 📱 Responsive Design

The application is fully responsive and works great on:
- Desktop (1920x1080+)
- Laptop (1366x768+)
- Tablet (768x1024+)
- Mobile (375x667+)

## 🎯 Development Tips

### Adding New Components

Use shadcn/ui CLI to add components:
```bash
npx shadcn-ui@latest add [component-name]
```

### Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Use client components only when needed
- Implement proper error handling

## 🔗 API Integration

The frontend communicates with the backend via REST APIs. All API calls are centralized in `src/lib/api.ts`.

## 🐛 Troubleshooting

### CORS Issues
Make sure backend CORS is configured to allow `http://localhost:3000`

### API Connection Failed
Check that backend is running on `http://localhost:8080`

### Hot Reload Not Working
Try deleting `.next` folder and restart dev server

## 📝 License

MIT

