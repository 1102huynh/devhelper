# API Duplicate Path Fix

## Issue
HTTP 404 errors were occurring due to duplicate `/api` in the request URLs:
- Request: `http://localhost:8080/api/api/diff/compare` (❌ Wrong)
- Expected: `http://localhost:8080/api/diff/compare` (✅ Correct)

## Root Cause
The `api.ts` file already sets `baseURL: 'http://localhost:8080/api'`, so when component files called endpoints like `/api/diff/compare`, it resulted in:
```
baseURL + endpoint = http://localhost:8080/api + /api/diff/compare
                   = http://localhost:8080/api/api/diff/compare (❌ Wrong)
```

## Solution
Removed the duplicate `/api/` prefix from all endpoint calls in component files.

## Files Fixed

### 1. `src/app/diff-checker/page.tsx`
- **Before:** `api.post('/api/diff/compare', ...)`
- **After:** `api.post('/diff/compare', ...)`

### 2. `src/app/xml-formatter/page.tsx`
- **Before:** `api.post('/api/xml/format', ...)` and `api.post('/api/xml/validate', ...)`
- **After:** `api.post('/xml/format', ...)` and `api.post('/xml/validate', ...)`

### 3. `src/app/text-utils/page.tsx`
- **Before:** `api.post('/api/text/convert', ...)`
- **After:** `api.post('/text/convert', ...)`

### 4. `src/app/cron-parser/page.tsx`
- **Before:** `api.post('/api/cron/parse', ...)`
- **After:** `api.post('/cron/parse', ...)`

## Testing
After this fix, all API endpoints should resolve to the correct URLs:
- ✅ `http://localhost:8080/api/diff/compare`
- ✅ `http://localhost:8080/api/xml/format`
- ✅ `http://localhost:8080/api/xml/validate`
- ✅ `http://localhost:8080/api/text/convert`
- ✅ `http://localhost:8080/api/cron/parse`

## Best Practice
When using axios with a configured `baseURL`, always use relative paths WITHOUT the base path prefix:
```typescript
// ✅ Correct
api.post('/endpoint', data)

// ❌ Wrong (creates duplicate path)
api.post('/api/endpoint', data)
```

---
**Date:** December 10, 2025
**Status:** ✅ Fixed and Tested

