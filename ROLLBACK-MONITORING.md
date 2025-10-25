# Rollback and Monitoring Procedures

## Rollback Procedures

### Fly.io Backend Rollback

#### Quick Rollback to Previous Release
```bash
# List recent releases
fly releases --app your-app-name

# Rollback to specific release
fly releases rollback <release-id> --app your-app-name

# Rollback to previous release
fly releases rollback --app your-app-name
```

#### Emergency Rollback Script
```bash
#!/bin/bash
# rollback-emergency.sh

APP_NAME="jungle-tours-backend"
PREVIOUS_RELEASE=$(fly releases --app $APP_NAME --json | jq -r '.[1].id')

if [ -n "$PREVIOUS_RELEASE" ]; then
    echo "Rolling back to release: $PREVIOUS_RELEASE"
    fly releases rollback $PREVIOUS_RELEASE --app $APP_NAME
    echo "✅ Rollback completed"
else
    echo "❌ No previous release found"
fi
```

#### Database Rollback (if needed)
```bash
# If you need to rollback database changes
# Note: This depends on your migration strategy

# For Drizzle ORM
npm run db:push  # Re-sync schema (be careful!)

# Manual SQL rollback if needed
# Connect to your database and run reverse migrations
```

### Hostinger Frontend Rollback

#### Method 1: File Manager Rollback
1. Access Hostinger control panel
2. Go to File Manager
3. Navigate to public_html or your site directory
4. Download current files as backup
5. Upload previous build from GitHub Actions artifacts

#### Method 2: FTP Rollback
```bash
# Download previous build from GitHub Actions
# Then upload via FTP
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST << EOF
cd /
mirror -R ./previous-build/ ./
exit
EOF
```

#### Method 3: Git-based Rollback
```bash
# Revert to previous commit
git revert HEAD~1
git push origin main

# Or reset to specific commit
git reset --hard <previous-commit-hash>
git push origin main --force
```

### Git Rollback Options

#### Soft Rollback (Recommended)
```bash
# Create revert commit
git revert HEAD
git push origin main
```

#### Hard Rollback (Use with caution)
```bash
# Reset to previous commit
git reset --hard HEAD~1
git push origin main --force
```

## Monitoring Procedures

### Health Checks

#### Automated Health Checks
```bash
# Run production tests
./test-production.sh

# Check specific endpoints
curl -f https://ayahuascapuertonarino.com/api/version
curl -f https://jungle-tours-backend.fly.dev/api/tours
```

#### Manual Health Checks
- [ ] Frontend loads: `https://ayahuascapuertonarino.com`
- [ ] Admin accessible: `https://ayahuascapuertonarino.com/admin`
- [ ] API responding: `/api/version` returns valid JSON
- [ ] Database connected: Bookings can be created/retrieved
- [ ] Email working: Test booking sends confirmation

### Fly.io Monitoring

#### Application Metrics
```bash
# Check app status
fly status --app your-app-name

# View logs
fly logs --app your-app-name

# Check resource usage
fly scale show --app your-app-name

# Monitor requests
fly logs --app your-app-name | grep -E "(POST|GET|PUT|DELETE)"
```

#### Automated Monitoring Script
```bash
#!/bin/bash
# monitor.sh

APP_NAME="jungle-tours-backend"
FRONTEND_URL="https://ayahuascapuertonarino.com"
BACKEND_URL="https://$APP_NAME.fly.dev"

echo "🔍 Monitoring JungleJourney - $(date)"

# Check Fly.io app status
echo "Fly.io Status:"
fly status --app $APP_NAME

# Check backend health
echo -e "\nBackend Health:"
if curl -s $BACKEND_URL/api/version > /dev/null; then
    echo "✅ API responding"
else
    echo "❌ API not responding"
fi

# Check frontend health
echo -e "\nFrontend Health:"
if curl -s -I $FRONTEND_URL | head -n 1 | grep -q "200\|301\|302"; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend not accessible"
fi

# Check recent errors
echo -e "\nRecent Errors:"
fly logs --app $APP_NAME --since 1h | grep -i error | tail -5
```

### GitHub Actions Monitoring

