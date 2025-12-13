# 🚀 RENDER DEPLOYMENT - BACKEND

**Platform:** Render (Backend Hosting)  
**Framework:** Spring Boot (Java 17)  
**Deployment Time:** ~5-10 minutes

---

## ✅ FILES CREATED

```
backend/
├── src/main/resources/
│   └── application-production.yml  ✅ Production config
│
render.yaml                          ✅ Render configuration
```

---

## 🎯 DEPLOYMENT METHOD: Render Dashboard

### Step 1: Sign Up / Login

1. Go to: https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your repositories

---

### Step 2: Create Web Service

1. **Click "New +" → "Web Service"**

2. **Connect Repository**
   - Select: `devhelper`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: devhelper-backend
   Region: Singapore (closest to Vietnam)
   Branch: main
   Environment: Docker
   Dockerfile Path: ./backend/Dockerfile
   Docker Context: ./backend
   ```

4. **Plan**
   - Select: **Free** (512 MB RAM, 750 hours/month)

5. **Advanced Settings**
   - Auto-Deploy: **Yes**
   - Health Check Path: `/actuator/health`

---

### Step 3: Environment Variables

Click "Advanced" → Add Environment Variables:

| Key | Value |
|-----|-------|
| `JAVA_TOOL_OPTIONS` | `-Xmx512m -Xms256m` |
| `SPRING_PROFILES_ACTIVE` | `production` |
| `SERVER_PORT` | `10000` |
| `FILE_STORAGE_BASE_PATH` | `/opt/render/project/data` |
| `FIREBASE_ENABLED` | `false` |

---

### Step 4: Add Persistent Disk (Important!)

1. Scroll to "Disks"
2. Click "Add Disk"
3. Configure:
   ```
   Name: devhelper-data
   Mount Path: /opt/render/project/data
   Size: 1 GB (free tier)
   ```

This stores your notes and SSH commands permanently!

---

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for:
   - Build (mvn package)
   - Deploy
   - Health check

3. Your backend will be live at:
   ```
   https://devhelper-backend-xxx.onrender.com
   ```

---

## 🧪 TESTING

### Health Check
```bash
curl https://your-app.onrender.com/actuator/health

# Expected response:
{"status":"UP"}
```

### Test Notes API
```bash
curl https://your-app.onrender.com/api/notes

# Should return array of notes
```

### Test SSH Commands API
```bash
curl https://your-app.onrender.com/api/ssh

# Should return array of SSH commands
```

---

## ⚙️ RENDER.YAML (Auto Configuration)

The `render.yaml` file is already created at project root. When Render detects this file, it will:

✅ Auto-configure Docker service  
✅ Set environment variables  
✅ Configure disk storage  
✅ Set health check path  

**Configuration:**
```yaml
env: docker
dockerfilePath: ./backend/Dockerfile
dockerContext: ./backend
```

**Note:** You can deploy using `render.yaml` OR manual configuration (both work)

---

## 🔄 AUTO DEPLOYMENT

Once connected to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main

# Render auto-deploys! 🚀
```

**Deployment triggers:**
- ✅ Push to main branch
- ✅ Merge pull request
- ✅ Manual deploy button

---

## ⚠️ IMPORTANT: Free Tier Limitations

### Sleep After Inactivity
- ⚠️ Backend **sleeps** after 15 minutes of inactivity
- ⏱️ Takes 30-60 seconds to wake up on first request
- ✅ Stays awake while actively used

### Keep-Alive Solutions:

**Option 1: Use a cron service**
```bash
# Ping every 10 minutes
*/10 * * * * curl https://your-app.onrender.com/actuator/health
```

**Option 2: Use UptimeRobot (Free)**
- https://uptimerobot.com
- Monitor URL every 5 minutes
- Keeps your app awake

---

## 📊 RENDER DASHBOARD FEATURES

After deployment:

- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory usage
- **Events**: Deployment history
- **Shell**: Access terminal
- **Disk**: View stored files

---

## 🔧 CONFIGURATION DETAILS

