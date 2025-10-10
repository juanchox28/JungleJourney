# Automated Deployment Setup

This guide explains how to set up one-click deployment for your full-stack JungleJourney app from VS Code.

## 🚀 **One-Click Deployment Overview**

When you push to the `main` branch, GitHub Actions will automatically:
1. **Deploy backend** to fly.io
2. **Build frontend** with correct API URLs
3. **Deploy frontend** to Hostinger via FTP

## 📋 **Prerequisites**

1. **GitHub Repository**: Push your code to GitHub
2. **fly.io Account**: With API token
3. **Hostinger Account**: With FTP access

## 🔑 **Required GitHub Secrets**

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

### **Backend Secrets (fly.io)**
```
FLY_API_TOKEN=your_fly_api_token
DATABASE_URL=postgres://juanchox28:1180parceros@mi-app-db.flycast:5432/amazondb
```

### **Frontend Secrets (Hostinger FTP)**
```
HOSTINGER_FTP_HOST=your-ftp-host (e.g., ftp.yourdomain.com)
HOSTINGER_FTP_USERNAME=your-ftp-username
HOSTINGER_FTP_PASSWORD=your-ftp-password
```

## 🛠️ **Setup Steps**

### **1. Get fly.io API Token**
```bash
fly auth token
```
Copy the token and add as `FLY_API_TOKEN` secret.

### **2. Get Hostinger FTP Details**
- **Host**: Usually `ftp.yourdomain.com` or your server's IP
- **Username**: Your FTP username
- **Password**: Your FTP password

### **3. Configure Repository**
Ensure your repo has:
- ✅ `.github/workflows/build.yml` (created)
- ✅ `fly.toml` with correct app name
- ✅ `.env` with API URL

### **4. Push to Trigger Deployment**
```bash
git add .
git commit -m "Setup automated deployment"
git push origin main
```

## 🎯 **How It Works**

### **Backend Deployment**
- Builds Docker image with Node.js 18
- Deploys to fly.io using `flyctl`
- Uses your `DATABASE_URL` for database connection

### **Frontend Deployment**
- Builds with `VITE_API_BASE_URL=https://jungle-tours-backend.fly.dev`
- Uploads via FTP to Hostinger `public_html/` directory
- Excludes development files

### **Backup Artifact**
- If FTP fails, creates downloadable artifact
- Available for 7 days in Actions → Artifacts

## 📊 **Monitoring Deployment**

### **Check Status**
- GitHub: Actions tab → Latest workflow
- fly.io: Dashboard → Your app
- Hostinger: Check your website

### **Logs**
- **Backend**: `fly logs`
- **Frontend**: GitHub Actions logs
- **FTP**: Check Hostinger file manager

## 🐛 **Troubleshooting**

### **Backend Issues**
```bash
fly status
fly logs
```

### **Frontend Issues**
- Check GitHub Actions logs
- Verify FTP credentials
- Ensure Hostinger FTP is enabled

### **Manual Deployment**
If automated deployment fails:
```bash
# Backend
fly deploy

# Frontend (after building)
# Upload dist/public/ to Hostinger manually
```

## 🎉 **Success Indicators**

✅ **Backend**: `https://jungle-tours-backend.fly.dev/api/tours` returns data
✅ **Frontend**: Your domain loads and shows tours
✅ **API Calls**: No CORS or network errors in browser console

## 🔄 **Future Improvements**

- Add staging environment
- Implement blue-green deployments
- Add automated testing before deployment
- Set up monitoring and alerts

---

**Need help?** Check the GitHub Actions logs or fly.io dashboard for detailed error messages!