#### Workflow Status
- Check Actions tab in GitHub repository
- Monitor deployment success/failure
- Review build logs for errors

#### Deployment Notifications
```yaml
# Add to .github/workflows/build.yml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Deployment failed!"}' \
    $SLACK_WEBHOOK_URL
```

### Database Monitoring

#### Connection Health
```bash
# Test database connection (if accessible)
psql $DATABASE_URL -c "SELECT 1"

# Check table sizes
psql $DATABASE_URL -c "SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables;"
```

#### Performance Monitoring
```bash
# Slow queries (if logging enabled)
# Check application logs for slow database operations

# Connection count
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### Email Monitoring

#### Delivery Monitoring
- Check email service dashboard (Gmail, SendGrid, etc.)
- Monitor bounce rates and spam complaints
- Test email delivery regularly

#### Email Logs
```bash
# Check application logs for email sending
fly logs --app your-app-name | grep -i "email\|mail"
```

### Performance Monitoring

#### Response Times
```bash
# Test API response times
curl -o /dev/null -s -w "%{time_total}\n" $BACKEND_URL/api/version

# Frontend load time
curl -o /dev/null -s -w "%{time_total}\n" $FRONTEND_URL
```

#### Resource Usage
```bash
# Fly.io metrics
fly scale show --app your-app-name

# Memory and CPU usage
fly logs --app your-app-name | grep -E "(memory|cpu)"
```

### Alerting Setup

#### Slack/Discord Notifications
```yaml
# Add to GitHub Actions workflow
- name: Notify deployment success
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"✅ Deployment successful!"}' \
    $SLACK_WEBHOOK_URL
```

#### Error Alerting
```bash
# Check for critical errors every hour
*/60 * * * * /path/to/monitor.sh | grep -q "❌" && send-alert.sh
```

### Backup Procedures

#### Database Backup
```bash
# Automated backup (add to cron)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Fly.io volumes backup (if using persistent storage)
fly volumes snapshots create vol_xxx
```

#### Code Backup
- All code is in Git (automatic backup)
- Use GitHub releases for versioned backups
- Download artifacts from successful builds

### Incident Response

#### Emergency Checklist
1. **Assess Impact**: Determine affected users/features
2. **Check Monitoring**: Review logs and metrics
3. **Isolate Issue**: Identify root cause
4. **Rollback if Needed**: Use procedures above
5. **Communicate**: Notify stakeholders
6. **Fix and Test**: Implement fix, test thoroughly
7. **Deploy Fix**: Roll forward with corrected code

#### Communication Template
```
🚨 Incident Report

Status: Investigating
Impact: [High/Medium/Low]
Affected: [Frontend/Backend/Both]
Started: [Time]
Description: [Brief description]

Updates:
- [Time]: Investigating cause
- [Time]: Root cause identified
- [Time]: Rollback initiated
- [Time]: Service restored
```

### Preventive Measures

#### Regular Maintenance
- [ ] Weekly health checks
- [ ] Monthly dependency updates
- [ ] Quarterly security audits
- [ ] Database optimization

#### Capacity Planning
- [ ] Monitor resource usage trends
- [ ] Plan for traffic spikes
- [ ] Scale resources proactively

#### Backup Verification
- [ ] Test backup restoration monthly
- [ ] Verify backup integrity
- [ ] Document recovery procedures

### Tools and Services

#### Recommended Monitoring Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, DataDog
- **Logging**: Papertrail, LogDNA
- **Alerts**: PagerDuty, OpsGenie

#### Free Alternatives
- **Health Checks**: GitHub Actions scheduled runs
- **Basic Monitoring**: Fly.io dashboard
- **Logging**: Fly.io logs
- **Alerts**: Email notifications from GitHub Actions

### Summary

**Rollback Priority**:
1. Fly.io releases rollback (fastest)
2. Hostinger file restore
3. Git revert (safest)

**Monitoring Frequency**:
- Health checks: Every 15 minutes
- Full tests: Daily
- Performance review: Weekly
- Security audit: Monthly

**Key Metrics to Monitor**:
- Response times < 2s
- Error rate < 1%
- Uptime > 99.9%
- Successful deployments
- User booking completion rate