# 🚀 Vercel Deployment Guide - Frontend

## 📋 Prerequisites

1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Push code to GitHub

---

## 🎯 Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Click "Import Project"

2. **Import Git Repository**
   - Select your GitHub repository: `devhelper`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables**
   - Add variable:
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://devhelper-api.onrender.com`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Navigate to frontend
cd D:\learn\devhelper\frontend

# 4. Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: devhelper
# - Directory: ./ (current)
# - Want to override settings? No

# 5. Deploy to production
vercel --prod
```

---

## ⚙️ Configuration Files

### ✅ Already Created:

1. **`vercel.json`** - Vercel configuration
   - Framework: Next.js
   - API proxy to backend
   - CORS headers
   - Build settings

2. **`.env.production`** - Production environment
   - `NEXT_PUBLIC_API_URL=https://devhelper-api.onrender.com`

3. **`.env.local.example`** - Local development example
   - Copy to `.env.local` for local development

---

## 🔧 Important Settings

### Custom Domain (Optional)

```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS:
# - Type: CNAME
# - Name: @ or www
# - Value: cname.vercel-dns.com
```

### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://devhelper-api.onrender.com
```

---

## 🚦 Auto Deployment

Once connected to GitHub, Vercel will:

✅ Auto deploy on every push to `main` branch
✅ Create preview deployments for PRs
✅ Run build checks
✅ Show deployment status on GitHub

---

## 🧪 Testing Deployment

After deployment:

1. **Check Site**
   ```
   https://your-project.vercel.app
   ```

2. **Test API Connection**
   - Open browser console
   - Try to use any tool (JSON Formatter, Regex Tester, etc.)
   - Check Network tab for API calls

3. **Common Issues**
   - ❌ API not responding → Backend not deployed yet
   - ❌ CORS errors → Check backend CORS settings
   - ❌ 404 errors → Check API_URL environment variable

---

## 📊 Vercel Dashboard Features

- **Deployments**: View all deployments
- **Analytics**: Traffic, performance metrics
- **Logs**: Real-time logs
- **Domains**: Manage custom domains
- **Environment Variables**: Manage env vars

---

## 🔄 Update Deployment

### Automatic (Recommended):
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys!
```

### Manual:
```bash
cd frontend
vercel --prod
```

---

## 📝 Post-Deployment Checklist

- [ ] Site is live
- [ ] All pages load correctly
- [ ] API calls work (after backend deployed)
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] GitHub integration active

---

## 🎯 Next Steps

1. ✅ Frontend deployed on Vercel
2. ⏳ Deploy backend on Render (next step)
3. ⏳ Test full application
4. ⏳ Configure custom domain (optional)

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Check build locally
cd frontend
npm run build

# Fix errors, then push to GitHub
```

### Environment Variable Not Working
- Must start with `NEXT_PUBLIC_` for client-side
- Restart deployment after changing env vars
- Check Vercel Dashboard → Settings → Environment Variables

### CORS Errors
- Backend must allow Vercel domain
- Add to backend CORS config:
  ```
  https://your-project.vercel.app
  https://*.vercel.app
  ```

---

## 📞 Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove devhelper
```

---

## ✅ Success Indicators

- ✅ Build succeeds in Vercel
- ✅ Site loads at Vercel URL
- ✅ No console errors
- ✅ All pages accessible
- ✅ Ready for backend deployment

---

**Deployment Date:** December 13, 2025  
**Platform:** Vercel  
**Status:** Ready to deploy! 🚀

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs
- Status Page: https://vercel-status.com

