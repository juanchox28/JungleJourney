# Development Workflow Guide

## Overview
This guide explains how to set up and use the seamless development workflow for the JungleJourney web project, enabling testing on localhost and production environments without code changes.

## Project Structure
- **Frontend**: React/Vite application hosted on Hostinger (`ayahuascapuertonarino.com`)
- **Backend**: Express/Node.js API deployed on Fly.io (`jungle-tours-backend.fly.dev`)
- **Deployment**: Automated via GitHub Actions

## Local Development Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- Local database (PostgreSQL recommended, or update `DATABASE_URL` for other DBs)

### Environment Files
The project uses environment-specific `.env` files:

- `client/.env.development`: Frontend dev config
- `client/.env.production`: Frontend prod config
- `server/.env.development`: Backend dev config
- `server/.env.production`: Backend prod config

### Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up local database**:
   - Create a PostgreSQL database
   - Update `server/.env.development` with your local DB URL
   - Run migrations: `npm run db:push`

3. **Start development server**:
   ```bash
   ./run-dev.sh
   # or
   npm run dev
   ```

4. **Access the application**:
   - Frontend: `http://localhost:5000`
   - Admin panel: `http://localhost:5000/admin` (password: `admin123`)

### Testing Key Features

#### Admin Access
1. Navigate to `http://localhost:5000/admin`
2. Enter password: `admin123`
3. Verify dashboard loads without errors

#### Room Bookings
1. Go to `http://localhost:5000/hotel-booking`
2. Select check-in/check-out dates and number of guests
3. Choose rooms and quantities
4. Fill booking form (use test email)
5. Submit booking
6. Verify success redirect and email confirmation

### Debug Mode
For detailed logging:
```bash
npm run dev:debug
```

## Production Testing

### Prerequisites
- Fly.io account and CLI installed
- Hostinger hosting account
- GitHub repository with Actions enabled

### Environment Setup

1. **Fly.io Secrets** (Backend):
   ```bash
   fly secrets set DATABASE_URL="your-prod-db-url"
   fly secrets set WOMPI_PRIVATE_KEY="your-prod-wompi-key"
   fly secrets set WOMPI_PUBLIC_KEY="your-prod-wompi-public-key"
   fly secrets set EMAIL_USER="paraisoayahuasca@gmail.com"
   fly secrets set EMAIL_PASS="your-email-password"
   fly secrets set FRONTEND_URL="https://ayahuascapuertonarino.com"
   fly secrets set ADMIN_PASSWORD="your-secure-admin-password"
   ```

2. **Hostinger Setup** (Frontend):
   - Upload `dist/public/` directory after build
   - Ensure domain points to uploaded files

### Deployment

#### Automated (Recommended)
1. Push to `main` branch
2. GitHub Actions automatically:
   - Builds frontend with production config
   - Deploys backend to Fly.io
   - Uploads frontend to Hostinger via FTP

#### Manual
1. **Deploy backend**:
   ```bash
   npm run deploy:server
   ```

2. **Deploy frontend**:
   ```bash
   npm run deploy:client
   # Then manually upload dist/public/ to Hostinger
   ```

### Testing in Production

#### Admin Access
1. Navigate to `https://ayahuascapuertonarino.com/admin`
2. Enter production admin password
3. Verify dashboard loads

#### Room Bookings
1. Go to `https://ayahuascapuertonarino.com/hotel-booking`
2. Complete booking flow with real payment (use small test amounts)
3. Verify success page and email confirmation

## Environment Switching

### No Code Changes Required
- **Local**: Run `npm run dev` (uses `.env.development` files)
- **Production**: Deploy via GitHub Actions or manual commands (uses `.env.production` and Fly.io secrets)

### Switching Between Environments
1. **Local ↔ Production**: Change `NODE_ENV` or use different build modes
2. **Frontend**: Vite automatically loads correct `.env` file based on `--mode`
3. **Backend**: `dotenv` loads file based on `NODE_ENV`

## Troubleshooting

### Common Issues

#### Admin Access Blocked
- **Local**: Check `server/.env.development` has `ADMIN_PASSWORD=admin123`
- **Production**: Verify Fly.io secret `ADMIN_PASSWORD` is set correctly
- **CORS**: Ensure `FRONTEND_URL` allows your domain

#### Booking Creation Failing
- **API URL**: Check `VITE_API_BASE_URL` in client `.env` file
- **Backend Route**: Verify `/api/create-accommodation-booking` exists in `server/routes.ts`
- **Env Vars**: Ensure Wompi keys and DB URL are correct
- **CORS**: Check allowed origins in `server/index.ts`

#### Build Failures
- **Frontend**: Check GitHub Actions logs for Vite errors
- **Backend**: Check Fly.io deployment logs
- **Env Files**: Ensure `.env` files exist and have correct syntax

#### Database Issues
- **Local**: Verify local DB is running and URL is correct
- **Production**: Check Fly.io secret `DATABASE_URL`

### Debug Steps
1. Check browser console for client-side errors
2. Check server logs: `fly logs` (production) or terminal (local)
3. Verify environment variables are loaded correctly
4. Test API endpoints directly with tools like Postman

### Rollback Procedures
1. **Fly.io**: `fly deploy --image <previous-image-id>`
2. **Hostinger**: Re-upload previous build from GitHub Actions artifacts
3. **Git**: Revert commit and redeploy

## Monitoring

### Production Monitoring
- **Fly.io**: Use `fly logs` and dashboard for backend metrics
- **Hostinger**: Check hosting analytics
- **GitHub Actions**: Monitor workflow runs and failures

### Health Checks
- API health: `GET /api/version`
- Database: Check booking creation works
- Email: Verify confirmation emails are sent

## Best Practices

1. **Always test locally before production deployment**
2. **Use staging environment for major changes**
3. **Keep environment variables secure (never commit to code)**
4. **Monitor logs regularly for errors**
5. **Document any custom configurations**

## Support

If issues persist:
1. Check this guide and `plan.md` for detailed architecture
2. Review GitHub Actions workflow files
3. Check Fly.io and Hostinger documentation
4. Examine browser dev tools and server logs for error details