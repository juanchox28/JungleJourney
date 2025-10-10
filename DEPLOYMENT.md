# Deployment Guide

This guide explains how to deploy the JungleJourney application with backend on fly.io and frontend as static files on Hostinger.

## Prerequisites

- fly.io account and CLI installed
- Hostinger account with static hosting
- Neon PostgreSQL database set up

## Backend Deployment (fly.io)

### 1. Configure fly.toml

Update `fly.toml` with your app name:
```toml
app = "your-actual-app-name"
```

### 2. Set Environment Variables

Before deploying, set the required environment variables:

```bash
fly secrets set DATABASE_URL="your-neon-database-url"
```

The following are already configured in fly.toml:
- NODE_ENV=production
- SERVE_STATIC=false (prevents serving static files, API-only mode)

### 3. Deploy to fly.io

```bash
fly launch
```

This will build and deploy your backend API.

### 4. Get the API URL

After deployment, note your fly.io app URL (e.g., `https://your-app.fly.dev`). You'll need this for the frontend.

## Frontend Deployment (Hostinger)

### 1. Build Static Files

```bash
npm run build:client
```

This creates static files in `dist/public/`.

### 2. Set API Base URL

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-app.fly.dev
```

Then rebuild:

```bash
npm run build:client
```

### 3. Upload to Hostinger

Upload the contents of `dist/public/` to your Hostinger static hosting directory.

## Environment Variables Summary

### fly.io (Backend)
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `PORT`: Automatically set by fly.io
- `NODE_ENV`: production
- `SERVE_STATIC`: false

### Build Time (Frontend)
- `VITE_API_BASE_URL`: Your fly.io app URL (e.g., https://your-app.fly.dev)

## Post-Deployment

1. Verify the frontend loads on Hostinger
2. Test API calls from frontend to backend
3. Check database connectivity
4. Run database migrations if needed: `npm run db:push` (locally with DATABASE_URL set)

## Troubleshooting

- If API calls fail, check CORS settings in your Express server
- Ensure VITE_API_BASE_URL is set correctly and rebuilt
- Verify DATABASE_URL is set in fly.io secrets