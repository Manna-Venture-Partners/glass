# Deployment Guide for Glass

## Overview

Glass consists of multiple components that need to be deployed:

1. **Electron Desktop App** - Built and distributed via GitHub Releases
2. **Next.js Web Dashboard** - Hosted on Vercel, Netlify, or custom server
3. **Firebase Backend** - Already configured (Firestore, Auth, Storage)
4. **Stripe Webhooks** - Need publicly accessible URL
5. **PostHog Analytics** - Already configured

## Architecture

```
┌─────────────────────┐
│  Electron Desktop   │
│  (User's Machine)   │
└──────────┬──────────┘
           │
           ├───────── Firestore (User Data)
           │
           └───────── Next.js Dashboard (Web)
           │
           ├───────── Stripe (Payments)
           │
           └───────── PostHog (Analytics)
```

## Deployment Options

### Option 1: Render (Recommended) 🚀

**Best for: Easy deployment and value**

- **Pros**: Free tier with SSL, easy setup, custom domains, Git integration
- **Cons**: Cold starts on free tier (15min timeout), slower than edge
- **Cost**: Free tier, paid from $7/mo
- **Docs**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

### Option 2: Vercel

**Best for: Speed and DX**

- **Pros**: Zero config, instant deployments, edge network, built-in analytics
- **Cons**: Serverless limits (10s timeout), vendor lock-in
- **Cost**: Free tier, paid from $20/mo

### Option 3: Railway

**Best for: Flexible hosting**

- **Pros**: Supports long-running processes, Docker-friendly, simple pricing
- **Cons**: Newer platform, fewer edge locations
- **Cost**: Free tier, paid from $5/mo

### Option 4: Self-Hosted (AWS/DO/GCP)

**Best for: Full control**

- **Pros**: Complete control, no vendor lock-in, custom infrastructure
- **Cons**: More setup, maintenance required
- **Cost**: Variable, typically $10-50/mo

## Recommended Setup: Render + GitHub Releases

### Step 1: Deploy Next.js Dashboard

#### Option A: Render (Recommended)

See [RENDER_QUICKSTART.md](../RENDER_QUICKSTART.md) for quick start.

