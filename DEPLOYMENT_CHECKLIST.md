# ✅ DEPLOYMENT CHECKLIST

Use this checklist to track your deployment progress.

---

## 📋 PRE-DEPLOYMENT

### Setup Accounts
- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Vercel account created (vercel.com)
- [ ] Render account created (render.com)

### Verify Files
- [ ] frontend/vercel.json exists
- [ ] frontend/.env.production exists
- [ ] render.yaml exists
- [ ] backend/src/main/resources/application-production.yml exists

---

## 🎯 FRONTEND DEPLOYMENT (Vercel)

### Configure
- [ ] Go to vercel.com/new
- [ ] Import GitHub repository
- [ ] Set root directory: `frontend`
- [ ] Framework detected: Next.js ✓
- [ ] Add environment variable: `NEXT_PUBLIC_API_URL`
- [ ] Temporary value: `https://devhelper-backend.onrender.com`

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Copy frontend URL: _________________
- [ ] Verify site loads

---

## 🎯 BACKEND DEPLOYMENT (Render)

### Configure Service
- [ ] Go to render.com → New Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory: `backend`
- [ ] Set runtime: Java
- [ ] Build command: `mvn clean package -DskipTests`
- [ ] Start command: `java -jar target/devhelper-backend-1.0.0.jar`
- [ ] Plan: Free

### Environment Variables
- [ ] `JAVA_TOOL_OPTIONS` = `-Xmx512m -Xms256m`
- [ ] `SPRING_PROFILES_ACTIVE` = `production`
- [ ] `SERVER_PORT` = `10000`
- [ ] `FILE_STORAGE_BASE_PATH` = `/opt/render/project/data`
- [ ] `FIREBASE_ENABLED` = `false`

### Persistent Disk
- [ ] Add disk
- [ ] Name: `devhelper-data`
- [ ] Mount path: `/opt/render/project/data`
- [ ] Size: 1 GB

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait 5-10 minutes for build
- [ ] Copy backend URL: _________________
- [ ] Verify health check: `curl [URL]/actuator/health`

---

## 🔄 UPDATE FRONTEND

### Update Environment Variable
- [ ] Go to Vercel Dashboard
- [ ] Select project → Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_API_URL` with actual backend URL
- [ ] Save changes

### Redeploy
- [ ] Go to Deployments tab
- [ ] Click "Redeploy" on latest deployment
- [ ] Wait for redeploy to complete

---

## 🧪 TESTING

### Frontend Tests
- [ ] Site loads correctly
- [ ] No console errors
- [ ] All pages accessible
- [ ] Home page displays all tools

### Backend Tests
- [ ] Health check: `curl [URL]/actuator/health` → `{"status":"UP"}`
- [ ] Notes API: `curl [URL]/api/notes` → Returns array
- [ ] SSH API: `curl [URL]/api/ssh` → Returns array

### Integration Tests
- [ ] Open frontend in browser
- [ ] Test JSON Formatter tool
- [ ] Test Regex Tester tool
- [ ] Create a note
- [ ] Refresh page → Note persists
- [ ] Create SSH command
- [ ] Refresh page → Command persists
- [ ] Edit note
- [ ] Delete note
- [ ] Pin/unpin note

### Browser Tests
- [ ] Chrome: Works ✓
- [ ] Firefox: Works ✓
- [ ] Safari: Works ✓
- [ ] Mobile: Works ✓

---

## 🎯 POST-DEPLOYMENT

### Optional but Recommended
- [ ] Set up UptimeRobot to prevent backend sleep
  - URL: https://uptimerobot.com
  - Monitor: `[backend-url]/actuator/health`
  - Interval: 5 minutes

- [ ] Configure custom domain (optional)
  - Frontend: Vercel Dashboard → Domains
  - Backend: Render Dashboard → Settings

- [ ] Enable analytics (optional)
  - Vercel Analytics
  - Google Analytics

---

## 📊 SUCCESS CRITERIA

Your deployment is successful when:

- [x] Frontend deployed and accessible
- [x] Backend deployed and healthy
- [x] API calls working
- [x] Data persists correctly
- [x] All tools functional
- [x] No errors in console
- [x] Response times acceptable

---

## 🐛 TROUBLESHOOTING

### If frontend fails:
- [ ] Check build logs in Vercel
- [ ] Test build locally: `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Check environment variables

### If backend fails:
- [ ] Check build logs in Render
- [ ] Test build locally: `mvn clean package`
- [ ] Verify Java 17 installed
- [ ] Check environment variables
- [ ] Verify disk is mounted

### If API calls fail:
- [ ] Verify backend URL in frontend env
- [ ] Check CORS settings
- [ ] Test API with curl
- [ ] Check browser Network tab

---

## 📝 DEPLOYMENT INFO

**Record your URLs here:**

```
Frontend URL: _______________________________
Backend URL:  _______________________________

Deployment Date: _______________________________
Deployed By:     _______________________________
```

---

## ✅ COMPLETION

### Final Checks
- [ ] Both platforms deployed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Team notified
- [ ] URLs shared

**Deployment Status:** 
- [ ] 🟢 Complete and Working
- [ ] 🟡 Deployed but Issues
- [ ] 🔴 Failed - Needs Fix

---

## 📞 HELP

If stuck:
1. Check DEPLOYMENT_GUIDE.md
2. Review platform logs
3. Test locally first
4. Check documentation

**Congratulations on your deployment!** 🎉

