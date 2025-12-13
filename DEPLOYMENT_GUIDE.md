# 🚀 FULL DEPLOYMENT GUIDE

**Project:** Dev Helper  
**Date:** December 13, 2025  
**Status:** Ready to Deploy

---

## 📋 OVERVIEW

```
Frontend (Vercel)          Backend (Render)
┌─────────────────┐       ┌──────────────────┐
│   Next.js App   │◄─────►│  Spring Boot API │
│   Port: 3000    │       │   Port: 10000    │
└─────────────────┘       └──────────────────┘
        ▲                          ▲
        │                          │
    Vercel CDN              Render Cloud
    Global Edge             Singapore Region
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Ready:
- [x] Frontend build configured
- [x] Backend build configured
- [x] Environment files created
- [x] CORS configured
- [x] File Storage configured
- [x] Firebase disabled

### Services Ready:
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Render account (free)
- [ ] Code pushed to GitHub

---

## 🎯 DEPLOYMENT STEPS

### STEP 1: Push to GitHub ⏱️ 2 minutes

```bash
cd D:\learn\devhelper

# Add all files
git add .

# Commit
git commit -m "Add deployment configuration"

# Push
git push origin main
```

**✅ Verify:** Code visible on GitHub

---

### STEP 2: Deploy Frontend to Vercel ⏱️ 5 minutes

#### A. Go to Vercel
1. Visit: https://vercel.com/new
2. Login with GitHub

#### B. Import Project
1. Click "Import Git Repository"
2. Select: `devhelper`
3. Click "Import"

#### C. Configure
```
Framework: Next.js (auto-detected)
Root Directory: frontend
Build Command: npm run build (auto)
Output Directory: .next (auto)
```

#### D. Add Environment Variable
```
Key: NEXT_PUBLIC_API_URL
Value: https://devhelper-backend.onrender.com
(You'll update this after backend deployment)
```

#### E. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Copy your URL: `https://devhelper-xxx.vercel.app`

**✅ Verify:** Site loads (APIs won't work yet)

---

### STEP 3: Deploy Backend to Render ⏱️ 10 minutes

#### A. Go to Render
1. Visit: https://render.com
2. Login with GitHub

#### B. Create Web Service
1. Click "New +" → "Web Service"
2. Connect repository: `devhelper`
3. Click "Connect"

#### C. Configure Service
```
Name: devhelper-backend
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Java
Build Command: mvn clean package -DskipTests
Start Command: java -jar target/devhelper-backend-1.0.0.jar
Plan: Free
```

#### D. Environment Variables

Click "Advanced" → Add these:

| Key | Value |
|-----|-------|
| `JAVA_TOOL_OPTIONS` | `-Xmx512m -Xms256m` |
| `SPRING_PROFILES_ACTIVE` | `production` |
| `SERVER_PORT` | `10000` |
| `FILE_STORAGE_BASE_PATH` | `/opt/render/project/data` |
| `FIREBASE_ENABLED` | `false` |

#### E. Add Persistent Disk

Scroll to "Disks" → "Add Disk":
```
Name: devhelper-data
Mount Path: /opt/render/project/data
Size: 1 GB
```

#### F. Deploy
- Click "Create Web Service"
- Wait 5-10 minutes
- Copy your URL: `https://devhelper-backend-xxx.onrender.com`

**✅ Verify:** 
```bash
curl https://your-backend-url.onrender.com/actuator/health
# Should return: {"status":"UP"}
```

---

### STEP 4: Update Frontend with Backend URL ⏱️ 2 minutes

#### A. Update Environment Variable

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Edit `NEXT_PUBLIC_API_URL`
5. Update value to: `https://your-backend-url.onrender.com`
6. Save

#### B. Redeploy Frontend

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Or push a commit:**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

**✅ Verify:** Frontend can now call backend APIs

---

### STEP 5: Test Full Application ⏱️ 5 minutes

#### Test Frontend:
1. Visit: `https://your-frontend.vercel.app`
2. Try tools:
   - JSON Formatter
   - Regex Tester
   - Notes (create, edit, delete)
   - SSH Commands

#### Test Backend:
```bash
# Health check
curl https://your-backend.onrender.com/actuator/health

# Get notes
curl https://your-backend.onrender.com/api/notes

# Get SSH commands
curl https://your-backend.onrender.com/api/ssh
```

#### Test Integration:
1. Open frontend
2. Open browser DevTools → Network tab
3. Use any tool
4. Check API calls to backend
5. Verify responses

**✅ All tests pass? You're live! 🎉**

---

## 📊 DEPLOYMENT SUMMARY

| Component | Platform | URL | Time |
|-----------|----------|-----|------|
| Frontend | Vercel | https://devhelper-xxx.vercel.app | 5 min |
| Backend | Render | https://devhelper-backend-xxx.onrender.com | 10 min |
| **Total** | - | - | **~20 min** |

---

## 🔧 POST-DEPLOYMENT

### Update CORS (if needed)

If frontend domain changed:

1. Edit `backend/src/main/resources/application-production.yml`
2. Update `cors.allowed-origins`
3. Push to GitHub (auto-redeploys)

### Custom Domain (Optional)

#### Frontend (Vercel):
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Configure DNS

#### Backend (Render):
1. Render Dashboard → Settings → Custom Domain
2. Add your domain
3. Configure DNS

---

## ⚠️ IMPORTANT NOTES

### Free Tier Limitations:

**Vercel:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ No sleep

**Render:**
- ⚠️ Sleeps after 15 minutes inactivity
- ⚠️ 512 MB RAM
- ⚠️ 750 hours/month (enough for 24/7)

### Keep Backend Alive:

Use **UptimeRobot** (free):
1. Sign up: https://uptimerobot.com
2. Add monitor: `https://your-backend.onrender.com/actuator/health`
3. Check interval: 5 minutes
4. Your backend stays awake!

---

## 🔄 UPDATING YOUR APP

### Frontend Changes:
```bash
cd D:\learn\devhelper\frontend
# Make changes
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys!
```

### Backend Changes:
```bash
cd D:\learn\devhelper\backend
# Make changes
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys!
```

---

## 🐛 TROUBLESHOOTING

### Frontend Issues:

**Site not loading:**
- Check build logs in Vercel
- Verify no TypeScript errors
- Check browser console

**API calls failing:**
- Verify backend URL in env vars
- Check CORS settings
- Check Network tab in DevTools

### Backend Issues:

**Build failing:**
- Check Maven build logs in Render
- Test build locally: `mvn clean package`
- Verify Java 17 used

**App crashing:**
- Check logs in Render Dashboard
- Verify environment variables
- Check disk is mounted

**Data not persisting:**
- Verify persistent disk configured
- Check mount path: `/opt/render/project/data`

---

## 📈 MONITORING

### Vercel:
- Analytics: View traffic, performance
- Logs: Real-time logs
- Deployments: History

### Render:
- Logs: Application logs
- Metrics: CPU, Memory, Requests
- Events: Deployment history

---

## 💰 COSTS

### Current Setup: **FREE** ✅

**Vercel Free:**
- 100 GB bandwidth
- Unlimited deployments
- All features included

**Render Free:**
- 512 MB RAM
- 750 hours/month
- 1 GB disk storage

**Total:** $0/month! 🎉

### If you outgrow free tier:

**Vercel Pro:** $20/month
- Unlimited bandwidth
- Team features
- Analytics

**Render Starter:** $7/month
- No sleep
- 512 MB RAM
- Better performance

---

## 📞 QUICK COMMANDS

```bash
# Test frontend build locally
cd frontend && npm run build

# Test backend build locally
cd backend && mvn clean package -DskipTests

# Deploy both
git push origin main

# Check backend health
curl https://your-backend.onrender.com/actuator/health

# View frontend
open https://your-frontend.vercel.app
```

---

## ✅ SUCCESS CHECKLIST

Deployment complete when:

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] API calls work
- [ ] Data persists (create note, refresh page)
- [ ] All tools functional
- [ ] No console errors

---

## 🎉 CONGRATULATIONS!

Your Dev Helper app is now **LIVE** and accessible worldwide! 🌍

**Share your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

## 📚 RESOURCES

### Documentation:
- Frontend: `FRONTEND_DEPLOYMENT_QUICK_START.md`
- Backend: `BACKEND_DEPLOYMENT.md`
- Firebase: `FIREBASE_DISABLED.md`
- File Storage: `FILE_STORAGE.md`

### Support:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Project Issues: Create GitHub issue

---

**Deployment Date:** December 13, 2025  
**Total Time:** ~20 minutes  
**Cost:** FREE  
**Status:** Production Ready! 🚀