Quick steps:
1. Go to [render.com](https://render.com)
2. Connect GitHub repo
3. Add environment variables
4. Deploy!

**Time**: ~10 minutes  
**Cost**: Free

#### Option B: Vercel

```bash
npm install -g vercel
cd pickleglass_web
vercel --prod
```

Add environment variables in Vercel dashboard.

**Time**: ~5 minutes  
**Cost**: Free tier available

### Step 2: Build Electron App

#### 2.1 Install Dependencies

```bash
npm install
cd pickleglass_web && npm install && cd ..
```

#### 2.2 Build for All Platforms

```bash
# Build for macOS
npm run build

# Build for Windows (requires Windows machine or CI)
npm run build:win

# Build for Linux (requires Linux machine or CI)
npm run build:linux
```

#### 2.3 Sign Code (macOS)

```bash
# You need a Developer ID certificate from Apple
# Export it to build/certs/glass-dev.pfx

CSC_KEY_PASSWORD=your_password npm run build
```

### Step 3: Publish to GitHub Releases

#### 3.1 Create GitHub Release

```bash
# Create a tag
git tag v0.2.5
git push origin v0.2.5
```

#### 3.2 Publish Release

```bash
# electron-builder will publish automatically
npm run publish
```

#### 3.3 Manual GitHub Release

If automatic publishing fails:

1. Go to GitHub → Releases → Draft a new release
2. Tag version: `v0.2.5`
3. Upload artifacts:
   - `glass-0.2.5-mac.dmg`
   - `glass-0.2.5-mac.zip`
   - `glass-0.2.5-win.exe`
   - `glass-0.2.5-linux.AppImage`

### Step 4: Configure Stripe Webhooks

#### 4.1 Add Webhook Endpoint in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://glass.pickle.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret: `whsec_xxxxx`

#### 4.2 Add to Environment Variables

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Step 5: Setup Custom Domain

#### 5.1 Add Domain to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `glass.pickle.com`
3. Add DNS records (CNAME or A record)
4. Wait for SSL certificate (automatic)

#### 5.2 Update Electron App Deep Links

In `electron-builder.yml`:

```yaml
protocols:
    name: PickleGlass Protocol
    schemes: 
        - pickleglass://
```

Deep links will automatically use your domain.

## Alternative: Docker Deployment

If you prefer Docker:

### Dockerfile

```dockerfile
# pickleglass_web/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t glass-web ./pickleglass_web
docker run -p 3000:3000 --env-file .env glass-web
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  release:
    types: [created]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        working-directory: ./pickleglass_web
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

  build-electron:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build Electron app
        run: npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: glass-${{ matrix.os }}
          path: dist/*
      
      - name: Create GitHub Release
        if: matrix.os == 'macos-latest'
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*.dmg
          tag_name: v${{ github.ref }}
```

## Testing Deployment

### 1. Test Next.js Dashboard

```bash
curl https://glass.pickle.com
# Should return 200 OK
```

### 2. Test API Routes

```bash
# Test health check
curl https://glass.pickle.com/api/health

# Test playbooks
curl https://glass.pickle.com/api/playbooks
```

### 3. Test Stripe Webhooks

Use Stripe CLI:

```bash
stripe listen --forward-to https://glass.pickle.com/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### 4. Test Electron Updates

1. Install version 0.2.4
2. Publish 0.2.5 to GitHub
3. Open app → Check for updates
4. Verify update notification

### 5. Test Authentication

1. Go to https://glass.pickle.com/login
2. Sign in with Google
3. Verify Firebase sync
4. Verify PostHog tracking

## Monitoring

### 1. Vercel Analytics

- Built-in dashboard
- Real-time metrics
- Performance monitoring

### 2. PostHog

- User events
- Feature adoption
- Conversion funnels

### 3. Firebase Console

- Firestore usage
- Authentication
- Error monitoring

### 4. Stripe Dashboard

- Subscription metrics
- Revenue tracking
- Customer lifetime value

## Troubleshooting

### Deployment Issues

**Error: Build failed**
```bash
# Check build logs
vercel logs

# Test locally
cd pickleglass_web && npm run build
```

**Error: API routes not working**
```bash
# Check environment variables
vercel env ls

# Re-deploy
vercel --prod
```

### Electron Updates Not Working

**Error: Update check failed**
```bash
# Check update server logs
curl https://glass.pickle.com/updates?platform=darwin&version=0.2.4

# Verify GitHub release exists
# Check UPDATE_SERVER_URL environment variable
```

### Stripe Webhooks Not Firing

**Error: Webhook signature invalid**
```bash
# Check STRIPE_WEBHOOK_SECRET is set
# Verify webhook endpoint in Stripe dashboard
# Test with Stripe CLI
```

## Cost Estimates

### Vercel (Recommended)
- Free tier: $0/mo
- Pro: $20/mo (for production)
- Bandwidth: $20/TB

### Stripe
- 2.9% + $0.30 per transaction
- No monthly fee

### Firebase
- Free tier: 50K reads/day
- Paid: Pay as you go
- ~$0.36/100K reads

### PostHog
- Free tier: 1M events/month
- Paid: $20/mo

### Total Estimated Cost
- Small scale (<1000 users): $40-50/mo
- Medium scale (1K-10K users): $100-200/mo
- Large scale (10K+ users): $500+/mo

## Security Checklist

- [ ] Environment variables secured
- [ ] Stripe webhook secret set
- [ ] Firebase security rules configured
- [ ] SSL certificates valid
- [ ] Code signing certificates secure
- [ ] API rate limiting enabled
- [ ] CORS configured properly
- [ ] No PII in logs
- [ ] PostHog privacy settings enabled

## Next Steps

1. ✅ Deploy Next.js to Vercel
2. ✅ Build and publish Electron to GitHub
3. ✅ Configure Stripe webhooks
4. ✅ Setup custom domain
5. ✅ Test all integrations
6. ✅ Monitor metrics
7. ✅ Scale as needed

## Support

For deployment issues:
- Vercel: https://vercel.com/docs
- Electron Builder: https://www.electron.build/
- Stripe: https://stripe.com/docs
- Firebase: https://firebase.google.com/docs

