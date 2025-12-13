# 🔧 FRONTEND-BACKEND CONNECTION ISSUES - DEBUG GUIDE

**Date:** December 13, 2025  
**Issue:** Frontend không load được Notes và SSH Commands từ backend  
**Status:** 🔍 DEBUGGING

---

## 🎯 COMMON ISSUES

### 1. ❌ CORS Error
**Symptom:** Browser console shows:
```
Access to XMLHttpRequest at 'https://backend.com/api/notes' from origin 'https://frontend.com' 
has been blocked by CORS policy
```

**Solution:** Update backend CORS config

### 2. ❌ Wrong API URL
**Symptom:** 404 Not Found errors

**Solution:** Verify API URL is correct

### 3. ❌ Backend Not Running
**Symptom:** Connection timeout, ERR_CONNECTION_REFUSED

**Solution:** Check if backend is deployed and running

### 4. ❌ Missing /api Path
**Symptom:** 404 errors on all endpoints

**Solution:** Ensure API URL includes `/api` path

---

## ✅ FIXES APPLIED

### 1. Fixed API URL Construction

**File:** `frontend/src/lib/api.ts`

**Before:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
```

**After:**
```typescript
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};
```

**Why:** Environment variable might not include `/api`, this ensures it's always appended.

### 2. Added Request/Response Interceptors

**Added:**
```typescript
// Debug logging for API calls
api.interceptors.request.use(...)
api.interceptors.response.use(...)
```

**Why:** Helps identify where requests are failing.

### 3. Added Timeout

**Added:**
```typescript
timeout: 30000, // 30 seconds
```

**Why:** Prevents hanging requests on slow backend startup.

---

## 🧪 TESTING STEPS

### Step 1: Access Test Page

After deploying, go to:
```
https://your-frontend.vercel.app/api-test
```

This page will test all API endpoints and show detailed results.

### Step 2: Check Browser Console

Press F12 → Console tab

**Look for:**
```javascript
API Request: GET /notes
API Response: 200 /notes
```

**Or errors:**
```javascript
API Response Error: {
  url: '/notes',
  status: 404,
  message: 'Not Found'
}
```

### Step 3: Test Backend Directly

**Health Check:**
```bash
curl https://your-backend.onrender.com/actuator/health
```

**Expected:**
```json
{"status":"UP"}
```

**Notes API:**
```bash
curl https://your-backend.onrender.com/api/notes
```

**Expected:**
```json
[
  {
    "id": "uuid",
    "title": "...",
    "content": "..."
  }
]
```

---

## 🔍 DEBUGGING CHECKLIST

### Backend Health:
- [ ] Backend is deployed on Render
- [ ] Backend status is "Live" (green)
- [ ] Health check endpoint responds: `/actuator/health`
- [ ] Port is set to 10000 (or PORT env var)

### API URLs:
- [ ] Backend URL is correct in Vercel env vars
- [ ] API endpoints return data when tested with curl
- [ ] `/api/notes` endpoint works
- [ ] `/api/ssh` endpoint works

### CORS Configuration:
- [ ] Backend CORS allows Vercel domain
- [ ] `allowed-origins` includes your Vercel URL
- [ ] No CORS errors in browser console

### Frontend Configuration:
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Environment variable includes backend URL
- [ ] Frontend redeployed after env var change

---

## 🔧 QUICK FIXES

### Fix 1: Update Vercel Environment Variable

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Find: `NEXT_PUBLIC_API_URL`
4. Update to: `https://your-actual-backend-url.onrender.com`
5. **Important:** NO `/api` at the end!
6. Redeploy: Deployments → Latest → Redeploy

### Fix 2: Update Backend CORS

**File:** `backend/src/main/resources/application-production.yml`

```yaml
cors:
  allowed-origins: https://your-actual-frontend.vercel.app,https://*.vercel.app
```

Push changes and Render will auto-deploy.

### Fix 3: Test Locally First

```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev

# Test at http://localhost:3000
```

If it works locally but not in production:
- ✅ Code is correct
- ❌ Configuration issue (URLs, CORS, env vars)

---

## 📊 COMMON SCENARIOS

### Scenario 1: Backend Sleeping (Render Free Tier)

