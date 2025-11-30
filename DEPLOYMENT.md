# Deployment Guide

This guide explains how to deploy the JungleJourney application with backend on Railway and frontend on Hostinger.

## Prerequisites

- Railway account
- Hostinger account with static hosting
- GitHub repository connected to Railway

## Backend Deployment (Railway)

### 1. Connect Repository to Railway

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Railway will auto-detect the Dockerfile and deploy

### 2. Set Environment Variables

In Railway dashboard → Variables, set:
- `DATABASE_URL`: Your database connection string (if using)
- `SERVE_STATIC`: `false` (API-only mode)
- `NODE_ENV`: `production`
- Other secrets (WOMPI keys, email credentials, etc.)

### 3. Get the API URL

After deployment, Railway provides a URL like:
`https://jungle-tours-backend-production.up.railway.app`

## Frontend Deployment (Hostinger)

### 1. Set API Base URL

Create/update `.env.production`:
```env
VITE_API_BASE_URL=https://jungle-tours-backend-production.up.railway.app
```

### 2. Build Static Files

```bash
npm run build:client:prod
```

This creates static files in `dist/public/`.

### 3. Upload to Hostinger

Upload the contents of `dist/public/` to your Hostinger directory via FTP.

## Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow (`.github/workflows/railway-deploy.yml`) that automatically:
1. Deploys backend to Railway on push to main
2. Builds and deploys frontend to Hostinger via FTP

### Required GitHub Secrets

Set these in GitHub → Settings → Secrets:
- `RAILWAY_TOKEN`: Railway API token
- `RAILWAY_SERVICE_NAME`: Your Railway service name
- `HOSTINGER_FTP_HOST`: FTP hostname
- `HOSTINGER_FTP_USERNAME`: FTP username
- `HOSTINGER_FTP_PASSWORD`: FTP password

## Environment Variables Summary

### Railway (Backend)
- `DATABASE_URL`: Database connection string
- `PORT`: Auto-set by Railway
- `NODE_ENV`: production
- `SERVE_STATIC`: false
- `WOMPI_PUBLIC_KEY`: Wompi public key
- `WOMPI_PRIVATE_KEY`: Wompi private key
- `FRONTEND_URL`: https://ayahuascapuertonarino.com

### Build Time (Frontend)
- `VITE_API_BASE_URL`: Railway backend URL

## Post-Deployment

1. Verify frontend loads on Hostinger
2. Test API calls from frontend to backend
3. Check `/health` endpoint
4. Test booking flow

## Troubleshooting

- If API calls fail, check CORS settings
- Ensure `VITE_API_BASE_URL` is set correctly
- Check Railway logs for backend errors
- Verify all environment variables are set