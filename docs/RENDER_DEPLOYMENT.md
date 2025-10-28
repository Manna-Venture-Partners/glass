# Deploying Glass to Render

## Overview

Render is a modern PaaS platform similar to Heroku. It's a great choice for deploying Glass with:
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Easy environment variable management
- ✅ Native Git integration
- ✅ Custom domains

## Quick Start

### 1. Connect Your Repository

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select "glass" repository

### 2. Configure Build Settings

Render will detect Node.js automatically. Configure:

**Build Command:**
```bash
cd pickleglass_web && npm install && npm run build
```

**Start Command:**
```bash
cd pickleglass_web && npm start
```

**Environment:** Node 18

### 3. Add Environment Variables

In Render dashboard, go to "Environment" and add:

#### Firebase (Public)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
```

#### Firebase Admin (Server-side)
```bash
FIREBASE_ADMIN_PROJECT_ID=xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxxxx
FIREBASE_ADMIN_PRIVATE_KEY=xxxxx
```

#### Stripe
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### PostHog
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### URLs (Important!)
```bash
NEXT_PUBLIC_URL=https://glass.onrender.com
UPDATE_SERVER_URL=https://glass.onrender.com
pickleglass_API_URL=https://glass.onrender.com
```

#### Node Version
```bash
NODE_VERSION=18
NODE_ENV=production
```

### 4. Deploy

Click "Create Web Service" and wait for deployment (5-10 minutes on first deploy).

Render will:
- Install dependencies
- Build Next.js app
- Start the service
- Generate SSL certificate automatically

## Using render.yaml (Recommended)

Instead of manual configuration, you can use `render.yaml`:

### 1. Push render.yaml to your repository

The file is already in your repo at the root.

### 2. Import Configuration

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click "Apply"

### 3. Add Secrets

Render will prompt you to add the environment variables that are marked `sync: false`:
- Firebase keys
- Stripe keys
- PostHog keys
- Other secrets

Add them in the Render dashboard under "Environment" → "Environment Variables".

### 4. Deploy

Click "Apply" and Render will create the service.

## Custom Domain Setup

### 1. Add Domain in Render

1. Go to your service in Render dashboard
2. Click "Settings" → "Custom Domains"
3. Enter your domain: `glass.pickle.com`
4. Click "Add"

### 2. Configure DNS

Add these DNS records to your domain provider:

**For Apex Domain (glass.pickle.com):**
```
Type: CNAME
Name: @
Value: glass.onrender.com
```

**For Subdomain (www.glass.pickle.com):**
```
Type: CNAME
Name: www
Value: glass.onrender.com
```

### 3. Update Environment Variables

After adding custom domain, update:

```bash
NEXT_PUBLIC_URL=https://glass.pickle.com
UPDATE_SERVER_URL=https://glass.pickle.com
pickleglass_API_URL=https://glass.pickle.com
```

## Deploying with CLI

### 1. Install Render CLI

```bash
npm install -g render-cli
```

### 2. Login

```bash
render login
```

### 3. Deploy

```bash
# From project root
render deploy
```

## Troubleshooting

### Issue: Build Fails

**Check logs:**
```bash
# In Render dashboard
# Go to service → Logs
```

**Common causes:**
1. Wrong Node version → Set `NODE_VERSION=18`
2. Missing dependencies → Check `package.json`
3. Build timeout → Upgrade to paid plan

**Solution:**
```bash
# Test build locally first
cd pickleglass_web
npm install
npm run build
```

### Issue: Application Crashes on Start

**Check logs for errors**

**Common causes:**
1. Missing environment variables
2. Wrong start command
3. Port binding issues

**Solution:**
```bash
# Start command should be:
cd pickleglass_web && npm start

# Not:
npm start
```

### Issue: API Routes Not Working

**Check if server is running:**
```bash
curl https://glass.onrender.com
```

**Verify environment variables:**
```bash
# All STRIPE_*, FIREBASE_* vars should be set
```

### Issue: Webhooks Not Receiving Stripe Events

**Stripe webhook configuration:**

1. In Stripe dashboard, go to Webhooks
2. Add endpoint: `https://glass.onrender.com/api/webhooks/stripe`
3. Copy webhook secret
4. Add to Render: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

**Test with Stripe CLI:**
```bash
stripe listen --forward-to https://glass.onrender.com/api/webhooks/stripe
```

### Issue: Slow Cold Starts

Render's free tier spins down after 15 minutes of inactivity. Solutions:

1. **Upgrade to paid plan** ($7/mo) - Always running
2. **Keep-alive ping** - Use cron to ping every 10 minutes
3. **Accept cold starts** - First request may take 30s

## Render vs Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| Free tier | ✅ Yes | ✅ Yes |
| Never sleeps | ❌ No (free) | ✅ Yes |
| Build time | Slower | Faster |
| Edge network | ❌ No | ✅ Yes |
| Custom domains | ✅ Yes | ✅ Yes |
| Git integration | ✅ Yes | ✅ Yes |
| Database | ✅ Add-on | ❌ No |
| Workers | ✅ Yes | ✅ Yes |

**Render is better for:**
- Traditional web apps
- Long-running processes
- Database-backed apps
- Backend-heavy apps

**Vercel is better for:**
- Static sites
- Edge functions
- Fast deployments
- Developer experience

## Pricing

### Free Tier
- Unlimited services
- 750 hours/month compute
- Automatic SSL
- Custom domains
- **Limitation:** Spins down after 15min inactivity

### Starter Plan ($7/month)
- **Everything in Free tier**
- Always running (no spin-down)
- Priority support
- Better performance

### Recommended for Glass

**Option 1: Free Tier**
- Good for testing
- First request may be slow (cold start)
- Free forever

**Option 2: Starter ($7/month)**
- Best for production
- Always running
- Fast response times
- Good value

## Monitoring

### View Logs

```bash
# Real-time logs in Render dashboard
# Or use CLI:
render logs -s glass-web
```

### Metrics

Render provides:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

View in dashboard: Service → Metrics

## Continuous Deployment

Render automatically deploys on git push:

1. Push to `main` branch
2. Render detects changes
3. Runs build command
4. Deploys new version
5. Updates live app

### Auto-deploy Settings

1. Go to service settings
2. Under "Build & Deploy"
3. Set branch: `main`
4. Auto-deploy: ✅ Enabled

### Manual Deploy

If you want to deploy manually:

1. Go to service
2. Click "Manual Deploy"
3. Select branch/commit
4. Deploy

## Rollback

If something breaks:

1. Go to "Deploys" in service
2. Find working version
3. Click "Redeploy"

## Production Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active (auto)
- [ ] Environment variables set
- [ ] Database connected (if needed)
- [ ] Stripe webhooks configured
- [ ] Analytics tracking working
- [ ] Error monitoring enabled
- [ ] Backups configured (if data stored)

## Next Steps

1. **Deploy to Render** (follow steps above)
2. **Configure Stripe webhooks**
3. **Test deployment**
4. **Add custom domain**
5. **Build Electron app**
6. **Publish to GitHub**
7. **Monitor usage**

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Support: support@render.com

## Example Deployment

```bash
# 1. Connect repo to Render (via dashboard)
# 2. Add environment variables
# 3. Deploy!

# 4. Test
curl https://glass.onrender.com

# 5. Check logs
render logs -s glass-web
```

## Success! 🎉

Once deployed, your app will be available at:
- **Render URL**: `https://glass.onrender.com`
- **Custom Domain**: `https://glass.pickle.com` (after DNS setup)