### application-production.yml

Key settings:
```yaml
# Server runs on Render's assigned port
server:
  port: ${PORT:10000}

# CORS allows Vercel domain
cors:
  allowed-origins: https://devhelper.vercel.app,https://*.vercel.app

# File storage in persistent disk
file:
  storage:
    base-path: /opt/render/project/data

# Firebase disabled (using File Storage)
firebase:
  enabled: false
```

---

## 🎯 UPDATE FRONTEND

After backend is deployed, update frontend with actual URL:

```bash
# Edit frontend/.env.production
NEXT_PUBLIC_API_URL=https://devhelper-backend-xxx.onrender.com

# Redeploy frontend
git push origin main
```

---

## 🐛 TROUBLESHOOTING

### Build Fails

**Check logs in Render Dashboard:**
- Look for Maven errors
- Check Java version (must be 17+)
- Verify pom.xml is valid

**Common fixes:**
```bash
# Test build locally first
cd backend
mvn clean package -DskipTests

# Fix any errors, then push
```

### App Crashes on Start

**Check logs for:**
- Port binding errors (use ${PORT})
- Missing dependencies
- File permission errors

**Solutions:**
- Verify `JAVA_TOOL_OPTIONS` set correctly
- Check disk is mounted
- Ensure `SERVER_PORT=10000`

### Data Not Persisting

**Ensure persistent disk is configured:**
- Mount path: `/opt/render/project/data`
- Size: 1 GB
- Check in Dashboard → Disks

### CORS Errors from Frontend

**Update CORS in application-production.yml:**
```yaml
cors:
  allowed-origins: https://your-frontend.vercel.app
```

Then redeploy.

---

## 📝 POST-DEPLOYMENT CHECKLIST

- [ ] Backend deployed successfully
- [ ] Health check returns `{"status":"UP"}`
- [ ] API endpoints respond (test with curl)
- [ ] Persistent disk configured
- [ ] Environment variables set
- [ ] CORS allows frontend domain
- [ ] Update frontend with backend URL
- [ ] Redeploy frontend

---

## 🔄 DEPLOYMENT UPDATES

### Manual Redeploy:
1. Go to Render Dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

### Auto Redeploy:
```bash
git push origin main
# Render auto-detects and deploys
```

---

## 💡 TIPS

### 1. View Logs
```
Dashboard → Your Service → Logs
```
Real-time logs help debug issues.

### 2. Access Shell
```
Dashboard → Your Service → Shell
```
SSH into your container to debug.

### 3. Check Disk Usage
```
Dashboard → Your Service → Disks
```
See files in persistent storage.

### 4. Monitor Performance
```
Dashboard → Your Service → Metrics
```
View CPU, memory, request stats.

---

## 🎉 SUCCESS INDICATORS

- ✅ Build succeeds
- ✅ Service is live (green status)
- ✅ Health check passes
- ✅ API endpoints respond
- ✅ Data persists across restarts
- ✅ Frontend can connect to backend

---

## 📞 QUICK REFERENCE

| Task | Location |
|------|----------|
| **Deploy** | Dashboard → Manual Deploy |
| **Logs** | Dashboard → Logs |
| **Env Vars** | Dashboard → Environment |
| **Disk** | Dashboard → Disks |
| **Shell** | Dashboard → Shell |
| **Metrics** | Dashboard → Metrics |

---

## 🔗 USEFUL LINKS

- Render Dashboard: https://dashboard.render.com
- Documentation: https://render.com/docs
- Status Page: https://status.render.com
- Community: https://community.render.com

---

## ✅ NEXT STEPS

1. ✅ Backend deployed on Render
2. ⏳ Update frontend with backend URL
3. ⏳ Redeploy frontend
4. ⏳ Test full application
5. ⏳ Set up keep-alive (optional)

---

**Ready to deploy backend?** 🚀

1. Push to GitHub
2. Go to render.com
3. Create Web Service
4. Configure & Deploy!

**Deployment time: ~10 minutes** ⏱️

