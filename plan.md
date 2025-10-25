# Development Workflow Setup Plan: Seamless Localhost ↔ Production Testing

## Overview
This plan outlines the implementation of a seamless development workflow for the JungleJourney web project, enabling testing on localhost and production environments without requiring code changes. The project consists of:
- **Frontend**: React/Vite application hosted statically on Hostinger (`ayahuascapuertonarino.com`)
- **Backend**: Express/Node.js API deployed on Fly.io (`jungle-tours-backend.fly.dev`)
- **Deployment**: Automated via GitHub Actions workflows
- **Issues to Resolve**: Admin access blocked, room booking creation failing

## Architecture Principles
1. **Environment Abstraction**: All environment-specific values (URLs, keys, DB connections) stored in `.env` files
2. **Build-Time Injection**: Frontend variables injected during Vite build process
3. **Runtime Configuration**: Backend loads variables via dotenv at startup
4. **Zero Code Changes**: Switching environments requires only `.env` file changes or build mode switches
5. **Security**: Sensitive data never committed to code; stored in platform secrets

## Current State Analysis
- ✅ Existing `.env` files: `client/.env.production`, `server/.env`
- ✅ GitHub Actions workflows: `build.yml` (full stack deploy), `fly-deploy.yml` (backend only)
- ✅ Package scripts: Basic dev/build commands present
- ❌ Missing: Development `.env` files, staging environment, comprehensive testing procedures
- ❌ Issues: Admin auth failing, booking API errors likely due to env mismatches

## Implementation Plan

### Phase 1: Environment Configuration Strategy
**Goal**: Establish robust environment management across all components

1. **Frontend Environment Files**:
   - `client/.env.development`: `VITE_API_BASE_URL=http://localhost:5000`
   - `client/.env.production`: `VITE_API_BASE_URL=https://jungle-tours-backend.fly.dev`
   - `client/.env.staging`: `VITE_API_BASE_URL=https://jungle-tours-backend-staging.fly.dev` (optional)

2. **Backend Environment Files**:
   - `server/.env.development`: Local DB, test keys, localhost frontend URL
   - `server/.env.production`: Production DB, live keys, Hostinger domain
   - `server/.env.staging`: Staging equivalents

3. **Environment Loading Logic**:
   - Frontend: Vite auto-loads based on `--mode` flag
   - Backend: dotenv loads based on `NODE_ENV`

### Phase 2: Local Development Setup
**Goal**: Optimize local testing workflow

1. **Enhanced Scripts**:
   - Update `run-dev.sh` to ensure proper env loading
   - Add `npm run dev:debug` with verbose logging
   - Add `npm run test:e2e` for local end-to-end testing

2. **Local Environment Variables**:
   - Database: Use local PostgreSQL or SQLite
   - Payments: Wompi sandbox keys
   - Email: Test SMTP or console logging
   - CORS: Allow localhost origins

3. **Development Tools**:
   - Hot reload configuration
   - Debug logging for API calls
   - Local SSL certificates (optional)

### Phase 3: Production Environment Configuration
**Goal**: Secure and reliable production deployment

1. **Fly.io Secrets Management**:
   - `DATABASE_URL`: Production database connection
   - `WOMPI_PRIVATE_KEY`: Live payment processing key
   - `WOMPI_PUBLIC_KEY`: Public key for client-side validation
   - `EMAIL_USER/PASS`: Production email credentials
   - `FRONTEND_URL`: `https://ayahuascapuertonarino.com`
   - `ADMIN_PASSWORD`: Secure admin password (not default)

2. **Hostinger Deployment**:
   - FTP credentials stored in GitHub secrets
   - Automated upload of `dist/public/` directory
   - Cache invalidation strategy

3. **Build Optimization**:
   - Production builds with minification
   - Asset optimization
   - Error boundaries for graceful failures

### Phase 4: Deployment Pipeline Improvements
**Goal**: Automate and monitor deployments

1. **GitHub Actions Enhancements**:
   - Add staging deployment on feature branches
   - Implement deployment status notifications
   - Add automated testing before production deploy
   - Rollback capabilities

2. **Multi-Environment Support**:
   - Staging app on Fly.io
   - Staging subdomain on Hostinger
   - Environment-specific build commands

3. **Monitoring & Logging**:
   - Fly.io application logs
   - Error tracking (Sentry integration)
   - Performance monitoring

### Phase 5: Testing Procedures
**Goal**: Comprehensive testing across environments

1. **Local Testing Checklist**:
   - Admin login: `http://localhost:5000/admin` → Enter password → Verify dashboard loads
   - Room booking: Select dates → Choose rooms → Submit form → Check API response
   - Payment flow: Use Wompi sandbox → Verify redirect to success page
   - Error handling: Test invalid inputs, network failures

2. **Production Testing Checklist**:
   - Same as local but with production URLs
   - Use test payment amounts
   - Monitor Fly.io logs for errors
   - Verify email confirmations sent

3. **Automated Testing**:
   - Unit tests for components
   - API integration tests
   - E2E tests with Playwright/Cypress

### Phase 6: Troubleshooting & Rollback
**Goal**: Quick issue resolution and safe rollbacks

1. **Common Issues & Solutions**:
   - Admin access: Check `ADMIN_PASSWORD` env var, verify auth headers
   - Booking failures: Inspect API calls, check Wompi configuration, verify DB connection
   - CORS errors: Update allowed origins in backend
   - Build failures: Check GitHub Actions logs, verify env vars

2. **Rollback Procedures**:
   - Fly.io: `fly deploy --image <previous-image>`
   - Hostinger: Re-upload previous build artifacts
   - Git: Revert commits and redeploy

3. **Debug Tools**:
   - Browser dev tools for frontend
   - Fly.io logs for backend
   - Environment variable inspection scripts

## Implementation Timeline
1. **Week 1**: Environment configuration (Phases 1-2)
2. **Week 2**: Production setup and deployment improvements (Phases 3-4)
3. **Week 3**: Testing procedures and documentation (Phase 5)
4. **Week 4**: Troubleshooting and monitoring (Phase 6)

## Success Criteria
- ✅ Seamless switching between localhost and production without code changes
- ✅ Admin access working in both environments
- ✅ Room booking creation successful with proper error handling
- ✅ Automated deployments reliable and monitored
- ✅ Comprehensive testing procedures documented and followed

## Risks & Mitigations
- **Env Var Mismatches**: Implement validation scripts
- **Downtime During Deploy**: Use blue-green deployments on Fly.io
- **Security Issues**: Regular secret rotation, no hardcoded values
- **Testing Gaps**: Mandatory local testing before production deploys

## Next Steps
1. Review and approve this plan
2. Switch to Code mode for implementation
3. Begin with Phase 1 environment configuration