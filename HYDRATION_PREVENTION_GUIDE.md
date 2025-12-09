# Hydration Error Prevention Guide

## Common Causes of Hydration Errors in Next.js

### 1. Browser-Only APIs
❌ **Problem**: Using browser APIs during SSR
```typescript
// DON'T DO THIS
const MyComponent = () => {
  const width = window.innerWidth // ❌ window is undefined on server
  return <div>Width: {width}</div>
}
```

✅ **Solution**: Use `useEffect` or check if mounted
```typescript
const MyComponent = () => {
  const [width, setWidth] = useState(0)
  
  useEffect(() => {
    setWidth(window.innerWidth)
  }, [])
  
  return <div>Width: {width}</div>
}
```

### 2. Theme/Dark Mode (next-themes)
❌ **Problem**: Rendering theme-dependent content directly
```typescript
// DON'T DO THIS
const ThemeButton = () => {
  const { theme } = useTheme()
  return <div>{theme === 'dark' ? '🌙' : '☀️'}</div> // ❌ Different on server vs client
}
```

✅ **Solution**: Use mounted state
```typescript
const ThemeButton = () => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return <div>...</div> // Placeholder
  return <div>{theme === 'dark' ? '🌙' : '☀️'}</div>
}
```

### 3. localStorage/sessionStorage
❌ **Problem**: Reading from storage during render
```typescript
// DON'T DO THIS
const MyComponent = () => {
  const saved = localStorage.getItem('data') // ❌ Not available on server
  return <div>{saved}</div>
}
```

✅ **Solution**: Use `useEffect`
```typescript
const MyComponent = () => {
  const [saved, setSaved] = useState('')
  
  useEffect(() => {
    setSaved(localStorage.getItem('data') || '')
  }, [])
  
  return <div>{saved}</div>
}
```

### 4. Random/Dynamic IDs
❌ **Problem**: Generating random IDs during render
```typescript
// DON'T DO THIS
const MyComponent = () => {
  const id = Math.random() // ❌ Different on server vs client
  return <div id={id}>Content</div>
}
```

✅ **Solution**: Use `useId` or generate in `useEffect`
```typescript
const MyComponent = () => {
  const id = useId() // ✅ Stable ID
  return <div id={id}>Content</div>
}
```

### 5. Date/Time Rendering
❌ **Problem**: Rendering current time directly
```typescript
// DON'T DO THIS
const Clock = () => {
  return <div>{new Date().toLocaleTimeString()}</div> // ❌ Different every render
}
```

✅ **Solution**: Use client-side state
```typescript
const Clock = () => {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return <div>{time || '--:--:--'}</div>
}
```

### 6. Third-Party Scripts/Widgets
❌ **Problem**: Rendering external widgets directly
```typescript
// DON'T DO THIS
const GoogleMap = () => {
  return <div dangerouslySetInnerHTML={{ __html: google.maps.init() }} /> // ❌
}
```

✅ **Solution**: Load in `useEffect`
```typescript
const GoogleMap = () => {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    // Load script and initialize
    setLoaded(true)
  }, [])
  
  return <div id="map">{!loaded && 'Loading map...'}</div>
}
```

## Quick Checklist

Before deploying, check for:

- [ ] No `window`, `document`, `navigator` usage outside `useEffect`
- [ ] No `localStorage`/`sessionStorage` reads during render
- [ ] Theme-dependent UI uses mounted state
- [ ] No `Math.random()` or `Date.now()` in JSX
- [ ] HTML attributes match on server and client
- [ ] No conditional rendering based on client-only data
- [ ] `suppressHydrationWarning` is on `<html>` tag if using themes

## Testing for Hydration Errors

### 1. Development Mode
```bash
npm run dev
```
Check browser console for warnings.

### 2. Production Build
```bash
npm run build
npm start
```
Production mode shows hydration errors more strictly.

### 3. React DevTools
Install React DevTools browser extension to see hydration mismatches highlighted.

## Best Practices

### The "Mounted" Pattern
```typescript
const ClientOnlyComponent = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <LoadingPlaceholder /> // Same structure as actual content
  }
  
  return <ActualClientSideContent />
}
```

### Use Next.js Dynamic Imports
```typescript
import dynamic from 'next/dynamic'

const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false, // Disable SSR for this component
  loading: () => <LoadingSpinner />
})
```

### Server vs Client Components (App Router)
```typescript
// Server Component (default)
const ServerComponent = async () => {
  const data = await fetchData()
  return <div>{data}</div>
}

// Client Component (explicitly marked)
'use client'
const ClientComponent = () => {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

## Resources

- [Next.js Hydration Documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [next-themes Best Practices](https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch)

---

**Created**: December 9, 2025  
**For**: Dev Helper Project

