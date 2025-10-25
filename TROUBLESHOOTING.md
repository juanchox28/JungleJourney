# Troubleshooting Guide

## Common Issues and Solutions

### Admin Access Issues

#### Problem: Cannot access `/admin` page
**Symptoms**: Page doesn't load or shows 404/403 error

**Solutions**:
1. **Check route configuration**: Ensure `/admin` route exists in `client/src/App.tsx`
2. **Verify authentication**: Admin requires password `admin123` (or production password from Fly.io secrets)
3. **Check environment variables**: Ensure `ADMIN_PASSWORD` is set correctly
4. **CORS issues**: Verify `FRONTEND_URL` in backend allows your domain

**Testing**:
```bash
# Local
curl -I http://localhost:5000/admin

# Production
curl -I https://ayahuascapuertonarino.com/admin
```

#### Problem: Admin login fails
**Symptoms**: Wrong password error or authentication not working

**Solutions**:
1. **Check password**: Default is `admin123` for development
2. **Verify backend auth**: Check `server/routes.ts` `requireAdmin` middleware
3. **Environment variables**: Ensure `ADMIN_PASSWORD` matches in `.env` files
4. **Production**: Check Fly.io secrets: `fly secrets list --app your-app`

### Booking Creation Issues

#### Problem: Room booking creation fails
**Symptoms**: API returns error or booking doesn't complete

**Solutions**:
1. **Check API URL**: Verify `VITE_API_BASE_URL` in client `.env` files
2. **Backend route**: Ensure `/api/create-accommodation-booking` exists in `server/routes.ts`
3. **Environment variables**: Check Wompi keys and DB connection
4. **CORS**: Ensure backend allows frontend origin
5. **Database**: Verify DB connection and schema

**Testing**:
```bash
# Test API endpoint
curl -X POST http://localhost:5000/api/create-accommodation-booking \
  -H "Content-Type: application/json" \
  -d '{"guestName":"Test","guestEmail":"test@test.com","totalPrice":1000}'
```

#### Problem: Payment processing fails
**Symptoms**: Wompi integration not working

**Solutions**:
1. **Check Wompi keys**: Verify sandbox/production keys are correct
2. **Environment**: Use sandbox keys for local testing
3. **Network**: Ensure backend can reach Wompi APIs
4. **Configuration**: Check `WOMPI_BASE` URL in env files

### Environment Configuration Issues

#### Problem: Wrong environment variables loaded
**Symptoms**: App uses wrong API URLs or settings

**Solutions**:
1. **Check NODE_ENV**: Ensure correct value (`development` or `production`)
2. **File loading**: Backend loads `.env.development` or `.env.production` based on NODE_ENV
3. **Frontend**: Vite loads `.env.development` or `.env.production` based on mode
4. **Restart required**: Changes to `.env` files require server restart

**Verification**:
```bash
# Check loaded env vars
node -e "console.log(process.env)"
```

#### Problem: Database connection fails
**Symptoms**: API calls fail with DB errors

**Solutions**:
1. **Local DB**: Ensure PostgreSQL is running and URL is correct
2. **Production DB**: Check Fly.io secret `DATABASE_URL`
3. **Migrations**: Run `npm run db:push` to sync schema
4. **Connection string**: Verify format and credentials

### Deployment Issues

#### Problem: GitHub Actions deployment fails
**Symptoms**: Build or deploy step fails in workflow

**Solutions**:
1. **Check logs**: Review GitHub Actions run logs
2. **Dependencies**: Ensure all packages install correctly
3. **Build commands**: Verify `npm run build:client:prod` works locally
4. **Secrets**: Check all required secrets are set in repo settings

#### Problem: Fly.io deployment fails
**Symptoms**: Backend deployment fails

**Solutions**:
1. **Check logs**: `fly logs --app your-app-name`
2. **Environment**: Ensure all required secrets are set
3. **Build**: Test build locally first: `npm run build`
4. **Resources**: Check Fly.io plan limits

#### Problem: Hostinger FTP upload fails
**Symptoms**: Frontend not updated after deployment

**Solutions**:
1. **FTP credentials**: Verify secrets in GitHub repo
2. **Permissions**: Check FTP user has write access
3. **Path**: Ensure `server-dir: ./` is correct for your hosting
4. **Manual upload**: Use Hostinger panel as fallback

### CORS Issues

#### Problem: Cross-origin requests blocked
**Symptoms**: Browser console shows CORS errors

**Solutions**:
1. **Allowed origins**: Check `allowedOrigins` in `server/index.ts`
2. **Environment**: Ensure `FRONTEND_URL` is set correctly
3. **Development**: Add `http://localhost:5000` to allowed origins
4. **Production**: Add your domain to Fly.io secrets

### Performance Issues

#### Problem: Slow loading times
**Symptoms**: Pages take long to load

**Solutions**:
1. **Build optimization**: Ensure production builds are minified
2. **Caching**: Check browser cache settings
3. **CDN**: Consider using CDN for static assets
4. **Database**: Optimize queries and add indexes

### Email Issues

#### Problem: Confirmation emails not sent
**Symptoms**: Bookings complete but no emails received

**Solutions**:
1. **SMTP settings**: Check `EMAIL_USER` and `EMAIL_PASS`
2. **Service**: Verify email service allows SMTP
3. **Logs**: Check server logs for email sending errors
4. **Spam**: Check spam/junk folders

## Debug Tools

### Local Debugging
```bash
# Verbose server logging
npm run dev:debug

# Test API endpoints
./test-local.sh

# Check environment variables
node -e "console.log(require('dotenv').config({ path: './server/.env.development' }))"

# Check database connection
npm run db:push
```

### Production Debugging
```bash
# Check Fly.io logs
fly logs --app your-app-name

# Test production endpoints
./test-production.sh

# Check Fly.io secrets
fly secrets list --app your-app-name

# Check app status
fly status --app your-app-name
```

### Browser Debugging
1. Open DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Check Application tab for localStorage issues

## Emergency Rollback

### Fly.io Rollback
```bash
# List releases
fly releases --app your-app-name

# Rollback to previous release
fly releases rollback <release-id> --app your-app-name
```

### Hostinger Rollback
1. Use Hostinger file manager to restore previous build
2. Or re-upload from GitHub Actions artifacts

### Git Rollback
```bash
# Revert last commit
git revert HEAD

# Force push (use carefully)
git push origin main --force
```

## Getting Help

1. **Check documentation**: Review `README-DEV.md` and `plan.md`
2. **Run tests**: Use `test-local.sh` and `test-production.sh`
3. **Check logs**: Server logs, browser console, GitHub Actions
4. **Isolate issues**: Test components individually
5. **Search issues**: Check GitHub issues or similar problems

## Prevention

1. **Test locally first**: Always run `./test-local.sh` before committing
2. **Use staging**: Deploy to staging branch first
3. **Monitor regularly**: Check production health daily
4. **Keep dependencies updated**: Regular `npm audit` and updates
5. **Document changes**: Update this guide when fixing issues