**Symptom:**
- First request takes 30-60 seconds
- Subsequent requests are fast

**Not a bug!** Free tier sleeps after 15 minutes.

**Solution:**
- Use UptimeRobot to keep awake
- Or wait for backend to wake up

### Scenario 2: Wrong Backend URL

**Symptom:**
- All API calls timeout
- Connection refused errors

**Check:**
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should output: https://your-backend.onrender.com
```

**Fix:** Update Vercel env var and redeploy.

### Scenario 3: CORS Blocking Requests

**Symptom:**
```
Access-Control-Allow-Origin header is missing
```

**Fix Backend CORS:**
```yaml
cors:
  allowed-origins: https://your-frontend.vercel.app,https://*.vercel.app
  allowed-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

### Scenario 4: Forgotten Redeploy

**Symptom:**
- Changed env vars but still not working

**Remember:**
- Vercel needs redeploy after env var changes
- Render auto-redeploys on git push
- Environment changes don't auto-update running apps

---

## 🎯 STEP-BY-STEP RESOLUTION

### 1. Verify Backend is Running

```bash
curl https://your-backend.onrender.com/actuator/health
```

**If fails:** Backend is not running. Check Render Dashboard.

### 2. Test API Endpoints

```bash
curl https://your-backend.onrender.com/api/notes
```

**If fails:** API endpoints not working. Check backend logs.

### 3. Check Vercel Environment Variable

Vercel Dashboard → Settings → Environment Variables

**Verify:**
```
NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
```

**Note:** NO `/api` at end!

### 4. Redeploy Frontend

Vercel Dashboard → Deployments → Redeploy

**Wait:** 3-5 minutes

### 5. Test Frontend

Visit: `https://your-frontend.vercel.app/api-test`

**Should show:**
- ✅ Health Check: Success
- ✅ Notes API: Success
- ✅ SSH Commands API: Success

### 6. Check Browser Console

F12 → Console

**Look for:**
```javascript
API Request: GET /notes
API Response: 200 /notes
```

**If CORS error:**
- Update backend CORS config
- Push to GitHub
- Wait for Render to redeploy

---

## 📝 VERIFICATION COMMANDS

```bash
# Test backend health
curl https://YOUR-BACKEND.onrender.com/actuator/health

# Test notes API
curl https://YOUR-BACKEND.onrender.com/api/notes

# Test SSH commands API
curl https://YOUR-BACKEND.onrender.com/api/ssh

# Test CORS (from browser console)
fetch('https://YOUR-BACKEND.onrender.com/api/notes')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## ✅ SUCCESS INDICATORS

When everything works:

1. **Backend:**
   - ✅ Render status: Live
   - ✅ Health check: `{"status":"UP"}`
   - ✅ API returns data

2. **Frontend:**
   - ✅ No CORS errors in console
   - ✅ API requests succeed
   - ✅ Notes load
   - ✅ SSH commands load

3. **Integration:**
   - ✅ Can create notes
   - ✅ Can edit notes
   - ✅ Can delete notes
   - ✅ Data persists after refresh

---

## 🆘 STILL NOT WORKING?

### Check These:

1. **Backend URL in Vercel**
   ```
   Settings → Environment Variables → NEXT_PUBLIC_API_URL
   ```

2. **Backend Logs in Render**
   ```
   Dashboard → Your Service → Logs
   Look for errors
   ```

3. **CORS Configuration**
   ```yaml
   # backend/src/main/resources/application-production.yml
   cors:
     allowed-origins: YOUR-ACTUAL-VERCEL-URL
   ```

4. **Frontend Redeployed?**
   ```
   After changing env vars, MUST redeploy!
   ```

---

## 📞 QUICK COMMAND REFERENCE

```bash
# Push backend changes
cd backend
git add .
git commit -m "Fix CORS"
git push origin main

# Update Vercel env var
# Do this in Vercel Dashboard, then:

# Trigger Vercel redeploy
git commit --allow-empty -m "Redeploy frontend"
git push origin main

# Or manually redeploy in Vercel Dashboard
```

---

**Debug Page Created:** `/api-test`  
**Visit:** https://your-frontend.vercel.app/api-test  
**Status:** Ready for debugging! 🔍

